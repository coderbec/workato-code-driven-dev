# Quick Start: Workato Teams Bot Setup

## 5-Minute Overview

**Goal:** Set up a Microsoft Teams Enterprise Workbot in Workato with automated Infrastructure as Code.

### Option 1: Interactive Guided Setup (Recommended)

```bash
# Run the interactive setup script
node scripts/setup-interactive.js

# Follow the prompts (5-10 minutes)
# You'll be asked for:
# - Bot name, description, branding
# - Website, privacy policy, terms of use URLs
# - Data center (US, EU, JP, etc.)
# - Microsoft Azure credentials

# Output: Terraform files, Azure CLI script, checklist
```

### Option 2: Direct Azure CLI

```bash
# Run the generated Azure CLI script
bash teams-bot-setup.sh

# Or manual commands
az ad app create --display-name "MyTeamsBot" \
  --web-redirect-uris "https://www.workato.com/oauth/callback"
```

### Option 3: Terraform (Infrastructure as Code)

```bash
cd teams-bot-terraform
terraform init
terraform plan
terraform apply
```

## What Happens at Each Stage

### Stage 1: You (Collect Information)
- Provide bot name, description, branding
- Provide Azure credentials (Client ID, Secret)
- Choose deployment method (Terraform or Azure CLI)

### Stage 2: Script (Automate Setup)

**Terraform:**
- Creates Azure AD app registration
- Creates service principal
- Creates client secret
- Generates configuration

**Azure CLI:**
- Creates Azure AD app registration
- Creates service principal
- Creates client secret
- Prints instructions for manual Azure Portal steps

### Stage 3: You (Manual Azure Portal)
- Complete Web redirect URI in Azure Portal
- Approve if prompted

### Stage 4: You (Workato Console)
- Create custom OAuth profile with Client ID & Secret
- Create the Workbot in Workato
- Copy the bot endpoint address

### Stage 5: You (Teams Developer Portal)
- Create the Teams bot and app
- Paste Workato bot endpoint
- Configure permissions and scopes
- Publish for admin approval

### Stage 6: Teams Admin
- Approves publish request in Teams Admin Center
- Bot is available in Teams app store

### Stage 7: You (Add to Teams)
- Find bot in Teams app store
- Add to channels

## Key Information You'll Need

| Item | Where to Get | Notes |
|------|--------------|-------|
| **Workato Workspace** | https://www.workato.com/platform | Login required |
| **Client ID** | Microsoft Teams Dev Portal > Apps > Your App > Basic info | UUID format |
| **Client Secret** | Azure Portal > App registrations > Your app > Certificates & secrets | **Save immediately** |
| **Secret Expiration** | Choose yourself (typically 1 year) | Set reminder for renewal |
| **Workato Endpoint** | Workato Platform > Workbot > Custom bots > Step 1 | Looks like `https://app.workato.com/skype_webhooks/event?coak_id=XX` |

## Data Center & URLs

Choose the data center that matches your Workato instance:

| Region | OAuth Callback URL |
|--------|-------------------|
| **US (Default)** | `https://www.workato.com/oauth/callback` |
| **EU** | `https://app.eu.workato.com/oauth/callback` |
| **Japan** | `https://app.jp.workato.com/oauth/callback` |
| **Singapore** | `https://app.sg.workato.com/oauth/callback` |
| **Australia** | `https://app.au.workato.com/oauth/callback` |
| **Israel** | `https://app.il.workato.com/oauth/callback` |
| **China** | `https://app.workatoapp.cn/oauth/callback` |
| **South Korea** | `https://app.kr.workato.com/oauth/callback` |
| **UK** | `https://app.uk.workato.com/oauth/callback` |
| **Sandbox/Trial** | `https://app.trial.workato.com/oauth/callback` |

## Common Questions

**Q: Can I use an existing Azure AD app?**
A: Yes, but you'll need to manually configure it. Use the checklist in `setup-checklist.md`.

**Q: What if my client secret expires?**
A: You can rotate it in Azure Portal or via Azure CLI. You'll need to update Workato with the new secret.

**Q: Can I have multiple Teams bots?**
A: Yes. Use Terraform workspaces or separate directories for each bot.

**Q: Is Terraform required?**
A: No. You can use Azure CLI script for a more manual approach, or do everything in Azure Portal.

**Q: How long does approval take?**
A: Typically 1-2 business days for Teams admin approval.

## Workflow Diagram

```
Start
  ↓
[Interactive Script]  ← You provide bot info
  ↓
[Terraform or Azure CLI]  ← Script automates Azure setup
  ↓
[Output: Checklist]  ← You follow step-by-step
  ↓
[Workato Console]  ← You create custom OAuth & Workbot
  ↓
[Teams Developer Portal]  ← You create app & bot
  ↓
[Teams Admin Center]  ← Admin approves publish
  ↓
[Teams App Store]  ← Bot available
  ↓
[Add to Teams]  ← You add bot to channels
  ↓
Done ✅
```

## Error Recovery

If something goes wrong:

1. **Terraform errors:** See `references/terraform-guide.md`
2. **Azure CLI errors:** See `references/azure-cli-guide.md`
3. **Setup checklist:** `setup-checklist.md` has troubleshooting section

To start over (delete everything):

```bash
# Terraform
terraform destroy

# Azure CLI (manual)
az ad app delete --id <APP_ID>
```

Then run the script again.

## Next Steps

1. **Decide deployment method:**
   - Terraform (recommended): `terraform apply`
   - Azure CLI: `bash teams-bot-setup.sh`
   - Manual: Follow `setup-checklist.md`

2. **Follow the generated checklist**

3. **Ask for help:**
   - Workato docs: https://docs.workato.com/en/workbot-for-teams/guides/creating-enterprise-workbot
   - Microsoft Teams: https://learn.microsoft.com/en-us/microsoftteams/
   - Azure Portal help: https://learn.microsoft.com/en-us/azure/

## Time Estimates

| Step | Time | Notes |
|------|------|-------|
| Gather info | 5-10 min | Interactive script |
| Run Terraform/CLI | 2-5 min | Automated |
| Azure Portal setup | 5-10 min | Manual redirect URI |
| Workato configuration | 5-10 min | Custom OAuth & Workbot |
| Teams Developer Portal | 10-15 min | App & bot setup |
| Teams admin approval | 1-2 days | Async, out of your control |
| Add to Teams | 2-5 min | Final step |
| **Total** | **~2 hours** | **Mostly async waiting** |

---

**Ready?** Start with:
```bash
node scripts/setup-interactive.js
```
