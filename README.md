<div align="center">

# 🚀 Workato Code-Driven Development

![GitHub](https://img.shields.io/badge/GitHub-Private%20Repo-blue?logo=github)
![License](https://img.shields.io/badge/License-Private-red)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

**Recipes as Code • Version Control • Governance • DevOps at Scale**

[Quick Start](#quick-start) • [Architecture](#architecture) • [Tools](#tools) • [Development](#development) • [Troubleshooting](#troubleshooting)

</div>

---

## 📖 What Is This?

This is a **production-ready template** for managing Workato integrations using **code-driven development principles**. It combines:

- 📝 **Recipes as Code** — Store recipes in Git (JSON files)
- 🔐 **Header Authentication** — MCP servers with secure header-based auth
- 🏗️ **Infrastructure as Code** — Terraform for Azure resources
- 🤖 **AI-Powered Development** — Claude + Workato MCPs
- 🔄 **CI/CD Ready** — Automated linting, testing, deployment
- 📊 **Governance** — Recipe linting, standards enforcement

### Key Features

✅ **Developer API MCP** — Manage workspace (recipes, connections, jobs, genies)  
✅ **AIRO MCP** — Build custom connectors from natural language  
✅ **Workato Labs (wk CLI)** — Sync recipes between Git and Workato  
✅ **Recipe Linter** — Enforce naming conventions, error handling, no hardcoded secrets  
✅ **Terraform + Azure** — Provision SQL Database, Key Vault, storage  
✅ **Claude Desktop Integration** — Use MCPs for AI-powered development  
✅ **Pre-configured** — Just add your API token and go

---

## 🚀 Quick Start

### Prerequisites

- ✅ **Node.js** 18+ (`node --version`)
- ✅ **npm** (`npm --version`)
- ✅ **Git** (`git --version`)
- ✅ **Terraform** 1.0+ (`terraform --version`)
- ✅ **Azure CLI** (`az --version`)
- ✅ **Workato Account** (Direct, with API token)

### Installation (5 minutes)

#### 1️⃣ Clone & Setup
```bash
git clone https://github.com/your-org/workato-code-driven-dev.git
cd workato-code-driven-dev
npm install
node scripts/setup.js
```

#### 2️⃣ Configure Secrets
```bash
cp .env.example .env
# Edit .env with:
# - WORKATO_API_TOKEN (Workspace Admin > API clients)
# - WORKATO_WORKSPACE_ID (your workspace ID)
# - Azure credentials (if using Terraform)
```

#### 3️⃣ Authenticate
```bash
npm run wk:auth
npm run wk:status
```

#### 4️⃣ Discover Your Projects (NEW: Selective Hydration)
Use Claude or your AI client to discover all projects:
```bash
# Using Claude Desktop / OpenCode / Cursor:
Claude: "I'm setting up for the first time, show me all projects"
→ Returns full inventory with recipe counts and activity status
→ You can then choose which projects to hydrate
```

Or use CLI directly:
```bash
npm run wk:pull --project "Data Sync"
npm run wk:pull --project "Customer API"
```

#### 5️⃣ Hydrate Selected Projects to Git
```bash
# Claude will guide you through this, or manually:
git add recipes/
git commit -m "Initial hydration: Data Sync & Customer API"
git push
```

#### 6️⃣ Add More Projects Later (Iterative Approach)
After initial setup, you can add more projects without re-syncing:
```bash
Claude: "Which projects can I still hydrate?"
Claude: "Hydrate Internal Tools to Git"
→ Downloads only new projects
→ Doesn't re-pull already hydrated recipes
```

#### 7️⃣ Optional: Deploy Infrastructure
```bash
cp terraform/environments/dev.tfvars.example terraform/environments/dev.tfvars
# Edit with your Azure credentials
npm run terraform:init
npm run terraform:plan
npm run terraform:apply
```

**Done!** You're ready to develop 🎉

---

## 🏗️ Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Workflow                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Local Machine                                              │
│  ├─ Claude Desktop (with MCPs configured)                  │
│  ├─ VS Code (with Workato extensions)                      │
│  ├─ wk CLI (recipe sync)                                   │
│  ├─ Git (version control)                                  │
│  └─ Terraform (infrastructure)                             │
│                                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐   ┌──────────┐   ┌──────────────┐
   │   Git   │   │ Workato  │   │    Azure     │
   │ (GitHub)│   │  Recipes │   │ (Terraform)  │
   │         │   │   + MCPs │   │              │
   └─────────┘   └──────────┘   └──────────────┘
```

### Technology Stack

| Component | Purpose | Status |
|---|---|---|
| **Workato Developer API MCP** | Workspace management | ✅ Configured |
| **AIRO MCP** | Connector building | ✅ Configured |
| **wk CLI** | Recipe sync | ✅ Preconfigured |
| **Recipe Linter** | Code quality | ✅ Ready |
| **Terraform** | Infrastructure | ✅ Templates provided |
| **Azure SQL** | Data storage | ✅ Terraform config ready |
| **Azure Key Vault** | Secrets | ✅ Terraform config ready |
| **GitHub** | Version control | ✅ Ready |

---

## 🛠️ Tools & Commands

### AI-Assisted Workflow (Recommended)

Use Claude Desktop, OpenCode, or Cursor with these commands:

```
# Initial Discovery
"I'm setting up for the first time, show me all projects"
→ List all projects with recipe counts and activity status

"Hydrate [project names] to Git"
→ Selectively pull chosen projects (not all-or-nothing)

"Which projects haven't I hydrated yet?"
→ Show remaining projects ready for future hydration

# Ongoing Operations
"Pull latest recipes from Workato"
"Push recipe changes to Workato"
"Show me the differences between Git and Workato"
```

### NPM Scripts (Direct CLI Approach)

```bash
# Development
npm run setup              # Run setup wizard
npm run lint              # Check recipe syntax & standards
npm run lint:fix          # Auto-fix linting issues

# Workato CLI (wk) - Discovery & Hydration
npm run wk:auth           # Authenticate with Workato
npm run wk:pull           # Pull recipes from Workato to Git
npm run wk:pull --project "Project Name"  # Pull specific project
npm run wk:push           # Push recipes from Git to Workato
npm run wk:status         # Check sync status
npm run wk:diff           # Show differences

# Terraform
npm run terraform:init    # Initialize Terraform
npm run terraform:plan    # Preview infrastructure changes
npm run terraform:apply   # Deploy infrastructure
npm run terraform:destroy # Tear down infrastructure

# Azure
npm run azure:login       # Login to Azure (service principal)
npm run setup:db          # Setup database connection
```

### Manual Commands

```bash
# Authentication
wk auth login --api-token $WORKATO_API_TOKEN
wk auth logout

# Recipe operations
wk pull recipes/              # Sync from Workato
wk push recipes/              # Sync to Workato
wk diff recipes/              # Show changes
wk status recipes/            # Check status

# Terraform
terraform -chdir=terraform init
terraform -chdir=terraform plan -var-file='environments/dev.tfvars'
terraform -chdir=terraform apply -var-file='environments/dev.tfvars'
terraform -chdir=terraform output

# Azure CLI
az login --service-principal -u $AZURE_CLIENT_ID -p $AZURE_CLIENT_SECRET --tenant $AZURE_TENANT_ID
az keyvault secret show --vault-name kv-workato-dev --name db-password
```

---

## 📁 Project Structure

```
workato-code-driven-dev/
├── README.md                          # This file (you are here)
├── .env.example                       # Environment variables template
├── .gitignore                         # Git ignore rules
├── mcp.json                           # MCP server configuration (legacy)
├── claude_desktop_config.json         # Claude Desktop MCP setup
├── linter-config.json                 # Recipe linting rules
├── package.json                       # NPM dependencies & scripts
│
├── recipes/                           # 🎯 Recipe JSON files here
│   ├── .gitkeep
│   └── [your recipes].json
│
├── recipe-templates/                  # 📋 Template recipes
│   └── basic_sync_template.json
│
├── terraform/                         # 🏗️ Infrastructure as Code
│   ├── main.tf                        # Azure resources
│   ├── variables.tf                   # Input variables
│   ├── outputs.tf                     # Output values
│   └── environments/
│       ├── dev.tfvars.example
│       ├── staging.tfvars.example
│       └── prod.tfvars.example
│
├── scripts/                           # 🔧 Helper scripts
│   ├── setup.js                       # Setup wizard
│   └── setup-db-connection.sh         # Database setup (TODO)
│
├── .opencode/                         # ⭐ Universal AI client config (RECOMMENDED)
│   ├── opencode.jsonc                 # Config for OpenCode (auto-detected)
│   ├── README.md                      # Setup guide
│   ├── SETUP-BY-CLIENT.md             # Client-specific instructions
│   ├── COMPATIBILITY.md               # Verification details
│   ├── mcps/                          # MCP configs per client
│   │   ├── claude-desktop-config.json
│   │   ├── cursor-config.json
│   │   └── generic-mcp-client-config.json
│   └── skills/                        # Skill definitions
│       ├── workato-project-cataloguer/SKILL.md
│       └── workato-cli-orchestrator/SKILL.md
│
├── .claude/                           # 🤖 Claude Desktop (legacy)
│   ├── claude.md                      # Claude configuration guide
│   └── skills/                        # Claude skills
│       ├── workato-project-cataloguer.md
│       └── workato-cli-orchestrator.md
│
└── .github/                           # 🚀 GitHub Actions (TODO)
    ├── workflows/
    │   ├── lint.yml
    │   ├── test.yml
    │   └── deploy.yml
```

**ℹ️ Note**: The `.opencode/` directory is the recommended configuration for all AI clients. The `.claude/` directory is maintained for backward compatibility.

---

## ⚡ Available Skills

This project includes specialized skills for Claude Desktop, OpenCode, and Cursor that automate common Workato tasks.

### 1. **Workato Project Cataloguer**
**What it does**: Discover all projects in your workspace and selectively hydrate (download) them to Git.

**Use cases**:
- First-time setup: "Show me all my projects" → Lists all projects with recipe counts and activity status
- Selective hydration: "Hydrate Data Sync and Customer API to Git" → Download only the projects you choose
- Incremental additions: "What projects haven't I hydrated yet?" → See remaining projects available

**Key features**:
- ✅ Lists all projects with metadata (recipe count, last modified date, active/inactive status)
- ✅ Selective hydration (don't download everything at once)
- ✅ Incremental workflow (add more projects later without re-syncing existing ones)
- ✅ Uses NEW wk CLI profile per customer (no default profiles shared)
- ✅ Saves profile name to .env for reproducibility

**Location**: `.opencode/skills/workato-project-cataloguer/`

---

### 2. **Workato CLI Orchestrator**
**What it does**: Sync recipes between Git and Workato, check differences, and deploy changes.

**Use cases**:
- Pull recipes: "Pull all recipes from Workato" → Downloads recipes to local Git
- Push changes: "Push recipe changes to Workato" → Deploys modified recipes
- Check differences: "Show me the differences between Git and Workato" → Compare versions before syncing

**Key features**:
- ✅ Bi-directional sync (pull from Workato, push to Git)
- ✅ Diff comparison (identify conflicts before pushing)
- ✅ Status reporting (shows what changed and what's pending)
- ✅ Validation (checks syntax and standards before deployment)

**Location**: `.opencode/skills/workato-cli-orchestrator/`

---

### 3. **Workato Teams Bot Setup** ⭐ NEW
**What it does**: Set up a Microsoft Teams Enterprise Workbot with Infrastructure as Code (Terraform or Azure CLI).

**Use cases**:
- Automate bot creation: "Set up a Teams bot for HR" → Guided setup with all configuration options
- Generate Terraform: Choose Terraform option → Production-ready Infrastructure as Code
- Generate scripts: Choose Azure CLI option → Step-by-step bash scripts with manual steps documented
- Comprehensive guides: Auto-generated setup checklists for manual portal configuration

**Key features**:
- ✅ Guided interactive prompts (5 phases, all required data collected)
- ✅ Terraform Infrastructure as Code (full Azure AD app registration automation)
- ✅ Azure CLI scripting (transparent, step-by-step shell commands)
- ✅ Comprehensive setup checklists (manual steps for Workato, Teams, Azure portals)
- ✅ Security best practices (secrets handling, expiration tracking, rotation guidance)
- ✅ All Workato data centers supported (US, EU, JP, SG, AU, IL, CN, KR, UK)
- ✅ Input validation (URLs, UUIDs, dates with helpful error messages)
- ✅ Troubleshooting guides (common issues with solutions)

**Deployment options**:
1. **Terraform** (Recommended) — Full Infrastructure as Code, version controllable, repeatable
2. **Azure CLI** (Manual) — Step-by-step bash script, transparent, easy to modify
3. **Manual** (Checklist) — Follow guided checklist, maximum control, best for learning

**Generated outputs**:
- `teams-bot-terraform/` — Terraform modules (main.tf, variables.tf, outputs.tf, tfvars)
- `teams-bot-setup.sh` — Bash script for Azure CLI workflow
- `setup-checklist.md` — Step-by-step verification guide for Workato, Teams, and Azure portals
- `teams-bot-config.json` — Configuration reference (no secrets)

**Location**: `.opencode/skills/workato-teams-bot-setup/`

**Documentation**: 
- Main skill: `.opencode/skills/workato-teams-bot-setup/SKILL.md`
- Claude instructions: `.opencode/skills/workato-teams-bot-setup/CLAUDE.md`
- Quick start: `.opencode/skills/workato-teams-bot-setup/references/quick-start.md`
- Terraform guide: `.opencode/skills/workato-teams-bot-setup/references/terraform-guide.md`
- Azure CLI guide: `.opencode/skills/workato-teams-bot-setup/references/azure-cli-guide.md`

---

### How to Use These Skills

**In Claude Desktop, OpenCode, or Cursor**:
Simply ask your AI client naturally:
```
"I'm setting up for the first time, show me all projects"
"Hydrate Data Sync and Customer API to Git"
"Set up a Teams bot for HR"
"Show me the differences between Git and Workato"
"Push recipe changes to Workato"
```

The AI will automatically load the appropriate skill and guide you through the workflow.

---

## 🔐 Security

### Header Authentication

All MCP servers use **header-based authentication** (not token in body):

```json
{
  "headers": {
    "Authorization": "Bearer YOUR_API_TOKEN"
  }
}
```

### Secrets Management

✅ **Do**:
- Store API tokens in `.env`
- Use Azure Key Vault for production secrets
- Rotate tokens regularly
- Use minimal-privilege API roles

❌ **Don't**:
- Commit `.env` to Git
- Store secrets in recipe files
- Hardcode credentials in code
- Share tokens in Slack/email

### GitHub Secrets (TODO)

Set up GitHub Actions with:
```bash
WORKATO_API_TOKEN=...
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
```

---

## 📊 Development Workflow

### Initial Setup (First Time)

```
1. Set up your AI client (OpenCode, Claude Desktop, or Cursor)
   See: .opencode/SETUP-BY-CLIENT.md

2. Ask your AI client: "I'm setting up for the first time, show me all projects"
   → See all projects with recipe counts and activity status

3. Choose which projects to hydrate:
   "Hydrate Data Sync and Customer API to Git"
   → AI client pulls selected projects via wk CLI
   → Recipes saved to recipes/ directory
   → Shows status of each project

4. Commit initial hydration:
   git add recipes/
   git commit -m "Initial hydration: Data Sync & Customer API"
   git push

5. Later, add more projects as needed:
   "Hydrate Internal Tools to Git"
   → Only new projects downloaded
   → Existing projects not re-synced
```

### Typical Day (After Setup)

```
Morning:
  1. git pull (get team's changes)
  2. Ask AI: "Show me differences between Git and Workato"
  3. Resolve any conflicts

During Development:
  1. Create/edit recipe JSON in recipes/
  2. npm run lint (check syntax)
  3. Test in Workato UI (optional)
  4. git commit (save to Git)

Before Push:
  1. Ask AI: "Show me differences between Git and Workato"
  2. npm run wk:push (sync to Workato)
  3. git push (share with team)

After Work:
  1. Ask AI: "Pull latest recipes from Workato"
  2. git status (check everything committed)
  
Or Just Use CLI:
  1. npm run wk:pull
  2. npm run wk:diff
  3. npm run wk:push
```

### With Claude Desktop / OpenCode / Cursor

**Initial Setup Workflow (Recommended)**:
```
1. Open your AI client (Claude Desktop, OpenCode, or Cursor)

2. "I'm setting up for the first time, show me all projects"
   → Cataloguer discovers all projects
   → Shows: names, recipe counts, activity status
   → Example:
     1. Data Sync (24 recipes) - Last modified 2 days ago
     2. Customer API (18 recipes) - Last modified 1 week ago
     3. Internal Tools (9 recipes) - Last modified 1 month ago
     4. Experiments (3 recipes) - Last modified 3 months ago
     Total: 54 recipes across 4 projects

3. "Hydrate Data Sync and Customer API to Git"
   → CLI Orchestrator pulls via wk CLI
   → Downloads full recipe definitions
   → Saves to recipes/[project-name]/
   → Shows: ✅ Data Sync: 24 recipes (OK)
           ✅ Customer API: 18 recipes (OK)
           ⚠️ Remaining: Internal Tools, Experiments (available on request)

4. Git workflow:
   $ git add recipes/
   $ git commit -m "Initial hydration: Data Sync & Customer API"
   $ git push

5. Later, add more projects incrementally:
   "Hydrate Internal Tools to Git"
   → Pulls only new project (9 recipes)
   → No need to re-sync existing recipes
   → Ready to commit again
```

**Other AI-Powered Commands**:
```
✅ "List all recipes in my workspace"
   → Developer API MCP
   → Returns: all recipes, status, metadata

✅ "Build a connector for the Weather API"
   → AIRO MCP
   → Generates: connection, actions, triggers

✅ "Show me the differences between Git and Workato"
   → Compare local vs remote
   → Identify conflicts

✅ "Which recipes haven't run in the last 30 days?"
   → Identify inactive recipes
   → Plan cleanup

✅ "Export a complete recipe inventory as JSON"
   → Programmatic access to metadata
   → Use for reports/analysis
```

---

## 🚀 Deployment

### Local Development
```bash
npm run wk:push
```

### Staging (Terraform)
```bash
npm run terraform:plan -var-file='environments/staging.tfvars'
npm run terraform:apply -var-file='environments/staging.tfvars'
```

### Production (CI/CD - TODO)
Push to `main` branch → GitHub Actions → Deploy

---

## 📋 Skills (Claude Desktop, OpenCode, Cursor)

### 1. Workato Project Cataloguer
**Discovery & Selective Hydration** — Find projects, choose what to hydrate

**First-Time Setup Commands**:
```
"I'm setting up for the first time, show me all projects"
→ Lists all projects with recipe counts and activity status
→ Helps you decide which to hydrate first

"Hydrate [project names] to Git"
→ Selective hydration of chosen projects
→ Uses CLI Orchestrator internally
→ Only pulls what you choose (not all-or-nothing)

"I want selective hydration, help me choose"
→ Interactive guide for decision-making
→ Shows project metadata to help decide
```

**Ongoing Commands**:
```
"Which projects can I still hydrate?"
→ Shows remaining projects not yet in Git
→ Ready for incremental additions

"List all recipes in my workspace"
→ Full inventory of all recipes

"Which recipes haven't run in the last 30 days?"
→ Identify inactive recipes for cleanup
```

**Location**: 
- `.opencode/skills/workato-project-cataloguer/SKILL.md` (OpenCode/Generic)
- `.claude/skills/workato-project-cataloguer.md` (Claude Desktop)

---

### 2. Workato CLI Orchestrator
**Recipe Sync & Deployment** — Pull/push recipes, check diffs, validate

```
"Pull all recipes from Workato"
→ Orchestrator uses wk CLI
→ Downloads recipes to recipes/ directory
→ Ready to commit to Git

"Push recipe changes to Workato"
→ Uploads modified recipes
→ Verifies deployment
→ Shows status

"Show me the differences between Git and Workato"
→ Compare local vs remote
→ Identify conflicts before pushing
```

**Location**: 
- `.opencode/skills/workato-cli-orchestrator/SKILL.md` (OpenCode/Generic)
- `.claude/skills/workato-cli-orchestrator.md` (Claude Desktop)

---

### How to Use Skills

These skills are automatically available in:
- ✅ **OpenCode** — Use `.opencode/opencode.jsonc` (auto-detected)
- ✅ **Claude Desktop** — Configure MCP servers, use `.claude/skills/`
- ✅ **Cursor IDE** — Configure MCP servers in workspace settings

See [.opencode/README.md](.opencode/README.md) for client-specific setup.

---

## 🐛 Troubleshooting

### AI Client Issues

#### "AI client doesn't show Cataloguer skill"
1. Verify MCP servers are configured (see `.opencode/SETUP-BY-CLIENT.md`)
2. Check environment variables are set: `WORKATO_API_TOKEN`, `WORKATO_WORKSPACE_ID`
3. Restart your AI client (Claude Desktop, OpenCode, or Cursor)
4. See: `.opencode/SETUP-BY-CLIENT.md` → Troubleshooting section

#### "Hydration command not working"
1. Ensure wk CLI is installed and authenticated: `npm run wk:auth`
2. Check wk CLI status: `npm run wk:status`
3. Verify project names exist and are exact matches
4. Try direct CLI command: `npm run wk:pull --project "Exact Project Name"`

#### "Cannot find module 'mcp-remote'"
```bash
npm install -g mcp-remote
# or
npx mcp-remote [rest of command]
```

### CLI Issues

#### "Authentication failed"
```bash
npm run wk:auth
# Re-enter credentials
```

#### "Linter errors"
```bash
npm run lint:fix
# Auto-fixes formatting issues
```

#### "Recipe not syncing"
```bash
npm run wk:status
npm run wk:diff
# Review differences before pushing
npm run wk:push
```

#### "Selective project hydration failed"
```bash
# Verify project exists
npm run wk:status

# Try with exact project name (case-sensitive)
npm run wk:pull --project "Data Sync"

# If still failing, try full sync
npm run wk:pull
```

#### "Terraform fails to initialize"
```bash
npm run terraform:init
# Ensure all variables in .env are set
```

### Client-Specific Issues

#### Claude Desktop Won't Connect
1. Restart Claude Desktop
2. Check `~/.config/Claude/claude_desktop_config.json`
3. Verify `WORKATO_API_TOKEN` is set
4. Run: `node -e "console.log(process.env.WORKATO_API_TOKEN)"`

#### OpenCode Issues
- See: https://opencode.ai/docs
- Check: `.opencode/README.md` → Troubleshooting

#### Cursor IDE Issues
- See: `.opencode/SETUP-BY-CLIENT.md` → Cursor IDE section
- Verify workspace settings have MCP configuration

---

## 📚 Documentation

| Document | Purpose |
|---|---|
| [.opencode/README.md](.opencode/README.md) | **START HERE** — Universal client setup & overview |
| [.opencode/SETUP-BY-CLIENT.md](.opencode/SETUP-BY-CLIENT.md) | Step-by-step setup for OpenCode, Claude Desktop, Cursor |
| [.opencode/COMPATIBILITY.md](.opencode/COMPATIBILITY.md) | Technical verification & compliance |
| [.opencode/skills/](./opencode/skills/) | Skill documentation (Cataloguer, CLI Orchestrator) |
| [.claude/claude.md](.claude/claude.md) | Claude Desktop configuration (legacy) |
| [terraform/](terraform/) | Infrastructure as Code configuration |
| [recipe-templates/](recipe-templates/) | Recipe examples & templates |

---

## 🤝 Contributing

### Adding a Recipe
1. Create `recipes/my_recipe.json` (copy from template)
2. Edit with your logic
3. `npm run lint` (fix issues)
4. `git add recipes/my_recipe.json`
5. `git commit -m "Add: my_recipe"`
6. `git push`
7. `npm run wk:push` (deploy to Workato)

### Updating Terraform
1. Edit `terraform/main.tf` or related files
2. `npm run terraform:plan` (review changes)
3. `npm run terraform:apply` (deploy to Azure)
4. Commit changes to Git

---

## ⚠️ TODO Items

- [ ] Implement GitHub Actions CI/CD pipeline (`.github/workflows/`)
- [ ] Complete Azure CLI database setup script (`scripts/setup-db-connection.sh`)
- [ ] Add GitHub Secrets configuration guide
- [ ] Create pre-commit hooks for automatic linting
- [ ] Add recipe testing framework
- [ ] Document secret rotation procedures
- [ ] Set up workspace health monitoring dashboard
- [ ] Create recipe template library (more examples)
- [ ] Add Slack/Teams notifications for deployments
- [ ] Document troubleshooting for common errors

---

## 📞 Support

### Getting Help

```bash
# Check setup status
node scripts/setup.js

# View Workato docs
open https://docs.workato.com/en/workato-api/

# View MCP docs
open https://modelcontextprotocol.io/

# Check wk CLI
wk --help
```

### Common Resources

- 📖 [Workato Developer API](https://docs.workato.com/en/workato-api/)
- 🔐 [AIRO MCP Documentation](https://docs.workato.com/en/airo/mcp)
- ⚙️ [wk CLI Repository](https://github.com/workato-devs/wk)
- 🔌 [MCP Protocol](https://modelcontextprotocol.io/)
- 🏗️ [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest)

---

## 📄 License

This project is **private**. Do not share or distribute without permission.

---

<div align="center">

**Made with ❤️ for Workato developers**

[⬆ Back to top](#-workato-code-driven-development)

</div>
