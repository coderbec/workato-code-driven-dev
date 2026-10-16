#!/usr/bin/env node

/**
 * Setup script for Workato Code-Driven Development project
 * Initializes project, checks dependencies, and configures MCP
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
    execSync(`${cmd}`, { stdio: 'pipe' });
    log.success(`${name} is installed`);
    return true;
} catch (err) {
    const isTap = name.endsWith('/tap');
    const hint = isTap
      ? `brew tap ${name} && brew trust ${name}`
      : `brew install ${name} (or your package manager)`;

    const code = err.status ?? err.errno ?? err.code ?? 'unknown';
    const stderr = err.stderr?.toString().trim();
    const detail = stderr || err.message;

    // log.warning(`Error ${code}: ${detail}).`);
    log.warning(`${name} not found. Install with: ${hint}`);
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

const main = () => {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}   Workato Code-Driven Development - Project Setup${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  log.step('Checking system dependencies...\n');
  
  const deps = {
    'node --version': 'Node.js',
    'npm --version': 'npm',
    'git --version': 'git',
    'brew tap|grep hashicorp || { echo "Error: hashicorp tap is not installed."; exit 1; }': 'hashicorp/tap',
    'terraform --version': 'terraform',
    'az --version': 'azure-cli'
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
    'mcp.json': 'mcp.json (MCP configuration)',
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
   cp .env.example .env
   # Edit .env with your actual Workato API token and Azure credentials

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

main();
