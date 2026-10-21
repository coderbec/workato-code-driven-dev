/**
 * Workato data centres: the single source of truth for every regional URL.
 *
 * Sources (docs.workato.com):
 *   - Developer API base URLs: /workato-api.html (US is www.workato.com, the rest app.<code>.workato.com)
 *   - AIRO MCP URLs per data centre: /en/airo/mcp ("Data center server URLs")
 *   - Developer API MCP: documented for US only; every other region's /mcp path answers on the
 *     same host (HTTP 401 without credentials), so it follows the AIRO pattern.
 *   - CN is excluded: MCP and the Platform CLI are not available there.
 */

const fs = require('fs');
const path = require('path');

const DATA_CENTERS = {
  us:    { label: 'United States',               apiHost: 'www.workato.com',       mcpHost: 'app.workato.com' },
  eu:    { label: 'Europe',                      apiHost: 'app.eu.workato.com',    mcpHost: 'app.eu.workato.com' },
  jp:    { label: 'Japan',                       apiHost: 'app.jp.workato.com',    mcpHost: 'app.jp.workato.com' },
  sg:    { label: 'Singapore',                   apiHost: 'app.sg.workato.com',    mcpHost: 'app.sg.workato.com' },
  au:    { label: 'Australia',                   apiHost: 'app.au.workato.com',    mcpHost: 'app.au.workato.com' },
  il:    { label: 'Israel',                      apiHost: 'app.il.workato.com',    mcpHost: 'app.il.workato.com' },
  kr:    { label: 'South Korea',                 apiHost: 'app.kr.workato.com',    mcpHost: 'app.kr.workato.com' },
  uk:    { label: 'United Kingdom',              apiHost: 'app.uk.workato.com',    mcpHost: 'app.uk.workato.com' },
  trial: { label: 'Developer Sandbox (trial)',   apiHost: 'app.trial.workato.com', mcpHost: 'app.trial.workato.com' },
};

// Claude Code reads the generated .mcp.json; it is rendered from the committed template.
const MCP_TEMPLATE = '.mcp.template.json';
const MCP_OUTPUT = '.mcp.json';

function normalise(code) {
  const dc = String(code || '').trim().toLowerCase();
  if (dc === 'cn') {
    throw new Error('The China (cn) data centre is not supported: MCP and the Workato Platform CLI are unavailable there.');
  }
  if (!DATA_CENTERS[dc]) {
    throw new Error(`Unknown data centre "${code}". Valid options: ${Object.keys(DATA_CENTERS).join(', ')}`);
  }
  return dc;
}

function urlsFor(code) {
  const dc = normalise(code);
  const { apiHost, mcpHost } = DATA_CENTERS[dc];
  return {
    dc,
    region: dc, // value for `wk auth login --region`
    apiEndpoint: `https://${apiHost}`,
    developerApiMcp: `https://${mcpHost}/mcp`,
    airoMcp: `https://${mcpHost}/airo_mcp`,
  };
}

/** Infer a data centre code from any Workato URL, or null if it is not a known host. */
function detectFromUrl(url) {
  try {
    const host = new URL(url).hostname;
    if (host === 'www.workato.com' || host === 'app.workato.com') return 'us';
    const m = host.match(/^app\.([a-z]+)\.workato\.com$/);
    return m && DATA_CENTERS[m[1]] ? m[1] : null;
  } catch {
    return null;
  }
}

/**
 * Render .mcp.template.json to .mcp.json for a data centre.
 * The template uses {{DEVELOPER_API_MCP_URL}} and {{AIRO_MCP_URL}} placeholders.
 * The token is never written: the template references ${WORKATO_CODE_DEV}, which Claude Code expands.
 */
function renderMcpConfig(root, code) {
  const u = urlsFor(code);
  const template = fs.readFileSync(path.join(root, MCP_TEMPLATE), 'utf-8');
  const rendered = template
    .replace(/\{\{DEVELOPER_API_MCP_URL\}\}/g, u.developerApiMcp)
    .replace(/\{\{AIRO_MCP_URL\}\}/g, u.airoMcp);
  JSON.parse(rendered); // fail loudly rather than write a broken config
  const out = path.join(root, MCP_OUTPUT);
  fs.writeFileSync(out, rendered);
  return { urls: u, file: MCP_OUTPUT };
}

/** Arguments for `wk auth login`: wk validates --region against a shorter list, so fall back to --base-url. */
const WK_REGIONS = ['us', 'eu', 'jp', 'au', 'sg', 'il', 'cn', 'trial'];
function wkRegionArgs(code) {
  const u = urlsFor(code);
  return WK_REGIONS.includes(u.dc) ? ['--region', u.region] : ['--base-url', u.apiEndpoint];
}

module.exports = {
  DATA_CENTERS, MCP_TEMPLATE, MCP_OUTPUT, urlsFor, detectFromUrl, renderMcpConfig, wkRegionArgs,
};
