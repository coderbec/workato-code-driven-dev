const test = require('node:test');
const assert = require('node:assert');
const { widgetHost } = require('./widget-host.js');

test('widget host is the first 32 hex chars of sha256 of the bare host', () => {
  const a = widgetHost('https://example.apim.mcp.au.workato.com/mcp');
  const b = widgetHost('example.apim.mcp.au.workato.com');
  assert.strictEqual(a.hash.length, 32);
  assert.strictEqual(a.hash, b.hash);
  assert.strictEqual(a.widgetHost, `https://${a.hash}.widget-renderer.usercontent.microsoft`);
});

test('host case and path are ignored', () => {
  assert.strictEqual(widgetHost('HTTPS://Example.COM/x/y').hash, widgetHost('example.com').hash);
});

test('empty input throws', () => {
  assert.throws(() => widgetHost(''));
});
