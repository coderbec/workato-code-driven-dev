const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { resolvePaths, PROJECTS_DIR_NAME } = require('./lib/paths');
const { bootstrap } = require('./bootstrap');
const dcs = require('./lib/data-centers');

const REPO = path.resolve(__dirname, '..');

/** A throwaway workspace root containing a fake repo folder with the real skills. */
function tempWorkspace() {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-test-'));
  const repo = path.join(ws, 'workato-code-driven-dev');
  fs.mkdirSync(path.join(repo, '.agents', 'skills', 'workato-setup'), { recursive: true });
  fs.writeFileSync(path.join(repo, '.agents', 'skills', 'workato-setup', 'SKILL.md'), '# skill');
  return { ws, repo, p: resolvePaths({ repoRoot: repo, env: {} }) };
}

test('workspace root defaults to the folder containing the repo, whatever the cwd', () => {
  const { ws, repo, p } = tempWorkspace();
  assert.strictEqual(p.workspaceRoot, ws);
  assert.strictEqual(p.projectsDir, path.join(ws, PROJECTS_DIR_NAME));
  assert.strictEqual(p.wkToml, path.join(ws, PROJECTS_DIR_NAME, '.wk', 'wk.toml'));
  const here = process.cwd();
  process.chdir(os.tmpdir());
  try {
    assert.strictEqual(resolvePaths({ repoRoot: repo, env: {} }).workspaceRoot, ws);
  } finally { process.chdir(here); }
});

test('WORKATO_WORKSPACE_ROOT overrides the default', () => {
  const { repo } = tempWorkspace();
  const other = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-other-'));
  const p = resolvePaths({ repoRoot: repo, env: { WORKATO_WORKSPACE_ROOT: other } });
  assert.strictEqual(p.workspaceRoot, other);
});

test('bootstrap builds the layout and is idempotent', () => {
  const { ws, repo, p } = tempWorkspace();
  const quiet = () => {};
  bootstrap({ ...p, repoRoot: repo, log: quiet });
  assert.ok(fs.statSync(p.projectsDir).isDirectory());
  assert.match(fs.readFileSync(path.join(ws, '.gitignore'), 'utf-8'), /^Workspace Projects\/$/m);
  assert.match(fs.readFileSync(path.join(ws, 'CLAUDE.md'), 'utf-8'), /workato-code-driven-dev\//);
  const link = path.join(ws, '.claude', 'skills');
  assert.ok(fs.lstatSync(link).isSymbolicLink());
  assert.ok(fs.existsSync(path.join(link, 'workato-setup', 'SKILL.md')), 'link resolves to the real skills');
  const before = fs.readFileSync(path.join(ws, '.gitignore'), 'utf-8');
  bootstrap({ ...p, repoRoot: repo, log: quiet });
  assert.strictEqual(fs.readFileSync(path.join(ws, '.gitignore'), 'utf-8'), before, 'second run changes nothing');
});

test('bootstrap never overwrites an existing CLAUDE.md, .gitignore lines or skills folder', () => {
  const { ws, repo, p } = tempWorkspace();
  fs.writeFileSync(path.join(ws, 'CLAUDE.md'), 'mine');
  fs.writeFileSync(path.join(ws, '.gitignore'), 'node_modules\n.env');
  fs.mkdirSync(path.join(ws, '.claude', 'skills', 'my-own'), { recursive: true });
  bootstrap({ ...p, repoRoot: repo, log: () => {} });
  assert.strictEqual(fs.readFileSync(path.join(ws, 'CLAUDE.md'), 'utf-8'), 'mine');
  const gi = fs.readFileSync(path.join(ws, '.gitignore'), 'utf-8');
  assert.match(gi, /node_modules/);
  assert.strictEqual((gi.match(/^\.env$/gm) || []).length, 1, 'existing .env line is not duplicated');
  assert.ok(fs.existsSync(path.join(ws, '.claude', 'skills', 'my-own')), 'own skill kept');
  assert.ok(fs.lstatSync(path.join(ws, '.claude', 'skills', 'workato-setup')).isSymbolicLink(), 'repo skill linked in');
});

test('renderMcpConfig writes to the workspace root and merges with an existing .mcp.json', () => {
  const { ws } = tempWorkspace();
  fs.writeFileSync(path.join(ws, '.mcp.json'), JSON.stringify({
    mcpServers: { 'my-other-server': { type: 'http', url: 'https://example.invalid/mcp' }, 'workato-airo': { type: 'http', url: 'https://stale.invalid' } },
  }));
  const r = dcs.renderMcpConfig(ws, 'au', { templateDir: REPO });
  assert.strictEqual(r.merged, true);
  const cfg = JSON.parse(fs.readFileSync(path.join(ws, '.mcp.json'), 'utf-8'));
  assert.ok(cfg.mcpServers['my-other-server'], 'foreign server kept');
  assert.strictEqual(cfg.mcpServers['workato-airo'].url, 'https://app.au.workato.com/airo_mcp', 'our server updated');
  assert.ok(cfg.mcpServers['workato-developer-api']);
});

test('renderMcpConfig refuses to overwrite an unreadable .mcp.json', () => {
  const { ws } = tempWorkspace();
  fs.writeFileSync(path.join(ws, '.mcp.json'), '{ not json');
  assert.throws(() => dcs.renderMcpConfig(ws, 'au', { templateDir: REPO }), /not valid JSON/);
  assert.strictEqual(fs.readFileSync(path.join(ws, '.mcp.json'), 'utf-8'), '{ not json');
});
