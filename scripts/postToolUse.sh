#!/usr/bin/env bash
# Called by Claude Code PostToolUse hook on Write|Edit.
# Reads tool JSON from stdin, then runs:
#   1. Biome format/lint on the file
#   2. Colocated-tests check (if .ts file touched)
#   3. Typecheck on the affected workspace

set -o pipefail

f=$(jq -r '.tool_response.filePath // .tool_input.file_path')
[ -z "$f" ] && exit 0

# 1. Biome lint/format
bun run lint:file "$f" 2>/dev/null || true

# 2. Colocated-tests — only for .ts files in apps/ or packages/
case "$f" in
  */apps/* | */packages/*)
    if [[ "$f" == *.test.ts ]]; then
      src="${f%.test.ts}.ts"
      if [ ! -f "$src" ]; then
        echo '{"systemMessage":"⚠ Orphaned test: no matching source file for '"$f"'"}'
        exit 0
      fi
    elif [[ "$f" == *.ts && ! "$f" == *.test.ts && ! "$f" == *.d.ts ]]; then
      test_file="${f%.ts}.test.ts"
      if [ ! -f "$test_file" ]; then
        echo '{"systemMessage":"Note: '"$f"' has no colocated test file"}'
      fi
    fi
    ;;
esac

# 3. Typecheck the affected workspace
case "$f" in
  */apps/backend/*)   turbo typecheck --filter=backend   2>/dev/null || true ;;
  */apps/frontend/*)  turbo typecheck --filter=frontend  2>/dev/null || true ;;
esac
