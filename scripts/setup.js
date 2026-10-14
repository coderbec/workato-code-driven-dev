#!/usr/bin/env node

/**
 * Setup script for Workato Code-Driven Development project
 * Initializes project, checks dependencies, and configures MCP
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { configureDataCenter } = require('./configure-data-center');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}→${colors.reset} ${msg}`)
};

const checkDependency = (cmd, name) => {
  try {
    execSync(`${cmd} --version`, { stdio: 'pipe' });
    log.success(`${name} is installed`);
    return true;
  } catch {
    log.warning(`${name} not found. Install with: brew install ${name} (or your package manager)`);
    return false;
  }
};

const checkFile = (filePath, name) => {
  if (fs.existsSync(filePath)) {
    log.success(`${name} exists`);
    return true;
  } else {
    log.warning(`${name} not found at ${filePath}`);
    return false;
  }
};

const main = async () => {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}   Workato Code-Driven Development - Project Setup${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  log.step('Choosing your Workato data centre...');
  await configureDataCenter({ askToKeep: true });

  log.step('Checking system dependencies...\n');
  
  const deps = {
    'node --version': 'Node.js',
    'npm --version': 'npm',
    'git --version': 'Git',
    'terraform --version': 'Terraform',
    'az --version': 'Azure CLI'
  };

  let allGood = true;
  Object.entries(deps).forEach(([cmd, name]) => {
    if (!checkDependency(cmd, name)) {
      allGood = false;
    }
  });

  console.log();
  log.step('Checking configuration files...\n');

  const files = {
    '.env': '.env (secrets)',
    '.mcp.json': '.mcp.json (MCP configuration)',
    'claude_desktop_config.json': 'claude_desktop_config.json (Claude Desktop config)',
    'linter-config.json': 'linter-config.json (Recipe Linter config)'
  };

  Object.entries(files).forEach(([filePath, name]) => {
    checkFile(filePath, name);
  });

  console.log();
  log.step('Next steps:\n');

  console.log(`
1. ${colors.yellow}Set up environment variables:${colors.reset}
   cp .env.example .env   # (skip if .env already exists)
   # Add your WORKATO_API_TOKEN (must be a token from the data centre you just chose)
   # and Azure credentials. WORKATO_DATA_CENTER / WORKATO_API_ENDPOINT are already set.
   # Change data centre later with: npm run setup:data-center

2. ${colors.yellow}Install dependencies:${colors.reset}
   npm install

3. ${colors.yellow}Authenticate with Workato:${colors.reset}
   npm run wk:auth

4. ${colors.yellow}Initialize Terraform:${colors.reset}
   npm run terraform:init

5. ${colors.yellow}Deploy Azure infrastructure:${colors.reset}
   npm run terraform:plan
   npm run terraform:apply

6. ${colors.yellow}Pull existing recipes:${colors.reset}
   npm run wk:pull

7. ${colors.yellow}Start using the project:${colors.reset}
   - Open Claude Desktop and configure MCP
   - Or use wk CLI: wk status recipes/
  `);

  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  if (allGood) {
    log.success('All dependencies are installed! You\'re ready to go.');
  } else {
    log.warning('Some dependencies are missing. Please install them before continuing.');
  }

  console.log();
};

main().catch((err) => {
  log.error(err.message);
  process.exit(1);
});
