#!/usr/bin/env bash
# Mechanical judge for template-BPE benchmark
# Runs deterministic checks and outputs pass/fail results
#
# Usage: ./bench/judge-mechanical.sh [project-root]

set -euo pipefail

ROOT="${1:-$(cd "$(dirname "$0")/.." && pwd)}"
BACKEND="$ROOT/apps/backend/src/backend"
FRONTEND="$ROOT/apps/frontend/src"
RESULTS_DIR="$ROOT/bench/results"
REPORT="$RESULTS_DIR/mechanical-$(date +%Y%m%d-%H%M%S).md"

passed=0
failed=0
total=0
results=""

check() {
  local name="$1"
  local status="$2"
  local detail="${3:-}"
  total=$((total + 1))
  if [ "$status" = "PASS" ]; then
    passed=$((passed + 1))
    results+="| $name | PASS | $detail |"$'\n'
  else
    failed=$((failed + 1))
    results+="| $name | **FAIL** | $detail |"$'\n'
  fi
}

echo "Running mechanical checks on: $ROOT"
echo "---"

# --- M1: turbo check passes ---
echo "[M1] Running turbo check..."
if cd "$ROOT" && bun run check > /tmp/bench-turbo-check.log 2>&1; then
  check "M1: turbo check" "PASS"
else
  detail=$(tail -5 /tmp/bench-turbo-check.log | tr '\n' ' ')
  check "M1: turbo check" "FAIL" "$detail"
fi

# --- M2: No try/catch in backend ---
echo "[M2] Checking for try/catch in backend..."
hits=$(grep -rn "try\s*{" "$BACKEND" --include="*.ts" || true)
if [ -z "$hits" ]; then
  check "M2: No try/catch" "PASS"
else
  count=$(echo "$hits" | wc -l | tr -d ' ')
  check "M2: No try/catch" "FAIL" "$count occurrences found"
fi

# --- M3: No throw in backend ---
echo "[M3] Checking for throw in backend..."
hits=$(grep -rn "\bthrow\b" "$BACKEND" --include="*.ts" || true)
if [ -z "$hits" ]; then
  check "M3: No throw" "PASS"
else
  count=$(echo "$hits" | wc -l | tr -d ' ')
  check "M3: No throw" "FAIL" "$count occurrences found"
fi

# --- M4: No Zod imports ---
echo "[M4] Checking for Zod imports..."
hits=$(grep -rn "from ['\"]zod['\"]" "$BACKEND" --include="*.ts" || true)
if [ -z "$hits" ]; then
  check "M4: No Zod" "PASS"
else
  check "M4: No Zod" "FAIL" "Zod imports found"
fi

# --- M5: No explicit any ---
echo "[M5] Checking for explicit any..."
hits=$(grep -rn ": any\b\|<any>" "$BACKEND" --include="*.ts" || true)
if [ -z "$hits" ]; then
  check "M5: No explicit any" "PASS"
else
  count=$(echo "$hits" | wc -l | tr -d ' ')
  check "M5: No explicit any" "FAIL" "$count occurrences found"
fi

# --- M6: No raw fetch in frontend ---
echo "[M6] Checking for raw fetch in frontend pages..."
hits=$(grep -rn "\bfetch(" "$FRONTEND/pages" --include="*.astro" --include="*.ts" || true)
if [ -z "$hits" ]; then
  check "M6: No raw fetch in frontend" "PASS"
else
  count=$(echo "$hits" | wc -l | tr -d ' ')
  check "M6: No raw fetch in frontend" "FAIL" "$count occurrences found"
fi

# --- M7: No Bun-specific APIs in backend ---
echo "[M7] Checking for Bun APIs in backend..."
hits=$(grep -rn "Bun\.\|from ['\"]bun['\"]" "$BACKEND" --include="*.ts" | grep -v "\.test\.ts" || true)
if [ -z "$hits" ]; then
  check "M7: No Bun APIs in backend" "PASS" "test files excluded"
else
  count=$(echo "$hits" | wc -l | tr -d ' ')
  check "M7: No Bun APIs in backend" "FAIL" "$count occurrences in non-test files"
fi

# --- M8: Co-located tests ---
echo "[M8] Checking co-located tests..."
missing=""
for src in $(find "$BACKEND" -name "*.ts" ! -name "*.test.ts" ! -name "*.test-d.ts" ! -name "main.ts" ! -name "*-test.ts" ! -path "*/node_modules/*"); do
  test_file="${src%.ts}.test.ts"
  type_test_file="${src%.ts}.test-d.ts"
  if [ ! -f "$test_file" ] && [ ! -f "$type_test_file" ]; then
    missing+="  - Missing: $test_file"$'\n'
  fi
done
if [ -z "$missing" ]; then
  check "M8: Co-located tests" "PASS"
else
  count=$(echo "$missing" | grep -c "Missing" || true)
  check "M8: Co-located tests" "FAIL" "$count source files without tests"
fi

# --- M9: api.ts is thin (no Effect.gen, no handler logic) ---
echo "[M9] Checking api.ts is thin..."
api_file="$BACKEND/shell/api.ts"
if [ -f "$api_file" ]; then
  hits=$(grep -n "Effect\.\|handler\|async\s*(.*)\s*=>" "$api_file" || true)
  if [ -z "$hits" ]; then
    check "M9: api.ts thin" "PASS"
  else
    check "M9: api.ts thin" "FAIL" "Logic found in api.ts"
  fi
else
  check "M9: api.ts thin" "FAIL" "api.ts not found"
fi

# --- M10: Todo routes registered in api.ts ---
echo "[M10] Checking todo routes registered..."
if [ -f "$api_file" ]; then
  if grep -q "todo" "$api_file"; then
    check "M10: Todo routes registered" "PASS"
  else
    check "M10: Todo routes registered" "FAIL" "No todo route in api.ts"
  fi
else
  check "M10: Todo routes registered" "FAIL" "api.ts not found"
fi

# --- M11: Tests use testApp, not production app ---
echo "[M11] Checking test isolation..."
route_tests=$(find "$BACKEND/shell/routes" -name "*todo*.test.ts" 2>/dev/null || true)
if [ -n "$route_tests" ]; then
  bad_imports=$(grep -l "from ['\"].*api['\"]" $route_tests 2>/dev/null || true)
  if [ -z "$bad_imports" ]; then
    check "M11: Tests use testApp" "PASS"
  else
    check "M11: Tests use testApp" "FAIL" "Test imports from api.ts instead of using testApp"
  fi
else
  check "M11: Tests use testApp" "FAIL" "No todo route test files found"
fi

# --- Generate Report ---
mkdir -p "$RESULTS_DIR"

cat > "$REPORT" << EOF
# Mechanical Judge Report

**Date:** $(date +%Y-%m-%d\ %H:%M:%S)
**Project:** $ROOT
**Score:** $passed/$total passed

## Results

| Check | Status | Detail |
|-------|--------|--------|
$results

## Summary

- **Passed:** $passed
- **Failed:** $failed
- **Total:** $total
- **Score:** $(( (passed * 100) / total ))%

$(if [ "$failed" -gt 0 ]; then echo "### Failed Checks"; echo ""; echo "$results" | grep "FAIL"; fi)
EOF

echo ""
echo "=== MECHANICAL JUDGE RESULTS ==="
echo "Passed: $passed/$total ($(( (passed * 100) / total ))%)"
echo "Report saved to: $REPORT"

if [ "$failed" -gt 0 ]; then
  echo ""
  echo "FAILURES:"
  echo "$results" | grep "FAIL"
fi
