#!/usr/bin/env node
/**
 * Recovery for provision.js step 7: generate a fresh client secret with the Teams CLI and create the
 * Workato teams_bot OAuth profile. The secret stays in memory.
 * node workato-profile.js --dc eu --name "My Bot" --bot-id <id> --teams-app-id <id>
 */
const L = require('./lib');
const W = require('./workato');
const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : undefined; };
const [dc, name, botId, appId] = [arg('dc') || L.dataCentreFromMcpConfig(), arg('name'), arg('bot-id'), arg('teams-app-id')];
if (!dc || !name || !botId || !appId) { console.error('Usage: node workato-profile.js --dc <dc> --name <bot name> --bot-id <id> --teams-app-id <id>'); process.exit(2); }
(async () => {
  if (await W.findProfile(dc, name)) { console.error(`A teams_bot profile named "${name}" already exists; nothing to do.`); process.exit(1); }
  const r = L.teams(['app', 'auth', 'secret', 'create', appId, '--json']);
  let secret;
  try { const j = L.parseJsonOutput(r.stdout); secret = (j.credentials || j).CLIENT_SECRET || j.secret || j.secretText; } catch { /* handled below */ }
  if (!r.ok || !secret) { console.error(`Could not create a client secret: ${L.redact(r.stderr || r.stdout, []).trim().slice(-300)}`); process.exit(1); }
  try {
    const p = await W.createProfile(dc, { name, botId, secret });
    console.log(`PASS: created profile "${name}"${p && p.id ? ` (id ${p.id})` : ''}`);
  } catch (e) { console.error(`FAIL: ${L.redact(e.message, [secret])}`); process.exit(1); }
})();
