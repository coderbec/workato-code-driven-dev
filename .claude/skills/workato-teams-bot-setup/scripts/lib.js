/**
 * Pure helpers for the Teams bot setup scripts (no network, no secrets on disk).
 * Shares the data centre table with the main setup: scripts/lib/data-centers.js.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const { urlsFor, detectFromUrl, MCP_OUTPUT } = require(path.join(REPO_ROOT, 'scripts', 'lib', 'data-centers'));

const BOT_SCOPES = ['personal', 'team', 'groupChat']; // Workato's documented bot scopes
const VALID_DOMAINS = ['*.workato.com'];
const HELP_COMMAND = { title: 'help', description: "Type 'help' to view available commands" };
const OAUTH_PROVIDER = 'teams_bot';
const TEAMS_ADMIN_ROLES = ['Global Administrator', 'Teams Administrator', 'Teams Service Administrator', 'Privileged Role Administrator'];

/** OAuth redirect URI that goes on the Entra app for a data centre (docs.workato.com Enterprise Workbot, part E). */
function redirectUri(dc) {
  return `${urlsFor(dc).apiEndpoint}/oauth/callback`;
}

/** The Workbot "Bot endpoint address" Workato shows: https://<host>/skype_webhooks/event?coak_id=<n>. */
function validateEndpoint(raw, dc) {
  let u;
  try { u = new URL(String(raw).trim()); } catch { return 'Not a valid URL.'; }
  const { apiEndpoint, developerApiMcp } = urlsFor(dc);
  const hosts = [new URL(apiEndpoint).host, new URL(developerApiMcp).host];
  if (u.protocol !== 'https:') return 'Must be https.';
  if (!hosts.includes(u.host)) return `Host must be ${hosts.join(' or ')} for data centre "${dc}", got ${u.host}.`;
  if (u.pathname !== '/skype_webhooks/event') return 'Path must be /skype_webhooks/event (copy the Bot endpoint address from the Workato custom bot page).';
  if (!/^\d+$/.test(u.searchParams.get('coak_id') || '')) return 'Missing numeric coak_id query parameter.';
  return null;
}

const https = (v) => /^https:\/\/\S+$/i.test(v || '');
/** Returns a list of human-readable problems; empty = OK. Limits are Teams manifest limits. */
function validateInputs(i) {
  const e = [];
  if (!i.name || !/^[A-Za-z0-9 -]{1,30}$/.test(i.name)) e.push('name: 1-30 characters, letters, numbers, spaces or hyphens (Teams short name limit is 30; Workato disallows special characters).');
  if (!i.shortDescription || i.shortDescription.length > 80) e.push('short description: required, 80 characters or fewer.');
  if (!i.longDescription || i.longDescription.length > 4000) e.push('long description: required, 4000 characters or fewer.');
  if (!i.developer || i.developer.length > 32) e.push('developer name: required, 32 characters or fewer.');
  for (const [k, label] of [['website', 'website'], ['privacyUrl', 'privacy policy URL'], ['termsUrl', 'terms of use URL']]) {
    if (!https(i[k])) e.push(`${label}: required, must be an https URL.`);
  }
  return e;
}

/** `path=json` assignments for `teams app manifest update --set-json` (dot-prop paths). */
function manifestAssignments() {
  return [
    `bots[0].supportsFiles=true`,
    `bots[0].commandLists=${JSON.stringify([{ scopes: BOT_SCOPES, commands: [HELP_COMMAND] }])}`,
    `validDomains=${JSON.stringify(VALID_DOMAINS)}`,
  ];
}

/** Args for `teams app update <id>` that set details, scopes and links. */
function appUpdateArgs(teamsAppId, i) {
  return ['app', 'update', teamsAppId,
    '--scopes', BOT_SCOPES.join(','),
    '--short-description', i.shortDescription, '--long-description', i.longDescription,
    '--developer', i.developer, '--website', i.website,
    '--privacy-url', i.privacyUrl, '--terms-url', i.termsUrl, '--json'];
}

/** Pull the JSON object out of CLI stdout that may carry banner lines around it. */
function parseJsonOutput(stdout) {
  const s = String(stdout);
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('no JSON in output');
  return JSON.parse(s.slice(start, end + 1));
}

function isTeamsAdmin(roleNames) {
  return (roleNames || []).some((r) => TEAMS_ADMIN_ROLES.includes(r));
}

function redact(text, secrets) {
  let out = String(text);
  for (const s of secrets.filter(Boolean)) out = out.split(s).join('***');
  return out;
}

/** Data centre of the generated .mcp.json, or null (setup not run yet). */
function dataCentreFromMcpConfig() {
  try {
    const cfg = JSON.parse(require('fs').readFileSync(path.join(REPO_ROOT, MCP_OUTPUT), 'utf-8'));
    const first = Object.values(cfg.mcpServers || {})[0];
    return first ? detectFromUrl(first.url) : null;
  } catch { return null; }
}

const winQuote = (a) => (/^[A-Za-z0-9_\-./:=,@]+$/.test(a) ? a : `"${String(a).replace(/"/g, '\\"')}"`);
/** Run a command. On Windows npm shims (.cmd) need a shell, so args are quoted explicitly. */
function exec(cmd, args, opts = {}) {
  const win = process.platform === 'win32';
  const r = win
    ? spawnSync([cmd, ...args.map(winQuote)].join(' '), { encoding: 'utf-8', shell: true, ...opts })
    : spawnSync(cmd, args, { encoding: 'utf-8', ...opts });
  return { ok: r.status === 0, status: r.status, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error };
}
const teams = (args, opts) => exec('teams', ['--disable-auto-update', '-y', ...args], { env: { ...process.env, TEAMS_NO_INTERACTIVE: '1' }, ...opts });

module.exports = {
  REPO_ROOT, BOT_SCOPES, VALID_DOMAINS, HELP_COMMAND, OAUTH_PROVIDER, TEAMS_ADMIN_ROLES,
  urlsFor, redirectUri, validateEndpoint, validateInputs, manifestAssignments, appUpdateArgs,
  parseJsonOutput, isTeamsAdmin, redact, dataCentreFromMcpConfig, exec, teams,
};
