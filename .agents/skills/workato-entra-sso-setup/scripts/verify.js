#!/usr/bin/env node
/**
 * Step 7: check the Entra side before (and after) pasting the metadata URL into Workato. Read-only.
 * node verify.js --tenant <tenantId> --app-id <appId> --portal acme.workato.app
 * Cannot test a real sign-in (that needs a browser): it prints the test to run by hand.
 */
const L = require('./lib');
const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : undefined; };
const tenant = arg('tenant'), appId = arg('app-id'), urls = L.samlUrls(arg('portal'));
if (!tenant || !appId || urls.error) { console.error(`Usage: verify.js --tenant <id> --app-id <id> --portal <host>${urls.error ? `\n${urls.error}` : ''}`); process.exit(1); }

const rows = [];
const check = (n, ok, d) => rows.push({ n, ok, d });

(async () => {
  const url = L.metadataUrl(tenant, appId);
  try {
    const res = await fetch(url);
    const xml = await res.text();
    const p = res.ok ? L.checkMetadataXml(xml) : [`HTTP ${res.status}`];
    check('Federation metadata URL reachable and valid', !p.length, p.length ? p.join('; ') : url);
  } catch (e) { check('Federation metadata URL reachable and valid', false, e.message); }

  try {
    const sp = L.graph('GET', `/servicePrincipals(appId='${appId}')?$select=id,preferredSingleSignOnMode,preferredTokenSigningKeyThumbprint,appRoleAssignmentRequired`);
    const app = L.graph('GET', `/applications(appId='${appId}')?$select=identifierUris,web,groupMembershipClaims,api`);
    check('SAML mode', sp.preferredSingleSignOnMode === 'saml', sp.preferredSingleSignOnMode || 'not set');
    check('Entity ID matches Workato SP entity ID', (app.identifierUris || []).includes(urls.entityId), (app.identifierUris || []).join(', ') || 'none');
    check('Reply URL matches Workato SSO URL', ((app.web || {}).redirectUris || []).includes(urls.acs), ((app.web || {}).redirectUris || []).join(', ') || 'none');
    check('Signing certificate set', !!sp.preferredTokenSigningKeyThumbprint, sp.preferredTokenSigningKeyThumbprint ? 'yes' : 'missing: claims policies fail with AADSTS50146 without one');
    const pol = L.graph('GET', `/servicePrincipals/${sp.id}/claimsMappingPolicies`);
    const hasPolicy = (pol.value || []).some((x) => (x.definition || []).join('').includes(L.USER_NAME_CLAIM));
    check(`${L.USER_NAME_CLAIM} claim (optional check)`, hasPolicy, hasPolicy ? 'claims mapping policy attached' : 'no claims policy found. Fine if the claim was set in the Entra portal (Attributes & Claims): this script cannot see portal-set claims, so confirm it there');
    check('Group claim (optional)', app.groupMembershipClaims === 'ApplicationGroup', app.groupMembershipClaims === 'ApplicationGroup' ? `on; confirm its custom name is ${L.GROUPS_CLAIM} in Attributes & Claims` : 'off (fine if you are not syncing groups)');
    const ra = L.graph('GET', `/servicePrincipals/${sp.id}/appRoleAssignedTo?$top=1&$select=principalDisplayName`);
    check('At least one user/group assigned', (ra.value || []).length > 0, (ra.value || []).length ? ra.value[0].principalDisplayName : 'none: nobody can sign in until someone is assigned');
  } catch (e) { check('Read app configuration through Graph', false, e.message); }

  for (const r of rows) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.n} - ${r.d}`);
  console.log(`\nManual sign-in test (cannot be automated):\n 1. Finish the Workato side (Portal settings > Security > paste the metadata URL > Save changes).\n 2. Open a private/incognito window, go to https://${urls.host}, and sign in with an assigned Entra user.\n 3. If group sync is on, confirm the user's portal groups match their Entra groups after sign-in.`);
  process.exit(rows.some((r) => !r.ok && !/optional/.test(r.n)) ? 1 : 0);
})();
