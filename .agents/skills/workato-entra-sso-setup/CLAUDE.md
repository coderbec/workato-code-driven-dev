# Workflow apps Entra SSO setup: briefing

Read `SKILL.md` first; it is the full procedure. Orientation:

- **What it does:** builds the Entra SAML enterprise app for the Workflow apps portal with Azure CLI + Microsoft Graph (`az rest`): non-gallery app, SAML mode, Entity ID / Reply URL, `workato_app_user_name` claim via claims mapping policy, signing certificate, optional group claim and group assignment. Prints the App Federation Metadata URL.
- **Manual steps that remain:** Workato Portal settings > Security (both parts; no API), and the group claim's custom name in the Entra portal.
- **Scripts:** `scripts/preflight.js`, `provision.js` (supports `--dry-run`), `verify.js`, helpers in `lib.js`; tests in `scripts/entra-sso.test.js` (`node --test`).
- **Status:** not run against a live tenant. The non-gallery template id, claims mapping policy and `addTokenSigningCertificate` flow come from Graph docs and are unverified here.
- **Prerequisite:** only `az login`; no Workato API token needed.
- **Location:** the only copy is `.agents/skills/`; `.claude/skills` is a symlink to it.
