#!/bin/bash
# deep-analyze.sh — Detect framework, backend, grep for 13 known bug patterns, count files, report health score 1-10
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=========================================="
echo "  Deep Project Analysis"
echo "=========================================="
echo ""

# --- Detect Framework ---
echo "-- Framework Detection --"
FRAMEWORK="unknown"
if [ -f "$PROJECT_DIR/config.xml" ]; then
    FRAMEWORK="Cordova"
elif [ -f "$PROJECT_DIR/capacitor.config.json" ] || [ -f "$PROJECT_DIR/capacitor.config.ts" ]; then
    FRAMEWORK="Capacitor"
elif [ -f "$PROJECT_DIR/vite.config.js" ] || [ -f "$PROJECT_DIR/vite.config.ts" ]; then
    FRAMEWORK="Vite"
fi
echo "  Framework: $FRAMEWORK"

# Detect additional web framework
WEB_FRAMEWORK="unknown"
if [ -f "$PROJECT_DIR/angular.json" ]; then
    WEB_FRAMEWORK="Angular"
elif [ -f "$PROJECT_DIR/ionic.config.json" ]; then
    WEB_FRAMEWORK="Ionic"
elif [ -f "$PROJECT_DIR/package.json" ]; then
    if grep -q '"react"' "$PROJECT_DIR/package.json" 2>/dev/null; then
        WEB_FRAMEWORK="React"
    elif grep -q '"vue"' "$PROJECT_DIR/package.json" 2>/dev/null; then
        WEB_FRAMEWORK="Vue"
    fi
fi
echo "  Web Framework: $WEB_FRAMEWORK"

# --- Detect Backend ---
echo ""
echo "-- Backend Detection --"
BACKEND="none"

if [ -f "$PROJECT_DIR/firebase.json" ] || grep -rli "firebase" "$PROJECT_DIR/src" "$PROJECT_DIR/www" 2>/dev/null | grep -q .; then
    BACKEND="Firebase"
fi

if grep -rli "supabase" "$PROJECT_DIR/src" "$PROJECT_DIR/www" 2>/dev/null | grep -q .; then
    if [ "$BACKEND" != "none" ]; then
        BACKEND="${BACKEND} + Supabase"
    else
        BACKEND="Supabase"
    fi
fi

if grep -rli "api\..*\.com\|api_key\|API_KEY" "$PROJECT_DIR/src" "$PROJECT_DIR/www" 2>/dev/null | grep -q .; then
    if [ "$BACKEND" != "none" ]; then
        BACKEND="${BACKEND} + Custom API"
    else
        BACKEND="Custom API"
    fi
fi

echo "  Backend: $BACKEND"

# --- Count files ---
echo ""
echo "-- File Counts --"
JS_COUNT=$(find "$PROJECT_DIR/src" "$PROJECT_DIR/www" -name "*.js" -type f 2>/dev/null | wc -l)
JSX_COUNT=$(find "$PROJECT_DIR/src" "$PROJECT_DIR/www" -name "*.jsx" -type f 2>/dev/null | wc -l)
TS_COUNT=$(find "$PROJECT_DIR/src" "$PROJECT_DIR/www" -name "*.ts" -type f 2>/dev/null | wc -l)
TSX_COUNT=$(find "$PROJECT_DIR/src" "$PROJECT_DIR/www" -name "*.tsx" -type f 2>/dev/null | wc -l)
HTML_COUNT=$(find "$PROJECT_DIR/src" "$PROJECT_DIR/www" -name "*.html" -type f 2>/dev/null | wc -l)
CSS_COUNT=$(find "$PROJECT_DIR/src" "$PROJECT_DIR/www" -name "*.css" -type f 2>/dev/null | wc -l)
TOTAL_SOURCE=$((JS_COUNT + JSX_COUNT + TS_COUNT + TSX_COUNT + HTML_COUNT + CSS_COUNT))

echo "  JS files:    $JS_COUNT"
echo "  JSX files:   $JSX_COUNT"
echo "  TS files:    $TS_COUNT"
echo "  TSX files:   $TSX_COUNT"
echo "  HTML files:  $HTML_COUNT"
echo "  CSS files:   $CSS_COUNT"
echo "  Total source: $TOTAL_SOURCE"

# --- Grep for 13 known bug patterns ---
echo ""
echo "-- Bug Pattern Scan --"
BUG_PATTERNS=(
    "console\.log"       # 1. debug logs in production (informational)
    "debugger"            # 2. debugger statements
    "TODO|FIXME|HACK|XXX" # 3. unfinished code markers
    "\.innerHTML\s*="     # 4. XSS-prone innerHTML
    "eval\("              # 5. eval usage
    "document\.write"     # 6. document.write
    "setTimeout\(.*0\s*\)" # 7. setTimeout with 0 (anti-pattern)
    "new Function\("      # 8. dynamic function creation
    "localStorage"        # 9. localStorage without try/catch (flag only)
    "alert\("             # 10. alert() in production
    "api[Kk]ey\s*=\s*['\"][^'\"]+['\"]" # 11. hardcoded API keys
    "password\s*=\s*['\"][^'\"]+['\"]"   # 12. hardcoded passwords
    "http://"             # 13. non-SSL URLs
)

BUG_COUNTS=()
TOTAL_BUGS=0

for i in "${!BUG_PATTERNS[@]}"; do
    pattern="${BUG_PATTERNS[$i]}"
    # count occurrences across source dirs
    count=$(grep -r "$pattern" "$PROJECT_DIR/src" "$PROJECT_DIR/www" 2>/dev/null | wc -l || echo 0)
    BUG_COUNTS+=("$count")
    TOTAL_BUGS=$((TOTAL_BUGS + count))
    if [ "$count" -gt 0 ]; then
        echo "  [$(printf "%02d" $((i+1)))] $(printf "%-30s" "$pattern") = $count occurrence(s)"
    else
        echo "  [$(printf "%02d" $((i+1)))] $(printf "%-30s" "$pattern") = 0"
    fi
done

echo ""
echo "  Total pattern matches: $TOTAL_BUGS"

# --- Health Score ---
echo ""
echo "-- Health Score --"
SCORE=10

# Deductions
[ "$TOTAL_BUGS" -gt 0 ]   && SCORE=$((SCORE - 1))
[ "$TOTAL_BUGS" -gt 5 ]   && SCORE=$((SCORE - 1))
[ "$TOTAL_BUGS" -gt 20 ]  && SCORE=$((SCORE - 1))
[ "$TOTAL_SOURCE" -eq 0 ] && SCORE=$((SCORE - 2))
[ "$FRAMEWORK" = "unknown" ] && SCORE=$((SCORE - 1))
[ "$BACKEND" = "none" ] && SCORE=$((SCORE - 1))

# Clamp
[ "$SCORE" -lt 1 ] && SCORE=1
[ "$SCORE" -gt 10 ] && SCORE=10

echo "  Health Score: $SCORE/10"
echo ""
echo "=========================================="
echo "  Analysis Complete"
echo "=========================================="

exit 0
