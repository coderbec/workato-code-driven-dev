#!/usr/bin/env node
// Prints the Microsoft 365 Copilot widget host for an MCP server.
// Copilot renders MCP app widgets on https://<hash>.widget-renderer.usercontent.microsoft where
// <hash> is the first 32 hex characters of SHA-256 of the MCP server's bare host name.
// Usage: node widget-host.js https://1234.apim.mcp.au.workato.com   (or just the host)
const crypto = require('node:crypto');

function widgetHost(input) {
  if (!input) throw new Error('give the MCP server URL or host');
  const host = input.includes('://') ? new URL(input).hostname : input.split('/')[0];
  const hash = crypto.createHash('sha256').update(host.toLowerCase()).digest('hex').slice(0, 32);
  return { host: host.toLowerCase(), hash, widgetHost: `https://${hash}.widget-renderer.usercontent.microsoft` };
}

module.exports = { widgetHost };

if (require.main === module) {
  try {
    const r = widgetHost(process.argv[2]);
    console.log(JSON.stringify(r, null, 2));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
