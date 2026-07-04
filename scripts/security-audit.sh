#!/bin/bash
# security-audit.sh — Check APK/project for API keys, hardcoded passwords, Firebase URLs, Supabase keys, phone numbers
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

SEVERITY_CRIT=0
SEVERITY_HIGH=0
SEVERITY_MED=0
SEVERITY_LOW=0

red() { printf "\033[31m%s\033[0m\n" "$1"; }
green() { printf "\033[32m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }
blue()  { printf "\033[34m%s\033[0m\n" "$1"; }

report_finding() {
    local severity="$1"
    local title="$2"
    local detail="$3"
    case "$severity" in
        CRIT) red "  [CRITICAL] $title: $detail"; SEVERITY_CRIT=$((SEVERITY_CRIT + 1)) ;;
        HIGH) red "  [HIGH] $title: $detail"; SEVERITY_HIGH=$((SEVERITY_HIGH + 1)) ;;
        MED)  yellow "  [MEDIUM] $title: $detail"; SEVERITY_MED=$((SEVERITY_MED + 1)) ;;
        LOW)  blue "  [LOW] $title: $detail"; SEVERITY_LOW=$((SEVERITY_LOW + 1)) ;;
    esac
}

echo "=========================================="
echo "  Security Audit"
echo "=========================================="
echo ""

# Source directories to scan
SOURCE_DIRS="$PROJECT_DIR/src $PROJECT_DIR/www $PROJECT_DIR/android $PROJECT_DIR/platforms/android"

# --- 1. API Keys ---
echo "-- API Keys & Secrets --"

# Generic API key patterns
for pattern in 'api[Kk]ey\s*[:=]\s*['"'"'"'][A-Za-z0-9_\-]{16,}['"'"'"']' \
              'api[Kk]ey\s*[:=]\s*['"'"'"'][A-Za-z0-9_\-]{32,}['"'"'"']' \
              'API_KEY\s*=\s*['"'"'"'][A-Za-z0-9_\-]{16,}['"'"'"']' \
              'api_secret\s*[:=]\s*['"'"'"'][A-Za-z0-9_\-]{16,}['"'"'"']' \
              'secret_key\s*[:=]\s*['"'"'"'][A-Za-z0-9_\-]{16,}['"'"'"']'; do
    matches=$(grep -rn "$pattern" $SOURCE_DIRS 2>/dev/null | grep -v node_modules | grep -v '.BACKUP' || true)
    if [ -n "$matches" ]; then
        report_finding "HIGH" "Possible hardcoded API key" "$(echo "$matches" | head -5 | tr '\n' ' ')"
    fi
done

# --- 2. Hardcoded Passwords ---
echo ""
echo "-- Hardcoded Passwords --"
for pattern in 'password\s*[:=]\s*['"'"'"'][^'"'"'"']+['"'"'"']' \
              'passwd\s*[:=]\s*['"'"'"'][^'"'"'"']+['"'"'"']' \
              'pwd\s*[:=]\s*['"'"'"'][^'"'"'"']+['"'"'"']'; do
    matches=$(grep -rn "$pattern" $SOURCE_DIRS 2>/dev/null | grep -vi 'placeholder\|example\|your_password\|changeme' | grep -v '.BACKUP' || true)
    if [ -n "$matches" ]; then
        report_finding "CRIT" "Possible hardcoded password" "$(echo "$matches" | head -5 | tr '\n' ' ')"
    fi
done

# --- 3. Firebase URLs ---
echo ""
echo "-- Firebase URLs --"
matches=$(grep -rn 'https://.*firebaseio\.com\|https://.*firebaseapp\.com\|project_id.*=.*[a-z0-9\-]\{20,\}' $SOURCE_DIRS 2>/dev/null | grep -v node_modules | grep -v '.BACKUP' || true)
if [ -n "$matches" ]; then
    report_finding "HIGH" "Firebase project URL found" "$(echo "$matches" | head -5 | tr '\n' ' ')"
fi

# Check for firebase config block with project info
matches=$(grep -rn 'apiKey.*AIza' $SOURCE_DIRS 2>/dev/null | grep -v node_modules | grep -v '.BACKUP' || true)
if [ -n "$matches" ]; then
    report_finding "CRIT" "Firebase API key (AIza prefix)" "$(echo "$matches" | head -5 | tr '\n' ' ')"
fi

# --- 4. Supabase Keys ---
echo ""
echo "-- Supabase Keys --"
# Public anon key
matches=$(grep -rn 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\|supabase.*Key.*eyJ\|supabaseUrl\|supabaseKey' $SOURCE_DIRS 2>/dev/null | grep -v node_modules | grep -v '.BACKUP' || true)
if [ -n "$matches" ]; then
    report_finding "HIGH" "Supabase credentials found" "$(echo "$matches" | head -5 | tr '\n' ' ')"
fi

# Service role key (critical)
matches=$(grep -rn 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.*[Ss]ervice' $SOURCE_DIRS 2>/dev/null | grep -v node_modules | grep -v '.BACKUP' || true)
if [ -n "$matches" ]; then
    report_finding "CRIT" "Supabase service role key detected" "$(echo "$matches" | head -3 | tr '\n' ' ')"
fi

# --- 5. Phone Numbers ---
echo ""
echo "-- Hardcoded Phone Numbers --"
matches=$(grep -rnP '(?<!\d)\+?\d{1,3}[ -]?\(?\d{2,4}\)?[ -]?\d{3,4}[ -]?\d{3,4}(?!\d)' $SOURCE_DIRS 2>/dev/null | grep -v node_modules | grep -v '.BACKUP' | grep -v '000-000-0000\|555-' || true)
if [ -n "$matches" ]; then
    report_finding "MED" "Possible hardcoded phone numbers" "$(echo "$matches" | head -5 | tr '\n' ' ')"
fi

# --- 6. Tokens and JWTs ---
echo ""
echo "-- Tokens & JWTs --"
matches=$(grep -rnP '[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}' $SOURCE_DIRS 2>/dev/null | grep -v node_modules | grep -v '.BACKUP' | grep -v 'package.json\|package-lock.json\|yarn.lock\|\.map' || true)
if [ -n "$matches" ]; then
    report_finding "HIGH" "Possible JWT tokens found" "$(echo "$matches" | head -5 | tr '\n' ' ')"
fi

# --- 7. Private Keys ---
echo ""
echo "-- Private Keys --"
matches=$(grep -rn 'BEGIN\s\(RSA\s\)\?PRIVATE KEY\|BEGIN\sOPENSSH\sPRIVATE KEY' $SOURCE_DIRS 2>/dev/null | grep -v node_modules | grep -v '.BACKUP' || true)
if [ -n "$matches" ]; then
    report_finding "CRIT" "Private key file detected" "$(echo "$matches" | head -5 | tr '\n' ' ')"
fi

# --- 8. Connection Strings ---
echo ""
echo "-- Connection Strings --"
matches=$(grep -rn 'postgres://\|mysql://\|mongodb://\|redis://\|jdbc:' $SOURCE_DIRS 2>/dev/null | grep -v node_modules | grep -v '.BACKUP' || true)
if [ -n "$matches" ]; then
    report_finding "CRIT" "Database connection string with credentials" "$(echo "$matches" | head -5 | tr '\n' ' ')"
fi

# --- 9. .env Files ---
echo ""
echo "-- Environment Files --"
for env_file in "$PROJECT_DIR/.env" "$PROJECT_DIR/.env.production" "$PROJECT_DIR/.env.development"; do
    if [ -f "$env_file" ]; then
        secrets=$(grep -c '=' "$env_file" 2>/dev/null || true)
        report_finding "LOW" "Environment file found" "$env_file ($secrets variables)"
    fi
done

# --- Summary ---
echo ""
echo "=========================================="
echo "  Audit Summary"
echo "=========================================="
echo ""
echo "  CRITICAL: $SEVERITY_CRIT"
echo "  HIGH:     $SEVERITY_HIGH"
echo "  MEDIUM:   $SEVERITY_MED"
echo "  LOW:      $SEVERITY_LOW"
FINDINGS=$((SEVERITY_CRIT + SEVERITY_HIGH + SEVERITY_MED + SEVERITY_LOW))
echo "  Total:    $FINDINGS"
echo ""

if [ "$FINDINGS" -gt 0 ]; then
    echo "WARNING: Security findings detected. Review each above."
    exit 1
else
    echo "No security issues found."
    exit 0
fi
