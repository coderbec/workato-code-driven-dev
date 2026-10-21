const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const dcs = require('./lib/data-centers');

const REPO = path.resolve(__dirname, '..');

function tempRoot() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dc-test-'));
  fs.copyFileSync(path.join(REPO, dcs.MCP_TEMPLATE), path.join(dir, dcs.MCP_TEMPLATE));
  return dir;
}

test('url table matches the documented hosts', () => {
  assert.deepStrictEqual(dcs.urlsFor('us'), {
    dc: 'us', region: 'us', apiEndpoint: 'https://www.workato.com',
    developerApiMcp: 'https://app.workato.com/mcp', airoMcp: 'https://app.workato.com/airo_mcp',
  });
  assert.strictEqual(dcs.urlsFor('AU').airoMcp, 'https://app.au.workato.com/airo_mcp');
  assert.strictEqual(dcs.urlsFor('eu').apiEndpoint, 'https://app.eu.workato.com');
  assert.strictEqual(dcs.urlsFor('trial').developerApiMcp, 'https://app.trial.workato.com/mcp');
});

test('cn and unknown codes are rejected', () => {
  assert.throws(() => dcs.urlsFor('cn'), /not supported/);
  assert.throws(() => dcs.urlsFor('mars'), /Unknown data centre/);
  assert.throws(() => dcs.urlsFor(''), /Unknown data centre/);
});

test('detectFromUrl', () => {
  assert.strictEqual(dcs.detectFromUrl('https://www.workato.com'), 'us');
  assert.strictEqual(dcs.detectFromUrl('https://app.workato.com/api'), 'us');
  assert.strictEqual(dcs.detectFromUrl('https://app.jp.workato.com'), 'jp');
  assert.strictEqual(dcs.detectFromUrl('https://example.com'), null);
  assert.strictEqual(dcs.detectFromUrl('not a url'), null);
});

test('wkRegionArgs uses --region where wk supports it and --base-url otherwise', () => {
  assert.deepStrictEqual(dcs.wkRegionArgs('eu'), ['--region', 'eu']);
  assert.deepStrictEqual(dcs.wkRegionArgs('uk'), ['--base-url', 'https://app.uk.workato.com']);
  assert.deepStrictEqual(dcs.wkRegionArgs('kr'), ['--base-url', 'https://app.kr.workato.com']);
});

test('template references the profile variable and never a literal token', () => {
  const text = fs.readFileSync(path.join(REPO, dcs.MCP_TEMPLATE), 'utf-8');
  assert.match(text, /Bearer \$\{WORKATO_CODE_DEV\}/);
  assert.doesNotMatch(text, /headersHelper|oauth/i);
});

for (const dc of Object.keys(dcs.DATA_CENTERS)) {
  test(`renderMcpConfig(${dc}) writes valid .mcp.json with the right URLs and header auth`, () => {
    const root = tempRoot();
    const { urls } = dcs.renderMcpConfig(root, dc);
    const cfg = JSON.parse(fs.readFileSync(path.join(root, dcs.MCP_OUTPUT), 'utf-8'));
    assert.strictEqual(cfg.mcpServers['workato-developer-api'].url, urls.developerApiMcp);
    assert.strictEqual(cfg.mcpServers['workato-airo'].url, urls.airoMcp);
    for (const server of Object.values(cfg.mcpServers)) {
      assert.strictEqual(server.headers.Authorization, 'Bearer ${WORKATO_CODE_DEV}');
    }
    assert.ok(!fs.existsSync(path.join(root, '.env')), 'no .env is ever created');
  });
}

test('re-rendering for another data centre replaces the URLs', () => {
  const root = tempRoot();
  dcs.renderMcpConfig(root, 'eu');
  dcs.renderMcpConfig(root, 'us');
  const cfg = JSON.parse(fs.readFileSync(path.join(root, dcs.MCP_OUTPUT), 'utf-8'));
  assert.strictEqual(cfg.mcpServers['workato-airo'].url, 'https://app.workato.com/airo_mcp');
});
