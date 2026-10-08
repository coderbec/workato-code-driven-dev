# Workato Project Cataloguer Skill

**Purpose**: Discover, catalogue, and export all recipes and projects from your Workato workspace.

**When to use**: 
- First-time setup to understand what recipes you have
- Migration planning
- Inventory management
- Compliance/audit reporting

## Available Operations

### List All Projects
```
Cataloguer: "Show me all projects and folders in my workspace"
```

Returns:
- Project names and IDs
- Folder structure
- Number of recipes per project

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

### Identify Inactive Recipes
```
Cataloguer: "Which recipes haven't run in the last 30 days?"
```

### Filter by Project
```
Cataloguer: "List all recipes in the 'Data Sync' project"
```

## Integration with Other Skills

### With Workato CLI Orchestrator
After cataloguing, pull recipes to Git:
```
1. Cataloguer: "List all recipes"
2. CLI Orchestrator: "Pull all these recipes to Git"
3. Git: commit and push
```

### With Monitoring/Alerts
After cataloguing, set up monitoring:
```
Cataloguer: "Export inventory"
→ Store as baseline
→ Run daily comparison
→ Alert on new/deleted recipes
```

## Technical Details

**Calls API**: `GET /api/recipes`, `GET /api/projects`

**Requires**: WORKATO_API_TOKEN with read access

**Output formats**:
- Console (human-readable)
- JSON (programmatic)
- CSV (spreadsheet)
- Markdown (documentation)

## Example Workflow

```
Developer: "Catalogue my workspace"
↓
Cataloguer discovers 42 recipes across 8 projects
↓
"Export to JSON for documentation"
↓
JSON file generated with full inventory
↓
"Which recipes are inactive?"
↓
4 recipes identified (not run in 90 days)
↓
"Should we archive these?"
↓
Decision: archive 2, keep 2
↓
Next: Manual cleanup or API deletion
```

## Limitations

- ⚠️ Read-only operation (doesn't modify recipes)
- ⚠️ Returns only recipe names/IDs (not full recipe code)
- ⚠️ Doesn't include job history (use Developer API separately)
- ⚠️ Rate limited by Workato API

## Next Steps

After cataloguing:
1. **Backup**: Pull recipes to Git using CLI Orchestrator
2. **Analyze**: Identify patterns, dependencies, unused recipes
3. **Organize**: Archive unused, tag active recipes
4. **Monitor**: Set up continuous inventory tracking
