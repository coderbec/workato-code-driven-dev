#!/usr/bin/env node
// Makes an MCP app HTML file self-contained for Microsoft 365 Copilot.
//  - inlines the @modelcontextprotocol/ext-apps library (fetched from jsdelivr) so there is no external script
//  - removes Google Fonts <link> tags (the page falls back to its font stack)
//  - rewrites `await import(<URL const>)` to read the inlined library
// Usage: node inline-ext-apps.js <in.html> <out.html> [--version 1.3.1]
// The input must load the library with a dynamic import of a URL containing "ext-apps", as the
// Workato MCP app template does. Anything else is reported, not guessed.
const fs = require('node:fs');

async function main() {
  const args = process.argv.slice(2);
  const [inFile, outFile] = args.filter((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--version');
  const vi = args.indexOf('--version');
  const version = vi >= 0 ? args[vi + 1] : '1.3.1';
  if (!inFile || !outFile) throw new Error('usage: inline-ext-apps.js <in.html> <out.html> [--version X.Y.Z]');

  let html = fs.readFileSync(inFile, 'utf8');
  const url = `https://cdn.jsdelivr.net/npm/@modelcontextprotocol/ext-apps@${version}/dist/src/app-with-deps.js`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`could not fetch ${url}: ${res.status}`);
  const lib = (await res.text()).trim();
  if (/<\/script/i.test(lib)) throw new Error('library text contains </script>; cannot inline safely');

  const m = lib.match(/export\s*\{([^}]*)\}\s*;?\s*$/);
  if (!m) throw new Error('library has no trailing export{} statement; format changed, inline by hand');
  const appExport = m[1].split(',').map((s) => s.trim()).find((s) => /\bas App$/.test(s));
  if (!appExport) throw new Error('library does not export App');
  const local = appExport.split(/\s+as\s+/)[0];
  const body = lib.slice(0, m.index);

  const importRe = /\(\{\s*App\s*\}\s*=\s*await import\(\s*[A-Za-z_$][\w$]*\s*\)\s*\);?/;
  if (!importRe.test(html)) throw new Error('did not find `({ App } = await import(URL_CONST))` in the page');
  html = html.replace(importRe, "App = window.__ExtApps && window.__ExtApps.App;\n        if (!App) throw new Error('inlined MCP Apps library missing');");
  html = html.replace(/The MCP Apps library did not load\. Add https:\/\/cdn\.jsdelivr\.net to the app\\'s resource domains in Workato\./g, 'The MCP Apps library did not load.');
  html = html.replace(/\n\s*const\s+EXT_APPS_URL\s*=\s*\n?\s*'[^']*';\n/, '\n');
  html = html.replace(/\s*<link rel="preconnect"[^>]*fonts\.g[^>]*>/g, '');
  html = html.replace(/\s*<link href="https:\/\/fonts\.googleapis\.com[^>]*>/g, '');

  const inline = `<script type="module">\n/* @modelcontextprotocol/ext-apps ${version} inlined: the page has no external script. */\n${body}\nwindow.__ExtApps={App:${local}};\n</script>\n`;
  const at = html.indexOf('<script type="module">');
  if (at < 0) throw new Error('no <script type="module"> in the page to insert before');
  html = html.slice(0, at) + inline + html.slice(at);

  fs.writeFileSync(outFile, html);
  const external = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((x) => x[1]);
  console.log(`wrote ${outFile} (${html.length} bytes)`);
  if (external.length) console.log('remaining external src/href (check each is allowed):\n  ' + external.join('\n  '));
}

main().catch((e) => { console.error(e.message); process.exit(1); });
