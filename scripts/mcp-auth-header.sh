#!/usr/bin/env bash
# Prints the Authorization header for Workato MCP servers as JSON (Claude Code "headersHelper").
# Token source order: shell env WORKATO_API_TOKEN, then WORKATO_API_TOKEN in <repo>/.env.
# Needed because GUI/IDE-launched Claude Code does not inherit your shell profile.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
token="${WORKATO_API_TOKEN:-}"
if [ -z "$token" ] && [ -f "$root/.env" ]; then
  token="$(grep -E '^WORKATO_API_TOKEN=' "$root/.env" | tail -1 | cut -d= -f2- | sed -E 's/^["'\'']//; s/["'\'']$//')"
fi
if [ -z "$token" ] || [[ "$token" == \$\{* ]]; then
  echo "WORKATO_API_TOKEN is not set (shell env or $root/.env)" >&2
  exit 1
fi
printf '{"Authorization":"Bearer %s"}\n' "$token"
