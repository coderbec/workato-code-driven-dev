#!/usr/bin/env node
/**
 * Step 5: create a NEW wk auth profile from WORKATO_CODE_DEV and make it the default.
 * Never overwrites an existing profile: picks workato-code-dev-N with the next free N.
 * Usage: node scripts/setup/wk-profile.js --dc eu
 */
const { PROFILE_VAR, run, hasCommand, listProfiles, nextProfileName } = require('../lib/wk');
const { wkRegionArgs } = require('../lib/data-centers');

const i = process.argv.indexOf('--dc');
const dc = i > -1 ? process.argv[i + 1] : null;
const token = (process.env[PROFILE_VAR] || '').trim();
if (!dc) { console.error('Usage: node scripts/setup/wk-profile.js --dc <code>'); process.exit(2); }
if (!token) { console.error(`FAIL: ${PROFILE_VAR} is not set.`); process.exit(1); }
if (!hasCommand('wk')) { console.error('FAIL: wk CLI is not installed (step 4).'); process.exit(1); }

const existing = listProfiles();
const name = nextProfileName(existing);
console.log(`Existing wk profiles: ${existing.length ? existing.map((p) => p.NAME).join(', ') : 'none'}`);
console.log(`Creating new profile "${name}" ...`);

// wk only accepts the token as a flag in non-interactive mode, so it is briefly visible to local process listings.
const login = run('wk', ['auth', 'login', '--token', token, '--environment', 'dev', ...wkRegionArgs(dc), '--name', name, '--no-input']);
if (!login.ok) { console.error(`FAIL: wk auth login: ${(login.stderr || login.stdout).replaceAll(token, '***').trim()}`); process.exit(1); }

const sw = run('wk', ['auth', 'switch', name]);
if (!sw.ok) { console.error(`FAIL: wk auth switch: ${(sw.stderr || sw.stdout).trim()}`); process.exit(1); }

const status = run('wk', ['auth', 'status']);
console.log(status.stdout.trim() || status.stderr.trim());
console.log(`PASS: "${name}" created and set as the default wk profile.`);
