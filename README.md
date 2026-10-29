> ## 🚀 Start here: say **`start workato setup`**
> Clone this repo, open the folder in a terminal (the VS Code terminal is fine), run `claude`, then type
> **`start workato setup`** (or the slash command **`/workato-setup`**). Claude walks you through everything and tells you what it is doing at each step:
> 1. checks your `WORKATO_CODE_DEV` profile variable (your Workato API token) and shows you how to create it if missing
> 2. asks your data centre and configures the Developer API MCP and AIRO MCP (header auth, written last)
> 3. installs Workato Developer Labs (wk CLI, Recipe Linter, Developer Skills, Recipe Visualizer) and creates a wk profile, then asks you to **restart Claude** so the MCPs connect
> 4. after the restart, confirms both MCPs are connected and hydrates the projects you choose
>
> No `.env` file is used anywhere. The token lives only in the `WORKATO_CODE_DEV` variable of your OS profile.

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
- 🏗️ **Infrastructure as Code** — Terraform for Azure resources (optional)
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
✅ **Guided setup** — Say `start workato setup` and Claude does the rest

---

## 🚀 Quick Start

### Prerequisites

- ✅ **Node.js** 18+ (`node --version`) and **Git** (`git --version`)
- ✅ **Claude Code** (`claude`)
- ✅ **Homebrew** (macOS) or **Scoop** (Windows), used to install the wk CLI
- ✅ **Workato API token** from Workspace admin > API clients (role with **Developer API MCP** and **AIRO MCP** tools)
- ⚙️ Terraform 1.0+ and Azure CLI, only if you use the optional Azure infrastructure

### Guided setup (about 5 minutes)

```bash
git clone https://github.com/your-org/workato-code-driven-dev.git
cd workato-code-driven-dev
claude
```
Then type **`start workato setup`** (or **`/workato-setup`**). It runs in two phases with one restart of Claude in the middle (MCP servers only connect when Claude starts):

| Phase | # | Step | What it does |
|-------|---|------|--------------|
| A: before restart | 1 | Profile variable | Checks `WORKATO_CODE_DEV`. If missing, it gives the exact command for macOS or Windows to run in a **new** terminal in the same folder, then to restart Claude and rerun the phrase |
| | 2 | Data centre | Asks us / eu / jp / sg / au / il / kr / uk / trial |
| | 3 | Developer Labs | Installs wk CLI, Recipe Linter, Developer Skills and Recipe Visualizer; one failing never blocks the rest |
| | 4 | wk profile | Creates a new `workato-code-dev-N` profile (never overwrites) and makes it the default |
| | 5 | MCP config | Generates `.mcp.json` for the Developer API MCP and AIRO MCP, header auth `Bearer ${WORKATO_CODE_DEV}` (no OAuth) |
| Restart | 6 | **Restart Claude** | Exit, run `claude` again in the same folder, approve the two MCP servers, run `/mcp` and check both say **connected** |
| B: after restart | 7 | Confirm MCPs | Checks the MCP tools are present; when both are connected you are ready to go |
| | 8 | Projects | Lists your projects through the Developer API MCP so you can pick which to hydrate |
| | 9 | Hydrate | Pulls the chosen projects into `recipes/` (local, gitignored) with `wk` |

After the restart, say **`continue workato setup`** and it picks up at step 7. If a server isn't connected, use `/mcp` and **Reconnect** (never OAuth); the skill lists the usual causes: variable not visible to that terminal, token from a different data centre, or an API client role without the MCP tools.

**Setting the variable yourself** (what step 1 will ask you to do, in a new terminal, then restart VS Code and `claude`):

| OS | Command |
|----|---------|
| macOS (zsh) | `echo 'export WORKATO_CODE_DEV="<token>"' >> ~/.zshrc` |
| Windows (PowerShell / cmd / VS Code terminal) | `setx WORKATO_CODE_DEV "<token>"` |

> VS Code terminals only see variables that existed when VS Code started, so fully quit and reopen VS Code after setting it.

### Later

- Add more projects: ask Claude "Which projects can I still hydrate?" or run `npm run hydrate:interactive`
- Day-to-day sync: `npm run wk:pull`, `wk:push`, `wk:status`, `wk:diff`
- Optional Azure infrastructure: `cp terraform/environments/dev.tfvars.example terraform/environments/dev.tfvars`, edit, then `npm run terraform:init`, `terraform:plan`, `terraform:apply`

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
npm run setup              # Shows how to start the guided setup
npm run lint              # Check recipe syntax & standards
npm run lint:fix          # Auto-fix linting issues

# Workato CLI (wk) - Discovery & Hydration
npm run wk:pull           # Pull recipes from Workato to Git
npm run hydrate:projects -- "Project Name"  # Pull specific project
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
wk auth list                  # see profiles
wk auth switch <profile>     # change the default
wk auth status

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
├── README.md, AGENTS.md               # Overview; agent briefing
├── SETUP.md, GITHUB-SETUP.md          # Setup guides
├── ARCHITECTURE.md, CONTRIBUTING.md   # Design notes; contribution guide
├── package.json                       # NPM scripts (setup, wk:*, terraform:*, check:customer-assets)
├── .mcp.template.json                 # MCP config template (setup renders .mcp.json from it)
├── opencode.jsonc                     # OpenCode config (auto-detected)
├── claude_desktop_config.json         # Example Claude Desktop MCP config
├── linter-config.json                 # Recipe linting rules (linter not wired up yet)
│
├── .agents/skills/                    # ⭐ The only copy of the skills (read by OpenCode, Codex, Cursor)
│   ├── workato-setup/                 #    guided first-run setup
│   ├── workato-project-cataloguer/
│   ├── workato-cli-orchestrator/
│   ├── workato-teams-bot-setup/
│   └── workato-entra-sso-setup/
│
├── .claude/                           # 🤖 Claude Code
│   ├── claude.md                      # Claude configuration guide
│   └── skills -> ../.agents/skills    # Symlink, not a copy
│
├── recipes/                           # 🎯 wk working directory (hydrated from Workato)
│   └── .gitkeep                       #    Everything else here is customer-specific and gitignored
│
├── recipe-templates/                  # 📋 Template recipes
│   └── basic_sync_template.json
│
├── terraform/                         # 🏗️ Infrastructure as Code
│   ├── main.tf, variables.tf, outputs.tf
│   └── environments/                  #    dev / staging / prod .tfvars.example
│
├── scripts/                           # 🔧 Helper scripts
│   ├── setup.js, setup/, lib/         #    guided setup and shared helpers
│   ├── discover-projects.js, hydrate-projects*.js
│   ├── check-no-customer-assets.sh    #    guard: blocks customer material from commits
│   └── setup-db-connection.sh         #    database setup (TODO)
│
├── .githooks/pre-commit               # Runs the guard (enabled by `npm install`)
└── .github/workflows/                 # 🚀 GitHub Actions
    ├── lint.yml                       #    recipe lint (placeholder)
    ├── guard.yml                      #    fails if customer files are tracked
    └── terraform.yml                  #    Terraform plan
```

**ℹ️ Note**: Skills live once, in `.agents/skills/`. OpenCode reads that folder directly and `.claude/skills` is a symlink to it, so there is nothing to keep in sync.

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
- ✅ Uses the active wk profile (no stored settings)

**Location**: `.agents/skills/workato-project-cataloguer/`

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

**Location**: `.agents/skills/workato-cli-orchestrator/`

---

### 3. **Workato Teams Bot Setup**
**What it does**: Sets up a Workato Enterprise Workbot for Microsoft Teams end to end with the Teams Developer CLI, the Workato API and Microsoft Graph. Run it after `start workato setup`.

**What it automates**:
- Creates the Teams-managed bot, the Entra app registration (multitenant) and the Teams app, with your Workato bot endpoint
- Sets the Entra redirect URI for your data centre
- Sets bot scopes (Personal, Team, Group Chat), file upload, the `help` command, valid domain `*.workato.com`, descriptions, developer and policy links in the manifest
- Creates the Workato `teams_bot` custom OAuth profile (the client secret goes straight from the CLI to the Workato API; it is never written to a file or shown)
- Publishes to the org catalog through Graph: directly for Teams admins, otherwise submits for admin review and says what to approve

**Still manual**: creating the custom bot in Workato (to copy its Bot endpoint address), selecting the OAuth profile in Workbot Step 3, and admin approval when you are not a Teams admin. See `references/manual-fallback.md`.

**Say**: "Set up a Teams bot" (needs Node 22.12+, the `teams` CLI, `az login`, and custom app upload enabled in your tenant; preflight checks all of this).

**Location**: `.agents/skills/workato-teams-bot-setup/` (`.claude/skills` is a symlink to `.agents/skills`). Start with `SKILL.md`.

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
- Keep the API token only in the `WORKATO_CODE_DEV` profile variable of your OS
- Use Azure Key Vault for production secrets
- Rotate tokens regularly
- Use minimal-privilege API roles

❌ **Don't**:
- Put tokens in any file (including `.env`), or commit them to Git
- Store secrets in recipe files
- Hardcode credentials in code
- Share tokens in Slack/email

### GitHub Secrets (TODO)

Set up GitHub Actions with:
```bash
WORKATO_CODE_DEV=...
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
```

---

## 📊 Development Workflow

### Initial Setup (First Time)

```
1. Set up your AI client (OpenCode, Claude Desktop, or Cursor)
   See: `.claude/claude.md` (Claude) or `opencode.jsonc` (OpenCode)

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
- `.agents/skills/workato-project-cataloguer/SKILL.md` (all clients; `.claude/skills` is a symlink to it)

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
- `.agents/skills/workato-cli-orchestrator/SKILL.md` (all clients; `.claude/skills` is a symlink to it)

---

### How to Use Skills

These skills are automatically available in:
- ✅ **OpenCode** — Uses `opencode.jsonc` and reads `.agents/skills/` (auto-detected)
- ✅ **Claude Code / Claude Desktop** — Configure MCP servers, skills load from `.claude/skills/` (symlink to `.agents/skills/`)
- ✅ **Cursor IDE** — Configure MCP servers in workspace settings

See [.claude/claude.md](.claude/claude.md) for client-specific setup.

---

## 🐛 Troubleshooting

### AI Client Issues

#### "AI client doesn't show Cataloguer skill"
1. Verify MCP servers are configured (see `.claude/claude.md`)
2. Check `WORKATO_CODE_DEV` is set (say `start workato setup`; step 1 checks it)
3. Restart your AI client (Claude Desktop, OpenCode, or Cursor)
4. See: the Troubleshooting section of `.claude/claude.md`

#### "Hydration command not working"
1. Ensure wk CLI is installed and authenticated: say `start workato setup` (steps 4 and 5)
2. Check wk CLI status: `npm run wk:status`
3. Verify project names exist and are exact matches
4. Try: `npm run hydrate:projects -- "Exact Project Name"`

#### "Cannot find module 'mcp-remote'"
```bash
npm install -g mcp-remote
# or
npx mcp-remote [rest of command]
```

### CLI Issues

#### "Authentication failed"
```bash
wk auth status
# If it fails, rotate WORKATO_CODE_DEV and say: start workato setup (creates a fresh profile)
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
npm run hydrate:projects -- "Data Sync"

# If still failing, try full sync
npm run wk:pull
```

#### "Terraform fails to initialize"
```bash
npm run terraform:init
# Ensure your Terraform variables are set (terraform/environments/*.tfvars)
```

### Client-Specific Issues

#### Claude Desktop Won't Connect
1. Restart Claude Desktop
2. Check `~/.config/Claude/claude_desktop_config.json`
3. Verify `WORKATO_CODE_DEV` is set (do not print it): `node scripts/setup/check-profile-var.js`

#### OpenCode Issues
- See: https://opencode.ai/docs

#### Cursor IDE Issues
- See: the Cursor section of `.claude/claude.md`
- Verify workspace settings have MCP configuration

---

## 📚 Documentation

| Document | Purpose |
|---|---|
| [.claude/claude.md](.claude/claude.md) | **START HERE** — Client setup, skills overview and troubleshooting |
| [.agents/skills/](.agents/skills/) | Skill documentation (the single copy) |
| [opencode.jsonc](opencode.jsonc) | OpenCode MCP configuration |
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
