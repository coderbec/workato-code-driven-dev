# OpenCode Configuration - Workato Code-Driven Development

This project has been converted to be compatible with **OpenCode**, **Claude Desktop**, **Cursor**, and other standard agent harnesses. All configuration and skills are centralized in this `.opencode/` directory.

## 🎯 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Workato credentials:
# - WORKATO_API_TOKEN (from Workspace Admin > API clients)
# - WORKATO_WORKSPACE_ID (your workspace ID)
# - AIRO_API_TOKEN (optional, for custom connectors)
```

### 3. Verify Setup
```bash
npm run wk:status
```

### 4. Choose Your AI Client

#### OpenCode
OpenCode will automatically detect and load `.opencode/opencode.jsonc`:
```bash
opencode
```

#### Claude Desktop
Copy the MCP configuration to your Claude config:
```bash
# macOS/Linux
cp .opencode/mcps/claude-desktop-config.json ~/.config/Claude/claude_desktop_config.json

# Then restart Claude Desktop
```

#### Cursor IDE
Use the configuration in workspace settings:
- Copy content from `.opencode/mcps/cursor-config.json`
- Paste into Cursor workspace settings under `[tool.mcp.servers]`

#### Generic MCP Clients
Use `.opencode/mcps/generic-mcp-client-config.json` for any MCP-compatible client.

## 📁 Directory Structure

```
.opencode/
├── opencode.jsonc                    # Main configuration (all clients)
├── README.md                         # This file
├── mcps/
│   ├── claude-desktop-config.json    # Claude Desktop specific
│   ├── cursor-config.json            # Cursor IDE specific
│   └── generic-mcp-client-config.json # Generic MCP clients
├── config/
│   └── (additional config files as needed)
└── skills/
    ├── workato-project-cataloguer/
    │   └── SKILL.md                  # Skill definition
    └── workato-cli-orchestrator/
        └── SKILL.md                  # Skill definition
```

## 🛠️ Available Skills

### 1. Workato Project Cataloguer
**Purpose**: Discover and catalogue all recipes in your workspace

**Commands**:
- "List all recipes in my workspace"
- "Show me all projects and folders"
- "Export a complete recipe inventory as JSON"
- "Which recipes haven't run in the last 30 days?"

**Learn more**: `.opencode/skills/workato-project-cataloguer/SKILL.md`

### 2. Workato CLI Orchestrator
**Purpose**: Synchronize recipes between Workato and Git

**Commands**:
- "Pull all recipes from Workato to Git"
- "Push recipe changes to Workato"
- "Show me the differences between Git and Workato"
- "What's the status of all recipes in Git?"

**Learn more**: `.opencode/skills/workato-cli-orchestrator/SKILL.md`

## 🔌 Available MCP Servers

### Workato Developer API
- **Purpose**: Workspace management (recipes, connections, jobs, genies)
- **Authentication**: Bearer token (WORKATO_API_TOKEN)
- **Capabilities**:
  - List/create/update/delete recipes
  - Manage connections and genies
  - Monitor jobs and workspace health

### AIRO MCP
- **Purpose**: Build custom connectors from natural language
- **Authentication**: Bearer token (AIRO_API_TOKEN)
- **Capabilities**:
  - Generate connector code from API descriptions
  - Validate and release connectors
  - Generate schemas from JSON/CSV

## 📋 Common Workflows

### Workflow 1: Initial Backup & Setup
```
1. Cataloguer: "List all recipes in my workspace"
   → Get full inventory
   
2. CLI Orchestrator: "Pull all recipes from Workato to Git"
   → Download all recipes
   
3. Git: Commit and push
   → Backup established
```

### Workflow 2: Edit & Deploy
```
1. Edit a recipe file locally: recipes/my-recipe.json
   
2. CLI Orchestrator: "Check the status"
   → See what changed
   
3. CLI Orchestrator: "Push these changes to Workato"
   → Deploy to workspace
   
4. Git: Commit and push
   → Version control updated
```

### Workflow 3: Team Collaboration
```
1. CLI Orchestrator: "Pull latest from Workato"
   → Get remote updates
   
2. Git: Merge team branch
   → Combine changes
   
3. CLI Orchestrator: "Show me the differences"
   → Review conflicts
   
4. Resolve conflicts manually
   
5. CLI Orchestrator: "Push to Workato"
   → Deploy merged recipes
```

### Workflow 4: Build Custom Connector
```
1. AIRO: "Build a custom connector for [API Name]"
   → Generate connector code
   
2. AIRO: "Add [trigger/action] to this connector"
   → Enhance capabilities
   
3. AIRO: "Release this connector"
   → Make available for use
   
4. Reference connector in recipes
   → Use in Workato
```

## 🔐 Environment Variables

### Required
- `WORKATO_API_TOKEN` - API token from Workspace Admin
- `WORKATO_WORKSPACE_ID` - Your Workato workspace ID

### Optional
- `AIRO_API_TOKEN` - For custom connector building
- `GITHUB_TOKEN` - For GitHub integration
- `GITHUB_REPO` - GitHub repository reference

Store these in `.env` (never commit this file):
```bash
WORKATO_API_TOKEN=your_token_here
WORKATO_WORKSPACE_ID=your_workspace_id
AIRO_API_TOKEN=optional_airo_token
```

## 🚀 NPM Scripts

```bash
# Authentication & Status
npm run wk:auth      # Authenticate with Workato
npm run wk:status    # Check connection status

# Recipe Management
npm run wk:pull      # Pull recipes from Workato
npm run wk:push      # Push recipes to Workato
npm run wk:diff      # Show differences

# Code Quality
npm run lint         # Check recipe linting
npm run lint:fix     # Auto-fix linting issues
```

## 🔄 Client Compatibility

| Client | Supported | Notes |
|--------|-----------|-------|
| **OpenCode** | ✅ | Automatic detection via `opencode.jsonc` |
| **Claude Desktop** | ✅ | Use `mcps/claude-desktop-config.json` |
| **Cursor IDE** | ✅ | Use `mcps/cursor-config.json` |
| **Generic MCP Clients** | ✅ | Use `mcps/generic-mcp-client-config.json` |

## 🛡️ Security Best Practices

- ⚠️ **Never** commit `.env` file
- ⚠️ **Never** hardcode tokens in configuration
- ✅ Store tokens in environment variables
- ✅ Use `.env` file (listed in `.gitignore`)
- ✅ Rotate API tokens regularly
- ✅ Use least-privilege API clients
- ✅ Use header authentication (not body tokens)

## 📚 Additional Resources

- [OpenCode Documentation](https://opencode.ai/docs)
- [Workato Developer API Docs](https://docs.workato.com/en/workato-api/)
- [AIRO Documentation](https://docs.workato.com/en/airo/mcp)
- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [wk CLI Repository](https://github.com/workato-devs/wk)

## 🐛 Troubleshooting

### Skills Not Loading
- Verify `.opencode/opencode.jsonc` exists and is valid
- Check skill paths are correct in configuration
- Restart your AI client

### MCP Servers Not Connecting
- Verify environment variables are set
- Check token hasn't expired
- Restart your AI client
- Test with: `npm run wk:status`

### Authentication Failed
```bash
npm run wk:auth
# Re-authenticate and update tokens
```

### Linter Errors Before Push
```bash
npm run lint:fix
# Auto-fix formatting issues
```

### Git Conflicts
```bash
npm run wk:diff
# Review differences and resolve manually
```

## 📝 Migration from .claude/

This project previously used Claude Desktop-specific configuration in `.claude/`. The `.opencode/` directory is a **drop-in replacement** that:

- ✅ Maintains all functionality
- ✅ Adds support for OpenCode, Cursor, and generic MCP clients
- ✅ Uses standard MCP protocol (more portable)
- ✅ Simplifies configuration management

You can now safely use either configuration, but `.opencode/` is recommended for better compatibility.

## 🤝 Contributing

When adding new skills:
1. Create a new folder in `.opencode/skills/`
2. Add a `SKILL.md` file with skill definition
3. Update `opencode.jsonc` to reference the skill
4. Test with all supported clients

## 📞 Support

For issues with:
- **OpenCode**: Check OpenCode docs at https://opencode.ai/docs
- **Workato API**: See https://docs.workato.com/
- **This project**: Check CONTRIBUTING.md in the repository root

---

**Last Updated**: 2024
**Configuration Version**: 1.0.0
**Compatibility**: OpenCode 1.0+, Claude Desktop, Cursor, Generic MCP Clients
