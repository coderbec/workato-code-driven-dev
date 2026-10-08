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
```
Cataloguer: "I'm doing initial setup, show me all projects"
→ Returns full list with recipe counts and status

Cataloguer: "Hydrate [project names] to Git"
→ Uses wk CLI to pull full recipes for selected projects only
→ Saves to recipes/ directory
→ Ready to commit to Git

Cataloguer: "I want selective hydration, help me choose"
→ Shows projects with metadata
→ Asks which to hydrate
→ Executes hydration workflow
→ Provides next steps
```

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

**MCP Server**: `workato-developer-api` (for discovery/cataloging)

**CLI Integration**: Coordinates with `wk CLI` for hydration via CLI Orchestrator

**API Calls**: 
- `GET /api/recipes` - Full catalog
- `GET /api/projects` - Project structure
- Metadata for project-level analysis

**Requires**: 
- WORKATO_API_TOKEN with read access
- wk CLI installed and authenticated (for hydration)

**Output formats**:
- Console (human-readable project lists)
- JSON (programmatic inventory)
- CSV (spreadsheet-friendly)
- Markdown (documentation)
- Git repository (after hydration)

## Example Workflow: First-Time Setup

```
Developer: "I'm setting up for the first time"
↓
Cataloguer: "I'll help you discover and hydrate your workspace"
↓
Shows all projects:
  1. Data Sync (24 recipes) - Last modified 2 days ago
  2. Customer API (18 recipes) - Last modified 1 week ago
  3. Internal Tools (9 recipes) - Last modified 1 month ago
  4. Experiments (3 recipes) - Last modified 3 months ago
  Total: 54 recipes across 4 projects
↓
Developer: "Hydrate Data Sync and Customer API"
↓
Cataloguer:
  - Validates projects exist
  - Confirms 42 total recipes will be hydrated
  - Pulls via wk CLI (Data Sync + Customer API)
  - Saves to recipes/ directory
  - Shows summary:
    ✅ Data Sync: 24 recipes (OK)
    ✅ Customer API: 18 recipes (OK)
    
    Not hydrated (available on request):
    ⚠️ Internal Tools: 9 recipes
    ⚠️ Experiments: 3 recipes
↓
Developer: "Commit these changes"
↓
git add recipes/
git commit -m "Initial hydration: Data Sync & Customer API"
git push
↓
Result: 42 recipes now version-controlled, others remain in Workato
↓
Developer: "Show me what projects I haven't hydrated yet"
↓
Cataloguer lists remaining projects, ready for future hydration
```

## Example Workflow: Ongoing Hydration

```
Developer (2 weeks later): "I want to hydrate Internal Tools now"
↓
Cataloguer: "Hydrate Internal Tools to Git"
↓
Pulls 9 recipes for Internal Tools project
↓
Saves to recipes/internal-tools/
↓
Developer: "Commit and push"
↓
git add recipes/
git commit -m "Hydrate: Internal Tools"
git push
↓
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
