/**
 * Helpers for the Workflow apps <-> Microsoft Entra SAML SSO setup scripts.
 * Everything here is pure except exec/graph, which shell out to the Azure CLI. No secrets are involved:
 * SAML SSO exchanges public metadata only, so nothing is written to disk apart from a temp request body.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const GRAPH = 'https://graph.microsoft.com/v1.0';
// Graph's "Custom" (non-gallery) application template: the API equivalent of "Create your own application".
const NON_GALLERY_TEMPLATE_ID = '8adf8e6e-67b2-4cf2-a259-e3dc5476c621';
const USER_NAME_CLAIM = 'workato_app_user_name';
const GROUPS_CLAIM = 'workato_app_user_groups';
const DEFAULT_ACCESS_ROLE = '00000000-0000-0000-0000-000000000000';

// Entra directory roles that may create/configure enterprise apps, and create/assign groups.
const APP_ADMIN_ROLES = ['Global Administrator', 'Application Administrator', 'Cloud Application Administrator'];
const GROUP_ADMIN_ROLES = ['Global Administrator', 'Groups Administrator', 'User Administrator'];
const hasRole = (have, want) => (have || []).some((r) => want.includes(r));

/** Accepts `acme.workato.app`, `https://acme.workato.app/` or a custom domain; returns the two SAML values or an error. */
function samlUrls(raw) {
  let host = String(raw || '').trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
  if (!/^(?=.{4,253}$)([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(host)) return { error: 'Not a valid host. Use the portal address, e.g. acme.workato.app or sso.acme.com.' };
  if (/^(www|app)\.([a-z]+\.)?workato\.com$/.test(host)) return { error: 'That is the Workato platform host, not the Workflow apps portal. The portal is <subdomain>.workato.app or your custom domain.' };
  return { host, acs: `https://${host}/portal/sso/saml/acs`, entityId: `https://${host}/portal/sso/saml/metadata` };
}

function validateAppName(n) { return n && n.length <= 120 && !/[\r\n]/.test(n) ? null : 'App name: required, 120 characters or fewer.'; }

const metadataUrl = (tenantId, appId) => `https://login.microsoftonline.com/${tenantId}/federationmetadata/2007-06/federationmetadata.xml?appid=${appId}`;

/** Claims mapping policy that adds workato_app_user_name = user.displayname (Workato docs Part 2, step 11). */
function claimsPolicyDefinition() {
  return JSON.stringify({
    ClaimsMappingPolicy: {
      Version: 1,
      IncludeBasicClaimSet: 'true',
      ClaimsSchema: [{ Source: 'user', ID: 'displayname', SamlClaimType: USER_NAME_CLAIM }],
    },
  });
}

/** PATCH body for the application object: SAML identifiers, mapped-claims acceptance and (optionally) the group claim. */
function applicationPatch(urls, groupSync) {
  const body = { identifierUris: [urls.entityId], web: { redirectUris: [urls.acs] }, api: { acceptMappedClaims: true } };
  if (groupSync) body.groupMembershipClaims = 'ApplicationGroup';
  return body;
}

/** Pick the app role to assign users with: an enabled User role, else the "Default Access" id. */
function pickAccessRole(appRoles) {
  const r = (appRoles || []).find((x) => x.isEnabled && (x.allowedMemberTypes || []).includes('User'));
  return r ? r.id : DEFAULT_ACCESS_ROLE;
}

/** Sanity-check Entra's federation metadata XML. Returns a list of problems; empty = looks right. */
function checkMetadataXml(xml) {
  const p = [];
  if (!/<EntityDescriptor[\s>]/.test(xml)) p.push('not a SAML EntityDescriptor document');
  if (!/<IDPSSODescriptor[\s>]/.test(xml)) p.push('no IDPSSODescriptor (Entra did not return identity provider metadata)');
  if (!/<SingleSignOnService[\s]/.test(xml)) p.push('no SingleSignOnService endpoint');
  if (!/<X509Certificate>/.test(xml)) p.push('no signing certificate');
  return p;
}

/** Body for a cloud-only security group (not mail-enabled, not on-prem synced, so its display name is emitted by the group claim). */
function groupBody(displayName) {
  const nick = displayName.replace(/[^A-Za-z0-9]/g, '').slice(0, 60) || 'workatogroup';
  return { displayName, description: 'Workato Workflow apps portal users (SAML SSO)', mailEnabled: false, mailNickname: nick, securityEnabled: true };
}

const odataEscape = (s) => String(s).replace(/'/g, "''");

function exec(cmd, args, opts = {}) {
  const win = process.platform === 'win32';
  const q = (a) => (/^[A-Za-z0-9_\-./:=,@$]+$/.test(a) ? a : `"${String(a).replace(/"/g, '\\"')}"`);
  const r = win ? spawnSync([cmd, ...args.map(q)].join(' '), { encoding: 'utf-8', shell: true, ...opts })
    : spawnSync(cmd, args, { encoding: 'utf-8', ...opts });
  return { ok: r.status === 0, status: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}

/** Microsoft Graph call through the Azure CLI's signed-in token. Returns parsed JSON (or null for empty bodies); throws with the Graph error. */
function graph(method, urlPath, body) {
  const args = ['rest', '--method', method, '--url', urlPath.startsWith('http') ? urlPath : GRAPH + urlPath, '--only-show-errors'];
  let tmp;
  if (body !== undefined) {
    tmp = path.join(os.tmpdir(), `entra-sso-${process.pid}-${Date.now()}.json`);
    fs.writeFileSync(tmp, JSON.stringify(body));
    args.push('--headers', 'Content-Type=application/json', '--body', `@${tmp}`);
  }
  try {
    const r = exec('az', args);
    if (!r.ok) throw new Error((r.stderr || r.stdout).trim().split('\n').filter(Boolean).slice(-2).join(' ').slice(0, 400));
    return r.stdout.trim() ? JSON.parse(r.stdout) : null;
  } finally { if (tmp) fs.rmSync(tmp, { force: true }); }
}

module.exports = {
  GRAPH, APP_ADMIN_ROLES, GROUP_ADMIN_ROLES, hasRole, NON_GALLERY_TEMPLATE_ID, USER_NAME_CLAIM, GROUPS_CLAIM, DEFAULT_ACCESS_ROLE,
  samlUrls, validateAppName, metadataUrl, claimsPolicyDefinition, applicationPatch, pickAccessRole,
  checkMetadataXml, groupBody, odataEscape, exec, graph,
};
