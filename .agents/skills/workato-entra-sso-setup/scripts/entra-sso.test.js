const test = require('node:test');
const assert = require('node:assert');
const L = require('./lib');

test('SAML URLs derive from the portal host in any input shape', () => {
  for (const raw of ['acme.workato.app', 'https://acme.workato.app/', ' HTTPS://Acme.Workato.app/portal ']) {
    const u = L.samlUrls(raw);
    assert.strictEqual(u.acs, 'https://acme.workato.app/portal/sso/saml/acs');
    assert.strictEqual(u.entityId, 'https://acme.workato.app/portal/sso/saml/metadata');
  }
  assert.strictEqual(L.samlUrls('sso.acme.com').acs, 'https://sso.acme.com/portal/sso/saml/acs');
});

test('SAML URLs reject junk and the platform host', () => {
  assert.ok(L.samlUrls('').error);
  assert.ok(L.samlUrls('nope').error);
  assert.match(L.samlUrls('app.eu.workato.com').error, /platform host/);
  assert.match(L.samlUrls('www.workato.com').error, /platform host/);
});

test('metadata URL embeds tenant and app id', () => {
  assert.strictEqual(L.metadataUrl('t1', 'a1'), 'https://login.microsoftonline.com/t1/federationmetadata/2007-06/federationmetadata.xml?appid=a1');
});

test('claims policy is valid JSON that maps displayname to workato_app_user_name', () => {
  const d = JSON.parse(L.claimsPolicyDefinition()).ClaimsMappingPolicy;
  assert.deepStrictEqual(d.ClaimsSchema[0], { Source: 'user', ID: 'displayname', SamlClaimType: 'workato_app_user_name' });
});

test('application patch only turns on the group claim when syncing groups', () => {
  const u = L.samlUrls('acme.workato.app');
  assert.strictEqual(L.applicationPatch(u, false).groupMembershipClaims, undefined);
  assert.strictEqual(L.applicationPatch(u, true).groupMembershipClaims, 'ApplicationGroup');
  assert.deepStrictEqual(L.applicationPatch(u, false).identifierUris, [u.entityId]);
  assert.strictEqual(L.applicationPatch(u, false).api.acceptMappedClaims, true);
});

test('access role prefers an enabled User role, else Default Access', () => {
  assert.strictEqual(L.pickAccessRole([{ id: 'r1', isEnabled: true, allowedMemberTypes: ['Application'] }, { id: 'r2', isEnabled: true, allowedMemberTypes: ['User'] }]), 'r2');
  assert.strictEqual(L.pickAccessRole([]), L.DEFAULT_ACCESS_ROLE);
});

test('metadata XML check', () => {
  const ok = '<EntityDescriptor><IDPSSODescriptor><KeyDescriptor><X509Certificate>x</X509Certificate></KeyDescriptor><SingleSignOnService Binding="b"/></IDPSSODescriptor></EntityDescriptor>';
  assert.deepStrictEqual(L.checkMetadataXml(ok), []);
  assert.ok(L.checkMetadataXml('<html>sign in</html>').length >= 3);
});

test('odata escaping doubles single quotes; app name validated', () => {
  assert.strictEqual(L.odataEscape("O'Brien"), "O''Brien");
  assert.ok(L.validateAppName(''));
  assert.strictEqual(L.validateAppName('Workflow apps'), null);
});

test('group body is a cloud-only security group with a valid mail nickname', () => {
  const g = L.groupBody('Workflow Apps - Users');
  assert.strictEqual(g.securityEnabled, true);
  assert.strictEqual(g.mailEnabled, false);
  assert.strictEqual(g.mailNickname, 'WorkflowAppsUsers');
  assert.strictEqual(g.displayName, 'Workflow Apps - Users');
  assert.ok(L.groupBody('!!!').mailNickname.length > 0);
});

test('role check matches active Entra roles only by exact name', () => {
  assert.strictEqual(L.hasRole(['Cloud Application Administrator'], L.APP_ADMIN_ROLES), true);
  assert.strictEqual(L.hasRole(['Application Developer'], L.APP_ADMIN_ROLES), false);
  assert.strictEqual(L.hasRole([], L.GROUP_ADMIN_ROLES), false);
  assert.strictEqual(L.hasRole(['Groups Administrator'], L.GROUP_ADMIN_ROLES), true);
});
