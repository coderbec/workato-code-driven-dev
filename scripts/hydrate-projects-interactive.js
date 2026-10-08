#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

/**
 * Interactive project hydration
 * Guides user through selecting which projects to download
 * 
 * Usage:
 *   npm run hydrate:interactive
 *   node scripts/hydrate-projects-interactive.js
 */

// Simple inquirer alternative using readline (no npm dependencies required)
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function selectProjects(projects) {
  console.log('\n📁 Available Projects:\n');
  
  projects.forEach((project, index) => {
    const recipeInfo = project.recipes === '—' ? 
      '? recipes' : 
      `${project.recipes} recipes`;
    const statusIcon = project.status === 'Active' ? '🟢' : '⚪';
    
    console.log(`   ${index + 1}. ${project.name}`);
    console.log(`      ${statusIcon} ${project.status} | ${recipeInfo} | Last modified: ${project.lastModified}`);
  });

  console.log('\n');
  const input = await prompt('Enter project numbers to hydrate (comma-separated, e.g., "1,3,5"): ');
  
  const selected = input.split(',')
    .map(s => s.trim())
    .map(s => parseInt(s) - 1)
    .filter(i => i >= 0 && i < projects.length);

  if (selected.length === 0) {
    console.log('\n⚠️  No valid projects selected');
    return [];
  }

  return selected.map(i => projects[i].name);
}

async function confirmSelection(selectedProjects) {
  console.log('\n📋 You selected:\n');
  selectedProjects.forEach((name, i) => {
    console.log(`   ${i + 1}. ${name}`);
  });
  
  const answer = await prompt('\nProceed with hydration? (yes/no): ');
  return answer.toLowerCase().startsWith('y');
}

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
  console.log('\n🔄 Starting hydration...\n');
  
  let allProjects = [];
  try {
    allProjects = getProjectsList();
  } catch (error) {
    return [];
  }

  const results = [];

  for (const projectName of projectNames) {
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
      console.log(`📥 Hydrating: ${project.name}...`);

      const projectDir = path.join('recipes', project.name.toLowerCase().replace(/\s+/g, '-'));
      
      if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
      }

      try {
        const profile = process.env.WORKATO_PROFILE || 'default';
        // wk pull uses the sync entry server_path (project name)
        execSync(
          `wk pull --folder "${project.name}" --force --profile ${profile}`,
          {
            cwd: path.join(process.cwd(), 'recipes'),
            stdio: 'inherit',
            timeout: 120000
          }
        );
      } catch (error) {
        if (error.status && error.status !== 0) {
          throw new Error(`wk pull failed with status ${error.status}`);
        }
      }

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
        // Ignore
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

  return results;
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║        🚀 Interactive Project Hydration                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');

  try {
    // Discover projects
    console.log('\n🔍 Discovering projects...\n');
    
    let projects = [];
    try {
      const projectsJSON = execSync('wk folders list --projects --json', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      projects = JSON.parse(projectsJSON);
    } catch (error) {
      console.error('\n❌ Failed to discover projects. Make sure:');
      console.error('   1. wk CLI is installed: which wk');
      console.error('   2. You are authenticated: wk auth status');
      console.error('   3. .env file has WORKATO_API_TOKEN\n');
      rl.close();
      process.exit(1);
    }

    if (!projects || projects.length === 0) {
      console.log('\n⚠️  No projects found in your workspace.\n');
      rl.close();
      process.exit(0);
    }

    // Enrich with recipe counts
    console.log('📊 Gathering project metadata...\n');
    
    const enrichedProjects = projects.map((project, index) => {
      process.stdout.write(`   [${index + 1}/${projects.length}] ${project.name}...`);
      
      let recipeCount = 0;
      let lastModified = 'Unknown';
      let status = 'Unknown';
      
      try {
        const recipesJSON = execSync(
          `wk recipes list --folder ${project.id} --json --per-page 1000`,
          {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
            timeout: 10000
          }
        );
        
        const recipesData = JSON.parse(recipesJSON);
        // wk CLI returns {items: [...]} structure
        const recipes = Array.isArray(recipesData) ? recipesData : (recipesData.items || []);
        recipeCount = recipes.length || 0;
        
        const runningRecipes = recipes.filter(r => r.active === true || r.running === true || r.status === 'active' || r.status === 'running');
        status = runningRecipes.length > 0 ? 'Active' : 'Inactive';
        
        if (recipes.length > 0) {
          const sortedByDate = recipes.sort((a, b) => {
            const dateA = new Date(a.updated_at || a.created_at || 0);
            const dateB = new Date(b.updated_at || b.created_at || 0);
            return dateB - dateA;
          });
          
          if (sortedByDate[0].updated_at || sortedByDate[0].created_at) {
            const date = new Date(sortedByDate[0].updated_at || sortedByDate[0].created_at);
            const now = new Date();
            const diffMs = now - date;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor(diffMs / (1000 * 60));
            
            if (diffMins < 60) {
              lastModified = `${diffMins}m ago`;
            } else if (diffHours < 24) {
              lastModified = `${diffHours}h ago`;
            } else if (diffDays < 7) {
              lastModified = `${diffDays}d ago`;
            } else {
              lastModified = date.toLocaleDateString();
            }
          }
        }
      } catch (error) {
        recipeCount = '?';
        status = '⚠️ Error';
      }
      
      console.log(` ${recipeCount > 0 ? '✓' : ' '}`);
      
      return {
        name: project.name,
        id: project.id,
        recipes: recipeCount,
        lastModified,
        status
      };
    });

    // Let user select
    const selectedNames = await selectProjects(enrichedProjects);

    if (selectedNames.length === 0) {
      console.log('\n⚠️  No projects selected. Exiting.\n');
      rl.close();
      process.exit(0);
    }

    const confirmed = await confirmSelection(selectedNames);

    if (!confirmed) {
      console.log('\n⚠️  Hydration cancelled.\n');
      rl.close();
      process.exit(0);
    }

    // Ensure recipes directory is initialized for wk
    const recipesDir = path.join(process.cwd(), 'recipes');
    if (!fs.existsSync(recipesDir)) {
      fs.mkdirSync(recipesDir, { recursive: true });
    }

    const wkTomlPath = path.join(recipesDir, '.wk', 'wk.toml');
    if (!fs.existsSync(wkTomlPath)) {
      try {
        console.log('\n📋 Initializing wk project in recipes directory...\n');
        const profile = process.env.WK_PROFILE || 'default';
        execSync(
          `wk init --name workato --projects-dir . --profile ${profile} --no-input`,
          {
            cwd: recipesDir,
            stdio: 'inherit'
          }
        );
      } catch (error) {
        console.warn('⚠️  Warning: Could not initialize wk project, proceeding anyway...\n');
      }
    }

    // Perform hydration
    const results = hydrateProjects(selectedNames);

    // Display summary
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║             📊 Hydration Summary                              ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    console.table(results);

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

    rl.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { hydrateProjects };
