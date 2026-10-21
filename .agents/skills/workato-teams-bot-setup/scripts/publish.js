#!/usr/bin/env node
/**
 * Step 8: publish the Teams app to the org catalog through Microsoft Graph, adapting to the user's rights.
 *   node publish.js --teams-app-id <id> [--approve]
 * - Teams admin: publishes directly.
 * - Anyone else: submits with requiresReview=true and prints what the admin must approve.
 * - --approve (run by an admin): approves a pending submission for this app.
 * If the Azure CLI token lacks AppCatalog permissions, the package is kept and manual upload steps are printed.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const L = require('./lib');

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : undefined; };
const appId = arg('teams-app-id');
if (!appId) { console.error('Usage: node publish.js --teams-app-id <id> [--approve]'); process.exit(2); }
const GRAPH = 'https://graph.microsoft.com/v1.0';

function graphToken() {
  const r = L.exec('az', ['account', 'get-access-token', '--resource-type', 'ms-graph', '--query', 'accessToken', '-o', 'tsv']);
  return r.ok ? r.stdout.trim() : null;
}
async function graph(token, method, url, { body, headers } = {}) {
  const res = await fetch(url.startsWith('http') ? url : `${GRAPH}${url}`, {
    method, headers: { Authorization: `Bearer ${token}`, ...headers }, body, signal: AbortSignal.timeout(60000),
  });
  const text = await res.text();
  let json = null; try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }
  return { status: res.status, ok: res.ok, json, text };
}

function manualUpload(zip) {
  console.log(`\nAutomatic publish was not possible with the Azure CLI token. Package kept at:\n  ${zip}`);
  console.log('Upload it by hand: Teams Admin Center > Teams apps > Manage apps > Upload new app (admin),');
  console.log('or in Teams: Apps > Manage your apps > Upload an app > Submit an app to your org (then an admin approves it).');
}

(async () => {
  const token = graphToken();
  if (!token) { console.error('FAIL: could not get a Graph token. Run: az login'); process.exit(1); }

  const roles = await graph(token, 'GET', '/me/transitiveMemberOf/microsoft.graph.directoryRole?$select=displayName');
  const roleNames = roles.ok && roles.json && roles.json.value ? roles.json.value.map((r) => r.displayName) : [];
  const admin = L.isTeamsAdmin(roleNames);
  console.log(`Signed-in user ${admin ? 'IS' : 'is not'} a Teams/Global admin${roles.ok ? '' : ' (role lookup unavailable, assuming not)'}.`);

  if (process.argv.includes('--approve')) {
    if (!admin) { console.error('FAIL: only an admin can approve. Ask a Teams admin to run this, or approve in the Teams Admin Center (Manage apps).'); process.exit(1); }
    const list = await graph(token, 'GET', `/appCatalogs/teamsApps?$filter=externalId eq '${appId}'&$expand=appDefinitions`);
    const app = list.json && list.json.value && list.json.value[0];
    const pending = app && (app.appDefinitions || []).find((d) => String(d.publishingState).toLowerCase() === 'submitted');
    if (!pending) { console.log('Nothing pending for this app.'); return; }
    const etag = pending['@odata.etag'] || '*';
    const r = await graph(token, 'PATCH', `/appCatalogs/teamsApps/${app.id}/appDefinitions/${pending.id}`, { body: JSON.stringify({ publishingState: 'published' }), headers: { 'content-type': 'application/json', 'If-Match': etag } });
    console.log(r.ok ? 'PASS: approved and published.' : `FAIL: HTTP ${r.status} ${r.text.slice(0, 200)}`);
    process.exit(r.ok ? 0 : 1);
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'teams-pkg-'));
  const zip = path.join(dir, 'app.zip');
  console.log('Downloading the app package from the Developer Portal ...');
  const dl = L.teams(['app', 'package', 'download', appId, '-o', zip]);
  if (!dl.ok || !fs.existsSync(zip)) { console.error(`FAIL: could not download the package: ${dl.stderr.trim().slice(-300)}`); process.exit(1); }

  const url = `/appCatalogs/teamsApps${admin ? '' : '?requiresReview=true'}`;
  console.log(admin ? 'Publishing to the org catalog ...' : 'Submitting for admin review (requiresReview=true) ...');
  const r = await graph(token, 'POST', url, { body: fs.readFileSync(zip), headers: { 'content-type': 'application/zip' } });

  if (r.status === 401 || r.status === 403) return manualUpload(zip);
  if (!r.ok) {
    const detail = r.json && r.json.error ? `${r.json.error.code}: ${r.json.error.message}` : r.text.slice(0, 300);
    if (/already exists|conflict/i.test(detail) || r.status === 409) console.log('This app is already in the catalog; to ship a changed manifest, bump the version (teams app update --version) and publish again.');
    console.error(`FAIL: HTTP ${r.status} ${detail}`); process.exit(1);
  }
  fs.rmSync(dir, { recursive: true, force: true });
  if (admin) console.log(`PASS: published to the org catalog (catalog id ${r.json && r.json.id}).`);
  else {
    console.log(`PASS: submitted for review (catalog id ${r.json && r.json.id}).`);
    console.log('A Teams admin must approve it: Teams Admin Center > Teams apps > Manage apps > search for the app name > Publish,');
    console.log(`or the admin can run: node publish.js --teams-app-id ${appId} --approve`);
  }
})().catch((e) => { console.error(`FAIL: ${e.message}`); process.exit(1); });
