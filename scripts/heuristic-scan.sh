#!/bin/bash
# heuristic-scan.sh — Scan JS/JSX files for common coding issues
# Checks for: undeclared variables, missing React imports, inline env() in style props,
# const redeclaration, localStorage without try/catch, missing word-break on tables
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

PASS=0
FAIL=0
TOTAL=0

red() { printf "\033[31m%s\033[0m\n" "$1"; }
green() { printf "\033[32m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }

check_result() {
    local check_name="$1"
    local count="$2"
    TOTAL=$((TOTAL + 1))
    if [ "$count" -eq 0 ]; then
        green "  ✓ $check_name"
        PASS=$((PASS + 1))
    else
        red "  ✗ $check_name — $count issue(s) found"
        FAIL=$((FAIL + 1))
    fi
}

echo "=== heuristic-scan.sh: JS/JSX Heuristic Analysis ==="
echo ""

# Find all JS and JSX files in source directories
JS_FILES=$(find "$PROJECT_DIR/src" "$PROJECT_DIR/www" -type f \( -name "*.js" -o -name "*.jsx" \) 2>/dev/null | grep -v node_modules | grep -v '.BACKUP' || true)
JS_COUNT=$(echo "$JS_FILES" | grep -c . || true)
echo "JS/JSX files found: $JS_COUNT"
echo ""

# --- 1. Undeclared variables (assigning to variable without let/const/var) ---
echo "-- 1. Undeclared Variables --"
count=0
for f in $JS_FILES; do
    # Check for assignments without let/const/var at beginning of line or after ;
    # This is heuristic - not perfect but catches obvious cases
    matches=$(grep -nP '(?<![\.\w])[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*[^=]' "$f" 2>/dev/null | \
        grep -vP '^(.*(let|const|var)\s+|//|/\*|function\s+|=>\s*\{|for\s*\(|if\s*\()' || true)
    # Filter out imports, exports, params
    # We count unique variable names that look suspicious
    suspicious=$(echo "$matches" | grep -vP '\b(import|export|module|require|this|window|document|null|undefined|true|false|self|global|process|__dirname|__filename)\b' || true)
    c=$(echo "$suspicious" | grep -c . || true)
    count=$((count + c))
    if [ "$c" -gt 0 ]; then
        echo "    $f: $c possible undeclared variable(s)"
        echo "$suspicious" | head -5 | sed 's/^/      -> /'
    fi
done
check_result "Undeclared variables" "$count"

# --- 2. Missing React import in JSX files ---
echo ""
echo "-- 2. Missing React Import in JSX --"
count=0
for f in $JS_FILES; do
    if [[ "$f" == *.jsx ]] || grep -qP 'React\.|createElement|Fragment' "$f" 2>/dev/null; then
        # Contains JSX or React references but no import React
        if grep -qP 'import\s+React' "$f" 2>/dev/null || grep -qP 'require\(.*react' "$f" 2>/dev/null; then
            : # React is imported
        elif grep -qP '<[A-Z][a-zA-Z]*\s' "$f" 2>/dev/null; then
            # Has JSX-like tags (capital component names) but no React import
            if ! grep -qP '^import\s+\{[^}]*\bReact' "$f" 2>/dev/null; then
                echo "    $f: Possible missing React import"
                count=$((count + 1))
            fi
        fi
    fi
done
check_result "Missing React imports" "$count"

# --- 3. Inline env() in style props ---
echo ""
echo "-- 3. Inline env() in style props --"
count=0
for f in $JS_FILES; do
    matches=$(grep -nP 'style=\{.*env\(.*\}' "$f" 2>/dev/null || true)
    c=$(echo "$matches" | grep -c . || true)
    count=$((count + c))
    if [ "$c" -gt 0 ]; then
        echo "    $f: $c inline env() in style"
    fi
done
check_result "Inline env() in style props" "$count"

# --- 4. Const redeclaration (same const name used twice) ---
echo ""
echo "-- 4. Const redeclaration --"
count=0
for f in $JS_FILES; do
    # Find all const declarations and check for duplicates within the same file
    consts=$(grep -oP 'const\s+(\{[^}]+\}|[a-zA-Z_$][a-zA-Z0-9_$]*)' "$f" 2>/dev/null || true)
    duplicates=$(echo "$consts" | sort | uniq -d | grep -c . || true)
    if [ "$duplicates" -gt 0 ]; then
        echo "    $f: $duplicates potential const redeclaration(s)"
        echo "$consts" | sort | uniq -d | head -5 | sed 's/^/      -> /'
        count=$((count + duplicates))
    fi
done
check_result "Const redeclaration" "$count"

# --- 5. localStorage without try/catch ---
echo ""
echo "-- 5. localStorage without try/catch --"
count=0
for f in $JS_FILES; do
    # Find lines with localStorage access
    lines=$(grep -n 'localStorage' "$f" 2>/dev/null || true)
    if [ -n "$lines" ]; then
        # Check if the file has any try/catch
        has_try_catch=false
        if grep -qP 'try\s*\{' "$f" 2>/dev/null && grep -qP 'catch\s*\(' "$f" 2>/dev/null; then
            has_try_catch=true
        fi
        if [ "$has_try_catch" = false ]; then
            line_count=$(echo "$lines" | grep -c . || true)
            echo "    $f: $line_count localStorage access(es), file has no try/catch"
            count=$((count + line_count))
        fi
    fi
done
check_result "localStorage without try/catch" "$count"

# --- 6. Missing word-break on tables ---
echo ""
echo "-- 6. Missing word-break on tables --"
count=0
for f in $JS_FILES; do
    # Look for <table> or <td> or <th> without word-break styling
    if grep -qP '<table|<td|<th' "$f" 2>/dev/null; then
        # Check if word-break or wordBreak is used
        if ! grep -qP 'word[-_]?[Bb]reak' "$f" 2>/dev/null; then
            table_count=$(grep -cP '<table' "$f" 2>/dev/null || true)
            if [ "$table_count" -gt 0 ]; then
                echo "    $f: $table_count <table> tag(s) without word-break styling"
                count=$((count + table_count))
            fi
        fi
    fi
done
check_result "Missing word-break on tables" "$count"

# --- Summary ---
echo ""
echo "=========================================="
echo "  Heuristic Scan Summary"
echo "=========================================="
echo "  PASSED: $PASS/$TOTAL checks"
echo "  FAILED: $FAIL/$TOTAL checks"
echo ""

if [ "$FAIL" -gt 0 ]; then
    exit 1
else
    exit 0
fi
