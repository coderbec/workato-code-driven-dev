# 📚 Project Index & Navigation

Welcome to **Workato Code-Driven Development**! This document helps you find what you need.

---

## 🚀 Quick Navigation

### First Time Here?
1. **Read**: [README.md](README.md) — 5 minute overview
2. **Do**: [SETUP.md](SETUP.md) — Step-by-step setup (30 minutes)
3. **Understand**: [ARCHITECTURE.md](ARCHITECTURE.md) — How it works
4. **Contribute**: [CONTRIBUTING.md](CONTRIBUTING.md) — Making changes

### Ready to Code?
→ See "Development Workflow" in [README.md](README.md#-development-workflow)

### Want to Deploy?
→ Push recipes with `npm run wk:push` or GitHub Actions

### Need Help?
→ Check [Troubleshooting](README.md#-troubleshooting) or [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📖 Documentation Files

| File | Purpose | Read Time |
|---|---|---|
| **[README.md](README.md)** | Project overview, features, commands | 10 min |
| **[SETUP.md](SETUP.md)** | Detailed step-by-step setup guide | 20 min |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System design, data flow, scaling | 15 min |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | How to add recipes & contribute | 10 min |
| **[GITHUB-SETUP.md](GITHUB-SETUP.md)** | Create private GitHub repo | 5 min |
| **[INDEX.md](INDEX.md)** | This file — navigation guide | 5 min |

---

## 🛠️ Configuration Files

| File | Purpose | Status |
|---|---|---|
| **[.env.example](.env.example)** | Environment variables template | Requires setup |
| **[mcp.json](mcp.json)** | MCP server configuration | ✅ Ready |
| **[claude_desktop_config.json](claude_desktop_config.json)** | Claude Desktop setup | ✅ Ready |
| **[linter-config.json](linter-config.json)** | Recipe linting rules | ✅ Ready |
| **[package.json](package.json)** | npm dependencies & scripts | ✅ Ready |

---

## 🤖 Claude Integration

| File | Purpose | Use When |
|---|---|---|
| **[.claude/claude.md](.claude/claude.md)** | MCP configuration guide | Setting up Claude Desktop |
| **[.claude/skills/workato-project-cataloguer.md](.claude/skills/workato-project-cataloguer.md)** | List & catalogue recipes | Discovery, inventory |
| **[.claude/skills/workato-cli-orchestrator.md](.claude/skills/workato-cli-orchestrator.md)** | Sync recipes to/from Workato | Pull/push operations |

**Quick Start**: Read `.claude/claude.md` first, then use the skills with Claude.

---

## 🏗️ Infrastructure (Terraform)

| File | Purpose |
|---|---|
| **[terraform/main.tf](terraform/main.tf)** | Azure resources (SQL, Key Vault, Storage) |
| **[terraform/variables.tf](terraform/variables.tf)** | Input variables |
| **[terraform/outputs.tf](terraform/outputs.tf)** | Output values |
| **[terraform/environments/dev.tfvars.example](terraform/environments/dev.tfvars.example)** | Dev environment config |
| **[terraform/environments/staging.tfvars.example](terraform/environments/staging.tfvars.example)** | Staging environment config |
| **[terraform/environments/prod.tfvars.example](terraform/environments/prod.tfvars.example)** | Production environment config |

**Quick Start**: Copy `dev.tfvars.example` to `dev.tfvars`, fill in credentials, then run `npm run terraform:init`.

---

## 🔧 Scripts

| Script | Purpose | Usage |
|---|---|---|
| **[scripts/setup.js](scripts/setup.js)** | Setup wizard | `node scripts/setup.js` |
| **[scripts/setup-db-connection.sh](scripts/setup-db-connection.sh)** | Database connection setup | `bash scripts/setup-db-connection.sh dev` (TODO) |

---

## 📝 Recipe Files

| Location | Purpose |
|---|---|
| **[recipes/](recipes/)** | Your recipe JSON files go here |
| **[recipe-templates/basic_sync_template.json](recipe-templates/basic_sync_template.json)** | Template for new recipes |

**Quick Start**: Copy template, edit, then `npm run lint` to validate.

---

## 🚀 GitHub Actions

| Workflow | Trigger | Purpose |
|---|---|---|
| **[.github/workflows/lint.yml](.github/workflows/lint.yml)** | Push / PR | Validate recipe syntax & security |
| **[.github/workflows/sync.yml](.github/workflows/sync.yml)** | Manual trigger | Pull/push recipes to/from Workato |
| **[.github/workflows/terraform.yml](.github/workflows/terraform.yml)** | PR / Push | Plan Terraform changes |

**Quick Start**: These run automatically. Check "Actions" tab on GitHub.

---

## 📋 Common Tasks

### I want to...

#### Create a recipe
1. Read: [CONTRIBUTING.md](CONTRIBUTING.md#creating-a-recipe)
2. Copy: `recipe-templates/basic_sync_template.json`
3. Edit with your logic
4. Run: `npm run lint`
5. Commit: `git commit -m "Add: recipe_name"`

#### Pull recipes from Workato
1. Setup: Follow [SETUP.md](SETUP.md)
2. Run: `npm run wk:pull`
3. Commit: `git add recipes/ && git commit -m "chore: sync recipes from Workato"`

#### Push recipes to Workato
1. Setup: Follow [SETUP.md](SETUP.md)
2. Run: `npm run lint` (validate first)
3. Run: `npm run wk:push`
4. Verify in Workato UI

#### Deploy Azure infrastructure
1. Setup: [SETUP.md](SETUP.md#step-8-optional-setup-terraform--azure)
2. Configure: `terraform/environments/dev.tfvars`
3. Run: `npm run terraform:init`
4. Plan: `npm run terraform:plan`
5. Apply: `npm run terraform:apply`

#### Use Claude Desktop
1. Read: [.claude/claude.md](.claude/claude.md)
2. Edit: `~/.config/Claude/claude_desktop_config.json`
3. Ask Claude: "List all recipes in my workspace"

#### Set up GitHub
1. Read: [GITHUB-SETUP.md](GITHUB-SETUP.md)
2. Create private repo
3. Add GitHub Secrets
4. Start pushing code

---

## 🎯 Development Workflow at a Glance

```
git pull                        (get latest)
    ↓
npm run wk:pull                (sync from Workato)
    ↓
Edit recipes/*.json            (make changes)
    ↓
npm run lint                   (validate)
    ↓
git commit -m "Add: ..."       (save to Git)
    ↓
git push                       (share with team)
    ↓
GitHub Actions runs lint       (validation)
    ↓
PR review & merge              (approval)
    ↓
npm run wk:push                (deploy to Workato)
    ↓
Done! 🎉
```

---

## 💡 Pro Tips

### Useful Commands
```bash
npm run lint:fix               # Auto-fix linting issues
npm run wk:status              # Check sync status
npm run wk:diff                # See what changed
npm run terraform:plan         # Preview infrastructure
```

### With Claude Desktop
```
"List all recipes in my workspace"
"Show me recipes with 'customer' in the name"
"Build a custom connector for the Weather API"
"Pull all recipes from Workato to Git"
```

### Git Workflows
```bash
# Create feature branch
git checkout -b feature/my-recipe

# Push for review
git push -u origin feature/my-recipe

# Merge after review
git merge feature/my-recipe
```

---

## 🆘 Troubleshooting Quick Links

| Issue | Solution |
|---|---|
| "Cannot find module" | See [README.md § Troubleshooting](README.md#-troubleshooting) |
| "Authentication failed" | Run `npm run wk:auth` |
| "Linter errors" | Run `npm run lint:fix` |
| "Terraform fails" | Check [SETUP.md § Step 8](SETUP.md#step-8-optional-setup-terraform--azure) |
| "Git push fails" | See [CONTRIBUTING.md § Troubleshooting](CONTRIBUTING.md#troubleshooting) |

---

## 📚 External Resources

- 📖 [Workato API Documentation](https://docs.workato.com/en/workato-api/)
- 🤖 [MCP Protocol Specification](https://modelcontextprotocol.io/)
- ⚙️ [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest)
- 💻 [wk CLI Repository](https://github.com/workato-devs/wk)
- 🐙 [GitHub Docs](https://docs.github.com/)

---

## 📊 File Structure Overview

```
workato-code-driven-dev/
├── README.md                 ← START HERE
├── SETUP.md                  ← Setup instructions
├── ARCHITECTURE.md           ← How it works
├── CONTRIBUTING.md           ← How to contribute
├── GITHUB-SETUP.md          ← GitHub setup
├── INDEX.md                 ← This file
│
├── recipes/                 ← Your recipes go here
├── recipe-templates/        ← Templates
│
├── terraform/               ← Infrastructure
├── .github/workflows/       ← CI/CD pipelines
│
├── .claude/                 ← Claude integration
├── scripts/                 ← Helper scripts
│
├── .env.example             ← Secrets template
├── mcp.json                 ← MCP config
├── claude_desktop_config.json
├── linter-config.json
└── package.json
```

---

## ❓ FAQ

**Q: Where do I put my recipes?**  
A: In the `recipes/` directory as JSON files.

**Q: How do I authenticate?**  
A: Run `npm run wk:auth` after setup.

**Q: Can I use this with GitHub?**  
A: Yes! See [GITHUB-SETUP.md](GITHUB-SETUP.md).

**Q: How do I add team members?**  
A: Share the GitHub repo link, they follow [SETUP.md](SETUP.md).

**Q: Is this free?**  
A: The tools are, but Azure resources may incur charges.

**Q: Can I use this with Cursor IDE?**  
A: Yes! See [.claude/claude.md](.claude/claude.md).

---

<div align="center">

**🎉 You're All Set!**

Start with [README.md](README.md), then follow [SETUP.md](SETUP.md).

Questions? Check [CONTRIBUTING.md](CONTRIBUTING.md#questions).

</div>
