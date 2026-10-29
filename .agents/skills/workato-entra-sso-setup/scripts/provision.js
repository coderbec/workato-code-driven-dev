#!/usr/bin/env node
/**
 * Steps 3-5: build the Entra SAML enterprise application for Workflow apps with the Azure CLI (Graph).
 *
 * node provision.js --portal acme.workato.app --name "Workflow apps" [--group-sync] [--groups "A,B"] [--create-groups "C,D"] [--dry-run]
 * --groups assigns existing groups; --create-groups creates cloud-only security groups (reusing one with that exact name) and assigns them.
 *
 * Creates (non-gallery app) -> SAML mode -> Entity ID / Reply URL -> workato_app_user_name claim ->
 * token signing certificate -> optional group claim and group assignment. Prints the App Federation Metadata URL.
 * Stops without changes if an enterprise app with that name already exists.
 */
const L = require('./lib');

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : undefined; };
const has = (n) => process.argv.includes(`--${n}`);
const dryRun = has('dry-run');
const groupSync = has('group-sync');
const list = (n) => (arg(n) || '').split(',').map((s) => s.trim()).filter(Boolean);
const createGroups = list('create-groups');
const groups = [...new Set([...list('groups'), ...createGroups])];
const name = arg('name');
const urls = L.samlUrls(arg('portal'));

const step = (n, t) => console.log(`\n==> Step ${n}: ${t}`);
const fail = (m) => { console.error(`FAIL: ${m}`); process.exit(1); };
const problems = [urls.error, L.validateAppName(name)].filter(Boolean);
if (groups.length && !groupSync) problems.push('--groups / --create-groups need --group-sync (assigning groups without the group claim syncs nothing).');
if (problems.length) fail(`fix these inputs:\n - ${problems.join('\n - ')}`);

if (dryRun) {
  console.log('DRY RUN: nothing is executed. Graph calls that would run:\n');
  console.log(`GET   /servicePrincipals?$filter=displayName eq '${name}'   (stop if found)`);
  console.log(`POST  /applicationTemplates/${L.NON_GALLERY_TEMPLATE_ID}/instantiate  { displayName: "${name}" }`);
  console.log('PATCH /servicePrincipals/<spId>  { preferredSingleSignOnMode: "saml" }');
  console.log(`PATCH /applications/<appObjectId>  ${JSON.stringify(L.applicationPatch(urls, groupSync))}`);
  console.log(`POST  /policies/claimsMappingPolicies  ${L.claimsPolicyDefinition()}  then assign to the service principal`);
  console.log('POST  /servicePrincipals/<spId>/addTokenSigningCertificate, then PATCH preferredTokenSigningKeyThumbprint');
  if (groupSync) console.log(`group claim: applications groupMembershipClaims = ApplicationGroup (name "${L.GROUPS_CLAIM}" is set in the portal, see manual step)`);
  groups.forEach((g) => {
    if (createGroups.includes(g)) console.log(`GET   /groups?$filter=displayName eq '${g}'  (reuse if found), else POST /groups ${JSON.stringify(L.groupBody(g))}`);
    console.log(`POST  /groups/<id of "${g}">/appRoleAssignments`);
  });
  process.exit(0);
}

(async () => {
  const manual = [];
  const attempt = (label, fn, manualText) => {
    try { const r = fn(); console.log(`    ${label}: done`); return r; }
    catch (e) { console.log(`    ${label}: FAILED (${e.message.slice(0, 200)})`); manual.push(manualText); return undefined; }
  };

  step('3/6', `Creating the "${name}" enterprise application (Non-gallery) in Entra`);
  const existing = L.graph('GET', `/servicePrincipals?$filter=${encodeURIComponent(`displayName eq '${L.odataEscape(name)}'`)}&$select=id,appId`);
  if (existing && existing.value && existing.value.length) fail(`an enterprise application named "${name}" already exists (appId ${existing.value[0].appId}). Choose another name, or delete it in Entra first.`);
  const inst = L.graph('POST', `/applicationTemplates/${L.NON_GALLERY_TEMPLATE_ID}/instantiate`, { displayName: name });
  const app = inst.application, sp = inst.servicePrincipal;
  if (!app || !sp) fail('Graph did not return an application and service principal.');
  console.log(`    appId ${app.appId}, enterprise app object ${sp.id}`);
  const tenantId = sp.appOwnerOrganizationId || L.exec('az', ['account', 'show', '--query', 'tenantId', '-o', 'tsv']).stdout.trim();

  step('4/6', 'Enabling SAML and setting Identifier (Entity ID) and Reply URL (ACS)');
  // Entra needs a moment before a freshly instantiated app accepts PATCHes.
  for (let i = 0; i < 5; i++) {
    try { L.graph('PATCH', `/servicePrincipals/${sp.id}`, { preferredSingleSignOnMode: 'saml' }); break; }
    catch (e) { if (i === 4) fail(`could not switch the app to SAML: ${e.message}`); await new Promise((r) => setTimeout(r, 3000)); }
  }
  console.log('    SAML mode: done');
  attempt('Entity ID + Reply URL', () => L.graph('PATCH', `/applications/${app.id}`, L.applicationPatch(urls, groupSync)),
    `Entra > Enterprise apps > "${name}" > Single sign-on > Basic SAML Configuration: Identifier ${urls.entityId}, Reply URL ${urls.acs}`);

  step('5/6', `Adding the ${L.USER_NAME_CLAIM} claim and a token signing certificate`);
  attempt(`${L.USER_NAME_CLAIM} claim`, () => {
    const pol = L.graph('POST', '/policies/claimsMappingPolicies', { definition: [L.claimsPolicyDefinition()], displayName: `${name} SAML claims`, isOrganizationDefault: false });
    L.graph('POST', `/servicePrincipals/${sp.id}/claimsMappingPolicies/$ref`, { '@odata.id': `${L.GRAPH}/policies/claimsMappingPolicies/${pol.id}` });
  }, `Entra > "${name}" > Single sign-on > Attributes & Claims > + Add new claim: Name ${L.USER_NAME_CLAIM}, Source attribute user.displayname`);
  // Claims policies require an app-specific signing key, otherwise sign-in fails with AADSTS50146.
  attempt('token signing certificate', () => {
    const end = new Date(Date.now() + 3 * 365 * 864e5).toISOString();
    const c = L.graph('POST', `/servicePrincipals/${sp.id}/addTokenSigningCertificate`, { displayName: `CN=${name} SAML signing`, endDateTime: end });
    L.graph('PATCH', `/servicePrincipals/${sp.id}`, { preferredTokenSigningKeyThumbprint: c.thumbprint });
  }, `Entra > "${name}" > Single sign-on > SAML Certificates: create/activate a signing certificate (needed once a claims policy is used)`);

  if (groupSync) {
    manual.push(`Group claim name: Entra > "${name}" > Single sign-on > Attributes & Claims > + Add a group claim: Groups assigned to the application, Cloud-only group display names, Customize the name = ${L.GROUPS_CLAIM}, leave Namespace empty. (The group claim is switched on by the CLI; its custom name can only be set in the portal.)`);
  }

  step('6/6', groups.length ? `Creating/assigning ${groups.length} group(s) and assigning to the app` : 'Group creation/assignment (none requested)');
  if (groups.length) {
    const roles = L.graph('GET', `/servicePrincipals/${sp.id}?$select=appRoles`).appRoles;
    const roleId = L.pickAccessRole(roles);
    for (const g of groups) {
      attempt(`group "${g}"`, () => {
        const f = L.graph('GET', `/groups?$filter=${encodeURIComponent(`displayName eq '${L.odataEscape(g)}'`)}&$select=id,displayName,onPremisesSyncEnabled`);
        if (f.value.length > 1) throw new Error('more than one group has that display name');
        if (!f.value.length) {
          if (!createGroups.includes(g)) throw new Error('no group with that exact display name');
          f.value.push(L.graph('POST', '/groups', L.groupBody(g)));
          console.log(`    created group "${g}" (no members yet: add users in Entra > Groups)`);
        } else if (createGroups.includes(g)) console.log(`    group "${g}" already exists, reusing it`);
        if (f.value[0].onPremisesSyncEnabled) console.log('    note: this group is synced from on-premises AD; "Cloud-only group display names" will not emit it.');
        L.graph('POST', `/groups/${f.value[0].id}/appRoleAssignments`, { principalId: f.value[0].id, resourceId: sp.id, appRoleId: roleId });
      }, `Entra > Groups > create/find "${g}" (cloud-only security group), then Entra > "${name}" > Users and groups > + Add user/group: ${g}`);
    }
  }

  console.log('\n==== Entra side configured ====');
  console.log(`Enterprise app    : ${name}  (appId ${app.appId})`);
  console.log(`Tenant ID         : ${tenantId}`);
  console.log(`Entity ID         : ${urls.entityId}`);
  console.log(`Reply URL (ACS)   : ${urls.acs}`);
  console.log(`App Federation Metadata URL (paste into Workato):\n  ${L.metadataUrl(tenantId, app.appId)}`);
  console.log(`Portal            : https://entra.microsoft.com/#view/Microsoft_AAD_IAM/ManagedAppMenuBlade/~/Overview/objectId/${sp.id}/appId/${app.appId}`);
  console.log(`\nNext: node ${process.argv[1].replace(/provision\.js$/, 'verify.js')} --tenant ${tenantId} --app-id ${app.appId} --portal ${urls.host}`);
  if (manual.length) { console.log('\nLeft for you:'); manual.forEach((m) => console.log(` - ${m}`)); }
})().catch((e) => fail(e.message));
