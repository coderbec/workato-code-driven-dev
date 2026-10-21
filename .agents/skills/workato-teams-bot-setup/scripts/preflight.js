#!/usr/bin/env node
/** Step 1: everything the Teams bot setup needs. Read-only. Exit 0 = ready, 1 = something to fix. */
const { exec, teams, parseJsonOutput, dataCentreFromMcpConfig } = require('./lib');

const rows = [];
const check = (name, ok, detail) => rows.push({ name, ok, detail });

const [maj, min] = process.versions.node.split('.').map(Number);
check('Node 22.12+', maj > 22 || (maj === 22 && min >= 12), `found ${process.versions.node}`);

const v = exec('teams', ['--version']);
check('Teams Developer CLI', v.ok, v.ok ? `teams ${v.stdout.trim()}` : 'missing. Install: npm install -g @microsoft/teams.cli');

if (v.ok) {
  const s = teams(['status', '--json']);
  let st = null;
  try { st = parseJsonOutput(s.stdout); } catch { /* not logged in */ }
  const loggedIn = !!st && s.ok;
  check('Teams CLI signed in', loggedIn, loggedIn ? 'yes' : 'run: teams login   (or teams login --device-code)');
  if (loggedIn) {
    const sideload = JSON.stringify(st).toLowerCase();
    const enabled = /sideloading"?\s*:\s*("?enabled"?|true)/.test(sideload);
    check('Custom app upload (sideloading) enabled', enabled, enabled ? 'enabled' : 'disabled: a tenant admin must enable custom app upload first');
  }
}

const az = exec('az', ['account', 'show', '--query', 'user.name', '-o', 'tsv']);
check('Azure CLI signed in', az.ok, az.ok ? az.stdout.trim() : 'run: az login (needed to set the Entra redirect URI)');

check('WORKATO_CODE_DEV set', !!(process.env.WORKATO_CODE_DEV || '').trim(), 'the Workato API token variable from "start workato setup"');
const dc = dataCentreFromMcpConfig();
check('Data centre known', !!dc, dc ? `"${dc}" (from .mcp.json)` : 'run "start workato setup" first so .mcp.json exists');

for (const r of rows) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name} - ${r.detail}`);
const ok = rows.every((r) => r.ok);
console.log(ok ? '\nREADY' : '\nNOT READY: fix the FAIL lines above, then rerun.');
process.exit(ok ? 0 : 1);
