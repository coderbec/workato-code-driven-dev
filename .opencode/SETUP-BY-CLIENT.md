# Setup Guide by AI Client

This guide shows how to configure this project for your specific AI development tool.

## Table of Contents
1. [OpenCode](#opencode)
2. [Claude Desktop](#claude-desktop)
3. [Cursor IDE](#cursor-ide)
4. [Generic MCP Clients](#generic-mcp-clients)
5. [Troubleshooting](#troubleshooting)

---

## OpenCode

### Installation
```bash
# Install OpenCode CLI
npm install -g opencode

# Or use with npx
npx opencode
```

### Configuration
OpenCode automatically detects and loads `.opencode/opencode.jsonc`. No additional setup needed!

### Verification
```bash
# Start OpenCode in the project directory
opencode

# You should see:
# - 2 skills loaded (workato-project-cataloguer, workato-cli-orchestrator)
# - 2 MCP servers configured
```

### Usage
```
You: "List all recipes in my workspace"
→ Cataloguer skill activates automatically
→ Uses workato-developer-api MCP server
```

### Benefits with OpenCode
- ✅ Automatic skill detection
- ✅ Built-in task management
- ✅ Better performance optimization
- ✅ Native parallel agent support

---

## Claude Desktop

### Prerequisites
- Claude Desktop installed on your system
- `.env` file configured with `WORKATO_API_TOKEN` and `WORKATO_WORKSPACE_ID`

### Step 1: Locate Claude Config Directory
```bash
# macOS/Linux
~/.config/Claude/

# Windows
%APPDATA%\Claude\
```

### Step 2: Update Claude Configuration

#### Option A: Merge Configuration (Recommended)
Copy the MCP servers from this project's config:

1. Open your Claude config:
```bash
# macOS/Linux
cat ~/.config/Claude/claude_desktop_config.json

# Windows
type %APPDATA%\Claude\claude_desktop_config.json
```

2. Merge in the Workato servers from `.opencode/mcps/claude-desktop-config.json`

Your config should look like:
```json
{
  "mcpServers": {
    "workato-developer-api": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://app.workato.com/mcp",
        "--header",
        "Authorization: Bearer ${WORKATO_API_TOKEN}"
      ]
    },
    "workato-airo": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://app.workato.com/mcp/airo",
        "--header",
        "Authorization: Bearer ${AIRO_API_TOKEN}"
      ]
    }
    // ... your other MCP servers ...
  }
}
```

#### Option B: Full Replacement
```bash
# macOS/Linux
cp .opencode/mcps/claude-desktop-config.json ~/.config/Claude/claude_desktop_config.json

# Windows
copy .opencode\mcps\claude-desktop-config.json %APPDATA%\Claude\claude_desktop_config.json
```

### Step 3: Set Environment Variables

Claude Desktop reads environment variables from your shell. Ensure they're available:

```bash
# Add to ~/.zshrc, ~/.bashrc, or ~/.bash_profile
export WORKATO_API_TOKEN="your_token_here"
export WORKATO_WORKSPACE_ID="your_workspace_id"
export AIRO_API_TOKEN="your_airo_token" # optional
```

Then reload your shell:
```bash
source ~/.zshrc  # or ~/.bashrc / ~/.bash_profile
```

### Step 4: Restart Claude Desktop
Close and reopen Claude Desktop. The MCP servers should now appear in the Tools panel.

### Step 5: Test Connection
In Claude chat, try:
```
"List all recipes in my workspace"
```

Claude should invoke the Workato Developer API MCP server.

### Verification Checklist
- [ ] Claude config file exists at `~/.config/Claude/claude_desktop_config.json`
- [ ] MCP servers are added to config
- [ ] Environment variables are exported
- [ ] Claude Desktop has been restarted
- [ ] API token is valid and not expired

### Benefits with Claude Desktop
- ✅ Full MCP support
- ✅ Works with Claude 3.5+
- ✅ Desktop application (no browser)
- ✅ Local file access

---

## Cursor IDE

### Prerequisites
- Cursor IDE installed
- `.env` file configured with `WORKATO_API_TOKEN` and `WORKATO_WORKSPACE_ID`
- `npm install` completed

### Step 1: Open Cursor Settings
```
Cursor → Settings → Extensions
```

Search for "MCP" or look for Model Context Protocol settings.

### Step 2: Add MCP Configuration

In your Cursor workspace settings (`.cursor/settings.json` or via UI):

```json
{
  "mcp": {
    "servers": {
      "workato-developer-api": {
        "command": "npx",
        "args": [
          "mcp-remote",
          "https://app.workato.com/mcp",
          "--header",
          "Authorization: Bearer ${WORKATO_API_TOKEN}"
        ]
      },
      "workato-airo": {
        "command": "npx",
        "args": [
          "mcp-remote",
          "https://app.workato.com/mcp/airo",
          "--header",
          "Authorization: Bearer ${AIRO_API_TOKEN}"
        ]
      }
    }
  }
}
```

### Step 3: Configure Environment
Cursor reads from `.env` in the workspace root. Ensure it's set up:

```bash
WORKATO_API_TOKEN=your_token_here
WORKATO_WORKSPACE_ID=your_workspace_id
AIRO_API_TOKEN=your_airo_token # optional
```

### Step 4: Restart Cursor
Close and reopen Cursor. The MCP servers should now be available.

### Step 5: Test in Chat
In the Cursor chat panel, try:
```
"Pull all recipes from Workato to Git"
```

### Verification Checklist
- [ ] Cursor settings configured with MCP servers
- [ ] `.env` file exists with valid tokens
- [ ] Cursor has been restarted
- [ ] Chat panel shows MCP tools as available

### Benefits with Cursor
- ✅ IDE-integrated AI
- ✅ Real-time code suggestions
- ✅ MCP server support
- ✅ Seamless Git integration

---

## Generic MCP Clients

For any MCP-compatible client (e.g., some custom applications, web-based interfaces):

### Configuration Template
Use `.opencode/mcps/generic-mcp-client-config.json` as a template:

```json
{
  "mcpServers": {
    "workato-developer-api": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://app.workato.com/mcp",
        "--header",
        "Authorization: Bearer ${WORKATO_API_TOKEN}"
      ]
    },
    "workato-airo": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://app.workato.com/mcp/airo",
        "--header",
        "Authorization: Bearer ${AIRO_API_TOKEN}"
      ]
    }
  }
}
```

### Required Environment Variables
Your client must have access to:
- `WORKATO_API_TOKEN`
- `WORKATO_WORKSPACE_ID`
- `AIRO_API_TOKEN` (optional)

### Client-Specific Notes

**VS Code with Cursor Extension**:
- Use Cursor-specific configuration (see above)

**Custom Node.js Application**:
```javascript
const mcp = require('mcp');
const config = require('./.opencode/mcps/generic-mcp-client-config.json');
const client = new mcp.Client(config);
```

**Web-Based AI Tools**:
- Contact the tool provider for MCP support
- They may need to host MCP servers remotely
- Provide `.opencode/opencode.jsonc` as reference

---

## Troubleshooting

### Problem: "MCP Server not found"

**Solution for Claude Desktop**:
```bash
# 1. Verify config file
cat ~/.config/Claude/claude_desktop_config.json

# 2. Check syntax (should be valid JSON)
# 3. Restart Claude Desktop
# 4. Check Claude menu → Developer → Logs
```

**Solution for Cursor**:
```bash
# 1. Check Cursor settings for MCP configuration
# 2. Verify .env file exists and is readable
# 3. Restart Cursor
# 4. Check Output panel for MCP errors
```

### Problem: "Authentication failed"

**Causes**:
- Token expired
- Token format incorrect
- Environment variables not set
- Token not found in environment

**Solution**:
```bash
# 1. Verify token is valid
npm run wk:status

# 2. Generate new token if needed
# Go to Workato Workspace Admin > API Clients

# 3. Update .env file
echo "WORKATO_API_TOKEN=new_token" > .env

# 4. Restart your AI client
```

### Problem: "Connection refused / Server not responding"

**Solution**:
```bash
# 1. Check internet connection
ping app.workato.com

# 2. Verify token format
# Should be: Authorization: Bearer YOUR_TOKEN

# 3. Check if MCP remote server is accessible
curl -H "Authorization: Bearer ${WORKATO_API_TOKEN}" \
  https://app.workato.com/mcp/status

# 4. Check Workato status page
# https://status.workato.com/
```

### Problem: "Skills not loading"

**For OpenCode**:
```bash
# 1. Check opencode.jsonc is valid
# 2. Verify skill paths are correct
# 3. Run: opencode --debug
```

**For Claude Desktop**:
- Skills are provided by MCP servers, not config files
- If MCP server is connected, skills should work

**For Cursor**:
- Similar to Claude Desktop
- Check MCP server configuration

### Problem: "npm run wk:* commands fail"

**Solution**:
```bash
# 1. Verify npm installation
npm --version

# 2. Install dependencies
npm install

# 3. Check authentication
npm run wk:auth

# 4. Verify workspace ID
echo $WORKATO_WORKSPACE_ID
```

---

## Client Comparison

| Feature | OpenCode | Claude Desktop | Cursor | Generic Client |
|---------|----------|----------------|--------|----------------|
| **Automatic Skill Loading** | ✅ | ❌ | ❌ | ❓ |
| **MCP Server Support** | ✅ | ✅ | ✅ | ✅ |
| **Environment Variable Support** | ✅ | ✅ | ✅ | ✅ |
| **Task Management** | ✅ | ❌ | ❌ | ❓ |
| **Desktop Application** | ✅ | ✅ | ✅ | ❓ |
| **IDE Integration** | ❌ | ❌ | ✅ | ❓ |
| **Configuration Complexity** | Low | Medium | Medium | High |

---

## Recommended Setup for Teams

1. **Use OpenCode** as the primary development environment
2. **Configure Claude Desktop** as a backup
3. **Optional: Configure Cursor** for IDE-based work
4. **Document MCP configuration** for new team members

---

## Next Steps

1. Choose your preferred AI client from above
2. Follow the setup steps
3. Test with: `"Check the status of my workspace"`
4. Create a `.opencode/setup-notes.md` with your team's specific configuration

---

**Questions?** Check [README.md](./README.md) or contact your team's AI lead.
