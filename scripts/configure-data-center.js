#!/usr/bin/env node

/**
 * Choose your Workato data centre and point every config at the right URLs.
 *
 * Writes WORKATO_DATA_CENTER, WORKATO_REGION and WORKATO_API_ENDPOINT to .env and rewrites the MCP
 * server URLs for Claude Code, Claude Desktop, Cursor, OpenCode and generic MCP clients.
 *
 * Usage:
 *   npm run setup:data-center                 # interactive prompt
 *   npm run setup:data-center -- --dc eu      # non-interactive
 *   WORKATO_DATA_CENTER=au npm run setup:data-center
 */

const path = require('path');
const readline = require('readline');
const {
  DATA_CENTERS, urlsFor, applyDataCenter, currentDataCenter,
} = require('./lib/data-centers');

const ROOT = path.resolve(__dirname, '..');

function parseDcFlag(argv) {
  const i = argv.findIndex((a) => a === '--dc' || a.startsWith('--dc='));
  if (i === -1) return null;
  return argv[i].includes('=') ? argv[i].split('=')[1] : argv[i + 1];
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => { rl.close(); resolve(answer.trim()); }));
}

async function promptForDataCenter(current) {
  const codes = Object.keys(DATA_CENTERS);
  console.log('\nWhich Workato data centre is your workspace in?');
  console.log('(Check the URL you log in at, or Workspace Admin. Tokens only work in their own data centre.)\n');
  codes.forEach((code, i) => {
    const { label, apiHost } = DATA_CENTERS[code];
    const mark = code === current ? '  <- current' : '';
    console.log(`  ${String(i + 1).padStart(2)}. ${code.padEnd(5)} ${label.padEnd(28)} ${apiHost}${mark}`);
  });
  console.log('\n  The China (cn) data centre is not supported (no MCP or Platform CLI).\n');

  for (;;) {
    const hint = current ? ` [${current}]` : '';
    const answer = (await ask(`Enter a number or code${hint}: `)) || current || '';
    const byNumber = codes[Number(answer) - 1];
    const choice = byNumber || answer.toLowerCase();
    try {
      return urlsFor(choice).dc;
    } catch (err) {
      console.log(`  ${err.message}`);
    }
  }
}

/**
 * Resolve the data centre (flag > env > prompt) and apply it.
 * @param {{interactive?: boolean, argv?: string[]}} opts
 */
async function configureDataCenter({ argv = process.argv.slice(2), askToKeep = false } = {}) {
  const current = currentDataCenter(ROOT);
  let dc = parseDcFlag(argv) || process.env.WORKATO_DATA_CENTER || null;

  if (!dc) {
    if (!process.stdin.isTTY) {
      if (current) {
        console.log(`Data centre: keeping "${current}" (non-interactive).`);
        dc = current;
      } else {
        console.error('No data centre set and no terminal to ask in.\n'
          + 'Re-run with --dc <code> or WORKATO_DATA_CENTER=<code>. Options: ' + Object.keys(DATA_CENTERS).join(', '));
        process.exit(1);
      }
    } else if (current && askToKeep) {
      const keep = (await ask(`Data centre is currently "${current}" (${DATA_CENTERS[current].label}). Keep it? [Y/n] `)).toLowerCase();
      dc = keep === '' || keep === 'y' || keep === 'yes' ? current : await promptForDataCenter(current);
    } else {
      dc = await promptForDataCenter(current);
    }
  }

  let result;
  try {
    result = applyDataCenter(ROOT, dc);
  } catch (err) {
    console.error(`\n❌ ${err.message}`);
    process.exit(1);
  }

  const { urls, changed, missing } = result;
  console.log(`\n✅ Data centre: ${urls.dc} (${DATA_CENTERS[urls.dc].label})`);
  console.log(`   Developer API : ${urls.apiEndpoint}/api`);
  console.log(`   Developer MCP : ${urls.developerApiMcp}`);
  console.log(`   AIRO MCP      : ${urls.airoMcp}`);
  console.log(`   .env updated  : WORKATO_DATA_CENTER, WORKATO_REGION, WORKATO_API_ENDPOINT`);
  console.log(changed.length
    ? `   Rewrote MCP URLs in: ${changed.join(', ')}`
    : '   MCP config files already point at this data centre.');
  if (missing.length) console.log(`   (skipped, not found: ${missing.join(', ')})`);
  console.log('\n   Restart your agent (Claude Code, Cursor, OpenCode...) to pick up the new URLs.');
  console.log('   Then create the wk profile for this data centre: npm run wk:auth\n');
  return urls;
}

if (require.main === module) {
  configureDataCenter({ askToKeep: false });
}

module.exports = { configureDataCenter };
