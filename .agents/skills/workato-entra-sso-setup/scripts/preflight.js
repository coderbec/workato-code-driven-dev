#!/usr/bin/env node
/** Step 1: everything the Entra SSO setup needs. Read-only. Exit 0 = ready, 1 = something to fix. */
const L = require('./lib');
const { exec, graph } = L;

const rows = [];
const check = (name, ok, detail) => rows.push({ name, ok, detail });

const [maj] = process.versions.node.split('.').map(Number);
check('Node 18+', maj >= 18, `found ${process.versions.node}`);

const v = exec('az', ['--version']);
check('Azure CLI', v.ok, v.ok ? v.stdout.split('\n')[0].trim() : 'missing. Install: https://learn.microsoft.com/cli/azure/install-azure-cli (macOS: brew install azure-cli)');

if (v.ok) {
  const acct = exec('az', ['account', 'show', '--query', '{user:user.name,tenant:tenantId}', '-o', 'json']);
  let a = null;
  try { a = JSON.parse(acct.stdout); } catch { /* not signed in */ }
  check('Azure CLI signed in', !!a, a ? `${a.user} (tenant ${a.tenant})` : 'run: az login --allow-no-subscriptions   (the user needs no Azure subscription, only Entra)');
  if (a) {
    try {
      graph('GET', '/servicePrincipals?$top=1&$select=id');
      check('Graph can read enterprise apps', true, 'ok');
    } catch (e) { check('Graph can read enterprise apps', false, `${e.message} | try: az login --scope https://graph.microsoft.com//.default`); }
    let roles = [];
    try { roles = graph('GET', '/me/transitiveMemberOf/microsoft.graph.directoryRole?$select=displayName').value.map((r) => r.displayName); } catch { /* reported below */ }
    check('Entra role to create enterprise apps', L.hasRole(roles, L.APP_ADMIN_ROLES), L.hasRole(roles, L.APP_ADMIN_ROLES) ? roles.join(', ') : `none of ${L.APP_ADMIN_ROLES.join(' / ')} is ACTIVE (roles held: ${roles.join(', ') || 'none'}). If eligible in PIM, activate it, then az logout and az login again.`);
    check('Entra role to create groups (recommended)', L.hasRole(roles, L.GROUP_ADMIN_ROLES), L.hasRole(roles, L.GROUP_ADMIN_ROLES) ? 'ok' : `none of ${L.GROUP_ADMIN_ROLES.join(' / ')}; group creation may still work if the tenant lets members create security groups`);
    try {
      graph('GET', '/policies/claimsMappingPolicies?$top=1');
      check('Graph can manage claims policies', true, 'ok (needed for the workato_app_user_name claim)');
    } catch (e) { check('Graph can manage claims policies', false, `${e.message.slice(0, 160)} | the claim will be left for you to add in the Entra portal`); }
  }
}

for (const r of rows) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name} - ${r.detail}`);
const hard = rows.filter((r) => !r.ok && !/claims policies|groups \(recommended\)/.test(r.name));
console.log(hard.length ? '\nNOT READY: fix the FAIL lines above, then rerun.' : '\nREADY' + (rows.some((r) => !r.ok) ? ' (claims claim will be a manual step)' : ''));
process.exit(hard.length ? 1 : 0);
