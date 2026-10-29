---
name: workato-entra-sso-setup
description: Guided setup of SAML single sign-on between Workato Workflow apps (the Workflow apps portal) and Microsoft Entra ID. Use when the user asks to set up SSO, SAML or Entra for Workflow apps, "Workflow apps SSO", "Entra SSO setup", the Workato "SAML SSO with Entra" guide, or to configure the workato_app_user_name / workato_app_user_groups claims or group sync. Uses the Azure CLI (Microsoft Graph) to create the non-gallery Entra enterprise app, SAML identifiers, claims, signing certificate and group assignment, then walks the user through the two Workato portal steps that have no API.
---

# Workflow apps SAML SSO with Microsoft Entra

Automates the Entra half of Workato's "SAML SSO with Entra" guide (docs.workato.com/en/workflow-apps/saml-sso-entra). The Workato half (Portal settings > Security) is UI-only: the docs describe no API or CLI for it, so this skill guides the user through it with exact values.

## Ground rules
- **Signpost.** Before each step print `Step N/8: <what and why>`; afterwards say PASS / FAIL.
- **Ask before outward actions.** Show `--dry-run` output and get a yes before running `provision.js`; it creates objects in the user's Entra tenant.
- **No secrets involved.** SAML SSO exchanges public metadata only. Never ask the user to paste tokens.
- **Don't claim what wasn't tested.** Only a real browser sign-in proves SSO works. `verify.js` checks configuration, not a login.
- **One failure doesn't stop the run.** `provision.js` finishes what it can and lists "Left for you"; relay it and point to `references/manual-fallback.md`.
- Scripts: cross-platform Node, run from the repo root as `node .claude/skills/workato-entra-sso-setup/scripts/<name>.js`. They call Graph through `az rest`, so they use the user's own Azure CLI sign-in and permissions.

## Step 1/8: Preflight
Run `scripts/preflight.js`. It checks Node 18+, Azure CLI, `az login`, and that Graph can read enterprise apps and manage claims policies. Fixes:
- No Azure CLI: `brew install azure-cli` (macOS) or the Microsoft install page; offer to run it.
- Not signed in: user runs `az login --allow-no-subscriptions` (no Azure subscription needed, only Entra). Suggest `! az login --allow-no-subscriptions`.
- Claims policy check fails: not fatal; the claim becomes a manual step.
Entra roles needed: Cloud Application Administrator or Application Administrator (enterprise apps); Groups Administrator or User Administrator for group assignment. Workato: Admin/Analyst role, or an RBAC 2.0 role with **Apps portal > Settings**.

## Step 2/8: Workato part 1 (manual): switch the portal to SAML, copy two values
Tell the user: in Workato go to **Platform > Workflow apps portal > Portal settings > Security**, set **Authentication method** to **SAML based SSO**. The page then shows **Single Sign-On URL** and **Service provider (SP) entity ID**. Do not complete the metadata step yet. Ask for the portal address (`<subdomain>.workato.app` or custom domain). `lib.samlUrls` derives both values as `https://<host>/portal/sso/saml/acs` and `.../metadata`; **show them and ask the user to confirm they match what Workato displays** (VPW customers may differ; the docs defer to private VPW documentation).

## Step 3/8: Collect inputs
- App name (default `Workflow apps`; must not already exist as an enterprise app).
- Sync groups from Entra? If yes, the Entra group display names to assign. **They must exactly match the user group names in the Workflow apps portal**, and those portal groups must exist; otherwise assignments silently do not sync. Groups synced from on-premises AD are not emitted by "Cloud-only group display names".
- Enforcement and JIT provisioning are decided in Step 7 (Workato side).

## Steps 4-6/8: Provision Entra
Run `scripts/provision.js --portal <host> --name "<app>" [--group-sync] [--groups "A,B"] [--create-groups "C,D"] --dry-run`, show it, get a yes, rerun without `--dry-run`. It:
- **4**: creates the enterprise app from Graph's non-gallery template (the "Create your own application > Non-gallery" equivalent), switches it to SAML, sets **Identifier (Entity ID)** and **Reply URL (ACS)**.
- **5**: adds the `workato_app_user_name` claim (`user.displayname`) via a claims mapping policy and creates a token signing certificate (required once a claims policy is used, else AADSTS50146).
- **6**: with `--group-sync` turns on the group claim for groups assigned to the app; with `--groups` assigns existing groups; `--create-groups` first creates cloud-only security groups (reusing one with the exact name) then assigns them. New groups have no members: add users in Entra > Groups, and create a portal user group with the identical name.
It prints the **App Federation Metadata URL**, tenant ID and app ID. The group claim **name** (`workato_app_user_groups`, cloud-only display names) can only be set in the Entra portal; the script lists it under "Left for you". Walk the user through it.

## Step 7/8: Verify, then Workato part 2 (manual)
Run `scripts/verify.js --tenant <id> --app-id <id> --portal <host>`. Fix any FAIL first. Then tell the user, in Workato **Portal settings > Security**:
1. Confirm **SAML based SSO**. **Do you have your identity provider metadata URL?** = Yes; paste the metadata URL.
2. **Enforce SAML authentication for**: all users or specific domains (others keep password sign-in). Recommend domain-limited first so admins cannot lock themselves out.
3. Optional **JIT provisioning**; **Enable user groups syncing** if using group sync (applied at each sign-in, not instantly).
4. **Save changes.**

## Step 8/8: Test and close
The user opens a private window, goes to the portal URL and signs in as an assigned Entra user; with group sync on, checks their portal groups afterwards. Session length: 7 days without group sync, 1 day with it (Entra Conditional Access sign-in frequency overrides). Close with a summary: created / manual / untested. The signing certificate lasts 3 years: suggest a reminder.

## Notes
- Written from Workato's doc and Microsoft Graph docs; **not yet run against a live tenant**. If a Graph call fails the script prints the portal fallback; adapt, and say what differed.
- To undo: delete the enterprise app in Entra, delete the "<app> SAML claims" claims mapping policy, set the Workato authentication method back.
- Entity IDs on non-verified domains are accepted for single-tenant apps, which is what the template creates.
