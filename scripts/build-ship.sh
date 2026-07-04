#!/bin/bash
# build-ship.sh — Full pipeline: version bump + build + rename + send via Telegram
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DATE="$(date +%Y%m%d-%H%M%S)"
DESKTOP_DIR="$HOME/Desktop"

# Load Telegram config
ENV_FILE="$HOME/.hermes/.env"
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""

if [ -f "$ENV_FILE" ]; then
    # Source it safely
    set +a
    source "$ENV_FILE"
    set -a
    TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
    TELEGRAM_CHAT_ID="${TELEGRAM_HOME_CHANNEL:-639719170}"
fi

echo "=== build-ship.sh: Full Pipeline ==="
echo "BUILD_DATE=$BUILD_DATE"

# Step 1: Version bump
echo ""
echo "--- Step 1: Bump version ---"
if [ -f "$SCRIPT_DIR/bump-version.sh" ]; then
    bash "$SCRIPT_DIR/bump-version.sh" BUILD
    echo "Version bumped."
else
    echo "Warning: bump-version.sh not found, skipping version bump."
fi

# Read current version
VERSION="1.0.0"
if [ -f "$PROJECT_DIR/version.properties" ]; then
    MAJOR=$(grep -oP '^MAJOR=\K\d+' "$PROJECT_DIR/version.properties" || echo "1")
    MINOR=$(grep -oP '^MINOR=\K\d+' "$PROJECT_DIR/version.properties" || echo "0")
    BUILD_NUM=$(grep -oP '^BUILD=\K\d+' "$PROJECT_DIR/version.properties" || echo "0")
    VERSION="${MAJOR}.${MINOR}.${BUILD_NUM}"
fi
echo "Version: $VERSION"

# Step 2: Detect framework and build
echo ""
echo "--- Step 2: Build APK ---"
BUILT_APK=""

if [ -d "$PROJECT_DIR/platforms/android" ] && [ -f "$PROJECT_DIR/platforms/android/gradlew" ]; then
    echo "Detected Cordova project. Running Cordova build..."
    if [ -f "$SCRIPT_DIR/build-cordova.sh" ]; then
        bash "$SCRIPT_DIR/build-cordova.sh"
        # Find the resulting APK on Desktop
        BUILT_APK=$(ls -t "$DESKTOP_DIR"/*cordova*.apk "$DESKTOP_DIR"/app-*.apk 2>/dev/null | head -1)
    fi
elif [ -d "$PROJECT_DIR/android" ] && [ -f "$PROJECT_DIR/android/gradlew" ]; then
    echo "Detected Capacitor project. Running Capacitor build..."
    if [ -f "$SCRIPT_DIR/build-capacitor.sh" ]; then
        bash "$SCRIPT_DIR/build-capacitor.sh"
        BUILT_APK=$(ls -t "$DESKTOP_DIR"/*-release.apk "$DESKTOP_DIR"/app-*.apk 2>/dev/null | head -1)
    fi
else
    echo "ERROR: No recognized Android project found (Cordova platforms/android/ or Capacitor android/)"
    exit 1
fi

if [ -z "$BUILT_APK" ] || [ ! -f "$BUILT_APK" ]; then
    echo "ERROR: No built APK found on Desktop."
    exit 1
fi

echo "Built APK: $BUILT_APK"

# Step 3: Rename with full version info
echo ""
echo "--- Step 3: Rename APK ---"
FINAL_NAME="app-v${VERSION}-${BUILD_DATE}.apk"
cp "$BUILT_APK" "$DESKTOP_DIR/$FINAL_NAME"
echo "Final APK: $DESKTOP_DIR/$FINAL_NAME"

# Step 4: Send via Telegram
echo ""
echo "--- Step 4: Send via Telegram ---"
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
    API_URL="https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument"
    CAPTION="🚀 *New Build v${VERSION}* (%0ABuild date: ${BUILD_DATE}%0AFile: ${FINAL_NAME})"
    
    echo "Sending to Telegram chat ID: ${TELEGRAM_CHAT_ID:-639719170}"
    curl -s -X POST "$API_URL" \
        -F "chat_id=${TELEGRAM_CHAT_ID:-639719170}" \
        -F "document=@${DESKTOP_DIR}/${FINAL_NAME}" \
        -F "caption=${CAPTION}" \
        -F "parse_mode=Markdown" \
        --connect-timeout 30 \
        --max-time 120
    
    echo ""
    echo "Telegram upload complete."
else
    echo "Warning: TELEGRAM_BOT_TOKEN not found. Skipping Telegram send."
    echo "Set TELEGRAM_BOT_TOKEN in $ENV_FILE"
fi

echo ""
echo "=== build-ship.sh: Pipeline Complete ==="
echo "APK: $DESKTOP_DIR/$FINAL_NAME"
