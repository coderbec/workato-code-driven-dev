# Workato Project Cataloguer

**Purpose**: Discover, catalogue, and export all recipes and projects from your Workato workspace.

**Skill ID**: `workato-project-cataloguer`

**When to use**: 
- First-time setup to understand what recipes you have
- Migration planning
- Inventory management
- Compliance/audit reporting

## Available Operations

### Initial Setup: Discover & Hydrate Projects
This is the recommended workflow for first-time setup. It discovers all projects, presents them to you, and helps you selectively hydrate them to Git.

```
User: "I'm setting up for the first time, help me hydrate my workspace"
↓
Cataloguer lists all projects:
  1. Data Sync (24 recipes)
  2. Customer Integrations (18 recipes)
  3. Internal Tools (9 recipes)
  4. Experiments (3 recipes)
↓
User selects projects to hydrate:
  "Hydrate Data Sync and Customer Integrations"
↓
Cataloguer pulls full recipes using wk CLI:
  npm run wk:pull --project "Data Sync"
  npm run wk:pull --project "Customer Integrations"
↓
Recipes now available in Git
↓
User can commit and continue with selective hydration
```

**Commands for Initial Setup**:

**Option 1: Manual discovery and hydration**
```bash
# Step 1: Discover all projects
npm run discover:projects

# Step 2: Hydrate specific projects
npm run hydrate:projects -- "Data Sync" "Customer API"

# Step 3: Commit to Git
git add recipes/
git commit -m "Initial hydration: Data Sync & Customer API"
git push
```

**Option 2: Interactive guided workflow (Recommended)**
```bash
# Step 1: Discover projects and interactively select which to hydrate
npm run hydrate:interactive

# Step 2: Commit to Git
git add recipes/
git commit -m "Initial hydration"
git push
```

**What each command does**:
- `npm run discover:projects` → Shows full list of projects with recipe counts and status
- `npm run hydrate:projects -- "Name1" "Name2"` → Pulls specific projects only, saves to Git
- `npm run hydrate:interactive` → Guided workflow with interactive project selection

### List All Projects
```
Cataloguer: "Show me all projects and folders in my workspace"
```

Returns:
- Project names and IDs
- Folder structure
- Number of recipes per project
- Activity status (active/inactive)
- Last modified information

### List All Recipes
```
Cataloguer: "List all recipes in my workspace"
```

Returns for each recipe:
- Recipe ID
- Name
- Status (active/inactive)
- Last modified date
- Parent project/folder

### Export Inventory
```
Cataloguer: "Export a complete recipe inventory as JSON"
```

Generates:
```json
{
  "workspace_id": "...",
  "exported_at": "...",
  "projects": [...],
  "recipes": [
    {
      "id": "...",
      "name": "...",
      "project": "...",
      "status": "...",
      "last_modified": "..."
    }
  ],
  "summary": {
    "total_recipes": 42,
    "active": 38,
    "inactive": 4
  }
}
```

### Selective Hydration (After Initial Discovery)
```
Cataloguer: "Hydrate [project names] to Git"
```

What happens:
1. Validates project names against discovered projects
2. Calls CLI Orchestrator to hydrate via `wk pull --project [name]`
3. Downloads full recipe definitions (not just metadata)
4. Saves to `recipes/[project-name]/` structure
5. Shows summary of hydrated recipes
6. Provides Git commit recommendations

### Identify Inactive Recipes
```
Cataloguer: "Which recipes haven't run in the last 30 days?"
```

### Filter by Project
```
Cataloguer: "List all recipes in the 'Data Sync' project"
```

## Integration with Other Skills

### With Workato CLI Orchestrator (Initial Setup)
The recommended first-time setup workflow:
```
1. Cataloguer: "I'm setting up for the first time, show me all projects"
   → Lists all projects with recipe counts
   
2. User reviews and selects projects
   
3. Cataloguer: "Hydrate [selected projects] to Git"
   → Invokes CLI Orchestrator internally
   → Uses wk pull --project [name] for each selected project
   → Recipes saved to recipes/ directory
   
4. Git: "Commit these recipes"
   → git add recipes/
   → git commit -m "Initial hydration: [project names]"
   → git push
   
5. Result: Selective projects are version-controlled, others remain in Workato
```

### With Workato CLI Orchestrator (Ongoing)
After initial setup, add more projects:
```
Cataloguer: "Which other projects can I hydrate?"
↓
Shows remaining non-hydrated projects
↓
User selects projects to hydrate
↓
Cataloguer: "Hydrate [projects] to Git"
↓
Recipes added to Git
```

### With Monitoring/Alerts
After cataloguing, set up monitoring:
```
Cataloguer: "Export inventory"
→ Store as baseline
→ Run daily comparison
→ Alert on new/deleted recipes
→ Track project-level changes
```

## Technical Details

### Implementation

This skill is implemented through three Node.js scripts that wrap the `wk CLI`:

#### 1. Project Discovery: `scripts/discover-projects.js`
**What it does**:
- Runs `wk folders list --projects --json` to get all projects
- For each project, runs `wk recipes list --folder <ID> --json` to count recipes
- Gathers metadata (last modified, active/inactive status)
- Formats output as human-readable table
- Saves metadata to `.workato/project-metadata.json` for programmatic use

**How to use**:
```bash
npm run discover:projects
```

**Example output**:
```
╔═══════════════════════════════════════════════════════════════╗
║             📁 Projects in Your Workspace                     ║
╚═══════════════════════════════════════════════════════════════╝

Project                | Recipes | Last Modified    | Status
─────────────────────────────────────────────────────────────
Data Sync             |   24    | 2 days ago       | Active
Customer API          |   18    | 1 week ago       | Active
Internal Tools        |    9    | 1 month ago      | Inactive
Experiments           |    3    | 3 months ago     | Inactive
```

#### 2. Selective Hydration: `scripts/hydrate-projects.js`
**What it does**:
- Accepts project names as command-line arguments
- Validates projects exist against discovered list
- For each project, runs `wk pull --folder <ID> --force`
- Downloads recipes to `recipes/[project-name]/`
- Shows progress and summary

**How to use**:
```bash
npm run hydrate:projects -- "Project 1" "Project 2"
```

**Example**:
```bash
npm run hydrate:projects -- "Data Sync" "Customer API"
```

#### 3. Interactive Selection: `scripts/hydrate-projects-interactive.js`
**What it does**:
- Shows all discovered projects with metadata
- Lets user select which projects to hydrate using arrow keys
- Confirms selection before proceeding
- Performs hydration
- Shows summary

**How to use**:
```bash
npm run hydrate:interactive
```

**Interactive workflow**:
```
📁 Available Projects:

   1. Data Sync
      🟢 Active | 24 recipes | Last modified: 2 days ago
   
   2. Customer API
      🟢 Active | 18 recipes | Last modified: 1 week ago
   
   3. Internal Tools
      ⚪ Inactive | 9 recipes | Last modified: 1 month ago

Enter project numbers to hydrate (comma-separated, e.g., "1,3,5"): 1,2
```

### MCP Server (Future)
**MCP Server**: `workato-developer-api` (for future direct AI integration)

**CLI Integration**: Currently uses `wk CLI` commands through Node.js script wrappers

### API Calls
- `GET /api/projects` (via `wk folders list`)
- `GET /api/recipes` (via `wk recipes list`)
- `POST /api/pull` (via `wk pull`)

### Requirements
- Node.js 18+ (already installed)
- `wk CLI` installed globally (`/opt/homebrew/bin/wk`)
- `WORKATO_API_TOKEN` configured in `.env`
- `WORKATO_WORKSPACE_ID` configured in `.env`

### Output formats
- Console (human-readable project lists)
- JSON (`.workato/project-metadata.json`)
- Git repository (after hydration)

## Example Workflow: First-Time Setup

### Manual Approach
```bash
# Step 1: Discover all projects
$ npm run discover:projects

📊 Gathering project metadata...

📁 Projects in Your Workspace:

Project          | Recipes | Last Modified    | Status
─────────────────────────────────────────────────────
Data Sync        |   24    | 2 days ago       | Active
Customer API     |   18    | 1 week ago       | Active
Internal Tools   |    9    | 1 month ago      | Inactive
Experiments      |    3    | 3 months ago     | Inactive

📋 Next Steps:
1. Review the projects listed above
2. Choose which projects to hydrate
3. Run: npm run hydrate:projects -- "Data Sync" "Customer API"

# Step 2: Hydrate selected projects
$ npm run hydrate:projects -- "Data Sync" "Customer API"

📥 Hydrating: Data Sync
   └─ 24 recipes hydrated

📥 Hydrating: Customer API
   └─ 18 recipes hydrated

📊 Hydration Summary:

Project      | Recipes | Status
──────────────────────────────
Data Sync    |   24    | ✅ Success
Customer API |   18    | ✅ Success

✨ Next Steps:
1. Review the downloaded recipes in ./recipes/
2. Commit your changes:
   $ git add recipes/
   $ git commit -m "chore: hydrate projects"
3. Start developing with:
   $ npm run dev

# Step 3: Commit to Git
$ git add recipes/
$ git commit -m "Initial hydration: Data Sync & Customer API"
$ git push

Result: 42 recipes now version-controlled, others remain in Workato
```

### Interactive Approach (Recommended)
```bash
# One command for full guided workflow
$ npm run hydrate:interactive

╔═══════════════════════════════════════════════════════════════╗
║        🚀 Interactive Project Hydration                       ║
╚═══════════════════════════════════════════════════════════════╝

🔍 Discovering projects...

📁 Available Projects:

   1. Data Sync
      🟢 Active | 24 recipes | Last modified: 2 days ago
   
   2. Customer API
      🟢 Active | 18 recipes | Last modified: 1 week ago
   
   3. Internal Tools
      ⚪ Inactive | 9 recipes | Last modified: 1 month ago
   
   4. Experiments
      ⚪ Inactive | 3 recipes | Last modified: 3 months ago

Enter project numbers to hydrate (comma-separated, e.g., "1,3,5"): 1,2

📋 You selected:

   1. Data Sync
   2. Customer API

Proceed with hydration? (yes/no): yes

🔄 Starting hydration...

📥 Hydrating: Data Sync...
   └─ 24 recipes hydrated

📥 Hydrating: Customer API...
   └─ 18 recipes hydrated

📊 Hydration Summary:

Project      | Recipes | Status
──────────────────────────────
Data Sync    |   24    | ✅ Success
Customer API |   18    | ✅ Success

✨ Next Steps:
1. Review the downloaded recipes in ./recipes/
2. Commit your changes:
   $ git add recipes/
   $ git commit -m "chore: hydrate projects"
3. Start developing with:
   $ npm run dev
```

## Example Workflow: Ongoing Hydration

```bash
# 2 weeks later: Hydrate additional projects

# Option 1: Add more projects interactively
$ npm run hydrate:interactive
(User selects "Internal Tools")

📥 Hydrating: Internal Tools...
   └─ 9 recipes hydrated

# Option 2: Add specific projects directly
$ npm run hydrate:projects -- "Internal Tools"

📥 Hydrating: Internal Tools
   └─ 9 recipes hydrated

# Commit to Git
$ git add recipes/
$ git commit -m "Hydrate: Internal Tools"
$ git push

Result: 51 recipes now in Git (9 newly added)
```

## Limitations

- ⚠️ Read-only operation (doesn't modify recipes)
- ⚠️ Returns only recipe names/IDs (not full recipe code)
- ⚠️ Doesn't include job history (use Developer API separately)
- ⚠️ Rate limited by Workato API

## Setup Requirements

1. Configure `WORKATO_API_TOKEN` in environment
2. Configure `WORKATO_WORKSPACE_ID` in environment
3. Ensure `workato-developer-api` MCP server is configured

## Workflow: First Setup vs. Ongoing

### First-Time Setup (Recommended)
1. **Discover**: "Show me all projects"
   → Get full inventory with recipe counts
   
2. **Evaluate**: Review projects and their activity levels
   → Decide which to hydrate first
   
3. **Hydrate**: "Hydrate [projects] to Git"
   → Selective hydration (not all-or-nothing)
   → Only what you need in Git
   
4. **Commit**: Save to version control
   → `git add recipes/`
   → `git commit -m "Initial hydration: [projects]"`

### Ongoing (Add More Projects)
1. **Review**: "Which projects haven't I hydrated?"
   → See remaining projects in Workato
   
2. **Hydrate**: "Hydrate [projects] to Git"
   → Pull additional projects as needed
   
3. **Commit**: Update Git with new recipes
   → Incremental addition to repository

### Analysis & Optimization
1. **Identify**: "Which recipes are inactive?"
   → Find recipes not run in 30/90 days
   
2. **Analyze**: "Export inventory as JSON"
   → Programmatic analysis for reports
   
3. **Organize**: "List recipes in [project]"
   → Understand project composition
   
4. **Monitor**: Set up alerts for changes
   → Compare inventory over time

## Next Steps

After cataloguing:
1. **Discover**: List all projects to understand scope
2. **Hydrate**: Selectively pull projects to Git (not all at once)
3. **Commit**: Version control the initial set
4. **Iterate**: Add more projects as needed
5. **Monitor**: Track inventory changes over time
