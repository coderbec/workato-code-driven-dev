#!/usr/bin/env node

/**
 * Interactive Workato Teams Bot Setup
 * 
 * Guides user through collecting all required inputs for Teams bot setup
 * and generates Terraform and/or Azure CLI deployment code
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Validation rules
const validators = {
  botName: (val) => {
    if (!val) return 'Bot name is required';
    if (val.length > 100) return 'Bot name must be ≤100 characters';
    if (/[^a-zA-Z0-9\s\-]/.test(val)) return 'Bot name cannot contain special characters (except hyphens)';
    return true;
  },
  shortDesc: (val) => {
    if (!val) return 'Short description is required';
    if (val.length > 80) return 'Short description must be ≤80 characters';
    return true;
  },
  longDesc: (val) => {
    if (!val) return 'Long description is required';
    if (val.length > 4000) return 'Long description must be ≤4000 characters';
    return true;
  },
  devName: (val) => {
    if (!val) return 'Developer/company name is required';
    return true;
  },
  url: (val) => {
    if (!val) return 'URL is required';
    if (!/^https:\/\//.test(val)) return 'URL must start with https://';
    try {
      new URL(val);
      return true;
    } catch {
      return 'Invalid URL format';
    }
  },
  dataCenter: (val) => {
    const valid = ['us', 'eu', 'jp', 'sg', 'au', 'il', 'cn', 'kr', 'uk', 'trial'];
    if (!val) return 'Data center is required';
    if (!valid.includes(val.toLowerCase())) return `Data center must be one of: ${valid.join(', ')}`;
    return true;
  },
  clientId: (val) => {
    if (!val) return 'Client ID is required';
    if (!/^[a-f0-9\-]{36}$/i.test(val) && !/^[a-f0-9]{32}$/i.test(val)) {
      return 'Client ID must be a valid UUID (e.g., 12345678-1234-1234-1234-123456789012)';
    }
    return true;
  },
  clientSecret: (val) => {
    if (!val) return 'Client secret is required';
    if (val.length < 20) return 'Client secret seems too short (usually 30+ characters)';
    return true;
  },
  date: (val) => {
    if (!val) return 'Date is required';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return 'Date format must be yyyy-mm-dd';
    const d = new Date(val);
    if (isNaN(d.getTime())) return 'Invalid date';
    if (d < new Date()) return 'Expiration date must be in the future';
    return true;
  },
};

// Prompt user for input with validation
function prompt(question, validator, defaultVal = null) {
  return new Promise((resolve) => {
    const displayQ = defaultVal ? `${question} [${defaultVal}]: ` : `${question}: `;
    rl.question(displayQ, (answer) => {
      const val = answer.trim() || defaultVal;
      if (validator) {
        const result = validator(val);
        if (result === true) {
          resolve(val);
        } else {
          console.error(`❌ ${result}`);
          resolve(prompt(question, validator, defaultVal));
        }
      } else {
        resolve(val);
      }
    });
  });
}

// Interactive guided setup
async function runSetup() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║     🤖 Workato Enterprise Teams Bot Setup (Interactive)         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const config = {};

  // Phase 1: Bot Identity & Branding
  console.log('📝 Phase 1: Bot Identity & Branding\n');
  config.botName = await prompt('Bot name (unique, spaces OK, no special chars)', validators.botName);
  config.shortDesc = await prompt('Short description (max 80 chars)', validators.shortDesc);
  config.longDesc = await prompt('Long description (max 4000 chars)', validators.longDesc);
  config.devName = await prompt('Developer/company name', validators.devName);

  // Phase 2: URLs & Policies
  console.log('\n🔗 Phase 2: URLs & Policies\n');
  config.website = await prompt('Website URL (must be HTTPS)', validators.url);
  config.privacyPolicy = await prompt('Privacy policy URL (must be HTTPS)', validators.url);
  config.termsOfUse = await prompt('Terms of use URL (must be HTTPS)', validators.url);

  // Phase 3: Microsoft Configuration
  console.log('\n💙 Phase 3: Microsoft Configuration\n');
  console.log('Data center options: us (default), eu, jp, sg, au, il, cn, kr, uk, trial');
  config.dataCenter = await prompt('Data center', validators.dataCenter, 'us');

  console.log('\nBot permissions:');
  config.uploadFiles = await prompt('Upload and download files? (y/n)', null, 'y');
  config.personalScope = await prompt('Enable Personal scope? (y/n)', null, 'y');
  config.teamScope = await prompt('Enable Team scope? (y/n)', null, 'y');
  config.groupChatScope = await prompt('Enable Group Chat scope? (y/n)', null, 'y');

  config.hasHelpCommand = await prompt('Add custom help command? (y/n)', null, 'y');
  if (config.hasHelpCommand.toLowerCase() === 'y') {
    config.helpCommand = await prompt('Help command text', null, 'help');
    config.helpCommandDesc = await prompt('Help command description', null, "Type 'help' to view available commands");
  }

  // Phase 4: Azure AD Configuration
  console.log('\n🔐 Phase 4: Azure AD Configuration\n');
  console.log('Get these from:');
  console.log('  • Client ID: Teams Dev Portal > Apps > Your App > Basic info > Application (client) ID');
  console.log('  • Client Secret: Azure Portal > App registrations > Your app > Certificates & secrets\n');
  
  config.clientId = await prompt('Application (Client) ID', validators.clientId);
  config.clientSecret = await prompt('Client Secret (will be stored securely)', validators.clientSecret);
  config.secretExpiration = await prompt('Client Secret expiration (yyyy-mm-dd)', validators.date);

  // Phase 5: Deployment Method
  console.log('\n⚙️ Phase 5: Deployment Method\n');
  console.log('Options: 1 = Terraform, 2 = Azure CLI, 3 = Both');
  const deployMethod = await prompt('Deployment method', null, '3');
  
  config.useTerraform = ['1', '3'].includes(deployMethod);
  config.useAzureCli = ['2', '3'].includes(deployMethod);

  if (config.useTerraform) {
    console.log('\nTerraform configuration:');
    config.azureSubscriptionId = await prompt('Azure Subscription ID (uuid)', null);
    config.azureResourceGroup = await prompt('Azure Resource Group name', null);
  }

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    📋 Configuration Summary                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  console.log(`Bot Name:              ${config.botName}`);
  console.log(`Short Description:     ${config.shortDesc}`);
  console.log(`Developer:             ${config.devName}`);
  console.log(`Data Center:           ${config.dataCenter}`);
  console.log(`Client ID:             ${config.clientId.substring(0, 8)}...${config.clientId.substring(config.clientId.length - 8)}`);
  console.log(`Secret Expiration:     ${config.secretExpiration}`);
  console.log(`Deployment Methods:    ${[config.useTerraform && 'Terraform', config.useAzureCli && 'Azure CLI'].filter(Boolean).join(', ')}`);
  
  const proceed = await prompt('\nProceed with generation? (y/n)', null, 'y');
  if (proceed.toLowerCase() !== 'y') {
    console.log('\n❌ Setup cancelled');
    rl.close();
    process.exit(1);
  }

  // Generate outputs
  console.log('\n✨ Generating deployment code...\n');
  generateOutputs(config);

  console.log('\n✅ Bot setup files generated successfully!\n');
  console.log('📂 Next steps:');
  if (config.useTerraform) {
    console.log('   1. cd teams-bot-terraform');
    console.log('   2. terraform init');
    console.log('   3. terraform plan');
    console.log('   4. terraform apply');
  }
  if (config.useAzureCli) {
    console.log('   1. bash teams-bot-setup.sh');
  }
  console.log('   2. Follow checklist in setup-checklist.md for Workato console setup\n');

  rl.close();
}

function generateOutputs(config) {
  // Get OAuth callback URL based on data center
  const datacenters = {
    us: 'https://www.workato.com/oauth/callback',
    eu: 'https://app.eu.workato.com/oauth/callback',
    jp: 'https://app.jp.workato.com/oauth/callback',
    sg: 'https://app.sg.workato.com/oauth/callback',
    au: 'https://app.au.workato.com/oauth/callback',
    il: 'https://app.il.workato.com/oauth/callback',
    cn: 'https://app.workatoapp.cn/oauth/callback',
    kr: 'https://app.kr.workato.com/oauth/callback',
    uk: 'https://app.uk.workato.com/oauth/callback',
    trial: 'https://app.trial.workato.com/oauth/callback',
  };
  config.oauthRedirectUri = datacenters[config.dataCenter];

  if (config.useTerraform) {
    generateTerraform(config);
  }
  if (config.useAzureCli) {
    generateAzureCli(config);
  }
  generateChecklist(config);
  generateConfigFile(config);
}

function generateTerraform(config) {
  const dir = './teams-bot-terraform';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // variables.tf
  fs.writeFileSync(
    path.join(dir, 'variables.tf'),
    `variable "bot_name" {
  type        = string
  description = "Unique name for the Teams bot"
  default     = "${config.botName}"
}

variable "short_description" {
  type        = string
  description = "Short description (max 80 chars)"
  default     = "${config.shortDesc.replace(/"/g, '\\"')}"
}

variable "long_description" {
  type        = string
  description = "Long description (max 4000 chars)"
  default     = "${config.longDesc.replace(/"/g, '\\"')}"
}

variable "developer_name" {
  type        = string
  description = "Developer or company name"
  default     = "${config.devName}"
}

variable "website_url" {
  type        = string
  description = "HTTPS website URL"
  default     = "${config.website}"
}

variable "privacy_policy_url" {
  type        = string
  description = "Privacy policy URL"
  default     = "${config.privacyPolicy}"
}

variable "terms_of_use_url" {
  type        = string
  description = "Terms of use URL"
  default     = "${config.termsOfUse}"
}

variable "client_id" {
  type        = string
  description = "Azure AD Application (Client) ID"
  sensitive   = true
  default     = "${config.clientId}"
}

variable "client_secret" {
  type        = string
  description = "Azure AD Client Secret"
  sensitive   = true
  default     = "${config.clientSecret}"
}

variable "data_center" {
  type        = string
  description = "Workato data center"
  default     = "${config.dataCenter}"
}

variable "oauth_redirect_uri" {
  type        = string
  description = "OAuth redirect URI (auto-determined from data center)"
  default     = "${config.oauthRedirectUri}"
}

variable "azure_subscription_id" {
  type        = string
  description = "Azure Subscription ID"
  default     = "${config.azureSubscriptionId || ''}"
}

variable "azure_resource_group" {
  type        = string
  description = "Azure Resource Group name"
  default     = "${config.azureResourceGroup || ''}"
}
`
  );

  // main.tf
  fs.writeFileSync(
    path.join(dir, 'main.tf'),
    `terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.azure_subscription_id
}

# Data source: Current Azure context
data "azurerm_client_config" "current" {}

# Resource Group (optional, use existing)
# Uncomment if you want Terraform to create the resource group
# resource "azurerm_resource_group" "teams_bot" {
#   name     = var.azure_resource_group
#   location = "East US"
# }

# App Registration for Teams Bot
resource "azurerm_ad_application" "teams_bot" {
  display_name = var.bot_name

  web {
    redirect_uris = [var.oauth_redirect_uri]
  }

  required_resource_access {
    resource_app_id = "00000003-0000-0000-c000-000000000000" # Microsoft Graph

    resource_access {
      id   = "e1fe6dd8-ba31-4d61-89e7-88639da4683d"  # User.Read
      type = "Scope"
    }
  }
}

# Service Principal
resource "azurerm_ad_service_principal" "teams_bot" {
  application_id = azurerm_ad_application.teams_bot.client_id
}

# Client Secret
resource "azurerm_ad_application_password" "teams_bot" {
  application_object_id = azurerm_ad_application.teams_bot.object_id
  display_name          = "WorkatoBotSecret"
  end_date_relative     = "8760h" # 1 year
}

# Output the created values
output "app_id" {
  value       = azurerm_ad_application.teams_bot.client_id
  description = "Application (Client) ID for Teams Developer Portal"
}

output "object_id" {
  value       = azurerm_ad_application.teams_bot.object_id
  description = "Object ID for further configuration"
}

output "service_principal_id" {
  value       = azurerm_ad_service_principal.teams_bot.id
  description = "Service Principal ID"
}

output "client_secret_created" {
  value       = "Client secret created. Retrieve from Azure Portal if needed."
  description = "Confirmation that client secret was created"
}
`
  );

  // outputs.tf
  fs.writeFileSync(
    path.join(dir, 'outputs.tf'),
    `output "workato_oauth_config" {
  value = {
    client_id             = var.client_id
    client_secret         = var.client_secret
    oauth_redirect_uri    = var.oauth_redirect_uri
    data_center           = var.data_center
  }
  description = "Configuration values for Workato Custom OAuth Profile"
  sensitive   = true
}

output "microsoft_config" {
  value = {
    app_id                = azurerm_ad_application.teams_bot.client_id
    bot_name              = var.bot_name
    short_description    = var.short_description
    long_description     = var.long_description
    website_url          = var.website_url
    privacy_policy_url   = var.privacy_policy_url
    terms_of_use_url     = var.terms_of_use_url
    developer_name       = var.developer_name
  }
  description = "Configuration values for Microsoft Teams Developer Portal"
}
`
  );

  // terraform.tfvars
  fs.writeFileSync(
    path.join(dir, 'terraform.tfvars'),
    `# Pre-populated values - modify as needed

bot_name             = "${config.botName}"
short_description    = "${config.shortDesc.replace(/"/g, '\\"')}"
long_description     = "${config.longDesc.replace(/"/g, '\\"')}"
developer_name       = "${config.devName}"
website_url          = "${config.website}"
privacy_policy_url   = "${config.privacyPolicy}"
terms_of_use_url     = "${config.termsOfUse}"
client_id            = "${config.clientId}"
client_secret        = "${config.clientSecret}"  # Store this securely after apply!
data_center          = "${config.dataCenter}"
azure_subscription_id = "${config.azureSubscriptionId || 'your-subscription-id'}"
azure_resource_group  = "${config.azureResourceGroup || 'your-resource-group'}"
`
  );

  console.log(`✅ Terraform files generated in ${dir}/`);
}

function generateAzureCli(config) {
  const script = `#!/bin/bash

# Workato Teams Bot Setup - Azure CLI Script
# Generated on ${new Date().toISOString()}
# 
# This script sets up a Microsoft Teams app registration in Azure AD
# and configures it for use with Workato Enterprise Workbot

set -e  # Exit on error

echo "🤖 Workato Teams Bot Setup (Azure CLI)"
echo "======================================"
echo ""
echo "This script will create:"
echo "  ✓ Azure AD App registration: ${config.botName}"
echo "  ✓ Service Principal"
echo "  ✓ Client Secret"
echo ""
echo "Prerequisites:"
echo "  • Azure CLI installed (az --version)"
echo "  • Logged in to Azure (az account show)"
echo "  • Appropriate Azure AD permissions"
echo ""

# Step 1: Create App Registration
echo "📋 Step 1: Creating Azure AD App Registration..."
APP_ID=\$(az ad app create \\
  --display-name "${config.botName}" \\
  --web-redirect-uris "${config.oauthRedirectUri}" \\
  --query appId -o tsv)

echo "✅ App created with ID: \$APP_ID"
echo ""

# Step 2: Create Service Principal
echo "📋 Step 2: Creating Service Principal..."
az ad sp create --id \$APP_ID
echo "✅ Service Principal created"
echo ""

# Step 3: Create Client Secret
echo "📋 Step 3: Creating Client Secret..."
CLIENT_SECRET=\$(az ad app credential reset \\
  --id \$APP_ID \\
  --display-name "WorkatoBotSecret" \\
  --query password -o tsv)

echo "⚠️  CLIENT SECRET (save this securely!):"
echo "    \$CLIENT_SECRET"
echo ""
echo "📌 IMPORTANT: Client secrets CANNOT be retrieved later!"
echo "   Save this in a secure location (password manager, vault, etc.)"
echo ""

# Step 4: Configure Web redirect URI
echo "📋 Step 4: Configuring Web redirect URI in Azure Portal..."
echo "⚠️  You must complete this step manually in Azure Portal:"
echo ""
echo "   1. Go to https://portal.azure.com"
echo "   2. Search for 'App registrations'"
echo "   3. Find and click '${config.botName}'"
echo "   4. Click 'Authentication' in left menu"
echo "   5. Under 'Platform configurations', add Web platform"
echo "   6. Set redirect URI: ${config.oauthRedirectUri}"
echo "   7. Click 'Save'"
echo ""

# Step 5: Save configuration
echo "📋 Step 5: Saving configuration..."
mkdir -p teams-bot-config

cat > teams-bot-config/config.json <<EOF
{
  "bot_name": "${config.botName}",
  "app_id": "\$APP_ID",
  "client_secret": "\$CLIENT_SECRET",
  "oauth_redirect_uri": "${config.oauthRedirectUri}",
  "data_center": "${config.dataCenter}",
  "created_at": "\$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo "✅ Configuration saved to teams-bot-config/config.json"
echo ""

# Final steps
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   ✅ Azure Setup Complete!                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Save the Client Secret (printed above) to a secure location"
echo ""
echo "2. Complete Azure Portal setup:"
echo "   • Go to https://portal.azure.com"
echo "   • Add Web redirect URI (see steps above)"
echo ""
echo "3. Configure in Workato:"
echo "   • Go to Platform > Workbot > Custom bots"
echo "   • Create new bot (select 'Workbot for Microsoft Teams')"
echo "   • Enter Client ID: \$APP_ID"
echo "   • Enter Client Secret: [from secure storage]"
echo "   • Save and note the Bot endpoint address"
echo ""
echo "4. Configure in Teams Developer Portal:"
echo "   • Go to https://dev.teams.microsoft.com"
echo "   • Create new bot and app"
echo "   • Paste Workato bot endpoint address"
echo "   • Configure permissions and scopes"
echo ""
echo "5. Publish and get admin approval"
echo ""
`;

  fs.writeFileSync('./teams-bot-setup.sh', script);
  fs.chmodSync('./teams-bot-setup.sh', '0755');
  console.log('✅ Azure CLI script generated: teams-bot-setup.sh');
}

function generateChecklist(config) {
  const checklist = `# Workato Teams Bot Setup Checklist

## Configuration
- **Bot Name:** ${config.botName}
- **Data Center:** ${config.dataCenter}
- **OAuth Callback:** ${config.oauthRedirectUri}
- **Secret Expiration:** ${config.secretExpiration}

## Prerequisites ✅
- [ ] You have Workato **Platform > Workbot** access
- [ ] You have Workato **Tools > Custom OAuth Profiles** access
- [ ] You have Microsoft Azure admin role
- [ ] You're in Microsoft Teams Developer Portal: https://dev.teams.microsoft.com
- [ ] You're in Azure Portal: https://portal.azure.com

## Phase 1: Create Workbot in Workato
1. [ ] Go to **Platform > Workbot**
2. [ ] Click **Custom bots** tab
3. [ ] Click **Create a custom bot**
4. [ ] Select **Workbot for Microsoft Teams**
5. [ ] Enter Bot Name: **${config.botName}**
6. [ ] Click **Create new app**
7. [ ] Note the **Bot endpoint address** displayed
   - Format: \`https://app.workato.com/skype_webhooks/event?coak_id=XX\`

## Phase 2: Create Microsoft Teams App
1. [ ] In Teams Developer Portal, go to **Tools > Bot Management**
2. [ ] Click **+ New Bot**
3. [ ] Enter Bot name: **${config.botName}**
4. [ ] Click **Add**
5. [ ] Paste Workato Bot endpoint address in **Bot endpoint address** field
6. [ ] Click **Save**
7. [ ] Copy the **Bot ID** from the URL or page
   - Store it securely: \`__________\`

## Phase 3: Create Teams App
1. [ ] In Teams Developer Portal, go to **Apps**
2. [ ] Click **+ New app**
3. [ ] Enter App name: **${config.botName}}**
4. [ ] Click **Add**
5. [ ] Go to **Configure > Basic information**
6. [ ] Fill in all required fields:
   - [ ] **Short description:** ${config.shortDesc}
   - [ ] **Long description:** ${config.longDesc}
   - [ ] **Developer or company name:** ${config.devName}
   - [ ] **Website:** ${config.website}
   - [ ] **Privacy policy:** ${config.privacyPolicy}
   - [ ] **Terms of use:** ${config.termsOfUse}
7. [ ] Paste Bot ID in **Application (client) ID** field
8. [ ] Click **Save**
9. [ ] (Optional) Go to **Configure > Branding** to customize bot appearance
10. [ ] Go to **Configure > Domains**
11. [ ] Click **Create your first domain**
12. [ ] Enter: \`*.workato.com\`
13. [ ] Click **Add**

## Phase 4: Configure Bot Permissions
1. [ ] Go to **Configure > App features**
2. [ ] Click **Bot**
3. [ ] Select your bot from **Select an existing bot**
4. [ ] In **What can your bot do?**, check:
   - [ ] **Upload and download files**
5. [ ] In **Select the scopes where people can use your bot**, check:
   - [ ] **Personal**
   - [ ] **Team**
   - [ ] **Group Chat**
6. [ ] Click **Save**
7. [ ] Click **Add a command**
8. [ ] Fill in:
   - [ ] **Command:** help
   - [ ] **Description:** Type 'help' to view available commands
   - [ ] Check: **Personal**, **Team**, **Group Chat**
9. [ ] Click **Add**
10. [ ] Click **Save**

## Phase 5: Configure Azure AD (OAuth)
1. [ ] Go to https://portal.azure.com
2. [ ] Search for **App registrations**
3. [ ] Find your app: **${config.botName}**
4. [ ] Go to **Manage > Authentication**
5. [ ] Verify **Accounts in any organizational directory (Multitenant)** is selected
6. [ ] Click **+ Add a platform** > **Web**
7. [ ] Enter Redirect URI: \`${config.oauthRedirectUri}\`
8. [ ] Click **Configure**
9. [ ] Go to **Manage > Certificates & secrets**
10. [ ] Click **+ New client secret**
11. [ ] Description: \`WorkatoBotSecret\`
12. [ ] Expiration: Set to **${config.secretExpiration}}**
13. [ ] Click **Add**
14. [ ] ⚠️ **COPY THE SECRET VALUE IMMEDIATELY** (cannot be retrieved later!)
    - Store: \`__________\`

## Phase 6: Configure Workato Custom OAuth Profile
1. [ ] Return to Workato tab
2. [ ] Go to **Tools > Custom OAuth Profiles** (or check Platform > Workbot for Step 3)
3. [ ] Fill in:
   - [ ] **Client ID:** \`${config.clientId}\`
   - [ ] **Client Secret:** \`[from Azure, stored above]\`
   - [ ] **Application ID:** \`[same as Client ID]\`
4. [ ] Click **Save**

## Phase 7: Publish to Organization
1. [ ] Return to Teams Developer Portal
2. [ ] Go to **Publish > Publish to org**
3. [ ] Click **Publish your app**
4. [ ] Request is submitted to your Microsoft Teams admin
5. [ ] Wait for approval (typically 1-2 business days)

## Phase 8: Add Bot to Teams
1. [ ] Once approved, open any Teams channel
2. [ ] Type \`@\` in message box
3. [ ] Select **Get bots**
4. [ ] Find **${config.botName}}**
5. [ ] Click to add to channel

## Verification
- [ ] Bot appears in Workato Platform > Workbot > Custom bots
- [ ] Bot appears in Teams app store
- [ ] Bot can be added to channels
- [ ] Bot responds to messages in Teams

## Important Dates
- **Client Secret Expires:** ${config.secretExpiration}
- **⏰ Set reminder:** 30 days before expiration for renewal

## Troubleshooting

### "Profile not found" error in Workato
- Verify Client ID and Client Secret are correct in Custom OAuth Profiles
- Check that the profile name matches what scripts reference

### Bot not appearing in Teams
- Confirm admin approved the publish request
- Try signing out and back into Teams
- Clear Teams cache: \`rm -rf ~/Library/Application\\ Support/Microsoft\\ Teams\` (macOS)

### "Invalid redirect URI"
- Ensure redirect URI in Azure matches Workato OAuth callback
- Verify correct data center: \`${config.oauthRedirectUri}\`

## Reference
- [Workato Docs](https://docs.workato.com/en/workbot-for-teams/guides/creating-enterprise-workbot)
- [Teams Developer Portal](https://dev.teams.microsoft.com)
- [Azure Portal](https://portal.azure.com)
`;

  fs.writeFileSync('./setup-checklist.md', checklist);
  console.log('✅ Setup checklist generated: setup-checklist.md');
}

function generateConfigFile(config) {
  const configFile = {
    bot: {
      name: config.botName,
      shortDescription: config.shortDesc,
      longDescription: config.longDesc,
      developerName: config.devName,
    },
    urls: {
      website: config.website,
      privacyPolicy: config.privacyPolicy,
      termsOfUse: config.termsOfUse,
    },
    microsoft: {
      dataCenter: config.dataCenter,
      oauthCallbackUri: config.oauthRedirectUri,
      clientId: config.clientId,
      uploadFiles: config.uploadFiles.toLowerCase() === 'y',
      scopes: {
        personal: config.personalScope.toLowerCase() === 'y',
        team: config.teamScope.toLowerCase() === 'y',
        groupChat: config.groupChatScope.toLowerCase() === 'y',
      },
      helpCommand: config.hasHelpCommand.toLowerCase() === 'y' ? {
        command: config.helpCommand || 'help',
        description: config.helpCommandDesc || "Type 'help' to view available commands",
      } : null,
    },
    deployment: {
      useTerraform: config.useTerraform,
      useAzureCli: config.useAzureCli,
      azureSubscriptionId: config.azureSubscriptionId,
      azureResourceGroup: config.azureResourceGroup,
    },
    metadata: {
      createdAt: new Date().toISOString(),
      clientSecretExpiration: config.secretExpiration,
    },
  };

  fs.writeFileSync('./teams-bot-config.json', JSON.stringify(configFile, null, 2));
  console.log('✅ Configuration saved: teams-bot-config.json');
}

// Main
runSetup().catch((err) => {
  console.error('\n❌ Error:', err.message);
  rl.close();
  process.exit(1);
});
