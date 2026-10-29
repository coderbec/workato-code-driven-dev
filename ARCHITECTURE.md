# 🏗️ Architecture & Design

## Overview

This project implements **code-driven Workato development** by combining:

1. **Version Control** (Git) — Recipes stored as JSON
2. **Synchronization** (wk CLI) — Bi-directional sync with Workato
3. **Quality Gates** (Linter) — Enforce standards before deployment
4. **Infrastructure** (Terraform) — Azure resources as code
5. **AI-Powered Development** (MCP) — Claude Desktop integration

---

## System Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Machine                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Local Git Repository                                       │
│  └─ Workspace Projects/*                                   │
│     ├─ my_recipe_1.json                                    │
│     ├─ my_recipe_2.json                                    │
│     └─ ...                                                  │
│                                                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
         wk pull / wk push
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                Workato Workspace                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Recipes (UI Editor)                                        │
│  ├─ Recipe 1                                               │
│  ├─ Recipe 2                                               │
│  └─ ...                                                     │
│                                                              │
│  Developer API MCP ←─ Claude Desktop / Cursor              │
│  AIRO MCP         ←─ Claude Desktop / Cursor              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                   
┌─────────────────────────────────────────────────────────────┐
│                    GitHub (Central)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Main Branch                                                │
│  ├─ Workspace Projects/* (local only)                      │
│  ├─ terraform/ (infrastructure)                            │
│  └─ ...                                                     │
│                                                              │
│  GitHub Actions                                             │
│  ├─ Lint recipes on PR                                     │
│  ├─ Plan Terraform changes                                 │
│  └─ Deploy on merge to main                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                   │
              Terraform
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                     Azure Cloud                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Resource Group                                             │
│  ├─ SQL Server + Database                                  │
│  ├─ Key Vault (secrets)                                    │
│  ├─ Storage Account                                        │
│  └─ ...                                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Recipe JSON Format

Recipes are stored as standardized JSON files:

```json
{
  "name": "my_integration_recipe",
  "description": "Syncs data from source to destination",
  "trigger": {
    "app": "scheduler",
    "event": "interval",
    "config": {
      "interval_unit": "hours",
      "interval_value": 1
    }
  },
  "actions": [
    {
      "name": "fetch_data",
      "app": "salesforce",
      "action": "search_records",
      "config": {}
    }
  ],
  "error_handler": {}
}
```

**Benefits**:
- ✅ Version control with Git
- ✅ Diff/merge with standard tools
- ✅ Automated testing & linting
- ✅ CI/CD integration

### 2. MCP Integration

Two Workato MCP servers available:

#### Developer API MCP
**Purpose**: Workspace management

```
GET /api/recipes
GET /api/recipes/:id
POST /api/recipes
PATCH /api/recipes/:id
DELETE /api/recipes/:id

GET /api/connections
GET /api/jobs
GET /api/genies
...
```

**Use Cases**:
- List all recipes
- Query recipe metadata
- Monitor job execution
- Manage connections

#### AIRO MCP
**Purpose**: Connector building from natural language

```
POST /api/connectors/generate
  Input: "Build a Salesforce connector with these fields..."
  Output: Connector code

PATCH /api/connectors/:id
  Update connector definition

POST /api/connectors/:id/release
  Release to marketplace
```

**Use Cases**:
- Build custom connectors
- Update connector APIs
- Release connectors

### 3. Authentication Strategy

All MCPs use **header-based authentication**:

```bash
curl -H "Authorization: Bearer $WORKATO_CODE_DEV" \
     https://app.workato.com/api/recipes
```

**Why headers?**
- ✅ Secure (not in body/URL)
- ✅ Standard HTTP practice
- ✅ Works with all MCP clients
- ✅ Easy to rotate tokens

### 4. Synchronization Flow

#### Pull (Workato → Git)
```
wk pull   (from Workspace Projects/)
  ↓
1. Authenticate with Workato API
2. Fetch all recipes
3. Convert to JSON
4. Save to Workspace Projects/
5. Git detects changes
```

#### Push (Git → Workato)
```
wk push   (from Workspace Projects/)
  ↓
1. Read Workspace Projects/
2. Lint & validate
3. Authenticate with Workato API
4. Create/update recipes in workspace
5. Verify deployment
```

### 5. Quality Gates (Linter)

Enforces standards before push:

```
npm run lint
  ↓
✅ Recipe naming: snake_case
✅ No hardcoded secrets
✅ Error handling required
✅ Description >= 10 chars
✅ JSON syntax valid
```

**Configuration**: `linter-config.json`

### 6. Infrastructure (Terraform)

Provisions Azure resources:

```
terraform/
├── main.tf          (Resource definitions)
├── variables.tf     (Input variables)
├── outputs.tf       (Return values)
└── environments/
    ├── dev.tfvars
    ├── staging.tfvars
    └── prod.tfvars
```

**Resources Created**:
- Resource Group
- SQL Server + Database
- Key Vault
- Storage Account

---

## Authentication Layers

### Layer 1: Workato API Token
```
Source: Workspace Admin > API clients
Storage: WORKATO_CODE_DEV profile variable (OS profile; never a file)
Usage: All MCP calls and the wk CLI profile
Header: Authorization: Bearer ${WORKATO_CODE_DEV}
```

### Layer 2: Azure Service Principal
```
Source: az ad sp create-for-rbac
Storage: shell environment (TF_VAR_*) or az login; never a file in the repo
Usage: Terraform authentication
```

### Layer 3: Database Credentials
```
Source: Azure Key Vault (Terraform-managed)
Storage: Workato connections
Usage: Recipe SQL access
```

---

## Development Workflow

### Typical Flow

```
1. Developer pulls latest
   git pull

2. Check for remote changes
   npm run wk:pull

3. Create feature branch
   git checkout -b feature/my-recipe

4. Create/edit recipe
   Workspace Projects/<project>/my_recipe.json

5. Validate locally
   npm run lint

6. Keep it local
   Workspace Projects/ is outside this repo and never committed

7. Push to GitHub
   git push origin feature/my-recipe

8. Open Pull Request
   GitHub Actions runs lint

9. Review & merge to main
   git merge

10. Auto-deploy to Workato
    GitHub Actions runs wk push
```

### With Claude Desktop

```
1. Claude: "List all recipes"
   → Uses Developer API MCP
   → Gets metadata, status, health

2. Claude: "Build connector for API X"
   → Uses AIRO MCP
   → Generates connector code

3. Claude: "Pull latest recipes"
   → Runs wk CLI Orchestrator skill
   → Saves to Workspace Projects/

4. npm run lint
   → Validates syntax

5. git commit && git push
   → Syncs to GitHub
```

---

## Deployment Environments

### Dev (Local Machine)
```
git branch: feature/*
Recipe storage: Workspace Projects/ (local, never committed)
Terraform: dev.tfvars
Deploy target: Local Workato workspace
```

### Staging
```
git branch: develop
Recipe storage: Workspace Projects/ (local, never committed)
Terraform: staging.tfvars
Deploy target: Staging Workato workspace
```

### Production
```
git branch: main
Recipe storage: Workspace Projects/ (local, never committed)
Terraform: prod.tfvars
Deploy target: Production Workato workspace
Approval: Manual review + merge
```

---

## Security Architecture

### Secrets Management

```
Developer Machine
    ↓ (OS profile variable - local only)
    ├─ WORKATO_CODE_DEV
    ├─ AZURE_CLIENT_SECRET
    └─ Database passwords (never stored locally)

    ↓ (GitHub Secrets)
    ├─ WORKATO_CODE_DEV
    ├─ AZURE_CLIENT_SECRET
    └─ AZURE_* credentials

    ↓ (Azure Key Vault - production)
    ├─ Database passwords
    ├─ Connection strings
    └─ API credentials
```

### No Hardcoded Secrets

Linter prevents:
```json
❌ "password": "MySecretPassword123"
❌ "api_key": "sk_live_xyz123"
❌ "connection_string": "Server=...;Password=..."
```

Instead, use references:
```json
✅ "password": "{{ env.DB_PASSWORD }}"
✅ "api_key": "{{ connections.salesforce.api_token }}"
✅ "connection_string": "{{ env.AZURE_SQL_CONNECTION }}"
```

---

## Error Handling

### Application Level
Every recipe must have error handling:

```json
{
  "actions": [...],
  "error_handler": {
    "app": "slack",
    "action": "post_message",
    "config": {
      "channel": "#errors",
      "message": "Recipe failed: {{ error_message }}"
    }
  }
}
```

### CI/CD Level
GitHub Actions validates:
```yaml
- npm run lint
- npm run terraform:plan
- GitHub status checks
```

### Infrastructure Level
Terraform manages:
- SQL Server failover
- Key Vault access policies
- Network security groups

---

## Scaling Considerations

### Single Developer
```
1 laptop
1 Workato workspace
1 Git repository
1 GitHub Actions pipeline
```

### Team (5+ developers)
```
Multiple laptops → One Workato workspace
  ├─ feature branches (local development)
  ├─ develop branch (staging)
  └─ main branch (production)

GitHub Actions
  ├─ PR lint/validation
  ├─ Manual approval on main
  ├─ Auto-deploy on merge

Azure
  └─ One per environment (dev/staging/prod)
```

---

## Performance Characteristics

| Operation | Duration | Limit |
|---|---|---|
| `wk pull` (100 recipes) | 30-60s | API rate limited |
| `wk push` (10 recipes) | 10-20s | API rate limited |
| `npm run lint` | 5-10s | Local only |
| `terraform plan` | 20-40s | Azure API |
| `terraform apply` | 5-15min | Azure provisioning |

---

## Future Enhancements

- [ ] Recipe testing framework
- [ ] Load testing scripts
- [ ] Multi-workspace management
- [ ] Advanced recipe dependencies
- [ ] Automatic secret rotation
- [ ] Workspace health dashboard
- [ ] Cost optimization reports

---

## References

- [Workato API Docs](https://docs.workato.com/en/workato-api/)
- [MCP Protocol Spec](https://modelcontextprotocol.io/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest)
- [wk CLI Documentation](https://github.com/workato-devs/wk)
