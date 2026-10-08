#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

/**
 * Selectively hydrate (download) recipes from specific projects
 * 
 * Usage:
 *   npm run hydrate:projects -- "Project 1" "Project 2"
 *   node scripts/hydrate-projects.js "Project 1" "Project 2"
 */

function getProjectsList() {
  try {
    const projectsJSON = execSync('wk folders list --projects --json', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return JSON.parse(projectsJSON);
  } catch (error) {
    console.error('❌ Failed to list projects');
    throw error;
  }
}

function hydrateProjects(projectNames) {
  if (!projectNames || projectNames.length === 0) {
    console.error('❌ No projects specified');
    console.error('Usage: npm run hydrate:projects -- "Project 1" "Project 2"');
    process.exit(1);
  }

  console.log('\n🔄 Hydrating projects...\n');

  // Ensure recipes directory exists and is initialized for wk
  const recipesDir = path.join(process.cwd(), 'recipes');
  if (!fs.existsSync(recipesDir)) {
    fs.mkdirSync(recipesDir, { recursive: true });
  }

  // Setup wk.toml with proper structure
  const wkDir = path.join(recipesDir, '.wk');
  const wkTomlPath = path.join(wkDir, 'wk.toml');
  
  if (!fs.existsSync(wkTomlPath)) {
    try {
      if (!fs.existsSync(wkDir)) {
        fs.mkdirSync(wkDir, { recursive: true });
      }
      
      // Create wk.toml with proper structure
      const profile = process.env.WORKATO_PROFILE || 'default';
      
      // Get workspace info from wk auth
      let workspaceInfo = '';
      try {
        const authInfo = execSync(`wk auth status --profile ${profile} --json`, {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        const parsed = JSON.parse(authInfo);
        if (parsed.workspace && parsed.workspace_id) {
          workspaceInfo = `workspace = '${parsed.workspace}'\nworkspace_id = ${parsed.workspace_id}\n`;
        }
      } catch (e) {
        // Ignore if we can't get workspace info
      }
      
      // Build sync entries for each project being hydrated
      let syncEntries = '';
      for (const projectName of projectNames) {
        const projectDirName = projectName.toLowerCase().replace(/\s+/g, '-');
        syncEntries += `\n[[sync]]\nserver_path = '${projectName}'\nlocal_path = '${projectDirName}'\n`;
      }
      
      const wkTomlContent = `name = 'workato-recipes'
profile = '${profile}'
${workspaceInfo}${syncEntries}`;
      
      fs.writeFileSync(wkTomlPath, wkTomlContent);
      
      // Create .gitignore
      fs.writeFileSync(
        path.join(wkDir, '.gitignore'),
        '# wk CLI state\n*\n'
      );
    } catch (error) {
      // Ignore errors creating wk.toml - wk pull might still work
      console.warn('⚠️  Warning: Could not create wk.toml, attempting to proceed...\n');
    }
  }

  // Get all available projects
  let allProjects = [];
  try {
    allProjects = getProjectsList();
  } catch (error) {
    console.error('❌ Error retrieving project list');
    process.exit(1);
  }

  const results = [];

  for (const projectName of projectNames) {
    // Find the project by name (case-insensitive)
    const project = allProjects.find(p => 
      p.name.toLowerCase() === projectName.toLowerCase()
    );

    if (!project) {
      results.push({
        project: projectName,
        recipes: '—',
        status: '❌ Not found'
      });
      continue;
    }

    try {
      console.log(`📥 Hydrating: ${project.name}`);

      // Create project directory structure
      const projectDirName = project.name.toLowerCase().replace(/\s+/g, '-');
      const projectDir = path.join('recipes', projectDirName);
      
      if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
      }

      // Pull recipes for this folder using wk pull
      try {
        const profile = process.env.WORKATO_PROFILE || 'default';
        // wk pull uses the sync entry server_path (project name)
        execSync(
          `wk pull --folder "${project.name}" --force --profile ${profile}`,
          {
            cwd: recipesDir,
            stdio: 'inherit',
            timeout: 120000 // 2 minute timeout per project
          }
        );
      } catch (error) {
        // wk pull might output to stderr even on success, so we check if it actually failed
        if (error.status && error.status !== 0) {
          throw new Error(`wk pull failed with status ${error.status}`);
        }
      }

      // Get recipe count to confirm
      let recipeCount = 0;
      try {
        const recipesJSON = execSync(
          `wk recipes list --folder ${project.id} --json --per-page 1000`,
          {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
          }
        );
        const recipesData = JSON.parse(recipesJSON);
        // wk CLI returns {items: [...]} structure
        const recipes = Array.isArray(recipesData) ? recipesData : (recipesData.items || []);
        recipeCount = recipes.length || 0;
      } catch (e) {
        // Ignore errors getting count
      }

      results.push({
        project: project.name,
        recipes: recipeCount,
        status: '✅ Success'
      });

      console.log(`   └─ ${recipeCount} recipes hydrated\n`);

    } catch (error) {
      results.push({
        project: project.name,
        recipes: '—',
        status: `❌ ${error.message}`
      });
      console.error(`   ❌ ${error.message}\n`);
    }
  }

  // Display summary
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║             📊 Hydration Summary                              ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  console.table(results);

  // Show what to do next
  const successCount = results.filter(r => r.status.includes('✅')).length;
  const failureCount = results.filter(r => r.status.includes('❌')).length;

  console.log('\n📋 Summary:\n');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}\n`);

  if (successCount > 0) {
    console.log('✨ Next Steps:\n');
    console.log('1. Review the downloaded recipes in ./recipes/\n');
    console.log('2. Commit your changes:\n');
    console.log('   $ git add recipes/\n');
    console.log('   $ git commit -m "chore: hydrate projects"\n');
    console.log('3. Start developing with:\n');
    console.log('   $ npm run dev\n');
  }

  return results;
}

// Parse command line arguments
const projectNames = process.argv.slice(2);

if (require.main === module) {
  hydrateProjects(projectNames);
}

module.exports = { hydrateProjects };
