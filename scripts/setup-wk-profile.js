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
  // CRITICAL: First check if token exists in shell environment directly
  // This is for customers who have their token in .zshrc or similar
  let apiToken = process.env.WORKATO_DEV_ANZ_PRESALES || 
                 process.env.WORKATO_API_TOKEN ||
                 process.env.WORKATO_TOKEN;

  const endpoint = process.env.WORKATO_API_ENDPOINT || 'https://app.au.workato.com';
  
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║        🔐 Setting up NEW wk CLI Profile from .env Token      ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  // Check if API token is missing or a placeholder
  const isInvalid = !apiToken || 
    apiToken === 'WORKATO_DEV_ANZ_PRESALES' || 
    apiToken.startsWith('${') ||
    apiToken.toLowerCase().includes('placeholder') ||
    apiToken.toLowerCase().includes('your_');

  if (isInvalid) {
    console.error('❌ Error: WORKATO_API_TOKEN in .env is not configured\n');
    console.error('📋 Setup Instructions:\n');
    console.error('1. Get your API token from Workato:');
    console.error('   • Go to Workspace Admin → Settings → API Clients');
    console.error('   • Create a new API client or copy existing token\n');
    console.error('2. Update your .env file:');
    console.error('   WORKATO_API_TOKEN=<your_actual_token_here>\n');
    console.error('3. Re-run setup:');
    console.error('   npm run setup:wk-profile\n');
    rl.close();
    process.exit(1);
  }

  // CRITICAL: Use a profile name that is UNIQUE and NOT a default
  // This ensures we create a NEW profile, not use an existing one
  let profileName = 'workato-project-' + Date.now();
  
  console.log('📋 Configuration:\n');
  console.log(`  API Token: ${apiToken.substring(0, 15)}...${apiToken.substring(apiToken.length - 5)}`);
  console.log(`  Endpoint: ${endpoint}`);
  console.log(`  New Profile Name: ${profileName}\n`);
  
  const customProfile = await prompt('Enter custom profile name (press Enter to use generated name): ');
  if (customProfile.trim()) {
    profileName = customProfile.trim();
  }
  
  console.log(`\n📝 Creating new profile: ${profileName}\n`);

  console.log(`📋 Configuration:`);
  console.log(`   Profile Name: ${profileName}`);
  console.log(`   API Token: ${apiToken.substring(0, 10)}...${apiToken.substring(apiToken.length - 5)}`);
  console.log(`   Endpoint: ${endpoint}\n`);

  try {
    // CRITICAL: ALWAYS create a NEW profile with the token from .env
    // Do NOT check if profile exists or reuse default profiles
    console.log('🔐 Creating NEW wk CLI profile with your API token...\n');
    
    // wk auth login requires: --token, --environment, --region, optionally --name
    const environment = 'dev';
    const region = 'au';
    
    execSync(
      `wk auth login --token "${apiToken}" --environment ${environment} --region ${region} --name "${profileName}" --force --no-input`,
      {
        stdio: 'inherit',
        timeout: 30000
      }
    );

    console.log('\n✅ New profile created!\n');

    // Verify setup by checking auth status
    console.log('✨ Verifying profile setup...\n');
    const authStatus = execSync(`wk auth status --profile ${profileName}`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    console.log(authStatus);

    // CRITICAL: Update .env with the NEW profile name
    // This ensures all subsequent commands use the NEW profile, not defaults
    console.log('💾 Updating .env with new profile name...\n');
    let envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf-8');
    envContent = envContent.replace(/WORKATO_PROFILE=.*/g, `WORKATO_PROFILE=${profileName}`);
    fs.writeFileSync(path.join(process.cwd(), '.env'), envContent);
    console.log(`✅ .env updated: WORKATO_PROFILE=${profileName}\n`);

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
