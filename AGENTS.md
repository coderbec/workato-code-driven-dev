# Workato Code-Driven Development Codex Configuration

This project is configured to work with Codex Desktop and Cursor via MCP (Model Context Protocol).

## Available Tools

### 1. Workato Developer API MCP
- **Purpose**: Workspace management (recipes, connections, jobs, genies)
- **Configuration**: `.mcp.json` - Developer API endpoint
- **Header Auth**: `Authorization: Bearer ${WORKATO_CODE_DEV}`

**Available Operations**:
- List/create/update/delete recipes
- Manage connections
- Monitor jobs and health
- List genies and knowledge bases
- Create/assign skills

**Example Prompts**:
```
"List all recipes in my workspace"
"Show me recipes with 'customer' in the name"
"Which recipes have failed in the last hour?"
"Create a new folder named 'Data Sync'"
"What's the health status of recipe 12345?"
```

### 2. AIRO MCP
- **Purpose**: Custom connector building from natural language
- **Configuration**: `.mcp.json` - AIRO endpoint
- **Header Auth**: `Authorization: Bearer ${WORKATO_CODE_DEV}`

**Available Operations**:
- Build custom connectors from API descriptions
- Edit connector code
- Validate and release connectors
- Generate schemas from JSON/CSV

**Example Prompts**:
```
"Build a custom connector for the Weather API"
"Add a trigger to this connector for new data"
"What's the current state of this connector?"
"Release this connector to production"
```

## Setup Instructions

### 1. Run the guided setup
Open this folder in a terminal, run `claude`, and say **`start workato setup`** (or `/workato-setup`). The skill `workato-setup` checks the `WORKATO_CODE_DEV` profile variable (your API token; shown how to set on macOS/Windows if missing), asks the data centre, installs Workato Developer Labs, creates a `workato-code-dev-N` wk profile, renders `.mcp.json` from `.mcp.template.json`, then has you restart Claude so the MCPs connect (check with `/mcp`) and finally hydrates the projects you choose (`continue workato setup` after the restart). No `.env` file is used.

### 2. Configure (other clients, optional)
Claude Code needs nothing further: the guided setup already produced `.mcp.json`. The configs below are for other clients, which still use the older token handling and are not yet part of the guided setup.

### Codex Desktop

#### Option A: Codex Desktop (Remote MCP)
Edit `~/.config/Codex/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "workato-developer-api": {
      "command": "npx",
      "args": ["mcp-remote", "https://app.workato.com/mcp", "--header", "Authorization:${AUTH_HEADER}"], "env": {"AUTH_HEADER": "Bearer YOUR_TOKEN"}
    },
    "workato-airo": {
      "command": "npx",
      "args": ["mcp-remote", "https://app.workato.com/airo_mcp", "--header", "Authorization:${AUTH_HEADER}"], "env": {"AUTH_HEADER": "Bearer YOUR_TOKEN"}
    }
  }
}
```

#### Option B: Cursor IDE (MCP Configuration)
Create `.Codex/cursor.json` in your workspace settings.

## Included Skills

Skills live in `.Codex/skills/<name>/SKILL.md` and are mirrored from `.opencode/skills/<name>/`. Every skill in `.opencode/skills/` must also exist in `.Codex/skills/`; edit both together, never one alone.

### 1. Workato Project Cataloguer (`.Codex/skills/workato-project-cataloguer/`)
Automatically discovers and catalogs all recipes in your Workato workspace.

**Commands**:
```
"Catalogue all recipes in my workspace"
"Show me a summary of all projects"
"List recipes by project"
"Export recipe inventory to JSON"
```

**npm scripts**: `npm run discover:projects`, `npm run hydrate:projects -- "Name"`, `npm run hydrate:interactive`. Discovery output is cached in `.workato/project-metadata.json`.

### 2. Workato CLI Orchestrator (`.Codex/skills/workato-cli-orchestrator/`)
Manages recipe synchronization between Git and Workato using wk CLI.

**Commands**:
```
"Pull latest recipes from Workato"
"Push these changes to Workato"
"Show me differences between Git and Workato"
"Check the status of all recipes"
```

### 3. Workato Teams Bot Setup (`.Codex/skills/workato-teams-bot-setup/`)
End-to-end setup of a Microsoft Teams Enterprise Workbot: Teams Developer CLI creates the bot, Entra app and Teams app; scopes, files, help command and domains are set in the manifest; the Workato `teams_bot` OAuth profile is created through the Workato API (secret never written to a file); publishing goes through Microsoft Graph (direct for Teams admins, otherwise submitted for review). Run after `start workato setup`. Includes `references/manual-fallback.md` and `scripts/` (preflight, provision, publish).

**Commands**:
```
"Set up a Teams bot"
"Create an Enterprise Workbot"
"Publish my Teams bot to the org"
```

## Other Agent Briefing Folders

This repo is configured for several agent clients. Keep them aligned when changing skills, MCP endpoints, or setup steps.

| Folder / file | Client | Notes |
|---|---|---|
| `.Codex/` (`AGENTS.md`, `skills/`) | Codex / Codex Desktop | This briefing. Project MCP config is `.mcp.json`. |
| `.opencode/` | OpenCode (also Cursor, generic MCP clients) | `opencode.jsonc` is the main config. Skills are auto-discovered from `.opencode/skills/<name>/SKILL.md`. |
| `.opencode/mcps/` | Codex Desktop, Cursor, generic MCP | `Codex-desktop-config.json`, `cursor-config.json`, `generic-mcp-client-config.json` |
| `claude_desktop_config.json` (repo root) | Codex Desktop | Example config; endpoints follow your data centre (data centre is set by the guided setup) |

Guides inside `.opencode/`: `README.md`, `SETUP-BY-CLIENT.md`, `COMPATIBILITY.md`, `FILE-GUIDE.md`, `INDEX.md`, `MIGRATION-SUMMARY.md`.

Differences to be aware of:
- OpenCode reads tokens from the shell environment (`{env:WORKATO_API_TOKEN}`); these other-client configs are not yet migrated to `WORKATO_CODE_DEV`. Claude Code uses `.mcp.json` rendered from `.mcp.template.json`, with `Authorization: Bearer ${WORKATO_CODE_DEV}` expanded by Claude Code at startup (so Claude must be started from a terminal that has the variable).
- Data centre: chosen in the guided setup (step 2) and written into the generated `.mcp.json` URLs (`us` -> `app.workato.com`, others -> `app.<code>.workato.com`; supported: us, eu, jp, sg, au, il, kr, uk, trial). A token only works in its own data centre.
- Claude Desktop and generic `mcp-remote` configs take the token as `AUTH_HEADER` (`Bearer <token>`) in their `env` block; Cursor uses `${env:WORKATO_API_TOKEN}`.
- `.opencode/skills/workato-teams-bot-setup/AGENTS.md` is a Codex-oriented briefing for that skill; it is mirrored into `.Codex/skills/workato-teams-bot-setup/`.

## Workflow Examples

### Example 1: Discover and Backup All Recipes
```
1. Use Workato Developer API MCP to list all recipes
2. Use Workato CLI Orchestrator to pull them to Git
3. Commit to GitHub
```

### Example 2: Build and Deploy a Custom Connector
```
1. Describe the API to AIRO MCP
2. AIRO generates connector code
3. Validate using AIRO tools
4. Release connector
5. Reference connector in wk CLI recipe
6. Deploy via Git + CI/CD
```

### Example 3: Monitor Workspace Health
```
1. Query Developer API MCP for recipe health scores
2. Check job failure rates
3. Identify problematic recipes
4. Generate report with recommendations
```

## Troubleshooting

### "MCP Server not found"
- Restart Codex Desktop
- Check `~/.config/Codex/claude_desktop_config.json` syntax
- Verify WORKATO_CODE_DEV is set in the terminal that started Claude (`node scripts/setup/check-profile-var.js`); restart the terminal/VS Code after setting it

### "Authentication failed"
- Rotate the token: update the `WORKATO_CODE_DEV` variable in your profile, restart the terminal/VS Code and `claude`, then reconnect with `/mcp`
- Verify token hasn't expired
- Generate a new token in Workspace Admin
- Ensure header format is: `Authorization: Bearer ${TOKEN}`

### "wk CLI commands not working"
- Run: `wk auth status`, or say `start workato setup` to create a fresh profile
- Check: `npm run wk:status`
- Verify: `wk --version`

## Security Notes

- ⚠️ Never put tokens in files; the token lives only in the `WORKATO_CODE_DEV` profile variable (or GitHub Secrets in CI)
- ✅ Use header authentication (not token in body)
- ✅ Rotate API tokens regularly
- ✅ Use least-privilege API client roles

## Additional Resources

- [Workato Developer API Docs](https://docs.workato.com/en/workato-api/)
- [AIRO MCP Documentation](https://docs.workato.com/en/airo/mcp)
- [wk CLI Repository](https://github.com/workato-devs/wk)
- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
