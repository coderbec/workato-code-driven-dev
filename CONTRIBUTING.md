# 🤝 Contributing Guide

Thank you for contributing to Workato Code-Driven Development! This guide explains how to add recipes, update infrastructure, and follow best practices.

## Before You Start

1. Read [README.md](README.md) — Architecture overview
2. Complete [SETUP.md](SETUP.md) — Local setup
3. Review [ARCHITECTURE.md](ARCHITECTURE.md) — Design decisions

---

## Creating a Recipe

### 1. Use a Template

```bash
cp recipe-templates/basic_sync_template.json recipes/my_new_recipe.json
```

### 2. Edit the Recipe

```json
{
  "name": "my_new_recipe",
  "description": "Syncs customers from Salesforce to database",
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
      "name": "fetch_customers",
      "app": "salesforce",
      "action": "search_records",
      "config": {
        "sobject": "Account"
      }
    },
    {
      "name": "insert_to_db",
      "app": "database",
      "action": "insert_rows",
      "config": {
        "table": "customers"
      }
    }
  ],
  "error_handler": {
    "app": "slack",
    "action": "post_message",
    "config": {
      "channel": "#alerts",
      "message": "Recipe failed: {{ error_message }}"
    }
  }
}
```

### 3. Lint & Validate

```bash
npm run lint

# Output should be:
# ✅ Naming: PASSED
# ✅ Secrets: PASSED
# ✅ Description: PASSED
# ✅ Error handling: PASSED
```

If there are issues:
```bash
npm run lint:fix
```

### 4. Commit to Git

```bash
git add recipes/my_new_recipe.json
git commit -m "Add: my_new_recipe - Syncs customers from Salesforce to database"
git push origin feature/my-recipe
```

### 5. Create Pull Request

On GitHub, open a PR with:
- **Title**: `Add: my_new_recipe`
- **Description**: What it does, why it's needed
- **Testing**: How you tested it

### 6. Review & Merge

Team reviews, GitHub Actions validates (lint + JSON syntax), then merge to main.

### 7. Auto-Deploy

Once merged to `main`:
1. GitHub Actions runs `wk push`
2. Recipe deployed to Workato workspace
3. You're done! 🎉

---

## Recipe Best Practices

### Naming Convention

✅ **Do**:
```
my_recipe_name          (snake_case)
customer_sync_daily     (descriptive)
slack_error_notification
```

❌ **Don't**:
```
myRecipeName            (camelCase)
My Recipe               (spaces)
recipe1, recipe2        (not descriptive)
```

### Descriptions

✅ **Do**:
```
"Syncs customer records from Salesforce to Azure SQL every hour. 
Includes error notifications to Slack."
```

❌ **Don't**:
```
"Recipe"
"Sync"
"Does stuff"
```

### Secrets Management

✅ **Do**:
```json
{
  "connection": "{{ connections.salesforce.id }}",
  "password": "{{ env.DATABASE_PASSWORD }}"
}
```

❌ **Don't**:
```json
{
  "api_key": "sk_live_abc123xyz",
  "password": "MySecret123!@#"
}
```

### Error Handling

✅ **Do**:
```json
{
  "actions": [...],
  "error_handler": {
    "app": "slack",
    "action": "post_message",
    "config": {
      "channel": "#integration-errors"
    }
  }
}
```

❌ **Don't**:
```json
{
  "actions": [...],
  "error_handler": null
}
```

---

## Updating Infrastructure

### Adding Azure Resources

1. Edit `terraform/main.tf`
2. Plan changes:
   ```bash
   npm run terraform:plan
   ```
3. Review output
4. Apply:
   ```bash
   npm run terraform:apply
   ```
5. Commit:
   ```bash
   git add terraform/
   git commit -m "Infrastructure: Add new SQL database"
   ```

### Adding Variables

1. Edit `terraform/variables.tf`
2. Update environment files:
   ```bash
   terraform/environments/dev.tfvars
   terraform/environments/staging.tfvars
   terraform/environments/prod.tfvars
   ```
3. Commit:
   ```bash
   git add terraform/
   git commit -m "Variables: Add new configuration option"
   ```

---

## Updating Documentation

When making changes, update relevant docs:

| Change | Update |
|---|---|
| New recipe | `README.md` (workflow section) |
| New Azure resource | `terraform/main.tf` + comments |
| New script | `package.json` scripts + `scripts/` |
| Architecture change | `ARCHITECTURE.md` |
| Setup process change | `SETUP.md` |

---

## Pull Request Process

### Before Submitting

```bash
# 1. Pull latest
git pull origin develop

# 2. Create feature branch
git checkout -b feature/description

# 3. Make changes
# ... edit recipes/terraform/docs ...

# 4. Test locally
npm run lint                    # Validate syntax
npm run terraform:plan         # Preview changes
npm run wk:status             # Check sync status

# 5. Commit with clear message
git commit -m "type: description

- Detailed explanation
- What changed and why
- Links to issues (if applicable)"

# 6. Push
git push origin feature/description
```

### PR Template

```markdown
## Description
Brief explanation of changes

## Type of Change
- [ ] New recipe
- [ ] Updated recipe
- [ ] Infrastructure change
- [ ] Documentation
- [ ] Bug fix

## Testing
How did you test this?

## Checklist
- [ ] Code follows style guide
- [ ] Linter passes (`npm run lint`)
- [ ] No hardcoded secrets
- [ ] Error handling included
- [ ] Documentation updated
```

### Review Expectations

A maintainer will:
- ✅ Review code for security
- ✅ Run linting checks
- ✅ Verify error handling
- ✅ Check for hardcoded secrets
- ✅ Test in staging environment
- ✅ Approve or request changes

---

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

type: add, update, fix, docs, ci, chore
scope: recipes, terraform, scripts, docs
description: what changed

Examples:
  add(recipes): customer_sync_daily - Syncs customer records hourly
  update(terraform): Add Key Vault for secrets management
  fix(scripts): Correct wk authentication flow
  docs(README): Update setup instructions
```

---

## Code Review Checklist

When reviewing PRs:

- [ ] **Naming**: Follows snake_case convention
- [ ] **Description**: Present and descriptive (10+ chars)
- [ ] **Secrets**: No hardcoded API keys/passwords
- [ ] **Error Handling**: All recipes have error handlers
- [ ] **Linting**: `npm run lint` passes
- [ ] **Syntax**: Valid JSON
- [ ] **Testing**: Changes tested locally
- [ ] **Documentation**: Updated (if applicable)

---

## Troubleshooting

### "My lint fails"
```bash
npm run lint:fix
# Auto-fixes formatting

# If manual fix needed:
npm run lint
# Shows specific errors
```

### "Terraform plan fails"
```bash
# Ensure variables are set
source .env
npm run terraform:plan -var-file='environments/dev.tfvars'
```

### "Git merge conflicts"
```bash
# Show conflicts
git diff

# Resolve manually, then:
git add .
git commit -m "Merge: resolve conflicts"
git push
```

### "wk push fails"
```bash
# Check authentication
npm run wk:auth

# Check differences
npm run wk:diff

# Try again
npm run wk:push
```

---

## Questions?

- 📖 Check [README.md](README.md)
- 🏗️ See [ARCHITECTURE.md](ARCHITECTURE.md)
- 🛠️ Follow [SETUP.md](SETUP.md)
- 💬 Ask in team chat

---

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Assume good intent
- Help others succeed

---

Thank you for contributing! 🙏
