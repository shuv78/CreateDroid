#!/bin/bash
# health-check.sh — Verify JAVA_HOME, ANDROID_HOME, SDK, keystore, disk space, network. Exit with status.
set -euo pipefail

PASS=0
FAIL=0
CHECKS=0

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd")"

red() { printf "\033[31m%s\033[0m\n" "$1"; }
green() { printf "\033[32m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }

check() {
    local name="$1"
    local result="$2"
    CHECKS=$((CHECKS + 1))
    if [ "$result" = "pass" ]; then
        green "  ✓ $name"
        PASS=$((PASS + 1))
    else
        red "  ✗ $name"
        FAIL=$((FAIL + 1))
    fi
}

echo "=========================================="
echo "  Environment Health Check"
echo "=========================================="
echo ""

# --- JAVA_HOME (Cordova JDK 17) ---
echo "-- Java --"
JAVA_CORDOVA="$HOME/zulu-17.jdk/Contents/Home"
if [ -d "$JAVA_CORDOVA" ] && [ -x "$JAVA_CORDOVA/bin/java" ]; then
    VER=$("$JAVA_CORDOVA/bin/java" -version 2>&1 | head -1)
    check "JDK 17 (Cordova): $VER" "pass"
else
    check "JDK 17 at $JAVA_CORDOVA" "fail"
fi

JAVA_CAPACITOR="$HOME/zulu21-jdk"
if [ -d "$JAVA_CAPACITOR" ] && [ -x "$JAVA_CAPACITOR/bin/java" ]; then
    VER=$("$JAVA_CAPACITOR/bin/java" -version 2>&1 | head -1)
    check "JDK 21 (Capacitor): $VER" "pass"
else
    check "JDK 21 at $JAVA_CAPACITOR" "fail"
fi

# --- ANDROID_HOME ---
echo ""
echo "-- Android SDK --"
ANDROID_SDK="$HOME/android-sdk"
if [ -d "$ANDROID_SDK" ]; then
    check "Android SDK dir: $ANDROID_SDK" "pass"
    
    # Check platforms
    PLATFORMS=$(ls -d "$ANDROID_SDK/platforms/android-"* 2>/dev/null | wc -l)
    if [ "$PLATFORMS" -gt 0 ]; then
        check "Platforms found: $PLATFORMS" "pass"
    else
        check "Platforms installed" "fail"
    fi
    
    # Check build-tools
    BUILD_TOOLS=$(ls -d "$ANDROID_SDK/build-tools/"* 2>/dev/null | wc -l)
    if [ "$BUILD_TOOLS" -gt 0 ]; then
        check "Build-tools found: $BUILD_TOOLS" "pass"
    else
        check "Build-tools installed" "fail"
    fi
    
    # Check platform-tools
    if [ -d "$ANDROID_SDK/platform-tools" ]; then
        check "Platform-tools present" "pass"
    else
        check "Platform-tools present" "fail"
    fi

    # Check alternative SDK location
    ALT_SDK="$HOME/Android/Sdk"
    if [ -d "$ALT_SDK" ]; then
        check "Alt SDK location: $ALT_SDK" "pass"
    else
        check "Alt SDK location: $ALT_SDK" "fail"
    fi
else
    check "Android SDK dir: $ANDROID_SDK" "fail"
fi

# --- Keystore ---
echo ""
echo "-- Keystore --"
KEYSTORE="${KEYSTORE_PATH:-}"
if [ -n "$KEYSTORE" ] && [ -f "$KEYSTORE" ]; then
    check "Keystore at KEYSTORE_PATH: $KEYSTORE" "pass"
elif [ -f "$PROJECT_DIR/android/app/keystore.jks" ]; then
    check "Keystore at project android/app/keystore.jks" "pass"
elif [ -f "$PROJECT_DIR/keystore.jks" ]; then
    check "Keystore at project root keystore.jks" "pass"
else
    check "Keystore (set KEYSTORE_PATH or place keystore.jks)" "fail"
fi

# --- Disk space ---
echo ""
echo "-- Disk Space --"
AVAIL_KB=$(df "$HOME" | tail -1 | awk '{print $4}')
AVAIL_GB=$((AVAIL_KB / 1024 / 1024))
if [ "$AVAIL_GB" -gt 5 ]; then
    check "Disk space: ${AVAIL_GB}GB available" "pass"
elif [ "$AVAIL_GB" -gt 1 ]; then
    check "Disk space: ${AVAIL_GB}GB available (low)" "fail"
else
    check "Disk space: ${AVAIL_GB}GB available (critical)" "fail"
fi

# --- Network ---
echo ""
echo "-- Network --"
if ping -c 1 -W 3 8.8.8.8 >/dev/null 2>&1; then
    check "Network: Internet reachable" "pass"
else
    check "Network: Internet reachable" "fail"
fi

if curl -s --max-time 5 https://api.telegram.org >/dev/null 2>&1; then
    check "Network: Telegram API reachable" "pass"
else
    check "Network: Telegram API reachable" "fail"
fi

# --- Tools ---
echo ""
echo "-- Required Tools --"
for cmd in node npm npx python3 curl git; do
    if command -v "$cmd" >/dev/null 2>&1; then
        check "Tool: $cmd ($(command -v "$cmd"))" "pass"
    else
        check "Tool: $cmd" "fail"
    fi
done

# Check Pillow (PIL) for Python
if python3 -c "from PIL import Image" 2>/dev/null; then
    check "Python Pillow: available" "pass"
else
    check "Python Pillow: available" "fail"
fi

# --- Project ---
echo ""
echo "-- Project --"
if [ -d "$PROJECT_DIR" ]; then
    check "Project dir exists: $PROJECT_DIR" "pass"
else
    check "Project dir exists: $PROJECT_DIR" "fail"
fi

echo ""
echo "=========================================="
echo "  Results: $PASS passed, $FAIL failed (of $CHECKS checks)"
echo "=========================================="

if [ "$FAIL" -gt 0 ]; then
    exit 1
else
    exit 0
fi
