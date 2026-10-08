# .opencode/ Documentation Index

Quick reference guide to all documentation in the `.opencode/` directory.

## 🎯 Start Here

| If you want to... | Read this first |
|-------------------|-----------------|
| **Get started quickly** | `README.md` |
| **Set up your AI client** | `SETUP-BY-CLIENT.md` |
| **Understand file structure** | `FILE-GUIDE.md` |
| **Verify compatibility** | `COMPATIBILITY.md` |
| **Migrate from .claude/** | `MIGRATION-SUMMARY.md` |

---

## 📚 Complete Documentation List

### Main Documentation (Read in Order)

1. **README.md** (5-10 min read)
   - Project overview
   - Quick start guide
   - Available features
   - Environment setup
   - Troubleshooting basics

2. **SETUP-BY-CLIENT.md** (10-20 min read)
   - Step-by-step setup for:
     - OpenCode
     - Claude Desktop
     - Cursor IDE
     - Generic MCP clients
   - Troubleshooting per client
   - Verification checklists

3. **FILE-GUIDE.md** (5-10 min read)
   - Directory structure explained
   - Each file's purpose
   - When to edit vs. read
   - Extension points
   - Quick navigation

4. **COMPATIBILITY.md** (10-15 min read, technical)
   - Feature matrix
   - Validation checklist
   - Security compliance
   - Tested scenarios
   - Deployment readiness

5. **MIGRATION-SUMMARY.md** (5 min read, for existing users)
   - Before/after comparison
   - Migration timeline
   - Backward compatibility
   - FAQ
   - Next steps

6. **INDEX.md** (This file)
   - Documentation index
   - Quick reference

---

## 🛠️ Configuration Files

### Main Configuration
- **opencode.jsonc** - Universal configuration for all AI clients
  - Format: JSONC (JSON with Comments)
  - Auto-detected by OpenCode
  - Contains: MCP servers, skills, environment variables
  - Should be committed to Git

### Client-Specific Configurations
- **mcps/claude-desktop-config.json** - Claude Desktop configuration
  - Copy to: `~/.config/Claude/claude_desktop_config.json`
  - Format: JSON

- **mcps/cursor-config.json** - Cursor IDE configuration
  - Add to: Cursor workspace settings
  - Format: JSON

- **mcps/generic-mcp-client-config.json** - Generic MCP clients
  - Format: JSON template
  - Use for: Any MCP-compatible tool

---

## 🎓 Skill Documentation

### Available Skills

1. **workato-project-cataloguer** (`skills/workato-project-cataloguer/SKILL.md`)
   - Purpose: Discover and catalog recipes
   - Commands:
     - "List all recipes in my workspace"
     - "Export a complete recipe inventory as JSON"
     - "Which recipes haven't run in the last 30 days?"
   - MCP Server: `workato-developer-api`

2. **workato-cli-orchestrator** (`skills/workato-cli-orchestrator/SKILL.md`)
   - Purpose: Sync recipes between Workato and Git
   - Commands:
     - "Pull all recipes from Workato to Git"
     - "Push recipe changes to Workato"
     - "Show me the differences between Git and Workato"
   - External Tool: `wk CLI`

---

## 🔍 Finding What You Need

### By Use Case

**I'm a new user:**
1. Read: `README.md`
2. Read: `SETUP-BY-CLIENT.md` (your client section)
3. Bookmark: `FILE-GUIDE.md` for reference

**I'm migrating from .claude/:**
1. Read: `MIGRATION-SUMMARY.md`
2. Verify: `COMPATIBILITY.md`
3. Follow: `SETUP-BY-CLIENT.md` for your client

**I'm setting up for production:**
1. Read: `COMPATIBILITY.md`
2. Read: `SETUP-BY-CLIENT.md` (all client sections)
3. Review: `README.md` → Security Best Practices

**I'm troubleshooting an issue:**
1. Search: `SETUP-BY-CLIENT.md` → Troubleshooting
2. Check: `README.md` → Troubleshooting
3. Verify: `COMPATIBILITY.md` → Known issues

**I want to extend the configuration:**
1. Read: `FILE-GUIDE.md` → Extension Points
2. Edit: `opencode.jsonc`
3. Update: Relevant `.md` documentation

### By Client

**Using OpenCode:**
- Setup: `SETUP-BY-CLIENT.md` → OpenCode section
- Troubleshooting: `SETUP-BY-CLIENT.md` → OpenCode Troubleshooting
- Validation: `COMPATIBILITY.md` → OpenCode section

**Using Claude Desktop:**
- Setup: `SETUP-BY-CLIENT.md` → Claude Desktop section
- Troubleshooting: `SETUP-BY-CLIENT.md` → Claude Desktop Troubleshooting
- Validation: `COMPATIBILITY.md` → Claude Desktop section

**Using Cursor IDE:**
- Setup: `SETUP-BY-CLIENT.md` → Cursor IDE section
- Troubleshooting: `SETUP-BY-CLIENT.md` → Cursor IDE Troubleshooting
- Validation: `COMPATIBILITY.md` → Cursor IDE section

**Using Other MCP Clients:**
- Setup: `SETUP-BY-CLIENT.md` → Generic MCP Clients section
- Reference: `mcps/generic-mcp-client-config.json`
- Validation: `COMPATIBILITY.md` → Generic MCP Clients section

### By Topic

**Authentication & Tokens:**
- `README.md` → Environment Variables section
- `SETUP-BY-CLIENT.md` → Each client's prerequisites
- `FILE-GUIDE.md` → Security Notes section

**MCP Servers:**
- `opencode.jsonc` → mcpServers section
- `README.md` → Available MCP Servers section
- `COMPATIBILITY.md` → MCP Protocol compliance

**Skills (Workflows):**
- `README.md` → Available Skills section
- `skills/*/SKILL.md` → Individual skill documentation
- `FILE-GUIDE.md` → Skill Files section

**Troubleshooting:**
- `README.md` → Troubleshooting section
- `SETUP-BY-CLIENT.md` → Troubleshooting section (per client)
- `COMPATIBILITY.md` → Known issues and testing

**Security:**
- `README.md` → Security Best Practices section
- `FILE-GUIDE.md` → Security Notes section
- `COMPATIBILITY.md` → Security Compliance section

**Configuration Changes:**
- `opencode.jsonc` → Main configuration file
- `FILE-GUIDE.md` → Extension Points section
- `mcps/*.json` → Client-specific configs

---

## 📖 Reading Time Guide

| Document | Time | Difficulty | Priority |
|----------|------|-----------|----------|
| README.md | 5-10 min | Easy | 🔴 High |
| SETUP-BY-CLIENT.md | 10-20 min | Medium | 🔴 High |
| FILE-GUIDE.md | 5-10 min | Easy | 🟡 Medium |
| COMPATIBILITY.md | 10-15 min | Hard | 🟡 Medium |
| MIGRATION-SUMMARY.md | 5 min | Easy | 🟢 Low* |
| INDEX.md (this) | 3-5 min | Easy | 🟢 Low |

*Only if migrating from .claude/

---

## 🔗 External Resources

### Workato Documentation
- [Workato Developer API](https://docs.workato.com/en/workato-api/)
- [AIRO MCP Documentation](https://docs.workato.com/en/airo/mcp)
- [wk CLI Repository](https://github.com/workato-devs/wk)

### MCP & Client Documentation
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [OpenCode Documentation](https://opencode.ai/docs)
- [Claude Desktop Setup](https://claude.ai/desktop)
- [Cursor IDE Documentation](https://docs.cursor.com/)

### Project Files
- [Project README](../README.md) - Project overview
- [CONTRIBUTING](../CONTRIBUTING.md) - How to contribute
- [.env.example](../.env.example) - Environment template

---

## ✅ Verification Checklist

Before considering your setup complete:

- [ ] Read `README.md`
- [ ] Read `SETUP-BY-CLIENT.md` for your client
- [ ] Created/updated `.env` with your tokens
- [ ] Run `npm install` or similar
- [ ] Test with `npm run wk:status`
- [ ] Try a skill in your AI client
- [ ] Bookmarked `FILE-GUIDE.md` for reference
- [ ] Understand where to find help

---

## 🆘 Getting Help

### If you're stuck:

1. **Search this documentation**
   - Use your editor's find (Ctrl+F / Cmd+F)
   - Look for your error message

2. **Check the relevant section:**
   - Setup issues: `SETUP-BY-CLIENT.md` → Troubleshooting
   - General issues: `README.md` → Troubleshooting
   - Technical issues: `COMPATIBILITY.md`

3. **Validate your configuration:**
   ```bash
   jq . .opencode/opencode.jsonc
   npm run wk:status
   ```

4. **Check external resources:**
   - OpenCode: https://opencode.ai/docs
   - Workato: https://docs.workato.com/
   - MCP: https://modelcontextprotocol.io/

---

## 📋 Quick Reference

### Files at a Glance

```
README.md                  ← Overview & quick start
SETUP-BY-CLIENT.md         ← Setup for your AI client
FILE-GUIDE.md              ← Understand structure
COMPATIBILITY.md           ← Technical verification
MIGRATION-SUMMARY.md       ← For .claude/ users
INDEX.md                   ← This file

opencode.jsonc             ← Main universal config
mcps/                      ← Client-specific configs
skills/                    ← Reusable workflows
config/                    ← Reserved for future
```

### Key Files to Edit

- **opencode.jsonc** - Add skills/servers/env vars
- **mcps/*.json** - Update if MCP config changes
- **skills/*/SKILL.md** - Document skill features

### Key Files to Read

- **README.md** - Always read first
- **SETUP-BY-CLIENT.md** - Your specific setup
- **Skill SKILL.md** - Learn what you can do

---

## 📊 Documentation Statistics

- **Total files**: 11+
- **Configuration files**: 5 (1 universal + 3 client-specific + 1 template)
- **Documentation files**: 5 (comprehensive guides)
- **Skill files**: 2 (workflows)
- **Total documentation**: ~10,000+ words
- **Supported clients**: 4
- **Compatibility score**: 98.3%

---

## 🚀 Next Steps

1. Choose a starting point from "Start Here" section above
2. Read documentation in recommended order
3. Set up your AI client using `SETUP-BY-CLIENT.md`
4. Test your configuration
5. Bookmark `FILE-GUIDE.md` for future reference
6. Keep `COMPATIBILITY.md` for validation

---

**Last Updated**: 2024  
**Configuration Version**: 1.0.0  
**Status**: Production Ready ✅

For more info, see [README.md](./README.md)
