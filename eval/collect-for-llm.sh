#!/usr/bin/env bash
# Collects all todo-related source files and formats them for the LLM judge.
# Pipe the output into a conversation along with judge-llm.md.
#
# Usage: ./bench/collect-for-llm.sh > /tmp/todo-code-for-judge.md

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/apps/backend/src/backend"
FRONTEND="$ROOT/apps/frontend/src"

echo "# Code Submission for LLM Judge"
echo ""
echo "Collected: $(date +%Y-%m-%d\ %H:%M:%S)"
echo ""

# Collect backend todo files
for f in $(find "$BACKEND" -name "*todo*" -o -name "*Todo*" | sort); do
  rel="${f#$ROOT/}"
  echo "## \`$rel\`"
  echo ""
  echo '```ts'
  cat "$f"
  echo '```'
  echo ""
done

# Collect api.ts (to check registry)
api="$BACKEND/shell/api.ts"
if [ -f "$api" ]; then
  echo "## \`apps/backend/src/backend/shell/api.ts\`"
  echo ""
  echo '```ts'
  cat "$api"
  echo '```'
  echo ""
fi

# Collect frontend todo pages
for f in $(find "$FRONTEND" -path "*/todos/*" 2>/dev/null | sort); do
  rel="${f#$ROOT/}"
  echo "## \`$rel\`"
  echo ""
  echo '```astro'
  cat "$f"
  echo '```'
  echo ""
done

# Collect frontend api client
api_client="$FRONTEND/api.ts"
if [ -f "$api_client" ]; then
  echo "## \`apps/frontend/src/api.ts\`"
  echo ""
  echo '```ts'
  cat "$api_client"
  echo '```'
  echo ""
fi

echo "---"
echo "End of code submission."
