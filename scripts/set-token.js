#!/usr/bin/env node

/**
 * One command to change your Workato API token.
 *
 *   npm run setup:token                      # hidden prompt
 *   pbpaste | npm run setup:token -- --stdin # from the clipboard (macOS), nothing echoed
 *   npm run setup:token -- --token <token>   # visible in shell history; prefer the two above
 *   npm run setup:token -- --force           # save even if the live check fails
 *   npm run setup:token -- --no-wk           # skip refreshing the wk CLI profile
 *
 * It (1) checks the token against your data centre's MCP endpoints, (2) saves it to .env as
 * WORKATO_API_TOKEN (the single place Claude Code, scripts and wk read it from), and (3) refreshes the
 * wk profile named in WORKATO_PROFILE. Restart or `/mcp` reconnect your agent afterwards.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execFileSync } = require('child_process');
const { urlsFor, currentDataCenter, upsertEnv } = require('./lib/data-centers');

const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');

function readEnvValue(key) {
  if (!fs.existsSync(ENV_PATH)) return null;
  const m = fs.readFileSync(ENV_PATH, 'utf-8').match(new RegExp(`^${key}=(.*)$`, 'm'));
  return m ? m[1].trim() : null;
}

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (c) => { data += c; });
    process.stdin.on('end', () => resolve(data));
  });
}

function promptHidden(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf-8');
    let value = '';
    const onData = (ch) => {
      for (const c of ch) {
        if (c === '\r' || c === '\n' || c === '\u0004') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          return resolve(value);
        }
        if (c === '\u0003') { process.stdout.write('\n'); process.exit(130); }
        if (c === '\u007f' || c === '\b') value = value.slice(0, -1);
        else value += c;
      }
    };
    stdin.on('data', onData);
  });
}

/** POST an MCP `initialize` and return the HTTP status (200 = token accepted). */
function checkEndpoint(url, token) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'initialize',
      params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'set-token', version: '1' } },
    });
    const req = https.request(url, {
      method: 'POST',
      timeout: 20000,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => { res.resume(); resolve(res.statusCode); });
    req.on('timeout', () => { req.destroy(); resolve('timeout'); });
    req.on('error', (e) => resolve(`error: ${e.code || e.message}`));
    req.end(body);
  });
}

async function main() {
  const argv = process.argv.slice(2);
  const flag = (name) => argv.includes(name);
  const tokenArg = (() => {
    const i = argv.findIndex((a) => a === '--token' || a.startsWith('--token='));
    if (i === -1) return null;
    return argv[i].includes('=') ? argv[i].split('=').slice(1).join('=') : argv[i + 1];
  })();

  let token = tokenArg;
  if (!token && (flag('--stdin') || !process.stdin.isTTY)) token = await readStdin();
  if (!token) token = await promptHidden('Paste your new Workato API token (input hidden): ');
  token = (token || '').trim();

  if (!token) { console.error('❌ No token provided.'); process.exit(1); }
  if (/\s/.test(token)) { console.error('❌ The token contains whitespace. Paste it as one line.'); process.exit(1); }
  if (!/^wrk/.test(token)) console.warn('⚠️  Token does not start with "wrk" (Workato tokens usually look like wrkprod-… / wrkaus-…).');

  const dc = currentDataCenter(ROOT) || 'us';
  const urls = urlsFor(dc);
  console.log(`\nChecking the token against the "${dc}" data centre (${urls.developerApiMcp.replace(/\/mcp$/, '')})…`);
  const [devStatus, airoStatus] = await Promise.all([
    checkEndpoint(urls.developerApiMcp, token),
    checkEndpoint(urls.airoMcp, token),
  ]);
  console.log(`   Developer API MCP: ${devStatus}`);
  console.log(`   AIRO MCP         : ${airoStatus}`);

  const ok = devStatus === 200 && airoStatus === 200;
  if (!ok && !flag('--force')) {
    console.error('\n❌ The token was not accepted, so .env was NOT changed.');
    console.error('   401 = wrong token or wrong data centre (change it with `npm run setup:data-center`).');
    console.error('   Use --force to save it anyway.');
    process.exit(1);
  }

  upsertEnv(ENV_PATH, { WORKATO_API_TOKEN: token });
  console.log(`\n✅ Saved WORKATO_API_TOKEN to .env${ok ? '' : ' (unverified, --force)'}`);

  const wkLine = readEnvValue('WK_API_TOKEN');
  if (wkLine !== null && /^wrk/.test(wkLine)) { upsertEnv(ENV_PATH, { WK_API_TOKEN: token }); }

  const profile = readEnvValue('WORKATO_PROFILE');
  if (flag('--no-wk')) {
    console.log('   Skipped the wk profile (--no-wk).');
  } else if (profile && ok) {
    try {
      execFileSync('wk', ['auth', 'login', '--token', token, '--environment', 'dev', '--region', urls.region,
        '--name', profile, '--force', '--no-input'], { stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 });
      console.log(`✅ Refreshed the wk profile "${profile}"`);
    } catch (e) {
      console.warn(`⚠️  Could not refresh the wk profile "${profile}": ${(e.stderr || e.message).toString().trim().split('\n')[0]}`);
      console.warn('   Run `npm run wk:auth` to create it.');
    }
  } else {
    console.log('   No wk profile to refresh. Create one with: npm run wk:auth');
  }

  console.log('\nNext: restart your agent, or run /mcp to reconnect. Claude Code reads the token from .env on each connect.\n');
}

main().catch((err) => { console.error(`❌ ${err.message}`); process.exit(1); });
