# Azure CLI Deployment Guide

## Overview

The Azure CLI script provides a step-by-step, manual approach to setting up a Teams bot app registration in Azure AD without Infrastructure as Code.

## Prerequisites

- Azure CLI installed: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli
- Logged into Azure: `az login`
- Appropriate permissions: Application Administrator or Global Administrator role
- Basic bash knowledge (script is compatible with macOS, Linux, and Windows WSL)

## Quick Start

```bash
# Run the script
bash teams-bot-setup.sh

# Follow the prompts and instructions
# Script will:
# 1. Create Azure AD app registration
# 2. Create service principal
# 3. Create client secret (print for copy)
# 4. Display next manual steps
```

## What the Script Does

### Step 1: Create App Registration
```bash
az ad app create \
  --display-name "YourBotName" \
  --web-redirect-uris "https://www.workato.com/oauth/callback"
```

Creates the Azure AD application that Workato will use for OAuth.

### Step 2: Create Service Principal
```bash
az ad sp create --id <APP_ID>
```

Creates a service principal (identity for automated processes).

### Step 3: Create Client Secret
```bash
az ad app credential reset \
  --id <APP_ID> \
  --display-name "WorkatoBotSecret"
```

⚠️ **IMPORTANT:** Client secrets are printed **only once**. Save immediately to secure storage:
- Password manager (1Password, LastPass, Bitwarden)
- Azure Key Vault
- Encrypted file
- **Never commit to git or version control**

### Step 4: Configure Web Redirect URI (Manual)
The script prints instructions to complete in Azure Portal:

1. Go to https://portal.azure.com
2. Search for "App registrations"
3. Find your app
4. Go to **Authentication**
5. Add Web platform with redirect URI
6. Save

**Why manual?** Azure CLI redirect URI configuration has limitations; Portal is more reliable.

### Step 5: Save Configuration
Script creates `teams-bot-config/config.json` with:
- Bot name
- Application ID
- Data center info
- Creation timestamp

This file is for reference only; doesn't contain secrets.

## Manual Equivalent Commands

If you prefer to run commands individually (instead of the script):

### 1. Create App Registration
```bash
APP_ID=$(az ad app create \
  --display-name "MyTeamsBot" \
  --web-redirect-uris "https://www.workato.com/oauth/callback" \
  --query appId -o tsv)

echo "App ID: $APP_ID"
```

### 2. Create Service Principal
```bash
az ad sp create --id $APP_ID
```

### 3. Create Client Secret
```bash
CLIENT_SECRET=$(az ad app credential reset \
  --id $APP_ID \
  --display-name "WorkatoBotSecret" \
  --query password -o tsv)

echo "Client Secret: $CLIENT_SECRET"
echo "⚠️ SAVE THIS SECURELY - CANNOT BE RETRIEVED LATER"
```

### 4. Add Web Redirect URI (via Portal or CLI)

**Via CLI (requires Graph API permissions):**
```bash
az ad app update \
  --id $APP_ID \
  --web-redirect-uris "https://www.workato.com/oauth/callback"
```

**Via Portal:**
1. Search "App registrations"
2. Click your app
3. Go to "Authentication"
4. Click "+ Add a platform" → "Web"
5. Enter redirect URI
6. Click "Save"

### 5. Configure Supported Accounts (Via Portal)
1. Go to **Authentication**
2. Under "Supported account types", select:
   - **Accounts in any organizational directory (Multitenant)**
3. Click "Save"

## Commands Reference

### View Registered App
```bash
az ad app show --id <APP_ID>
```

### List All Apps
```bash
az ad app list --display-name "<BOT_NAME>"
```

### View Service Principal
```bash
az ad sp show --id <APP_ID>
```

### Rotate Client Secret
```bash
# Create new secret
NEW_SECRET=$(az ad app credential reset \
  --id <APP_ID> \
  --display-name "WorkatoBotSecret-Rotated" \
  --query password -o tsv)

echo "New secret: $NEW_SECRET"

# List all secrets (shows which ones exist)
az ad app credential list --id <APP_ID>

# Delete old secret (use credential ID)
az ad app credential delete \
  --id <APP_ID> \
  --credential-id <OLD_CREDENTIAL_ID>
```

### Delete App & Service Principal
```bash
# Delete service principal first
az ad sp delete --id <APP_ID>

# Then delete app
az ad app delete --id <APP_ID>
```

### Export App Configuration
```bash
# Backup app settings to JSON
az ad app show --id <APP_ID> > app-backup.json

# View in formatted table
az ad app show --id <APP_ID> -o table
```

## Post-Deployment Checklist

After running the script (or manual commands):

- [ ] Note the **App ID** printed by script/command
- [ ] Save **Client Secret** to secure location (password manager, etc.)
- [ ] Complete Azure Portal Web redirect URI setup
- [ ] Configure Workato Custom OAuth Profile with Client ID & Secret
- [ ] Create Teams app in Teams Developer Portal
- [ ] Submit publish request
- [ ] Wait for admin approval
- [ ] Add bot to Teams channels

## Troubleshooting

### "az: command not found"
Solution: Install Azure CLI:
```bash
# macOS
brew install azure-cli

# Linux/WSL
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Windows (install from https://aka.ms/installazurecliwindows)
```

### "You do not have permission to perform action 'Microsoft.Directory/applications/create'"
Solution: Your Azure AD role needs elevation:
1. Go to https://portal.azure.com
2. Click your name (top right)
3. Click "View my permissions" or go to "Assigned roles"
4. Request **Application Administrator** role

### "Error: Invalid. Input string was not in a correct format"
Solution: Ensure your App ID is correct UUID format:
```bash
# Correct format
12345678-1234-1234-1234-123456789012

# Verify with:
echo "$APP_ID"
```

### "Client secret not displayed"
Solution: Client secrets cannot be retrieved. Create a new one:
```bash
NEW_SECRET=$(az ad app credential reset --id <APP_ID>)
# Now save this new secret
```

### "Cannot change Authentication settings"
Solution: You may need the **Privileged Role Administrator** role. Check:
```bash
az role assignment list --include-inherited
```

## Security Best Practices

### 1. Secure Secret Storage
❌ Don't:
- Store in plaintext files
- Commit to git
- Share in Slack/email
- Write in documentation

✅ Do:
- Use password manager (1Password, LastPass, Bitwarden)
- Use Azure Key Vault
- Use secrets management tool (HashiCorp Vault, AWS Secrets Manager)
- Set calendar reminder for expiration

### 2. Credential Rotation
- Create new secrets **before** old ones expire (typically annually)
- Delete old secrets after rotation confirmed
- Update Workato configuration immediately

### 3. Minimal Permissions
- Only grant **Application Administrator** (not Global Admin if possible)
- Use service accounts instead of personal accounts for automation
- Regularly review and remove unused app registrations

### 4. Monitoring
- Set up Azure AD logs to track app changes
- Monitor failed authentication attempts
- Review registered applications quarterly

## Advanced Usage

### Bulk Deployment (Multiple Bots)
```bash
# Create multiple bots in a loop
for bot in "HRBot" "FinanceBot" "ITBot"; do
  APP_ID=$(az ad app create \
    --display-name "$bot" \
    --web-redirect-uris "https://www.workato.com/oauth/callback" \
    --query appId -o tsv)
  
  az ad sp create --id $APP_ID
  
  SECRET=$(az ad app credential reset \
    --id $APP_ID \
    --display-name "WorkatoBotSecret" \
    --query password -o tsv)
  
  echo "$bot | $APP_ID | $SECRET" >> bots.csv
done
```

### Conditional Configuration (Based on Environment)
```bash
#!/bin/bash

ENV=$1  # Pass "dev", "staging", "prod"

case $ENV in
  dev)
    REDIRECT_URI="https://app.trial.workato.com/oauth/callback"
    TENANT="Trial"
    ;;
  staging)
    REDIRECT_URI="https://app.eu.workato.com/oauth/callback"
    TENANT="EU"
    ;;
  prod)
    REDIRECT_URI="https://www.workato.com/oauth/callback"
    TENANT="US"
    ;;
esac

APP_ID=$(az ad app create \
  --display-name "TeamsBot-$ENV" \
  --web-redirect-uris "$REDIRECT_URI" \
  --query appId -o tsv)

echo "Created $ENV bot: $APP_ID"
```

## Reference

- [Azure CLI Documentation](https://learn.microsoft.com/en-us/cli/azure/)
- [az ad app Commands](https://learn.microsoft.com/en-us/cli/azure/ad/app)
- [Microsoft Graph API](https://learn.microsoft.com/en-us/graph/overview)
- [OAuth 2.0 Concepts](https://learn.microsoft.com/en-us/graph/auth-concepts)
