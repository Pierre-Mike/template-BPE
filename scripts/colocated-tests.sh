#!/usr/bin/env bash
set -euo pipefail

found=0
while IFS= read -r f; do
  src="${f%.test.ts}.ts"
  if [ ! -f "$src" ]; then
    echo "Orphaned test: $f"
    found=1
  fi
done < <(find apps packages -name "*.test.ts")
exit $found
