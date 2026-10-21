#!/usr/bin/env node
/**
 * Step 4: install every Workato Developer Labs component (https://workato-devs.github.io/labs/).
 * Each component is independent: a failure is recorded and the next one still runs.
 */
const fs = require('fs');
const path = require('path');
const { run, hasCommand } = require('../lib/wk');

const root = path.resolve(__dirname, '..', '..');
const win = process.platform === 'win32';
const mac = process.platform === 'darwin';
const RELEASES = 'https://github.com/workato-devs/';

const results = [];
function component(name, fn, manual) {
  console.log(`\n==> Installing ${name} ...`);
  try {
    const detail = fn();
    results.push({ component: name, status: 'installed', detail: detail || '' });
    console.log(`    done: ${name}`);
  } catch (e) {
    results.push({ component: name, status: 'FAILED', detail: `${e.message} | manual install: ${manual}` });
    console.log(`    could not install ${name}: ${e.message}`);
  }
}

function step(cmd, args) {
  console.log(`    $ ${cmd} ${args.join(' ')}`);
  const r = run(cmd, args);
  if (!r.ok) throw new Error(`${cmd} ${args[0]} failed${r.error ? ` (${r.error.message})` : ''}: ${(r.stderr || r.stdout).trim().split('\n').slice(-2).join(' ')}`);
  return r;
}

function packageManager() {
  if (win && hasCommand('scoop')) return 'scoop';
  if (mac && hasCommand('brew')) return 'brew';
  if (!win && !mac && hasCommand('brew')) return 'brew';
  throw new Error(win ? 'Scoop is not installed (https://scoop.sh)' : 'Homebrew is not installed (https://brew.sh)');
}

component('wk CLI', () => {
  if (hasCommand('wk')) return 'already installed';
  if (packageManager() === 'scoop') {
    step('scoop', ['bucket', 'add', 'workato-devs', 'https://github.com/workato-devs/scoop-bucket']);
    step('scoop', ['install', 'wk']);
  } else {
    step('brew', ['install', 'workato-devs/tap/wk']);
  }
  step('wk', ['version']);
}, `${RELEASES}wk/releases`);

component('Recipe Linter (recipe-lint)', () => {
  if (!hasCommand('wk')) throw new Error('requires the wk CLI, which is not available');
  if (!hasCommand('recipe-lint')) {
    if (packageManager() === 'scoop') step('scoop', ['install', 'recipe-lint']);
    else step('brew', ['install', 'workato-devs/tap/recipe-lint']);
  }
  step('wk', ['plugins', 'install', 'recipe-lint']);
}, `${RELEASES}recipe-lint/releases then "wk plugins install recipe-lint"`);

component('Workato Developer Skills (recipe-skills)', () => {
  if (!hasCommand('git')) throw new Error('git is not installed');
  const dest = path.join(root, '.workato-labs', 'recipe-skills');
  if (fs.existsSync(dest)) { step('git', ['-C', dest, 'pull', '--ff-only']); return `updated ${path.relative(root, dest)}`; }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  step('git', ['clone', 'https://github.com/workato-devs/recipe-skills.git', dest]);
  return `cloned to ${path.relative(root, dest)}`;
}, 'git clone https://github.com/workato-devs/recipe-skills.git');

component('Recipe Visualizer (editor extension)', () => {
  const editors = ['code', 'cursor', 'windsurf'].filter(hasCommand);
  if (!editors.length) throw new Error('no editor CLI found (code / cursor / windsurf); in VS Code run "Shell Command: Install \'code\' command in PATH"');
  const done = [];
  for (const ed of editors) { step(ed, ['--install-extension', 'WorkatoLabs.recipe-visualizer']); done.push(ed); }
  return `installed via ${done.join(', ')}`;
}, 'search "Recipe Visualizer" in the Extensions panel');

console.log('\n==== Developer Labs install summary ====');
console.table(results.map(({ component: c, status, detail }) => ({ component: c, status, detail })));
const failed = results.filter((r) => r.status === 'FAILED');
if (failed.length) console.log(`${failed.length} component(s) could not be installed; the rest are fine. Manual steps are in the table above.`);
process.exit(0); // never abort the guided setup because one optional component failed
