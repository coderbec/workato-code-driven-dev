---
name: workato-teams-bot-setup
description: Set up a Workato Enterprise Teams bot with guided user input and Infrastructure as Code (Terraform and/or Azure CLI). Use this skill when the user asks to create, set up, deploy, configure, or automate a Microsoft Teams Enterprise Workbot in Workato. Also trigger on requests to "set up a Teams bot", "create a Teams integration", "automate Teams bot deployment", "Teams bot setup", "Enterprise Workbot", or "bot infrastructure as code". Covers all required inputs for Workato side, Microsoft side (Bot Management, App registration, OAuth), and Azure AD configuration with both automated and manual options.
---

# Workato Enterprise Teams Bot Setup

## Overview

This skill guides you through setting up a **Microsoft Teams Enterprise Workbot** in Workato with full infrastructure automation. You'll gather all required information interactively, then generate **Terraform** and/or **Azure CLI** scripts to automate the setup.

## Key Concepts

**Enterprise Workbots** are Microsoft Teams apps that:
- Run on the Workato bot platform
- Can be fully customized (branding, OAuth, permissions)
- Support sideloading into Teams groups/channels
- Require configuration in both Workato and Microsoft

**Prerequisites in place:**
- You have Workato access to **Platform > Workbot > Custom bots** tab
- You have Microsoft Azure admin role (Application Admin, Cloud App Admin, Global Admin, or Privileged Role Admin)
- Your Workato instance has Custom OAuth profiles enabled

## Workflow: Guided Input → Code Generation

### Phase 1: Gather Required Information

The skill will guide you through collecting:

1. **Bot Identity**
   - Bot name (unique, spaces OK, no special chars)
   - Short description (≤80 chars)
   - Long description (≤4,000 chars)
   - Developer/company name
   
2. **Bot URLs & Policies**
   - Website URL (HTTPS)
   - Privacy policy URL
   - Terms of use URL
   
3. **Microsoft Configuration**
   - Target data center (US, EU, JP, SG, AU, IL, CN, KR, UK, or self-service)
   - Bot permissions (Upload/download files, scopes: Personal/Team/Group Chat)
   - Custom help command (optional)
   
4. **Azure AD Configuration**
   - Application (client) ID from Microsoft Teams Developer Portal
   - Client secret (for OAuth)
   - Client secret expiration date
   
5. **Deployment Method**
   - Terraform or Azure CLI (or both)
   - Target Azure subscription/resource group (if using Terraform)

### Phase 2: Generate Infrastructure Code

The skill generates:

- **`teams-bot-terraform/`** – Terraform modules for Azure app registration, OAuth profile, and Workato bot
- **`teams-bot-setup.sh`** – Azure CLI script with step-by-step comments
- **`setup-checklist.md`** – Manual verification checklist for both Workato and Microsoft

## Guided Setup Process

I will ask you the following questions in order. You can skip any optional fields by pressing Enter.

### 1. Bot Identity & Branding

```
Bot Name (unique, no special chars): [required]
Short Description (max 80 chars): [required]
Long Description (max 4000 chars): [required]
Developer/Company Name: [required]
```

### 2. URLs & Policies

```
Website URL (HTTPS): [required]
  Example: https://www.example.com
Privacy Policy URL (HTTPS): [required]
Terms of Use URL (HTTPS): [required]
```

### 3. Microsoft Configuration

```
Data Center Region: [required]
  Options: us, eu, jp, sg, au, il, cn, kr, uk, trial
  Default: us

Bot Permissions:
  - Upload and download files? (y/n)
  - Enable Personal scope? (y/n)
  - Enable Team scope? (y/n)
  - Enable Group Chat scope? (y/n)

Custom help command? (optional)
  Default: "help" with text "Type 'help' to view available commands"
```

### 4. Azure AD Configuration

```
Application (Client) ID: [required]
  Location: Microsoft Teams Dev Portal > Apps > Your App > Basic info

Client Secret: [required]
  Location: Azure Portal > App registrations > Your app > Certificates & secrets

Client Secret Expiration: [required]
  Format: yyyy-mm-dd
  Example: 2025-10-09
```

### 5. Deployment Method

```
Preferred deployment method: [required]
  1. Terraform (recommended for IaC)
  2. Azure CLI script (manual steps)
  3. Both (for flexibility)

(If Terraform)
Azure Subscription ID: [required]
Azure Resource Group Name: [required]
```

## Generated Outputs

After you provide all information, the skill generates:

### Option A: Terraform
- **`main.tf`** – Azure app registration resource
- **`variables.tf`** – All configurable inputs
- **`outputs.tf`** – Bot ID, OAuth endpoints
- **`workato-provider.tf`** – Workato custom OAuth profile
- **`terraform.tfvars`** – Pre-populated with your values

**Usage:**
```bash
cd teams-bot-terraform
terraform init
terraform plan
terraform apply
```

### Option B: Azure CLI
- **`teams-bot-setup.sh`** – Bash script with inline comments
- Every step is clearly documented
- Copy-paste friendly commands

**Usage:**
```bash
bash teams-bot-setup.sh
```

### Both Options
- **`setup-checklist.md`** – Verification steps for Workato console

## Field Reference

| Field | Required | Format | Notes |
|-------|----------|--------|-------|
| Bot Name | Yes | String, spaces OK, no special chars | Must be unique in your Workato workspace |
| Short Description | Yes | ≤80 characters | Displays in Teams app catalog |
| Long Description | Yes | ≤4,000 characters | Detailed explanation of bot's purpose |
| Developer Name | Yes | String | Company or person responsible |
| Website | Yes | HTTPS URL | Public website for the bot/company |
| Privacy Policy | Yes | HTTPS URL | Must exist and be publicly accessible |
| Terms of Use | Yes | HTTPS URL | Must exist and be publicly accessible |
| Data Center | Yes | Enum (us, eu, jp, sg, au, il, cn, kr, uk, trial) | Determines OAuth callback URL |
| Client ID | Yes | UUID-format string | From Microsoft Teams Dev Portal |
| Client Secret | Yes | Long alphanumeric string | Keep secure; cannot be retrieved later |
| Secret Expiration | Yes | YYYY-MM-DD | Track for renewal (typically annual) |
| Upload Files | Yes | Boolean | Required by default for Teams bots |
| Personal Scope | Yes | Boolean | Allow 1:1 conversations with bot |
| Team Scope | Yes | Boolean | Allow bot in team channels |
| Group Chat Scope | Yes | Boolean | Allow bot in group DMs |

## Warnings & Best Practices

### Security
- **Client secrets expire** – Document expiration date in your calendar; renewal is manual
- **Store secrets securely** – Use Terraform `sensitive = true` for outputs, or Azure Key Vault
- **Delegated vs. Application permissions** – Delegated (default) requires user context; Application permissions are more secure but require additional Azure setup

### Naming
- Bot name must be unique within your Workato workspace
- Avoid names conflicting with default bots or other custom bots
- Use names that reflect the bot's purpose (e.g., "HR Hiring Bot", "Finance Expense Bot")

### Deployment
- **Terraform first:** If using both Terraform and Azure CLI, deploy Terraform first; it creates the Azure app registration
- **Manual approval:** After publishing, your Microsoft Teams admin must approve the app in the Teams Admin Center

## After Setup

1. **Verify in Workato:**
   - Go to **Platform > Workbot > Custom bots**
   - Confirm your new bot appears with the correct name
   - Check that credentials are saved

2. **Verify in Microsoft Teams:**
   - Go to **https://dev.teams.microsoft.com/apps**
   - Locate your app and confirm all info is present

3. **Publish & Approve:**
   - Submit publish request in Teams Dev Portal
   - Ask your Microsoft Teams admin to approve it

4. **Add to Teams:**
   - In any Teams channel, type `@` and find your bot
   - Click to add it to the channel

5. **Track Expiration:**
   - Set calendar reminders for client secret expiration
   - Renew **before** the date to avoid service disruption

## References

- [Workato Docs: Create an Enterprise Workbot](https://docs.workato.com/en/workbot-for-teams/guides/creating-enterprise-workbot)
- [Microsoft Teams Developer Portal](https://dev.teams.microsoft.com)
- [Azure App Registrations Portal](https://portal.azure.com)

## Next Steps

I'm ready to guide you through setup. Let me start by asking your bot name and description.

