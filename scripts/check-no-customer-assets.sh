#!/usr/bin/env bash
# Fails if customer-specific Workato material is staged or tracked.
#
# This repo is public and holds only reusable tooling and skills. Anything pulled
# from a Workato workspace (recipes, connections, wk metadata, ...) belongs to a
# customer and must never be committed. .gitignore is the first line of defence;
# this script catches what `git add -f` or a stray pattern lets through.
#
#   scripts/check-no-customer-assets.sh staged    # pre-commit hook (default)
#   scripts/check-no-customer-assets.sh tracked   # CI: every tracked file
set -euo pipefail

mode="${1:-staged}"
self="scripts/check-no-customer-assets.sh"

case "$mode" in
  staged)  files=$(git diff --cached --name-only --diff-filter=ACMR) ;;
  tracked) files=$(git ls-files) ;;
  *) echo "usage: $0 [staged|tracked]" >&2; exit 2 ;;
esac

# Path patterns (extended regex). Edit here to widen the guard.
path_re='^recipes/|^Workspace Projects/|(^|/)\.wk/|(^|/)wk\.toml$|(^|/)\.workato/|^packages/|(^|/)\.mcp\.json$|\.(recipe|connection|decision_engine_model|mcp_server|topic|workato_db_table|custom_adapter|agentic_[a-z_]+)\.(json|rb|png|jpe?g)$'
# Content patterns for added lines (customer / person identifiers). They are NOT
# kept in this public repo: put one extended regex per line in the untracked file
# .git/customer-patterns (or point GUARD_PATTERNS_FILE elsewhere).
patterns_file="${GUARD_PATTERNS_FILE:-$(git rev-parse --git-dir)/customer-patterns}"
content_re=""
if [ -s "$patterns_file" ]; then
  content_re=$(grep -vE '^\s*(#|$)' "$patterns_file" | paste -sd '|' -)
fi

bad=$(printf '%s\n' "$files" | grep -E "$path_re" || true)

bad_content=""
if [ "$mode" = "staged" ] && [ -n "$content_re" ]; then
  bad_content=$(git diff --cached -U0 --diff-filter=ACMR -- . ":(exclude)$self" \
    | grep -E '^\+[^+]' | grep -iE "$content_re" || true)
fi

if [ -n "$bad" ] || [ -n "$bad_content" ]; then
  echo "BLOCKED: customer-specific material must not be committed to this repo." >&2
  if [ -n "$bad" ]; then
    echo "" >&2; echo "Files:" >&2; printf '%s\n' "$bad" | sed 's/^/  /' >&2
    echo "" >&2; echo "Unstage with: git restore --staged <file>   (or git rm --cached <file>)" >&2
  fi
  if [ -n "$bad_content" ]; then
    echo "" >&2; echo "Added lines containing customer or personal identifiers:" >&2
    printf '  %s\n' "$bad_content" | cut -c1-140 >&2
  fi
  exit 1
fi
echo "ok: no customer-specific files in $mode set"
