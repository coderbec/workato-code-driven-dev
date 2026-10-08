# Workato Code-Driven Development Claude Configuration

This project is configured to work with Claude Desktop and Cursor via MCP (Model Context Protocol).

## Available Tools

### 1. Workato Developer API MCP
- **Purpose**: Workspace management (recipes, connections, jobs, genies)
- **Configuration**: `mcp.json` - Developer API endpoint
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
- **Configuration**: `mcp.json` - AIRO endpoint
- **Header Auth**: `Authorization: Bearer ${AIRO_API_TOKEN}`

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
      "args": ["mcp-remote", "https://app.workato.com/mcp/airo", "--header", "Authorization: Bearer YOUR_TOKEN"]
    }
  }
}
```

#### Option B: Cursor IDE (MCP Configuration)
Create `.claude/cursor.json` in your workspace settings.

## Included Skills

### 1. Workato Project Cataloguer (`skills/workato-project-cataloguer.md`)
Automatically discovers and catalogs all recipes in your Workato workspace.

**Commands**:
```
"Catalogue all recipes in my workspace"
"Show me a summary of all projects"
"List recipes by project"
"Export recipe inventory to JSON"
```

### 2. Workato CLI Orchestrator (`skills/workato-cli-orchestrator.md`)
Manages recipe synchronization between Git and Workato using wk CLI.

**Commands**:
```
"Pull latest recipes from Workato"
"Push these changes to Workato"
"Show me differences between Git and Workato"
"Check the status of all recipes"
```

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
