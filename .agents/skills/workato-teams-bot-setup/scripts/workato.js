/**
 * Workato Developer API calls made straight from Node, so the bot's client secret goes
 * script -> Workato over HTTPS and never passes through the chat or a file.
 * Auth: Bearer ${WORKATO_CODE_DEV}, the same profile variable as the MCP servers.
 */
const { urlsFor, OAUTH_PROVIDER } = require('./lib');

function token() {
  const t = (process.env.WORKATO_CODE_DEV || '').trim();
  if (!t) throw new Error('WORKATO_CODE_DEV is not set (run "start workato setup" first).');
  return t;
}

async function api(dc, method, route, body) {
  const res = await fetch(`${urlsFor(dc).apiEndpoint}/api${route}`, {
    method,
    headers: { Authorization: `Bearer ${token()}`, 'content-type': 'application/json', accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON error page */ }
  if (!res.ok) throw new Error(`Workato API ${method} ${route} -> HTTP ${res.status}${json && json.message ? `: ${json.message}` : ''}`);
  return json;
}

/** Existing teams_bot custom OAuth profile with this name, or null. Secrets are never returned by the API. */
async function findProfile(dc, name) {
  const list = await api(dc, 'GET', '/custom_oauth_profiles?per_page=100');
  const items = Array.isArray(list) ? list : (list && (list.result || list.items)) || [];
  return items.find((p) => p.provider === OAUTH_PROVIDER && p.name === name) || null;
}

/** Create the custom OAuth profile Workbot Step 3 uses: client_id = Bot ID. */
async function createProfile(dc, { name, botId, secret }) {
  return api(dc, 'POST', '/custom_oauth_profiles', {
    name, provider: OAUTH_PROVIDER, data: { client_id: botId, client_secret: secret },
  });
}

module.exports = { findProfile, createProfile };
