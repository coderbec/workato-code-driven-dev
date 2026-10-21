#!/usr/bin/env node
/**
 * Setup is guided by Claude Code, not by this script.
 * This prints how to start it and checks the one prerequisite that must exist before Claude starts.
 */
const { PROFILE_VAR } = require('./lib/wk');

const set = !!(process.env[PROFILE_VAR] || '').trim();
console.log(`
Workato Code-Driven Development setup is guided by Claude Code.

  1. Open this folder in a terminal (VS Code's terminal is fine) and run:  claude
  2. Type:  start workato setup      (or the slash command  /workato-setup)

Prerequisite: the ${PROFILE_VAR} variable (your Workato API token) must exist in your
OS profile before Claude starts. Currently: ${set ? 'SET' : 'NOT SET (the guided setup will show you how)'}.
`);
