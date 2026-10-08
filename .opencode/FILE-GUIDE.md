# .opencode/ File Structure Guide

This guide explains each file in the `.opencode/` directory and when to use it.

## 📁 Directory Layout

```
.opencode/
├── 📄 opencode.jsonc                    ← START HERE: Main universal configuration
├── 📄 README.md                         ← Overview and quick start guide
├── 📄 SETUP-BY-CLIENT.md                ← Detailed setup for each AI client
├── 📄 COMPATIBILITY.md                  ← Verification and testing details
├── 📄 MIGRATION-SUMMARY.md              ← Migration details from .claude/
├── 📄 FILE-GUIDE.md                     ← This file
│
├── 📂 mcps/                             ← MCP Server configurations
│   ├── 📄 claude-desktop-config.json    ← Use if deploying to Claude Desktop
│   ├── 📄 cursor-config.json            ← Use if deploying to Cursor IDE
│   └── 📄 generic-mcp-client-config.json ← Template for other MCP clients
│
├── 📂 skills/                           ← Skill definitions (reusable workflows)
│   ├── 📂 workato-project-cataloguer/
│   │   └── 📄 SKILL.md                  ← Skill: List and export workspace recipes
│   └── 📂 workato-cli-orchestrator/
│       └── 📄 SKILL.md                  ← Skill: Sync recipes with Git
│
└── 📂 config/                           ← Reserved for additional configurations
    └── (empty for now, expandable)
```

---

## 📋 File-by-File Reference

### 🔧 Configuration Files

#### `opencode.jsonc`
- **Purpose**: Universal configuration for all AI clients
- **Format**: JSONC (JSON with Comments)
- **Who uses it**: OpenCode, generic MCP clients
- **When to edit**: Adding new skills, MCP servers, or environment variables
- **Key sections**:
  - `version` - Configuration format version
  - `project` - Project metadata
  - `mcpServers` - List of MCP servers
  - `skills` - Registered skills
  - `agents` - Agent types available
  - `env` - Environment variable requirements
  - `compatibility` - Platform support matrix

**Example use**:
```bash
# OpenCode auto-detects this file
opencode

# To validate syntax:
jq . .opencode/opencode.jsonc
```

---

#### `mcps/claude-desktop-config.json`
- **Purpose**: Claude Desktop-specific MCP configuration
- **Format**: JSON
- **Who uses it**: Claude Desktop application
- **When to use**: Setting up Claude Desktop
- **Setup**: Copy to `~/.config/Claude/claude_desktop_config.json`

**Example**:
```bash
cp .opencode/mcps/claude-desktop-config.json \
   ~/.config/Claude/claude_desktop_config.json
```

---

#### `mcps/cursor-config.json`
- **Purpose**: Cursor IDE-specific MCP configuration
- **Format**: JSON
- **Who uses it**: Cursor IDE
- **When to use**: Setting up Cursor IDE
- **Setup**: Merge into Cursor workspace settings

**Example**:
```bash
# In Cursor settings, add from this file's content
```

---

#### `mcps/generic-mcp-client-config.json`
- **Purpose**: Template for any MCP-compatible client
- **Format**: JSON
- **Who uses it**: Custom MCP clients, web-based tools, other integrations
- **When to use**: Setting up tools not covered by other configs
- **Setup**: Use as reference for MCP client configuration

---

### 📚 Documentation Files

#### `README.md`
- **Purpose**: Main project documentation
- **Audience**: All users
- **Contains**:
  - Quick start instructions
  - Directory overview
  - Available skills and MCP servers
  - Common workflows
  - Environment setup
  - Client compatibility table
  - Troubleshooting guide

**Read this first** for project overview.

---

#### `SETUP-BY-CLIENT.md`
- **Purpose**: Client-specific setup instructions
- **Audience**: Users deploying to specific clients
- **Contains**: Step-by-step setup for each supported client
- **Sections**:
  - OpenCode setup
  - Claude Desktop setup
  - Cursor IDE setup
  - Generic MCP clients setup
  - Client-specific troubleshooting
  - Client comparison table

**Read this** when setting up your specific AI client.

---

#### `COMPATIBILITY.md`
- **Purpose**: Verification that configuration meets standards
- **Audience**: Technical leads, security reviews, compliance checks
- **Contains**:
  - Compatibility matrix for each client
  - Configuration validation checklist
  - Security compliance verification
  - Tested scenarios
  - Deployment readiness assessment
  - 98.3% compatibility score

**Read this** for validation and compliance details.

---

#### `MIGRATION-SUMMARY.md`
- **Purpose**: Explains transition from `.claude/` to `.opencode/`
- **Audience**: Existing users migrating from old setup
- **Contains**:
  - Before/after comparison
  - Migration timeline
  - Backward compatibility notes
  - FAQ about migration
  - Checklist for completion

**Read this** if you previously used `.claude/` configuration.

---

#### `FILE-GUIDE.md`
- **Purpose**: This document
- **Audience**: Users wanting to understand the directory structure
- **Contains**: Description of each file and folder, usage patterns

---

### 🛠️ Skill Files

#### `skills/workato-project-cataloguer/SKILL.md`
- **Purpose**: Skill for discovering and cataloging recipes
- **Key Features**:
  - List all projects and recipes
  - Export inventory as JSON
  - Filter recipes by status/project
  - Integration with CLI Orchestrator
- **MCP Server Used**: `workato-developer-api`
- **Example Commands**:
  - "List all recipes in my workspace"
  - "Export a complete recipe inventory as JSON"
  - "Which recipes haven't run in the last 30 days?"

**Read this** to understand cataloging capabilities.

---

#### `skills/workato-cli-orchestrator/SKILL.md`
- **Purpose**: Skill for synchronizing recipes between Workato and Git
- **Key Features**:
  - Pull recipes from Workato
  - Push changes to Workato
  - Check differences between Git and Workato
  - Validate recipes with linting
- **External Tool Used**: `wk CLI`
- **Example Commands**:
  - "Pull all recipes from Workato to Git"
  - "Push these changes to Workato"
  - "Show me the differences"

**Read this** to understand Git synchronization capabilities.

---

## 🚀 Quick Navigation

### "I want to..."

**...set up OpenCode**
→ Read: `SETUP-BY-CLIENT.md` → OpenCode section

**...set up Claude Desktop**
→ Read: `SETUP-BY-CLIENT.md` → Claude Desktop section

**...set up Cursor IDE**
→ Read: `SETUP-BY-CLIENT.md` → Cursor IDE section

**...understand what I can do**
→ Read: `README.md` → Available Skills section

**...learn about Cataloguer skill**
→ Read: `skills/workato-project-cataloguer/SKILL.md`

**...learn about CLI Orchestrator skill**
→ Read: `skills/workato-cli-orchestrator/SKILL.md`

**...verify compatibility**
→ Read: `COMPATIBILITY.md`

**...understand the migration**
→ Read: `MIGRATION-SUMMARY.md`

**...add a new MCP server**
→ Edit: `opencode.jsonc` → Add to `mcpServers` section

**...add a new skill**
→ Create: `skills/my-skill/SKILL.md`
→ Edit: `opencode.jsonc` → Add to `skills` section

**...troubleshoot issues**
→ Read: `SETUP-BY-CLIENT.md` → Troubleshooting section

---

## 📊 File Usage Patterns

### Which files do I need to edit?

| Scenario | File to Edit | Frequency |
|----------|-------------|-----------|
| Add new skill | `opencode.jsonc` | Occasionally |
| Add MCP server | `opencode.jsonc` | Occasionally |
| Change environment vars | `opencode.jsonc` | Rarely |
| Set up OpenCode | None (auto-detected) | Once |
| Set up Claude Desktop | `.opencode/mcps/claude-desktop-config.json` | Once |
| Set up Cursor | `.opencode/mcps/cursor-config.json` | Once |
| Troubleshoot | Specific guide file | As needed |

### Which files do I only read?

| File | Read For | Frequency |
|------|----------|-----------|
| `README.md` | Overview | Once |
| `SETUP-BY-CLIENT.md` | Setup steps | Once per client |
| `COMPATIBILITY.md` | Verification | Once (security review) |
| `MIGRATION-SUMMARY.md` | Migration info | Once |
| `FILE-GUIDE.md` | This reference | As needed |
| `skills/*/SKILL.md` | Feature docs | Occasionally |

---

## 🔐 Security Notes

### ⚠️ Files that should NOT contain secrets:
- ✅ `opencode.jsonc`
- ✅ All files in `mcps/`
- ✅ All files in `skills/`
- ✅ All `.md` files

### ✅ Where secrets go:
- `.env` file (in root, never commit)
- Environment variables
- Secrets manager (for CI/CD)

### Example secure pattern:
```jsonc
// ✅ GOOD - Uses variable substitution
{
  "authentication": {
    "type": "header",
    "headerValue": "Bearer ${WORKATO_API_TOKEN}"  // Substituted at runtime
  }
}

// ❌ BAD - Never do this
{
  "authentication": {
    "type": "header",
    "headerValue": "Bearer sk-abc123xyz789"  // Hardcoded secret!
  }
}
```

---

## 📈 Extension Points

### To add a new skill:
1. Create folder: `skills/my-skill/`
2. Create file: `skills/my-skill/SKILL.md`
3. Update `opencode.jsonc`:
   ```jsonc
   "skills": [
     // ... existing skills ...
     {
       "id": "my-skill",
       "name": "My Skill",
       "path": ".opencode/skills/my-skill/SKILL.md",
       "enabled": true,
       "description": "..."
     }
   ]
   ```

### To add a new MCP server:
1. Update `opencode.jsonc`:
   ```jsonc
   "mcpServers": {
     // ... existing servers ...
     "my-server": {
       "type": "stdio",
       "command": "npx",
       "args": ["..."],
       "env": { "TOKEN": "${MY_TOKEN}" }
     }
   }
   ```
2. Update all client configs in `mcps/` if needed

### To add environment variables:
1. Update `opencode.jsonc`:
   ```jsonc
   "env": {
     "required": ["NEW_VAR"],
     "optional": ["OPTIONAL_VAR"]
   }
   ```
2. Document in `.env.example`
3. Update `README.md` → Environment Variables section

---

## 🧪 Validation Commands

```bash
# Validate opencode.jsonc syntax
jq . .opencode/opencode.jsonc

# Check all JSON files
jq . .opencode/mcps/*.json

# Verify markdown files exist
ls -la .opencode/skills/*/SKILL.md

# Count files
find .opencode -type f | wc -l  # Should be 11+ files

# Test OpenCode detection
opencode --check-config
```

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024 | Initial `.opencode/` configuration |
| - | - | Converted from `.claude/` |
| - | - | Added multi-client support |
| - | - | Comprehensive documentation |

---

## 🔗 Related Files (Not in .opencode/)

| File | Purpose | Location |
|------|---------|----------|
| `.claude/` | Legacy Claude Desktop config | Root (kept for compatibility) |
| `.env.example` | Environment variable template | Root |
| `.env` | Actual environment variables | Root (never commit) |
| `package.json` | npm configuration | Root |
| `mcp.json` | Legacy MCP references | Root (can be archived) |

---

## ❓ FAQs

**Q: Can I delete this `.opencode/` directory?**
A: Not recommended. It's the recommended configuration. If you must, keep `.claude/` as fallback.

**Q: Should I commit `.opencode/` to Git?**
A: Yes! It's safe to commit (no secrets, standard format).

**Q: Should I commit `opencode.jsonc`?**
A: Yes! It's safe to commit and should be version controlled.

**Q: What about the `.env` file?**
A: No! Never commit `.env`. It contains secrets.

**Q: Can I have multiple `.opencode/` directories?**
A: No, but you can have multiple projects with their own `.opencode/`.

**Q: How do I update these files?**
A: Edit as needed, test with your AI client, commit when working.

---

## 📞 Support Resources

- OpenCode docs: https://opencode.ai/docs
- Workato docs: https://docs.workato.com/
- MCP spec: https://modelcontextprotocol.io/
- This project: See `README.md`

---

**Last Updated**: 2024  
**Configuration Version**: 1.0.0  
**Files in .opencode/**: 11+  
**Supported Clients**: 4 (OpenCode, Claude Desktop, Cursor, Generic)
