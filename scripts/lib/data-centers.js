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

// Files whose MCP server URLs are rewritten. Paths are relative to the repo root.
const MCP_CONFIG_FILES = [
  '.mcp.json',
  'claude_desktop_config.json',
  '.opencode/opencode.jsonc',
  '.opencode/mcps/claude-desktop-config.json',
  '.opencode/mcps/cursor-config.json',
  '.opencode/mcps/generic-mcp-client-config.json',
];

const MCP_URL_PATTERN = /https:\/\/(?:app|www)(?:\.[a-z]+)?\.workato\.com\/(mcp|airo_mcp)(?![A-Za-z0-9_])/g;

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

/** Rewrite MCP server URLs in every known config file under `root`. Returns the files changed. */
function applyMcpUrls(root, code) {
  const { developerApiMcp, airoMcp } = urlsFor(code);
  const changed = [];
  const missing = [];
  for (const rel of MCP_CONFIG_FILES) {
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) { missing.push(rel); continue; }
    const before = fs.readFileSync(file, 'utf-8');
    const after = before.replace(MCP_URL_PATTERN, (_m, kind) => (kind === 'mcp' ? developerApiMcp : airoMcp));
    if (after !== before) {
      fs.writeFileSync(file, after);
      changed.push(rel);
    }
  }
  return { changed, missing };
}

/** Set KEY=value lines in a .env file (replacing existing keys, appending new ones). */
function upsertEnv(envPath, values) {
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, 'm');
    if (re.test(content)) content = content.replace(re, line);
    else content += (content && !content.endsWith('\n') ? '\n' : '') + line + '\n';
  }
  fs.writeFileSync(envPath, content);
}

/** Apply a data centre choice: .env values plus every MCP config file. */
function applyDataCenter(root, code) {
  const u = urlsFor(code);
  upsertEnv(path.join(root, '.env'), {
    WORKATO_DATA_CENTER: u.dc,
    WORKATO_REGION: u.region,
    WORKATO_API_ENDPOINT: u.apiEndpoint,
  });
  return { urls: u, ...applyMcpUrls(root, u.dc) };
}

/** Read the currently configured data centre from .env, or null. */
function currentDataCenter(root) {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return null;
  const m = fs.readFileSync(envPath, 'utf-8').match(/^WORKATO_DATA_CENTER=(\S+)\s*$/m);
  return m && DATA_CENTERS[m[1].toLowerCase()] ? m[1].toLowerCase() : null;
}

module.exports = {
  DATA_CENTERS, MCP_CONFIG_FILES, urlsFor, detectFromUrl, applyMcpUrls,
  applyDataCenter, currentDataCenter, upsertEnv,
};
