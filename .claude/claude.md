# Workato Code-Driven Development Claude Configuration

This project is configured to work with Claude Desktop and Cursor via MCP (Model Context Protocol).

## Available Tools

### 1. Workato Developer API MCP
- **Purpose**: Workspace management (recipes, connections, jobs, genies)
- **Configuration**: `.mcp.json` - Developer API endpoint
- **Header Auth**: `Authorization: Bearer ${WORKATO_API_TOKEN}`

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
- **Header Auth**: `Authorization: Bearer ${WORKATO_API_TOKEN}`

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

### 1. Configure Environment
```bash
cp .env.example .env
# Edit .env with:
# - WORKATO_API_TOKEN (from Workspace Admin > API clients)
# - Azure credentials
```

### 2. Install Dependencies
```bash
npm install
node scripts/setup.js
```

### 3. Configure Claude Desktop

#### Option A: Claude Desktop (Remote MCP)
Edit `~/.config/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "workato-developer-api": {
      "command": "npx",
      "args": ["mcp-remote", "https://app.workato.com/mcp", "--header", "Authorization: Bearer YOUR_TOKEN"]
    },
    "workato-airo": {
      "command": "npx",
      "args": ["mcp-remote", "https://app.workato.com/airo_mcp", "--header", "Authorization: Bearer YOUR_TOKEN"]
    }
  }
}
```

#### Option B: Cursor IDE (MCP Configuration)
Create `.claude/cursor.json` in your workspace settings.

## Included Skills

Skills live in `.claude/skills/<name>/SKILL.md` and are mirrored from `.opencode/skills/<name>/`. Every skill in `.opencode/skills/` must also exist in `.claude/skills/`; edit both together, never one alone.

### 1. Workato Project Cataloguer (`.claude/skills/workato-project-cataloguer/`)
Automatically discovers and catalogs all recipes in your Workato workspace.

**Commands**:
```
"Catalogue all recipes in my workspace"
"Show me a summary of all projects"
"List recipes by project"
"Export recipe inventory to JSON"
```

**npm scripts**: `npm run discover:projects`, `npm run hydrate:projects -- "Name"`, `npm run hydrate:interactive`. Discovery output is cached in `.workato/project-metadata.json`.

### 2. Workato CLI Orchestrator (`.claude/skills/workato-cli-orchestrator/`)
Manages recipe synchronization between Git and Workato using wk CLI.

**Commands**:
```
"Pull latest recipes from Workato"
"Push these changes to Workato"
"Show me differences between Git and Workato"
"Check the status of all recipes"
```

### 3. Workato Teams Bot Setup (`.claude/skills/workato-teams-bot-setup/`)
Guided setup of a Microsoft Teams Enterprise Workbot in Workato, generating Terraform and/or Azure CLI. Includes `references/` (quick-start, Terraform and Azure CLI guides) and `scripts/setup-interactive.js`.

**Commands**:
```
"Set up a Teams bot"
"Create an Enterprise Workbot with Terraform"
"Generate Azure CLI scripts for a Teams bot"
```

## Other Agent Briefing Folders

This repo is configured for several agent clients. Keep them aligned when changing skills, MCP endpoints, or setup steps.

| Folder / file | Client | Notes |
|---|---|---|
| `.claude/` (`claude.md`, `skills/`) | Claude Code / Claude Desktop | This briefing. Project MCP config is `.mcp.json`. |
| `.opencode/` | OpenCode (also Cursor, generic MCP clients) | `opencode.jsonc` is the main config. Skills are auto-discovered from `.opencode/skills/<name>/SKILL.md`. |
| `.opencode/mcps/` | Claude Desktop, Cursor, generic MCP | `claude-desktop-config.json`, `cursor-config.json`, `generic-mcp-client-config.json` |
| `claude_desktop_config.json` (repo root) | Claude Desktop | Example config; endpoints use `app.workato.com` |

Guides inside `.opencode/`: `README.md`, `SETUP-BY-CLIENT.md`, `COMPATIBILITY.md`, `FILE-GUIDE.md`, `INDEX.md`, `MIGRATION-SUMMARY.md`.

Differences to be aware of:
- OpenCode reads tokens from the shell environment (`{env:WORKATO_API_TOKEN}`). Claude Code reads the token from `.env` through `scripts/mcp-auth-header.sh` (the `headersHelper` in `.mcp.json`), so it works even when Claude Code is launched without your shell profile.
- All configs point at the default data center: `https://app.workato.com/mcp` and `/airo_mcp`.
- `.opencode/skills/workato-teams-bot-setup/CLAUDE.md` is a Claude-oriented briefing for that skill; it is mirrored into `.claude/skills/workato-teams-bot-setup/`.

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
- Restart Claude Desktop
- Check `~/.config/Claude/claude_desktop_config.json` syntax
- Verify WORKATO_API_TOKEN is set in environment

### "Authentication failed"
- Verify token hasn't expired
- Generate a new token in Workspace Admin
- Ensure header format is: `Authorization: Bearer ${TOKEN}`

### "wk CLI commands not working"
- Run: `npm run wk:auth`
- Check: `npm run wk:status`
- Verify: `wk --version`

## Security Notes

- ⚠️ Never commit `.env` file
- ⚠️ Store tokens in `.env` or GitHub Secrets
- ✅ Use header authentication (not token in body)
- ✅ Rotate API tokens regularly
- ✅ Use least-privilege API client roles

## Additional Resources

- [Workato Developer API Docs](https://docs.workato.com/en/workato-api/)
- [AIRO MCP Documentation](https://docs.workato.com/en/airo/mcp)
- [wk CLI Repository](https://github.com/workato-devs/wk)
- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
