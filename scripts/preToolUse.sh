#!/usr/bin/env bash
# Called by Claude Code PreToolUse hook on Write|Edit.
# Reads tool JSON from stdin, blocks edits to protected paths.

f=$(jq -r '.tool_input.file_path')
[ -z "$f" ] && exit 0

# Block edits to api-contract — it's auto-derived from backend AppType
case "$f" in
  */packages/api-contract/*)
    echo '{"decision":"block","reason":"api-contract is auto-derived from backend AppType — never edit it manually. Change the backend routes instead."}'
    ;;
esac
