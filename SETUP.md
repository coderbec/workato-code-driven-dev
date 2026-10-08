# 🛠️ Detailed Setup Guide

This guide walks you through setting up the project step-by-step.

## Prerequisites Checklist

Before starting, verify you have:

- [ ] **Node.js 18+** — `node --version`
- [ ] **npm 9+** — `npm --version`
- [ ] **Git** — `git --version`
- [ ] **Terraform 1.0+** — `terraform --version`
- [ ] **Azure CLI** — `az --version`
- [ ] **Workato Account** — With API token access
- [ ] **GitHub Account** — For private repo

### Install Missing Dependencies

**macOS** (Homebrew):
```bash
brew install node
brew install terraform
brew install azure-cli
brew install git
```

**Linux** (Ubuntu/Debian):
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y terraform
sudo apt-get install -y azure-cli
```

**Windows** (Chocolatey):
```powershell
choco install nodejs
choco install terraform
choco install azure-cli
choco install git
```

---

## Step 1: Clone & Navigate

```bash
git clone https://github.com/YOUR-ORG/workato-code-driven-dev.git
cd workato-code-driven-dev
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This installs:
- `@workato/wk-cli` — Workato CLI for recipe sync
- `@workato/recipe-linter` — Linting for recipes
- `mcp-remote` — MCP client

**Verify**:
```bash
wk --version
npm run lint --version
```

---

## Step 3: Run Setup Wizard

```bash
node scripts/setup.js
```

This checks:
- ✅ All dependencies installed
- ✅ Configuration files present
- ✅ Environment variables ready

Output will look like:
```
═══════════════════════════════════════════════════════════
   Workato Code-Driven Development - Project Setup
═══════════════════════════════════════════════════════════

ℹ️ → Checking system dependencies...

✅ Node.js is installed
✅ npm is installed
✅ Git is installed
✅ Terraform is installed
✅ Azure CLI is installed

✅ All dependencies are installed! You're ready to go.
```

---

## Step 4: Configure Environment Variables

### Copy Template
```bash
cp .env.example .env
```

### Get Workato API Token

1. Go to **Workspace Admin** > **API Clients**
2. Click **Create New**
3. Name: `workato-code-driven-dev`
4. Copy the **API Token**
5. Paste into `.env`:

```bash
# .env
WORKATO_API_TOKEN=your_token_here_from_workspace_admin
WORKATO_WORKSPACE_ID=12345  # Your workspace ID
```

**Find Workspace ID**:
- Go to `https://app.workato.com/dashboard`
- Look at the URL: `app.workato.com/workspaces/12345/`
- Your ID is `12345`

### Get Azure Credentials (Optional, only if using Terraform)

```bash
# Login with Azure CLI
az login

# Get subscription details
az account show --query "{name:name, id:id, tenantId:tenantId}"

# Create service principal for Terraform
az ad sp create-for-rbac --role="Contributor"
```

Paste output into `.env`:
```bash
AZURE_SUBSCRIPTION_ID=...
AZURE_TENANT_ID=...
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
```

### Verify Configuration

```bash
# Check if .env is readable
cat .env

# Verify no secrets in Git
git status
# Should show: .env (not staged)
```

---

## Step 5: Authenticate with Workato

```bash
npm run wk:auth
```

You'll be prompted:
```
Enter your Workato API token: [paste token]
```

**Verify authentication**:
```bash
npm run wk:status
```

Should output:
```
✅ Authenticated as: your-workspace
```

---

## Step 6: Pull Existing Recipes

This downloads all recipes from your workspace:

```bash
npm run wk:pull
```

Output:
```
Pulling recipes from workspace...
✅ 42 recipes downloaded
✅ Saved to recipes/
```

**Verify recipes downloaded**:
```bash
ls recipes/
# Should show: recipe_1.json, recipe_2.json, etc.

wc -l recipes/*.json
# Shows number of files
```

---

## Step 7: Commit to Git

```bash
git add recipes/
git commit -m "Initial: backup of Workato recipes"
git push origin main
```

**Verify**:
```bash
git log --oneline -5
# Should show your commit
```

---

## Step 8: (Optional) Setup Terraform & Azure

If you want to provision Azure resources:

### Create Terraform Variables File

```bash
cp terraform/environments/dev.tfvars.example terraform/environments/dev.tfvars
```

### Edit with Your Values

```bash
nano terraform/environments/dev.tfvars
```

Fill in:
```hcl
azure_subscription_id = "your-subscription-id"
azure_tenant_id       = "your-tenant-id"
azure_client_id       = "your-service-principal-id"
azure_client_secret   = "your-service-principal-secret"
```

### Initialize Terraform

```bash
npm run terraform:init
```

Output:
```
Initializing the backend...
Initializing provider plugins...
✅ Terraform has been successfully initialized!
```

### Preview Changes

```bash
npm run terraform:plan
```

This shows what will be created (without making changes).

### Deploy (⚠️ Creates resources)

```bash
npm run terraform:apply
```

Terraform will ask: `Do you want to perform these actions?`  
Type: `yes`

**What gets created**:
- ✅ Azure Resource Group
- ✅ SQL Server + Database
- ✅ Key Vault (for secrets)
- ✅ Storage Account

View outputs:
```bash
cd terraform
terraform output
```

---

## Step 9: Configure Claude Desktop (Optional)

If you want to use Claude Desktop with Workato MCPs:

### Edit Claude Config

```bash
# macOS/Linux
nano ~/.config/Claude/claude_desktop_config.json

# Windows
notepad %APPDATA%\Claude\claude_desktop_config.json
```

### Add Workato MCPs

```json
{
  "mcpServers": {
    "workato-developer-api": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://app.workato.com/mcp",
        "--header",
        "Authorization: Bearer YOUR_API_TOKEN_HERE"
      ]
    },
    "workato-airo": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://app.workato.com/mcp/airo",
        "--header",
        "Authorization: Bearer YOUR_API_TOKEN_HERE"
      ]
    }
  }
}
```

### Restart Claude Desktop

Quit and reopen Claude Desktop.

### Test MCP Connection

```
Claude: "List all recipes in my workspace"
```

Should return list of recipes.

---

## Step 10: Setup GitHub Secrets (For CI/CD)

### In GitHub Repository Settings

1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Click **New repository secret**

Add these secrets:

| Secret Name | Value |
|---|---|
| `WORKATO_API_TOKEN` | Your Workato API token |
| `WORKATO_WORKSPACE_ID` | Your workspace ID |
| `AZURE_SUBSCRIPTION_ID` | From `az account show` |
| `AZURE_TENANT_ID` | From service principal |
| `AZURE_CLIENT_ID` | From service principal |
| `AZURE_CLIENT_SECRET` | From service principal |

---

## Verification Checklist

Run this to verify everything is set up correctly:

```bash
# Check Node/npm
node --version && npm --version

# Check tools
wk --version
terraform --version
az --version

# Check Workato auth
npm run wk:status

# Check recipes downloaded
ls recipes/ | wc -l

# Check Git
git status

# Check environment
grep -v "^#" .env | grep -v "^$"
```

Expected output:
```
✅ Node v18.x.x
✅ npm 9.x.x
✅ wk 2.x.x
✅ Terraform v1.x.x
✅ Azure CLI 2.x.x
✅ Authenticated as: your-workspace
✅ 42 recipes found
✅ Git repository clean
✅ Environment variables loaded
```

---

## 🎉 You're All Set!

Next steps:

1. **Read the main README**: `README.md`
2. **Learn the workflow**: See "Development Workflow" section
3. **Setup Claude Desktop**: `.claude/claude.md`
4. **Make your first recipe**: Copy `recipe-templates/basic_sync_template.json`

---

## Troubleshooting

### "Command not found: wk"
```bash
npm install -g @workato/wk-cli
wk --version
```

### "Cannot authenticate"
```bash
# Reset authentication
rm ~/.workato/auth

# Re-authenticate
npm run wk:auth
```

### "Terraform fails"
```bash
# Ensure .env is sourced
set -a
source .env
set +a

# Try init again
npm run terraform:init
```

### "GitHub Actions failing"
Check that GitHub Secrets are set:
```
Settings > Secrets and variables > Actions
```

All 6 secrets should be present.

---

## Next: Development

See [README.md](README.md) for:
- 📝 How to create/edit recipes
- 🤖 Using Claude Desktop
- 🚀 Pushing changes
- 📊 CI/CD workflow
