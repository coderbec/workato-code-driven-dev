#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

/**
 * Setup wk CLI profile using environment variables or interactive prompt
 * Creates a new profile in wk CLI using WORKATO_API_TOKEN and WORKATO_PROFILE
 * 
 * Usage:
 *   npm run setup:wk-profile
 *   node scripts/setup-wk-profile.js
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function setupWkProfile() {
  let profileName = process.env.WORKATO_PROFILE || 'workato-dev';
  let apiToken = process.env.WORKATO_API_TOKEN;
  const endpoint = process.env.WORKATO_API_ENDPOINT || 'https://app.au.workato.com';

  // Check if API token is a placeholder or empty
  const isPlaceholder = !apiToken || 
    apiToken === 'WORKATO_DEV_ANZ_PRESALES' || 
    apiToken.startsWith('${') ||
    apiToken.toLowerCase().includes('placeholder') ||
    apiToken.toLowerCase().includes('your_');

  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║        🔐 Setting up wk CLI Profile                           ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  if (isPlaceholder) {
    console.log('📋 No valid API token found in .env file\n');
    console.log('Getting your API token...\n');
    
    // Ask for profile name
    profileName = await prompt('Profile name (default: workato-dev): ');
    if (!profileName.trim()) {
      profileName = 'workato-dev';
    }
    
    // Ask for API token
    apiToken = await prompt('Workato API Token (get from Workspace > Admin > API clients): ');
    
    if (!apiToken.trim()) {
      console.error('\n❌ Error: API token is required');
      rl.close();
      process.exit(1);
    }
  }

  console.log(`📋 Configuration:`);
  console.log(`   Profile Name: ${profileName}`);
  console.log(`   API Token: ${apiToken.substring(0, 10)}...${apiToken.substring(apiToken.length - 5)}`);
  console.log(`   Endpoint: ${endpoint}\n`);

  try {
    // Check if profile already exists
    console.log('🔍 Checking if profile already exists...');
    let profileExists = false;
    try {
      execSync(`wk auth list --profile ${profileName} --json`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      profileExists = true;
      console.log(`✅ Profile "${profileName}" already exists`);
      console.log('   Skipping creation (already configured)\n');
    } catch (error) {
      // Profile doesn't exist, create it
      console.log(`   Profile not found, creating new one...\n`);
    }

    if (!profileExists) {
      // Store the API token in wk CLI
      console.log('🔐 Storing API token in wk CLI...\n');
      execSync(
        `wk auth login --api-token ${apiToken} --name ${profileName} --endpoint ${endpoint}`,
        {
          stdio: 'inherit',
          timeout: 30000
        }
      );

      console.log('\n✅ New profile created!\n');
    }

    // Verify setup by checking auth status
    console.log('✨ Verifying profile setup...\n');
    const authStatus = execSync(`wk auth status --profile ${profileName}`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    console.log(authStatus);

    // Update .env if token was provided interactively
    if (isPlaceholder && apiToken) {
      console.log('\n💾 Updating .env file with your configuration...\n');
      let envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf-8');
      envContent = envContent.replace(/WORKATO_PROFILE=.*/, `WORKATO_PROFILE=${profileName}`);
      envContent = envContent.replace(/WORKATO_API_TOKEN=.*/, `WORKATO_API_TOKEN=${apiToken}`);
      fs.writeFileSync(path.join(process.cwd(), '.env'), envContent);
      console.log('✅ .env updated with new profile name and token\n');
    }

    console.log('✅ Profile setup complete!\n');
    console.log('📋 Next Steps:\n');
    console.log(`1. Discover your projects:`);
    console.log(`   $ npm run discover:projects\n`);
    console.log(`2. Hydrate projects to Git (interactive):`);
    console.log(`   $ npm run hydrate:interactive\n`);
    console.log(`3. Or hydrate specific projects:`);
    console.log(`   $ npm run hydrate:projects -- "Project Name 1" "Project Name 2"\n`);
    console.log(`4. Commit to Git:`);
    console.log(`   $ git add recipes/`);
    console.log(`   $ git commit -m "Initial hydration of recipes"`);
    console.log(`   $ git push\n`);

    rl.close();
    return true;

  } catch (error) {
    console.error('\n❌ Error setting up wk CLI profile:');
    console.error(error.message);
    console.error('\n💡 Troubleshooting:\n');
    console.error('   1. Verify wk CLI is installed: which wk');
    console.error('   2. Make sure your API token is valid');
    console.error('   3. Try manually: wk auth login --api-token <YOUR_TOKEN>\n');
    rl.close();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setupWkProfile();
}

module.exports = { setupWkProfile };
