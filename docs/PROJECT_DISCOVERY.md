# Project Discovery & Selective Hydration

This guide explains how to discover all projects in your Workato workspace and selectively download (hydrate) recipes to Git—without downloading everything at once.

## Quick Start

### For the First Time (Recommended: Interactive)
```bash
npm run hydrate:interactive
```
This guides you through discovering projects and selecting which ones to download.

### For the First Time (Advanced: Manual)
```bash
# Discover all projects
npm run discover:projects

# Then hydrate specific ones
npm run hydrate:projects -- "Project 1" "Project 2"
```

## What Is Project Discovery?

When you run `npm run discover:projects`, the system:

1. **Connects to Workato API** via `wk CLI`
2. **Lists all your projects/folders** with their IDs
3. **Counts recipes in each project**
4. **Gathers metadata**:
   - Last modified date
   - Whether recipes are active/inactive
5. **Shows you a table** of all projects

### Example Output
```
╔═══════════════════════════════════════════════════════════════╗
║             📁 Projects in Your Workspace                     ║
╚═══════════════════════════════════════════════════════════════╝

Project                | Recipes | Last Modified    | Status
─────────────────────────────────────────────────────────────
Data Sync              |   24    | 2 days ago       | Active
Customer Integrations  |   18    | 1 week ago       | Active
Internal Tools         |    9    | 1 month ago      | Inactive
Experiments            |    3    | 3 months ago     | Inactive
```

## What Is Selective Hydration?

**Hydration** = Downloading recipes from Workato to your Git repository.

**Selective** = You choose which projects to download, not all of them.

### Why Selective Hydration?

- 🎯 **Control**: Only version-control what you need
- ⚡ **Speed**: Smaller Git repos are faster to clone
- 🔒 **Safety**: Don't accidentally download sensitive recipes
- 📊 **Organization**: Structure projects logically in Git
- 🚀 **Flexibility**: Add more projects later

## How to Use

### Method 1: Interactive (Recommended for First-Time Users)

**One command does everything**:
```bash
npm run hydrate:interactive
```

**What happens**:
1. Discovers all projects
2. Shows them in a list
3. Asks which ones you want to download
4. Confirms your selection
5. Downloads and saves to Git
6. Shows results

**Example session**:
```
╔═══════════════════════════════════════════════════════════════╗
║        🚀 Interactive Project Hydration                       ║
╚═══════════════════════════════════════════════════════════════╝

🔍 Discovering projects...

📁 Available Projects:

   1. Data Sync
      🟢 Active | 24 recipes | Last modified: 2 days ago
   
   2. Customer Integrations
      🟢 Active | 18 recipes | Last modified: 1 week ago
   
   3. Internal Tools
      ⚪ Inactive | 9 recipes | Last modified: 1 month ago
   
   4. Experiments
      ⚪ Inactive | 3 recipes | Last modified: 3 months ago

Enter project numbers to hydrate (comma-separated, e.g., "1,3,5"): 1,2

📋 You selected:

   1. Data Sync
   2. Customer Integrations

Proceed with hydration? (yes/no): yes

🔄 Starting hydration...

📥 Hydrating: Data Sync...
   └─ 24 recipes hydrated

📥 Hydrating: Customer Integrations...
   └─ 18 recipes hydrated

📊 Hydration Summary:

Project                | Recipes | Status
─────────────────────────────────────────
Data Sync              |   24    | ✅ Success
Customer Integrations  |   18    | ✅ Success

✨ Next Steps:

1. Review the downloaded recipes in ./recipes/

2. Commit your changes:
   $ git add recipes/
   $ git commit -m "chore: hydrate projects"

3. Start developing with:
   $ npm run dev
```

### Method 2: Two-Step (Manual Control)

**Step 1: Discover all projects**
```bash
npm run discover:projects
```

Gives you time to review and decide.

**Step 2: Hydrate specific projects**
```bash
npm run hydrate:projects -- "Data Sync" "Customer Integrations"
```

You specify exactly which projects to download.

## File Organization After Hydration

After hydration, your recipes are organized like this:

```
recipes/
├── data-sync/              # Project name (lowercase, dashes)
│   ├── recipe-1.json
│   ├── recipe-2.json
│   └── ...
├── customer-integrations/
│   ├── recipe-1.json
│   ├── recipe-2.json
│   └── ...
└── internal-tools/         # Not yet hydrated (optional)
    └── (recipes available on request)
```

## Committing to Git

After hydrating projects:

```bash
# Stage the recipes
git add recipes/

# Commit with a meaningful message
git commit -m "chore: hydrate projects - Data Sync & Customer Integrations"

# Push to your repository
git push
```

## Adding More Projects Later

As your needs grow, hydrate additional projects:

```bash
# Method 1: Interactive
npm run hydrate:interactive
# (Select projects you haven't hydrated yet)

# Method 2: Manual
npm run hydrate:projects -- "Internal Tools" "Experiments"

# Commit new recipes
git add recipes/
git commit -m "chore: hydrate additional projects - Internal Tools"
git push
```

## Common Tasks

### Show Me All Projects Again
```bash
npm run discover:projects
```

The metadata is also saved to `.workato/project-metadata.json` for programmatic access.

### Hydrate Everything
If you want all projects at once:

```bash
npm run hydrate:projects -- "Data Sync" "Customer Integrations" "Internal Tools" "Experiments"
```

### Hydrate by Naming Pattern
If projects follow a naming convention:

```bash
# Hydrate all "Sync" projects
npm run hydrate:projects -- "Data Sync" "Customer Sync" "Vendor Sync"
```

### Check Which Projects Are Already Hydrated
```bash
ls -la recipes/
```

Compare with the output of:
```bash
npm run discover:projects
```

## Troubleshooting

### Error: "Failed to list projects"

**Problem**: `wk CLI` isn't working or you're not authenticated.

**Solution**:
```bash
# Check if wk CLI is installed
which wk

# If not installed, install it
npm install -g @workato/wk

# Check if you're authenticated
wk auth status

# If not authenticated, log in
wk auth login
```

### Error: "Project not found"

**Problem**: You typed the project name wrong or it doesn't exist.

**Solution**:
```bash
# Run discovery again to see exact project names
npm run discover:projects

# Use the exact name from the table
npm run hydrate:projects -- "Exact Project Name"
```

### Error: "wk pull failed"

**Problem**: The `wk pull` command failed (network, permissions, etc.)

**Solution**:
```bash
# Try again (might be temporary)
npm run hydrate:projects -- "Project Name"

# Or try the wk CLI directly to debug
wk pull --folder <FOLDER_ID> --force

# Check wk status
wk auth status
```

### Recipes Downloaded But Can't See Them

**Problem**: You've hydrated projects but don't see them in the recipes folder.

**Solution**:
```bash
# List what's in recipes/
ls -la recipes/

# The folder name uses lowercase and dashes
# "Data Sync" → "data-sync"
# "Customer API" → "customer-api"

# Check with full path
ls -la recipes/data-sync/
```

## How It Works Under the Hood

### Discovery Process

When you run `npm run discover:projects`:

1. **Script**: `scripts/discover-projects.js`
2. **Gets projects**: `wk folders list --projects --json`
3. **For each project**:
   - Runs: `wk recipes list --folder <ID> --json`
   - Counts recipes
   - Determines if active/inactive
   - Gets last modified date
4. **Formats output** as human-readable table
5. **Saves metadata** to `.workato/project-metadata.json`

### Hydration Process

When you run `npm run hydrate:projects -- "Project"`:

1. **Script**: `scripts/hydrate-projects.js`
2. **Validates** project exists from discovery data
3. **For each project**:
   - Finds folder ID
   - Creates directory: `recipes/[project-name]/`
   - Runs: `wk pull --folder <ID> --force`
   - Waits for completion
4. **Counts recipes** downloaded
5. **Shows summary** with success/failure status

## Advanced Usage

### Programmatic Access

The metadata JSON can be used in scripts:

```bash
cat .workato/project-metadata.json | jq '.projects[0].name'
```

### Integrating with CI/CD

In GitHub Actions:
```yaml
- name: Discover and hydrate projects
  run: |
    npm run discover:projects
    npm run hydrate:projects -- "Project 1" "Project 2"

- name: Commit and push
  run: |
    git add recipes/
    git commit -m "CI: Auto-hydrate projects"
    git push
```

### Custom Selection Logic

Build your own selection script using the metadata:
```javascript
const metadata = require('./.workato/project-metadata.json');
const activeProjects = metadata.projects.filter(p => p.status === 'Active');
// Use activeProjects to auto-select
```

## Best Practices

1. **Start small**: Hydrate your most-used projects first
2. **Test the process**: Do a small hydration, verify it works, then scale
3. **Commit frequently**: After each hydration, commit to Git
4. **Document decisions**: In commit messages, explain why you chose those projects
5. **Review metadata**: Run discovery periodically to see what changed
6. **Use interactive mode**: For first-time setup and learning

## Performance Notes

- **Discovery**: ~10-30 seconds (depends on number of projects)
- **Hydration**: ~30 seconds to several minutes (depends on recipe count and network)
- **Large workspaces**: If you have 100+ projects, discovery might take longer

## Next Steps

1. **Run discovery**: `npm run discover:projects`
2. **Review projects**: Understand what you have
3. **Hydrate initial set**: `npm run hydrate:interactive`
4. **Commit to Git**: `git add recipes/ && git commit`
5. **Start developing**: `npm run dev`
6. **Add more later**: Use same commands to hydrate additional projects

## Related Commands

```bash
# Discover all projects
npm run discover:projects

# Interactively hydrate projects
npm run hydrate:interactive

# Directly hydrate specific projects
npm run hydrate:projects -- "Project 1" "Project 2"

# Work with recipes after hydration
npm run wk:pull          # Pull all hydrated projects
npm run wk:push          # Push changes back to Workato
npm run wk:status        # Check status
npm run wk:diff          # See what changed
```

## Need Help?

Check the Cataloguer Skill documentation:
```bash
open .opencode/skills/workato-project-cataloguer/SKILL.md
```

Or review the scripts directly:
```bash
cat scripts/discover-projects.js
cat scripts/hydrate-projects.js
cat scripts/hydrate-projects-interactive.js
```
