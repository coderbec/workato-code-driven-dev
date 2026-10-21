/** Small helpers around the wk CLI, shared by the setup and hydrate scripts. No secrets are read from files. */
const { spawnSync } = require('child_process');

const PROFILE_VAR = 'WORKATO_CODE_DEV';
const PROFILE_PREFIX = 'workato-code-dev';

function run(cmd, args, opts = {}) {
  // shell:true on Windows so .cmd/.exe shims (scoop, npm) resolve; args are fixed strings, not user input
  const r = spawnSync(cmd, args, { encoding: 'utf-8', shell: process.platform === 'win32', ...opts });
  return { ok: r.status === 0, status: r.status, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error };
}

function hasCommand(cmd) {
  return run(process.platform === 'win32' ? 'where' : 'which', [cmd]).ok;
}

function listProfiles() {
  const r = run('wk', ['auth', 'list', '--json']);
  if (!r.ok) return [];
  try { return JSON.parse(r.stdout); } catch { return []; }
}

/** Next unused name: workato-code-dev-1, -2, ... */
function nextProfileName(profiles = listProfiles()) {
  const taken = new Set(profiles.map((p) => p.NAME));
  let n = 1;
  while (taken.has(`${PROFILE_PREFIX}-${n}`)) n += 1;
  return `${PROFILE_PREFIX}-${n}`;
}

/** Name of the active wk profile, or null. Used instead of any stored setting. */
function activeProfile() {
  const p = listProfiles().find((x) => x.ACTIVE === '*');
  return p ? p.NAME : null;
}

module.exports = { PROFILE_VAR, PROFILE_PREFIX, run, hasCommand, listProfiles, nextProfileName, activeProfile };
