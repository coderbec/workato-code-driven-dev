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

## Steps 2 to 7: Run the guided setup

Everything from installing the wk CLI to pulling recipes is done by the guided setup in Claude Code. There is no `.env` file and no manual token handling.

1. In a terminal in this folder, run `claude`.
2. Type **`start workato setup`** (or **`/workato-setup`**).
3. Follow the prompts. Claude says what it is doing at each step.

### What it does, in order
| Phase | Step | Result |
|---|---|---|
| Before restart | 1. Profile variable | Checks `WORKATO_CODE_DEV` (your Workato API token). If missing, it shows the command to run in a new terminal |
| | 2. Data centre | You choose us / eu / jp / sg / au / il / kr / uk / trial |
| | 3. Developer Labs | Installs wk CLI, Recipe Linter, Developer Skills, Recipe Visualizer. One failure never blocks the others |
| | 4. wk profile | Creates a new `workato-code-dev-N` profile and makes it the default |
| | 5. MCP config | Generates `.mcp.json` for the Developer API MCP and AIRO MCP (header auth) |
| Restart | 6. Restart Claude | Exit, run `claude` again, approve the two MCP servers, run `/mcp` and check both say **connected** |
| After restart | 7-9. Projects | Confirms the MCPs, lists your projects, hydrates the ones you pick into `recipes/` |

### Get your Workato API token
1. Go to **Workspace admin** > **API clients**
2. Create a client with a role that includes the **Developer API MCP** and **AIRO MCP** tools
3. Copy the token (it is shown once)

### Set the profile variable (new terminal, same project folder)
| OS | Command |
|---|---|
| macOS (zsh) | `echo 'export WORKATO_CODE_DEV="<token>"' >> ~/.zshrc` |
| Windows (PowerShell, cmd or VS Code terminal) | `setx WORKATO_CODE_DEV "<token>"` |

Then fully quit and reopen VS Code (if you use it), run `claude` in this folder and say **start workato setup** again.

### Azure credentials (optional, only for Terraform)
Do not put these in a file in this repo. Sign in with `az login`, or export `TF_VAR_*` variables in your shell, or keep a values file outside the repo.

### Verify
```bash
node scripts/setup/status.js     # shows which setup steps are done
wk auth status                   # active wk profile and connectivity
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
        "Authorization:${AUTH_HEADER}"
      ],
      "env": {
        "AUTH_HEADER": "Bearer YOUR_WORKATO_API_TOKEN"
      }
    },
    "workato-airo": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://app.workato.com/airo_mcp",
        "--header",
        "Authorization:${AUTH_HEADER}"
      ],
      "env": {
        "AUTH_HEADER": "Bearer YOUR_WORKATO_API_TOKEN"
      }
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
| `WORKATO_CODE_DEV` | Your Workato API token (same value as your local profile variable) |
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

# Check setup state (never prints the token)
node scripts/setup/status.js
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
✅ WORKATO_CODE_DEV set; wk profile active
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
Say `start workato setup`; step 3 installs it. Or by hand:
```bash
brew install workato-devs/tap/wk                                                    # macOS
scoop bucket add workato-devs https://github.com/workato-devs/scoop-bucket; scoop install wk   # Windows
wk version
```

### "Cannot authenticate"
```bash
# Check the active profile and connectivity
wk auth status

# Create a fresh profile: say "start workato setup" in Claude Code
```

### "Terraform fails"
```bash
# Ensure your Azure credentials are available in this shell (az login, or TF_VAR_* variables)

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
