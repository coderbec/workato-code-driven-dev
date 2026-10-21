#!/usr/bin/env node
/**
 * Steps 4-7: create the Teams bot + app, configure it, and create the Workato OAuth profile.
 * The bot's client secret is read from the Teams CLI's JSON output into memory, sent to the
 * Workato API, and discarded. It is never written to a file or printed.
 *
 * node provision.js --dc eu --name "My Bot" --endpoint "<Workato bot endpoint>" \
 *   --short-description ... --long-description ... --developer ... --website ... --privacy-url ... --terms-url ... [--dry-run]
 */
const L = require('./lib');
const W = require('./workato');

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : undefined; };
const dryRun = process.argv.includes('--dry-run');
const dc = arg('dc') || L.dataCentreFromMcpConfig();
const inputs = {
  name: arg('name'), shortDescription: arg('short-description'), longDescription: arg('long-description'),
  developer: arg('developer'), website: arg('website'), privacyUrl: arg('privacy-url'), termsUrl: arg('terms-url'),
};
const endpoint = arg('endpoint');

const step = (n, text) => console.log(`\n==> Step ${n}: ${text}`);
const fail = (msg) => { console.error(`FAIL: ${msg}`); process.exit(1); };

if (!dc) fail('data centre unknown: pass --dc or run "start workato setup" first.');
const problems = L.validateInputs(inputs);
const epProblem = L.validateEndpoint(endpoint, dc);
if (epProblem) problems.push(`bot endpoint: ${epProblem}`);
if (problems.length) fail(`fix these inputs:\n - ${problems.join('\n - ')}`);

(async () => {
  const redirect = L.redirectUri(dc);
  const secrets = [];
  const show = (cmd, args) => `${cmd} ${args.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(' ')}`;

  if (dryRun) {
    console.log('DRY RUN: nothing is executed. The commands below are what would run.\n');
    console.log(show('teams', ['app', 'create', '--name', inputs.name, '--endpoint', endpoint, '--sign-in-audience', 'multipleOrgs', '--json']));
    console.log(show('az', ['ad', 'app', 'update', '--id', '<botId>', '--web-redirect-uris', redirect]));
    console.log(show('teams', L.appUpdateArgs('<teamsAppId>', inputs)));
    for (const a of L.manifestAssignments()) console.log(show('teams', ['app', 'manifest', 'update', '<teamsAppId>', '--set-json', a]));
    console.log(`POST ${L.urlsFor(dc).apiEndpoint}/api/custom_oauth_profiles  { name: "${inputs.name}", provider: "${L.OAUTH_PROVIDER}", data: { client_id: <botId>, client_secret: *** } }`);
    return;
  }

  // Refuse to create a second profile with the same name: the secret would be lost if we then stopped.
  step('4/9', `Checking the Workato workspace for an existing "${inputs.name}" teams_bot OAuth profile`);
  if (await W.findProfile(dc, inputs.name)) fail(`a teams_bot OAuth profile named "${inputs.name}" already exists. Choose another bot name, or delete that profile first.`);

  step('4/9', 'Creating the bot, the Entra app registration and the Teams app (Teams Developer CLI)');
  const created = L.teams(['app', 'create', '--name', inputs.name, '--endpoint', endpoint, '--sign-in-audience', 'multipleOrgs', '--json']);
  let app;
  try { app = L.parseJsonOutput(created.stdout); } catch { fail(`teams app create failed: ${L.redact(created.stderr || created.stdout, secrets).trim().slice(-400)}`); }
  const creds = app.credentials || {};
  secrets.push(creds.CLIENT_SECRET);
  if (!created.ok || !app.botId || !app.teamsAppId) fail(`teams app create did not return a bot: ${L.redact(created.stderr || created.stdout, secrets).trim().slice(-400)}`);
  console.log(`    bot ID ${app.botId}, Teams app ID ${app.teamsAppId}`);
  const manual = [];

  step('5/9', `Setting the Entra redirect URI for data centre "${dc}": ${redirect}`);
  const az = L.exec('az', ['ad', 'app', 'update', '--id', app.botId, '--web-redirect-uris', redirect]);
  if (az.ok) console.log('    done (multitenant sign-in was set at creation)');
  else {
    console.log(`    could not set it automatically: ${L.redact(az.stderr, secrets).trim().split('\n').pop()}`);
    manual.push(`Azure portal > App registrations > "${inputs.name}" (${app.botId}) > Authentication > Add a platform > Web > redirect URI ${redirect}`);
  }

  step('6/9', 'Setting bot details, scopes (personal, team, group chat), files, help command and domain *.workato.com');
  const upd = L.teams(L.appUpdateArgs(app.teamsAppId, inputs));
  if (!upd.ok) manual.push(`Teams app details/scopes: run  teams app update ${app.teamsAppId} --help  (${L.redact(upd.stderr, secrets).trim().split('\n').pop()})`);
  for (const a of L.manifestAssignments()) {
    const m = L.teams(['app', 'manifest', 'update', app.teamsAppId, '--set-json', a]);
    console.log(`    ${m.ok ? 'set' : 'FAILED'} ${a.split('=')[0]}`);
    if (!m.ok) manual.push(`Manifest field ${a.split('=')[0]}: ${L.redact(m.stderr, secrets).trim().split('\n').pop()}`);
  }

  step('7/9', 'Creating the Workato custom OAuth profile (client ID = Bot ID) directly through the Workato API');
  if (!creds.CLIENT_SECRET) {
    manual.push(`No client secret was generated. Run  teams app auth secret create ${app.teamsAppId}  and add the Workato OAuth profile by hand.`);
  } else {
    try {
      const p = await W.createProfile(dc, { name: inputs.name, botId: app.botId, secret: creds.CLIENT_SECRET });
      console.log(`    created profile "${inputs.name}"${p && p.id ? ` (id ${p.id})` : ''}`);
    } catch (e) {
      console.log(`    FAILED: ${L.redact(e.message, secrets)}`);
      manual.push(`Workato OAuth profile: re-run  node scripts/workato-profile.js --dc ${dc} --name "${inputs.name}" --bot-id ${app.botId} --teams-app-id ${app.teamsAppId}  (it makes a fresh secret).`);
    }
  }

  console.log('\n==== Provisioned (no secret was written or shown) ====');
  console.log(`Bot / client ID : ${app.botId}`);
  console.log(`Teams app ID    : ${app.teamsAppId}   (use as "Application ID" in Workbot Step 3 if asked)`);
  console.log(`Tenant ID       : ${creds.TENANT_ID || '(see teams status)'}`);
  console.log(`Install link    : ${app.installLink}`);
  console.log(`Developer Portal: ${app.portalLink}`);
  console.log('Client secret   : stored only in Workato. It expires; check Entra > App registrations > Certificates & secrets and set a reminder.');
  if (manual.length) { console.log('\nLeft for you:'); manual.forEach((m) => console.log(` - ${m}`)); }
})().catch((e) => fail(L.redact(e.message, [])));
