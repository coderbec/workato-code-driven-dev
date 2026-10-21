---
name: workato-cli-orchestrator
description: Manage recipe synchronization between Git and Workato using the wk CLI (pull, push, diff, status). Use when syncing recipes between a Git repo and a Workato workspace.
---

# Workato CLI Orchestrator

**Purpose**: Manage recipe synchronization between Git and Workato using wk CLI.

**Skill ID**: `workato-cli-orchestrator`

**When to use**:
- Pull recipes from Workato to Git (version control)
- Push recipe changes back to Workato
- Check diffs between local and remote
- Verify project status

## Available Operations

### Pull Recipes from Workato
```
Orchestrator: "Pull all recipes from Workato to Git"
```

What happens:
1. Authenticates with Workato API
2. Downloads all recipes as JSON files
3. Saves to `recipes/` directory
4. Ready to commit to Git

Command: `npm run wk:pull`

### Push Recipes to Workato
```
Orchestrator: "Push recipe changes to Workato"
```

What happens:
1. Reads recipe files from Git
2. Uploads to Workato workspace
3. Verifies deployment
4. Reports status

Command: `npm run wk:push`

### Check Differences
```
Orchestrator: "Show me the differences between Git and Workato"
```

Shows:
- Files added locally (not in Workato)
- Files deleted locally (still in Workato)
- Files modified (local vs remote differences)

Command: `npm run wk:diff`

### Check Status
```
Orchestrator: "What's the status of all recipes in Git?"
```

Returns:
- Synchronized files ✅
- Out-of-sync files ⚠️
- New files (not yet pushed) 🆕
- Deleted files ❌

Command: `npm run wk:status`

## Workflow Examples

### Example 1: Initial Backup
```
Step 1: "Pull all recipes from Workato"
        → Downloads to recipes/ folder

Step 2: "Commit these to Git"
        → git add recipes/
        → git commit -m "Initial backup of Workato recipes"
        → git push

Result: All recipes now version-controlled
```

### Example 2: Edit and Deploy
```
Step 1: Edit recipe file locally
        recipes/my-recipe.json

Step 2: "Check the status"
        → Shows local changes

Step 3: "Push these changes to Workato"
        → Uploads to workspace
        → Verifies deployment

Step 4: "Commit the change"
        → git commit
        → git push

Result: Recipe updated in both Git and Workato
```

### Example 3: Merge from Team
```
Step 1: "Pull latest from Workato"
        → Gets remote changes

Step 2: Git merge/pull from team branch
        → Combines with local changes

Step 3: "Check differences"
        → Identifies conflicts

Step 4: Resolve conflicts manually

Step 5: "Push to Workato"
        → Deploys merged recipes

Result: Team changes synchronized across Git and Workato
```

## Prerequisites

### Before Using
```bash
# 1. Install dependencies
npm install

# 2. Authenticate with Workato: say "start workato setup" (or /workato-setup) in Claude Code

# 3. Verify connection
npm run wk:status
```

### Authentication
Uses the active wk profile (created by the guided setup as `workato-code-dev-N`) from the `WORKATO_CODE_DEV` profile variable. There is no `.env`.

## Technical Details

**Tool**: wk CLI (Workato Labs)

**Authentication**: API token (header-based)

**Git Integration**: Works with standard Git workflow

**Supported Files**: `.json` recipe files

**Linting**: Runs automatically before push (via linter-config.json)

## Safety Features

✅ **Validation**: Recipes must pass linter before pushing
✅ **Diffs**: Always show changes before applying
✅ **Backups**: Git history preserves previous versions
✅ **Dry-run**: Can preview changes before applying

## Common Commands

```bash
# Check status
npm run wk:status

# Pull recipes
npm run wk:pull

# Show differences
npm run wk:diff

# Push changes
npm run wk:push

# Check / change the active profile
wk auth status
wk auth switch <profile>

# Check CLI version
wk --version

# Auto-fix linting issues
npm run lint:fix
```

## Troubleshooting

### "Authentication failed"
```
wk auth status
# If it fails: rotate WORKATO_CODE_DEV, then say "start workato setup" (creates a fresh profile)
```

### "Linter errors before push"
```
npm run lint:fix
# Auto-fix formatting issues
```

### "Git conflicts"
```
git merge --no-ff
# Resolve conflicts manually
npm run wk:diff
```

### "Workspace not recognized"
```
# Check the active profile's workspace
wk auth status
npm run wk:status
```

## Limitations

- ⚠️ Requires manual linting before push
- ⚠️ Doesn't merge conflicting recipes automatically
- ⚠️ Requires valid Git repository
- ⚠️ API rate limits apply

## Integration with Other Skills

Works seamlessly with:
- **Workato Project Cataloguer**: Pull recipes discovered during cataloging
- **Standard Git workflows**: Add, commit, push operations
- **CI/CD pipelines**: Automate push via GitHub Actions or similar

## Next Steps

1. **Pull** recipes to establish baseline
2. **Commit** to Git to create version history
3. **Configure** pre-commit hooks (optional)
4. **Push** changes as part of CI/CD pipeline
5. **Monitor** job deployments in Workato
