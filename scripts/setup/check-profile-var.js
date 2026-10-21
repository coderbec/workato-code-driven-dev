#!/usr/bin/env node
/** Step 1: is WORKATO_CODE_DEV set? Prints PASS/FAIL, never the value. Exit 0 = set, 1 = missing. */
const { PROFILE_VAR } = require('../lib/wk');

const value = process.env[PROFILE_VAR];
if (value && value.trim() && !value.includes('${')) {
  console.log(`PASS: ${PROFILE_VAR} is set (${value.trim().length} characters).`);
  process.exit(0);
}
console.log(`FAIL: ${PROFILE_VAR} is not set in this session's environment.`);
process.exit(1);
