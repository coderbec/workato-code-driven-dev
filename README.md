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
# - Azure credentials (if using Terraform)
```

#### 3️⃣ Authenticate
```bash
npm run wk:auth
npm run wk:status
```

#### 4️⃣ Pull Existing Recipes
```bash
npm run wk:pull
git add recipes/
git commit -m "Initial recipe backup"
git push
```

#### 5️⃣ Optional: Deploy Infrastructure
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

### NPM Scripts

```bash
# Development
npm run setup              # Run setup wizard
npm run lint              # Check recipe syntax & standards
npm run lint:fix          # Auto-fix linting issues

# Workato CLI (wk)
npm run wk:auth           # Authenticate with Workato
npm run wk:pull           # Pull recipes from Workato to Git
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
├── README.md                          # This file
├── .env.example                       # Environment variables template
├── .gitignore                         # Git ignore rules
├── mcp.json                           # MCP server configuration
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
├── .claude/                           # 🤖 Claude integration
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

### Typical Day

```
Morning:
  1. git pull (get team's changes)
  2. npm run wk:pull (sync from Workato)
  3. Resolve any git conflicts

During Development:
  1. Create/edit recipe JSON in recipes/
  2. npm run lint (check syntax)
  3. Test in Workato UI (optional)
  4. git commit (save to Git)

Before Push:
  1. npm run wk:diff (review changes)
  2. npm run wk:push (sync to Workato)
  3. git push (share with team)

After Work:
  1. npm run wk:pull (capture any changes)
  2. git status (check everything committed)
```

### With Claude Desktop

```
1. Open Claude Desktop
2. "List all recipes in my workspace"
   → Uses Developer API MCP
   → Returns: all recipes, status, metadata

3. "Build a connector for the Weather API"
   → Uses AIRO MCP
   → Generates: connection, actions, triggers

4. "Pull latest recipes from Workato"
   → Uses wk CLI Orchestrator skill
   → Saves to recipes/ directory

5. npm run lint
   → Check syntax
   → Fix issues

6. git commit && git push
   → Save to version control
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

## 📋 Claude Skills

### 1. Workato Project Cataloguer
**Discovery & Inventory** — Find all recipes, projects, health status

```
Claude: "List all recipes in my workspace"
→ Cataloguer uses Developer API MCP
→ Returns: JSON with all recipes, projects, status
```

**Location**: `.claude/skills/workato-project-cataloguer.md`

### 2. Workato CLI Orchestrator
**Sync & Deployment** — Pull/push recipes, check diffs

```
Claude: "Pull all recipes from Workato"
→ Orchestrator uses wk CLI
→ Downloads recipes to recipes/ directory
→ Ready to commit to Git
```

**Location**: `.claude/skills/workato-cli-orchestrator.md`

---

## 🐛 Troubleshooting

### "Cannot find module 'mcp-remote'"
```bash
npm install -g mcp-remote
# or
npx mcp-remote [rest of command]
```

### "Authentication failed"
```bash
npm run wk:auth
# Re-enter credentials
```

### "Linter errors"
```bash
npm run lint:fix
# Auto-fixes formatting issues
```

### "Recipe not syncing"
```bash
npm run wk:status
npm run wk:diff
# Review differences before pushing
npm run wk:push
```

### "Terraform fails to initialize"
```bash
npm run terraform:init
# Ensure all variables in .env are set
```

### "Claude Desktop won't connect"
1. Restart Claude Desktop
2. Check `~/.config/Claude/claude_desktop_config.json`
3. Verify `WORKATO_API_TOKEN` is set
4. Run: `node -e "console.log(process.env.WORKATO_API_TOKEN)"`

---

## 📚 Documentation

| Document | Purpose |
|---|---|
| [.claude/claude.md](.claude/claude.md) | Claude Desktop & MCP setup |
| [.claude/skills/](..claude/skills/) | Claude skills & operations |
| [terraform/](terraform/) | Infrastructure configuration |
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
