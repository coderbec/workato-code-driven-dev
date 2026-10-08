# Workato CLI Orchestrator Skill

**Purpose**: Manage recipe synchronization between Git and Workato using wk CLI.

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

# 2. Authenticate with Workato
npm run wk:auth

# 3. Verify connection
npm run wk:status
```

### Environment Variables
Requires in `.env`:
```
WORKATO_API_TOKEN=your_token_here
WORKATO_WORKSPACE_ID=your_workspace_id
```

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

# Re-authenticate
npm run wk:auth

# Check CLI version
wk --version
```

## Troubleshooting

### "Authentication failed"
```
npm run wk:auth
# Re-enter credentials
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
# Check WORKATO_WORKSPACE_ID in .env
# Verify ID format
npm run wk:status
```

## Limitations

- ⚠️ Requires manual linting before push
- ⚠️ Doesn't merge conflicting recipes automatically
- ⚠️ Requires valid Git repository
- ⚠️ API rate limits apply

## Next Steps

1. **Pull** recipes to establish baseline
2. **Commit** to Git to create version history
3. **Configure** pre-commit hooks (optional)
4. **Push** changes as part of CI/CD pipeline
5. **Monitor** job deployments in Workato
