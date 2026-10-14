const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const dcs = require('./lib/data-centers');

const REPO = path.resolve(__dirname, '..');

function tempCopy() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dc-test-'));
  for (const rel of dcs.MCP_CONFIG_FILES) {
    const dest = path.join(dir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(REPO, rel), dest);
  }
  fs.writeFileSync(path.join(dir, '.env'), 'WORKATO_API_TOKEN=x\nWORKATO_API_ENDPOINT=https://app.workato.com\n');
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

for (const dc of Object.keys(dcs.DATA_CENTERS)) {
  test(`applyDataCenter(${dc}) rewrites every config and .env, and is idempotent`, () => {
    const root = tempCopy();
    const first = dcs.applyDataCenter(root, dc);
    const u = dcs.urlsFor(dc);
    assert.deepStrictEqual(first.missing, []);

    for (const rel of dcs.MCP_CONFIG_FILES) {
      const text = fs.readFileSync(path.join(root, rel), 'utf-8');
      const hits = text.match(/https:\/\/(?:app|www)(?:\.[a-z]+)?\.workato\.com\/(?:mcp|airo_mcp)\b/g) || [];
      assert.ok(hits.length > 0, `${rel} has MCP URLs`);
      for (const h of hits) {
        assert.ok([u.developerApiMcp, u.airoMcp].includes(h), `${rel}: unexpected ${h} for ${dc}`);
      }
      if (rel.endsWith('.json')) JSON.parse(text); // still valid JSON
    }

    const env = fs.readFileSync(path.join(root, '.env'), 'utf-8');
    assert.match(env, new RegExp(`^WORKATO_DATA_CENTER=${dc}$`, 'm'));
    assert.match(env, new RegExp(`^WORKATO_REGION=${dc}$`, 'm'));
    assert.match(env, new RegExp(`^WORKATO_API_ENDPOINT=${u.apiEndpoint}$`, 'm'));
    assert.match(env, /^WORKATO_API_TOKEN=x$/m); // token untouched
    assert.strictEqual(dcs.currentDataCenter(root), dc);

    assert.deepStrictEqual(dcs.applyDataCenter(root, dc).changed, []); // second run is a no-op
  });
}

test('switching data centres round-trips cleanly', () => {
  const root = tempCopy();
  dcs.applyDataCenter(root, 'eu');
  dcs.applyDataCenter(root, 'us');
  for (const rel of dcs.MCP_CONFIG_FILES) {
    const orig = fs.readFileSync(path.join(REPO, rel), 'utf-8');
    const now = fs.readFileSync(path.join(root, rel), 'utf-8');
    if (/app\.workato\.com\/(mcp|airo_mcp)/.test(orig)) assert.strictEqual(now, orig, `${rel} round-trips`);
  }
});
