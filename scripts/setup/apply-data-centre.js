#!/usr/bin/env node
/**
 * Step 3: render .mcp.template.json -> .mcp.json for a data centre, then probe both URLs.
 * Usage: node scripts/setup/apply-data-centre.js --dc eu
 */
const path = require('path');
const { renderMcpConfig, DATA_CENTERS } = require('../lib/data-centers');

const root = path.resolve(__dirname, '..', '..');
const i = process.argv.indexOf('--dc');
const dc = i > -1 ? process.argv[i + 1] : null;
if (!dc) {
  console.error(`Usage: node scripts/setup/apply-data-centre.js --dc <${Object.keys(DATA_CENTERS).join('|')}>`);
  process.exit(2);
}

async function probe(label, url) {
  // No credentials sent: a healthy MCP endpoint answers 401. Anything else means the URL is suspect.
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'setup-probe', version: '1.0.0' } } }),
      signal: AbortSignal.timeout(10000),
    });
    const ok = res.status === 401;
    console.log(`${ok ? 'PASS' : 'WARN'}: ${label} ${url} -> HTTP ${res.status}${ok ? ' (reachable, wants credentials)' : ' (expected 401)'}`);
    return ok;
  } catch (e) {
    console.log(`WARN: ${label} ${url} unreachable (${e.message})`);
    return false;
  }
}

(async () => {
  let result;
  try { result = renderMcpConfig(root, dc); } catch (e) { console.error(`FAIL: ${e.message}`); process.exit(1); }
  console.log(`Wrote ${result.file} for data centre "${result.urls.dc}" (header auth via \${WORKATO_CODE_DEV}; no token stored in the file).`);
  const a = await probe('Developer API MCP', result.urls.developerApiMcp);
  const b = await probe('AIRO MCP', result.urls.airoMcp);
  process.exit(a && b ? 0 : 3);
})();
