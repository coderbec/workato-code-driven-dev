#!/usr/bin/env node
/**
 * Run a wk command inside the Workspace Projects folder (the wk container), from anywhere.
 * Usage: node scripts/wk-run.js pull --folder "13. Genesys MCP"
 * The folder name contains a space, so the working directory is passed as an option, never in a shell string.
 */
const fs = require('fs');
const { spawnSync } = require('child_process');
const { resolvePaths } = require('./lib/paths');

const { projectsDir } = resolvePaths();
if (!fs.existsSync(projectsDir)) {
  console.error(`Workspace Projects folder not found: ${projectsDir}\nRun: node scripts/bootstrap.js`);
  process.exit(1);
}
const r = spawnSync('wk', process.argv.slice(2), { cwd: projectsDir, stdio: 'inherit', shell: process.platform === 'win32' });
if (r.error) {
  console.error(`Could not run wk: ${r.error.message}\nInstall it with the guided setup (say "start workato setup").`);
  process.exit(1);
}
process.exit(r.status === null ? 1 : r.status);
