#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Setup wk CLI profile using environment variables
 * Creates a new profile in wk CLI using WORKATO_API_TOKEN and WORKATO_PROFILE
 * 
 * Usage:
 *   npm run setup:wk-profile
 *   node scripts/setup-wk-profile.js
 */

function setupWkProfile() {
  const profileName = process.env.WORKATO_PROFILE || 'default';
  const apiToken = process.env.WORKATO_API_TOKEN;
  const endpoint = process.env.WORKATO_API_ENDPOINT || 'https://app.au.workato.com';

  if (!apiToken) {
    console.error('❌ Error: WORKATO_API_TOKEN not found in .env file');
    console.error('   Please configure .env with your Workato API token');
    process.exit(1);
  }

  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║        🔐 Setting up wk CLI Profile                           ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  console.log(`📋 Configuration:`);
  console.log(`   Profile Name: ${profileName}`);
  console.log(`   API Token: ${apiToken.substring(0, 10)}...`);
  console.log(`   Endpoint: ${endpoint}\n`);

  try {
    // Check if profile already exists
    console.log('🔍 Checking if profile already exists...');
    try {
      execSync(`wk auth list --profile ${profileName} --json`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      console.log(`✅ Profile "${profileName}" already exists\n`);
      return true;
    } catch (error) {
      // Profile doesn't exist, create it
      console.log(`   Profile not found, creating new one...\n`);
    }

    // Store the API token in wk CLI
    console.log('🔐 Storing API token in wk CLI...');
    execSync(
      `wk auth login --api-token ${apiToken} --name ${profileName} --endpoint ${endpoint}`,
      {
        stdio: 'inherit',
        timeout: 30000
      }
    );

    console.log('\n✅ Profile setup complete!\n');
    console.log('📋 Next Steps:\n');
    console.log(`1. Verify profile was created:`);
    console.log(`   $ wk auth list\n`);
    console.log(`2. Discover your projects:`);
    console.log(`   $ npm run discover:projects\n`);
    console.log(`3. Hydrate projects to Git:`);
    console.log(`   $ npm run hydrate:interactive\n`);

    return true;

  } catch (error) {
    console.error('\n❌ Error setting up wk CLI profile:');
    console.error(error.message);
    console.error('\n💡 Troubleshooting:\n');
    console.error('   1. Verify wk CLI is installed: which wk');
    console.error('   2. Check .env file has WORKATO_API_TOKEN');
    console.error('   3. Verify API token is valid (from Workato workspace settings)');
    process.exit(1);
  }
}

if (require.main === module) {
  setupWkProfile();
}

module.exports = { setupWkProfile };
