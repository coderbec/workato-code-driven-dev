---
name: workato-teams-bot-setup
description: Set up a Workato Enterprise Workbot for Microsoft Teams end to end. Use when the user asks to create, set up, deploy or configure a Teams Enterprise Workbot, "Teams bot setup", "Enterprise Workbot", or to attach a bot to a Teams app, set bot scopes/commands/manifest, or publish it to the org. Uses the Teams Developer CLI to create the bot, Entra app and Teams app, sets scopes, files, help command and domains, creates the Workato Teams bot OAuth profile through the Workato API, and publishes via Microsoft Graph (publishes directly for Teams admins, otherwise submits for admin review).
---

# Workato Enterprise Workbot for Teams

Automates everything in Workato's "Create a Microsoft Teams Enterprise Workbot" guide except two short manual steps (creating the custom bot in Workato to get its endpoint, and selecting the OAuth profile in Workbot Step 3). Run it after `start workato setup` has been completed.

## Ground rules
- **Signpost.** Before each step print `Step N/9: <what and why>`; afterwards say PASS / FAIL.
- **No secrets in files or chat.** The bot's client secret is read from the Teams CLI's JSON output into memory by `scripts/provision.js` and sent straight to the Workato API. Never ask the user to paste a secret, never write one to disk, never print one. Do not use the Workato MCP `post_custom_oauth_profiles` tool for this: it would put the secret in the conversation.
- **Ask before outward actions.** Confirm the inputs and the data centre before running `provision.js`; confirm before `publish.js`.
- **One failure doesn't stop the run.** `provision.js` finishes what it can and lists "Left for you". Relay that list and point to `references/manual-fallback.md` for any step that needs doing by hand.
- Scripts live in `scripts/` (cross-platform Node, run from the repo root as `node .claude/skills/workato-teams-bot-setup/scripts/<name>.js`). They reuse `scripts/lib/data-centers.js` and the data centre in the generated `.mcp.json`.

## Step 1/9: Preflight
Run `scripts/preflight.js`. It checks Node 22.12+, the Teams Developer CLI, that the CLI is signed in with **custom app upload (sideloading) enabled**, `az login`, `WORKATO_CODE_DEV`, and the data centre from `.mcp.json`. For each FAIL, tell the user the fix it prints:
- CLI missing: `npm install -g @microsoft/teams.cli` (offer to run it).
- Not signed in: `teams login` (or `teams login --device-code`); the user completes the browser sign-in.
- Sideloading disabled: a Teams tenant admin must enable custom app upload; stop here.
- No `.mcp.json` / variable: run `start workato setup` first.
Roles needed in Microsoft 365: Application Administrator, Cloud Application Administrator, Global Administrator or Privileged Role Administrator (for the Entra redirect URI).

## Step 2/9: Collect inputs
Ask for: bot name (1-30 chars: letters, numbers, spaces, hyphens), short description (<=80), long description (<=4000), developer/company name (<=32), website, privacy policy URL, terms of use URL (all https). Fixed defaults, taken from Workato's guide: upload/download files on, scopes Personal + Team + Group Chat, a `help` command, valid domain `*.workato.com`, multitenant sign-in. Do not ask for a Client ID or Secret.

## Step 3/9: Create the custom bot in Workato (manual)
Tell the user: in Workato go to **Platform > Workbot > Custom bots > Create a custom bot**, choose **Workbot for Microsoft Teams**, enter the same name, click **Create new app**, and copy the **Bot endpoint address** (looks like `https://app.workato.com/skype_webhooks/event?coak_id=42`). Keep that Workato tab open; Step 7 finishes there. The endpoint is not a secret, so it may be pasted into the chat. No API for this step was found.

## Steps 4-7/9: Provision
Run `scripts/provision.js` with the inputs (first with `--dry-run` and show the user the plan). It then:
- **4**: checks Workato for an existing `teams_bot` OAuth profile of that name (stops if there is one), then `teams app create ... --sign-in-audience multipleOrgs --json`: creates the bot (Teams-managed, the equivalent of Developer Portal Bot Management), the Entra app registration and the Teams app, with the Workato endpoint as the bot endpoint.
- **5**: sets the Entra **web redirect URI** for the data centre (`<host>/oauth/callback`) with `az ad app update`.
- **6**: `teams app update` sets name/descriptions/developer/links and bot scopes; `teams app manifest update --set-json` sets `supportsFiles`, the `help` command list and `validDomains` (`*.workato.com`).
- **7**: creates the Workato custom OAuth profile (provider `teams_bot`, client ID = Bot ID, client secret) with `WORKATO_CODE_DEV`.
It prints the Bot ID, Teams App ID, tenant ID, install link and Developer Portal link, never the secret. If step 7 fails, run `scripts/workato-profile.js` (makes a fresh secret).

Then tell the user to finish in Workato Workbot **Step 3**: select the OAuth profile named after the bot (enter the Teams App ID as **Application ID** if the form asks) and save. This selection step is unverified against the Workato UI; say so if it differs.

## Step 8/9: Publish and approve
Confirm, then run `scripts/publish.js --teams-app-id <id>`. It downloads the app package from the Developer Portal and posts it to Microsoft Graph with the signed-in user's Azure CLI token:
- **Teams admin**: publishes directly to the org catalog.
- **Everyone else**: submits with `requiresReview=true` and prints what the admin must approve (Teams Admin Center > Teams apps > Manage apps). An admin can approve with `scripts/publish.js --teams-app-id <id> --approve`.
- If the Azure CLI token lacks the Graph `AppCatalog` permission (HTTP 401/403), the zip is kept and manual upload steps are printed (`references/manual-fallback.md`).

## Step 9/9: Install and verify
Give the install link (`teams app get <Teams App ID> --install-link` if needed). The user adds the bot, sends `help`, and confirms the bot shows connected in Workato. Close with a summary: what was created, what is left manual, and that the client secret expires (check Entra > App registrations > Certificates & secrets; set a reminder).

## Notes
- The Teams Developer CLI is in preview; flags may change. If a command fails, run `teams <command> --help` (put `--disable-auto-update` before the subcommand) and adapt.
- `--azure` bots (Azure Bot resource) are not used: Workato's guide uses a Teams-managed bot.
- References: Workato "Create a Microsoft Teams Enterprise Workbot"; Microsoft Learn "Publish teamsApp" (Graph) and the Teams Developer CLI quickstart.
