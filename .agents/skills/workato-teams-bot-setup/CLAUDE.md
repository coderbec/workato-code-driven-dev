# Workato Teams bot setup: briefing

Read `SKILL.md` first; it is the full procedure. Short version for orientation:

- **What it does:** creates a Teams-managed bot, Entra app and Teams app with the Teams Developer CLI; sets Entra redirect URI, scopes, files, help command and domains; creates the Workato `teams_bot` OAuth profile via the Workato API; publishes with Microsoft Graph.
- **Manual steps that remain:** creating the custom bot in Workato (to get the Bot endpoint address), selecting the OAuth profile in Workbot Step 3, and Teams admin approval when the user is not an admin. See `references/manual-fallback.md`.
- **Secrets:** the client secret exists only in memory (CLI JSON output to the Workato API). Never write it to a file, print it, or route it through an MCP tool call.
- **Scripts:** `scripts/preflight.js`, `provision.js`, `publish.js`, `workato-profile.js`, helpers in `lib.js` / `workato.js`; tests in `scripts/teams-bot.test.js` (`node --test`).
- **Prerequisite:** the main guided setup (`start workato setup`) so `WORKATO_CODE_DEV` and `.mcp.json` exist.
- **Mirroring:** this skill lives in `.claude/skills/`, `.opencode/skills/` and `.agents/skills/`; edit all three together.
