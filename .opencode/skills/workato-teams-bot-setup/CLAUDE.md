# Claude Version: Workato Teams Bot Setup Skill

This document describes how Claude should handle Teams bot setup requests.

## When to Use This Skill

Use this skill when the user asks to:
- "Set up a Teams bot"
- "Create an Enterprise Workbot"
- "Automate Teams bot deployment"
- "Generate Teams bot Terraform"
- "Configure Microsoft Teams integration"
- "Teams bot infrastructure as code"
- "Setup Teams bot in Workato"
- Or any variation asking to create/deploy/configure a Workato Teams bot

## Workflow

### Phase 1: Understand Requirements

Ask the user clarifying questions:

1. **Deployment Method Preference**
   - "Would you prefer Terraform (Infrastructure as Code), Azure CLI (script), or manual setup?"
   - Default: Terraform (recommended)

2. **Data Center**
   - "Which Workato data center? (US, EU, JP, SG, AU, IL, CN, KR, UK, or trial)"
   - Default: US
   - Note: This determines the OAuth redirect URI

3. **Scope of Work**
   - "Do you already have Azure AD app registration credentials, or should we create new ones?"
   - "Do you have Client ID and Client Secret ready, or do you need to create them?"

### Phase 2: Collect Bot Information

Ask the user to provide:

**Bot Identity & Branding:**
- Bot name (required)
  - Max 100 chars
  - No special characters (spaces OK, hyphens OK)
  - Example: "HR Hiring Bot"
  
- Short description (required)
  - Max 80 characters
  - Example: "Bot for managing HR hiring workflows"
  
- Long description (required)
  - Max 4,000 characters
  - Detailed explanation of what the bot does
  
- Developer/company name (required)
  - Example: "Acme Corp HR Team"

**URLs & Policies:**
- Website URL (required)
  - Must be HTTPS
  - Example: https://www.acme-corp.com
  
- Privacy Policy URL (required)
  - Must be HTTPS and publicly accessible
  - Example: https://www.acme-corp.com/privacy
  
- Terms of Use URL (required)
  - Must be HTTPS and publicly accessible
  - Example: https://www.acme-corp.com/terms

**Microsoft Configuration:**
- Data center (if not already asked)
  - Options: us, eu, jp, sg, au, il, cn, kr, uk, trial
  - Default: us
  
- Bot permissions
  - Always: Upload and download files? (default: yes)
  
- Scopes (check all that apply)
  - Personal (1:1 chats with bot)
  - Team (channel conversations)
  - Group Chat (group DMs)
  - Default: all checked
  
- Custom help command? (optional)
  - If yes, ask: "Help command text?" (default: "help")
  - Ask: "Help command description?" (default: "Type 'help' to view available commands")

**Azure AD Configuration:**
- Client ID (required)
  - UUID format: 12345678-1234-1234-1234-123456789012
  - Source: Microsoft Teams Developer Portal → Apps → Your App → Basic info
  
- Client Secret (required)
  - Long alphanumeric string
  - Source: Azure Portal → App registrations → Your app → Certificates & secrets
  - **WARNING:** Can only be viewed once! User must copy immediately
  
- Client Secret Expiration (required)
  - Format: YYYY-MM-DD
  - Must be a future date
  - Typical: 1 year from today
  - **NOTE:** User must set calendar reminder for renewal!

### Phase 3: Validate & Confirm

Before generating code:

1. Display summary of all inputs
2. Ask: "Proceed with generation? (yes/no)"
3. If no: ask what to change and restart collection
4. If yes: proceed to generation

### Phase 4: Generate Outputs

Based on user's deployment preference:

**If Terraform:**

Generate 4 files in `teams-bot-terraform/`:

1. **variables.tf**
   - Variable definitions for all inputs
   - Mark `client_id` and `client_secret` as `sensitive = true`
   - Provide defaults from user input

2. **main.tf**
   - Azure AD app registration resource
   - Service principal resource
   - Client secret resource (with expiration)
   - Proper error handling and comments

3. **outputs.tf**
   - Output the app ID
   - Output configuration values for Workato
   - Mark sensitive outputs appropriately

4. **terraform.tfvars**
   - Pre-populated with user's values
   - Comments indicating where each value came from
   - **WARNING:** Remind user this file contains sensitive data

Provide usage instructions:
```bash
cd teams-bot-terraform
terraform init
terraform plan
terraform apply
```

**If Azure CLI:**

Generate 1 file: `teams-bot-setup.sh`
- Bash script with step-by-step comments
- Uses `az ad app create`, `az ad sp create`, `az ad app credential reset`
- Prints output values for user to save
- Provides instructions for manual Azure Portal steps
- Saves config to `teams-bot-config/config.json`

Provide usage instructions:
```bash
bash teams-bot-setup.sh
# Follow the printed instructions
```

**If Both:**

Generate both Terraform and Azure CLI versions above

### Phase 5: Generate Checklist

Always generate `setup-checklist.md` with sections:

1. **Prerequisites**
   - Workato access requirements
   - Microsoft/Azure requirements
   - Tools needed

2. **Phase 1: Create Workbot in Workato**
   - Step-by-step console instructions
   - What to note (Bot endpoint address)

3. **Phase 2: Create Microsoft Teams App**
   - Steps in Teams Developer Portal
   - Creating the bot first
   - Then creating the app

4. **Phase 3: Configure Bot Permissions**
   - Which permissions to select
   - Scopes configuration
   - Help command setup

5. **Phase 4: Configure Azure AD (OAuth)**
   - Azure Portal steps
   - Redirect URI configuration
   - Client secret creation
   - **WARNING:** Secret visibility note

6. **Phase 5: Configure Workato Custom OAuth Profile**
   - Where to paste Client ID and Secret
   - Save confirmation

7. **Phase 6: Publish to Organization**
   - Submit publish request
   - Wait for admin approval

8. **Phase 7: Add Bot to Teams**
   - How to find and add bot to channels

9. **Verification Checklist**
   - Bot appears in Workato
   - Bot appears in Teams app store
   - Bot can be added to channels
   - Bot responds to messages

10. **Important Dates**
    - Client secret expiration date
    - Set reminder for renewal (30 days before)

11. **Troubleshooting**
    - Common error messages
    - Solutions for each

### Phase 6: Summary & Next Steps

Display:
- ✅ Files generated
- 📂 File locations
- 📝 Next immediate steps
- 🔗 Links to reference documentation
- ⏱️ Time estimates for each phase

Example:
```
✅ Generated:
   • teams-bot-terraform/main.tf, variables.tf, outputs.tf, terraform.tfvars
   • setup-checklist.md

📂 Next steps:
   1. cd teams-bot-terraform
   2. terraform init
   3. terraform plan
   4. terraform apply
   5. Follow setup-checklist.md for manual portal steps

⏱️ Time estimate: ~2 hours total (mostly async waiting for approvals)
```

## Reference Information

### Data Centers & OAuth Redirect URIs

| Region | OAuth Callback URL |
|--------|-------------------|
| US (default) | https://www.workato.com/oauth/callback |
| EU | https://app.eu.workato.com/oauth/callback |
| Japan | https://app.jp.workato.com/oauth/callback |
| Singapore | https://app.sg.workato.com/oauth/callback |
| Australia | https://app.au.workato.com/oauth/callback |
| Israel | https://app.il.workato.com/oauth/callback |
| China | https://app.workatoapp.cn/oauth/callback |
| South Korea | https://app.kr.workato.com/oauth/callback |
| UK | https://app.uk.workato.com/oauth/callback |
| Trial/Sandbox | https://app.trial.workato.com/oauth/callback |

### Input Validation Rules

- **Bot Name:** No special chars except hyphens, max 100 chars
- **Short Desc:** Max 80 chars
- **Long Desc:** Max 4,000 chars
- **URLs:** Must start with https://, be valid URLs
- **Client ID:** UUID format (12345678-1234-1234-1234-123456789012)
- **Client Secret:** Minimum 20 chars, alphanumeric
- **Expiration Date:** YYYY-MM-DD format, must be future date

### Security Notes

- **Client Secrets:**
  - Cannot be viewed after creation
  - User must copy immediately
  - Store in password manager or vault
  - Expire typically after 1 year
  - Must be rotated before expiration
  - Never commit to git

- **Terraform State:**
  - Contains sensitive values
  - Store in remote state (Azure Storage, Terraform Cloud)
  - Restrict file permissions (chmod 600)
  - Consider encryption

- **Azure Permissions:**
  - User needs: Application Admin or Global Admin role
  - Verify at: https://portal.azure.com

### Common Issues

**Issue:** "Bot endpoint address not appearing in Workato"
- **Solution:** Wait for Workbot creation to complete, refresh browser

**Issue:** "Client secret not displaying"
- **Solution:** Cannot be retrieved. Create new one:
  ```bash
  az ad app credential reset --id <APP_ID>
  ```

**Issue:** "Invalid redirect URI in Azure"
- **Solution:** Ensure URI matches Workato's OAuth callback for your data center

**Issue:** "Bot not appearing in Teams after publish"
- **Solution:** Admin hasn't approved yet, or cache needs clear (restart Teams)

**Issue:** "Profile not found" error in Workato
- **Solution:** Verify Client ID and Secret are correctly entered in Custom OAuth Profile

## Tools & Languages

- **Language:** JavaScript (Node.js) for interactive script
- **Infrastructure:** Terraform (HCL) for IaC option
- **Scripting:** Bash for Azure CLI option
- **Documentation:** Markdown for checklists and guides

## Files Used

- `SKILL.md` - This skill documentation
- `scripts/setup-interactive.js` - Interactive Node.js script for guided setup
- `references/quick-start.md` - Quick reference guide
- `references/terraform-guide.md` - Detailed Terraform guide
- `references/azure-cli-guide.md` - Detailed Azure CLI guide

## Success Criteria

User has successfully completed Teams bot setup when:
- ✅ Terraform applied OR Azure CLI script ran successfully
- ✅ Followed all steps in setup-checklist.md
- ✅ Bot appears in Workato Platform > Workbot > Custom bots
- ✅ Bot appears in Teams Developer Portal
- ✅ Bot can be added to Teams channels
- ✅ Bot responds to messages in Teams

## Follow-up Actions

After setup:

1. **If using Terraform:**
   - Ask: "Would you like to set up remote state (Azure Storage/Terraform Cloud)?"
   - Ask: "Would you like to automate future bot deployments?"
   - Point to: terraform-guide.md for scaling multiple bots

2. **If using Azure CLI:**
   - Ask: "Would you like to convert this to Terraform for future deployments?"
   - Ask: "Need to rotate the client secret?"

3. **General Follow-ups:**
   - "Set a calendar reminder for client secret expiration"
   - "Keep setup-checklist.md for reference during manual steps"
   - "Bookmark Workato docs and Teams dev portal"

## Related Skills/Resources

- `workato-project-cataloguer` - For discovering Workato projects
- Workato Docs: https://docs.workato.com/en/workbot-for-teams/guides/creating-enterprise-workbot
- Microsoft Teams Dev Portal: https://dev.teams.microsoft.com
- Azure Portal: https://portal.azure.com
- Terraform Registry: https://registry.terraform.io/providers/hashicorp/azurerm/latest

## Notes for Claude

- This is a **guided, multi-step process** — don't skip phases
- Always validate input **before** generating code
- Be explicit about **security warnings** (secrets, expiration dates)
- Provide **clear next steps** after each phase
- Offer both **automated (Terraform/CLI) and manual** options
- Generate **working, production-ready code**
- Include comprehensive **troubleshooting guides**
- Emphasize **calendar reminders** for secret expiration
- Make it clear which steps are **automated vs. manual**
- Provide **estimated timelines** for each phase

