#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Discover all projects/folders in your Workato workspace
 * Shows recipe counts, last modified dates, and activity status
 * 
 * Usage:
 *   npm run discover:projects
 *   node scripts/discover-projects.js
 */

async function discoverProjects() {
  try {
    console.log('\n🔍 Discovering projects in your Workato workspace...\n');

    // Step 1: Get all projects
    let projects = [];
    try {
      const projectsJSON = execSync('wk folders list --projects --json', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      projects = JSON.parse(projectsJSON);
    } catch (error) {
      console.error('❌ Failed to list projects. Make sure:');
      console.error('   1. wk CLI is installed: which wk');
      console.error('   2. You are authenticated: wk auth status');
      console.error('   3. .env file has WORKATO_API_TOKEN');
      process.exit(1);
    }

    if (!projects || projects.length === 0) {
      console.log('ℹ️  No projects found in your workspace.');
      console.log('📝 Create projects in Workato first, then run this script again.\n');
      return [];
    }

    // Step 2: For each project, get recipe count and metadata
    console.log('📊 Gathering project metadata...\n');
    
    const projectsWithRecipes = projects.map((project, index) => {
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
        
        // Determine status (if any recipe is active or running)
        const runningRecipes = recipes.filter(r => r.active === true || r.running === true || r.status === 'active' || r.status === 'running');
        status = runningRecipes.length > 0 ? 'Active' : 'Inactive';
        
        // Get last modified (most recent recipe)
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
        // Silent fail - project might be empty or inaccessible
        recipeCount = '—';
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

    // Step 3: Display results
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║             📁 Projects in Your Workspace                     ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    // Display as table
    console.table(projectsWithRecipes.map(p => ({
      'Project': p.name,
      'Recipes': p.recipes,
      'Last Modified': p.lastModified,
      'Status': p.status
    })));

    // Step 4: Show next steps
    console.log('📋 Next Steps:\n');
    console.log('1. Review the projects listed above');
    console.log('2. Choose which projects to hydrate (download recipes)');
    console.log('3. Run interactive hydration:\n');
    console.log('   $ npm run hydrate:interactive\n');
    console.log('   OR hydrate specific projects:\n');
    console.log('   $ npm run hydrate:projects -- "Project Name 1" "Project Name 2"\n');
    
    // Save metadata to JSON for programmatic use
    const metadataPath = path.join('.workato', 'project-metadata.json');
    const metadataDir = path.dirname(metadataPath);
    
    if (!fs.existsSync(metadataDir)) {
      fs.mkdirSync(metadataDir, { recursive: true });
    }
    
    fs.writeFileSync(
      metadataPath,
      JSON.stringify({
        discoveredAt: new Date().toISOString(),
        totalProjects: projectsWithRecipes.length,
        projects: projectsWithRecipes
      }, null, 2)
    );
    
    console.log(`✅ Project metadata saved to: ${metadataPath}\n`);

    return projectsWithRecipes;

  } catch (error) {
    console.error('\n❌ Error discovering projects:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  discoverProjects();
}

module.exports = { discoverProjects };
