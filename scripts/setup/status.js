#!/usr/bin/env node
/**
 * Where is the guided setup up to? Read-only; prints one line per check and never any secret.
 * The skill runs this first so a re-run (for example after restarting Claude) resumes at the right step.
 */
const fs = require('fs');
const path = require('path');
const { PROFILE_VAR, hasCommand, listProfiles, PROFILE_PREFIX } = require('../lib/wk');
const { detectFromUrl, MCP_OUTPUT } = require('../lib/data-centers');

const root = path.resolve(__dirname, '..', '..');
const out = [];
const line = (key, ok, detail = '') => out.push(`${ok ? 'DONE   ' : 'PENDING'} ${key}${detail ? ` - ${detail}` : ''}`);

const varSet = !!(process.env[PROFILE_VAR] || '').trim();
line('profile-variable', varSet, varSet ? `${PROFILE_VAR} is set` : `${PROFILE_VAR} is not set`);

let dc = null;
try {
  const raw = fs.readFileSync(path.join(root, MCP_OUTPUT), 'utf-8');
  if (!raw.includes('${' + PROFILE_VAR + '}')) throw new Error('old-style config'); // stale file from before the redesign
  const cfg = JSON.parse(raw);
  const urls = Object.values(cfg.mcpServers || {}).map((s) => s.url);
  dc = urls.length ? detectFromUrl(urls[0]) : null;
} catch { /* no generated config yet, or a stale pre-redesign one */ }
line('mcp-config', !!dc, dc ? `.mcp.json written for data centre "${dc}"` : '.mcp.json not generated');

const wk = hasCommand('wk');
line('wk-cli', wk, wk ? 'installed' : 'not installed');

const mine = wk ? listProfiles().filter((p) => String(p.NAME).startsWith(`${PROFILE_PREFIX}-`)) : [];
const active = mine.find((p) => p.ACTIVE === '*');
line('wk-profile', !!active, active ? `active profile ${active.NAME}` : mine.length ? `profiles ${mine.map((p) => p.NAME).join(', ')} exist but none is active` : 'no workato-code-dev-N profile');

const ready = varSet && dc && wk && active;
console.log(out.join('\n'));
console.log(`\nPRE-RESTART STEPS: ${ready ? 'ALL DONE. Next: the restart, then check the MCP servers (cannot be verified from a script; the MCP tools only appear after Claude restarts).' : 'incomplete'}`);
