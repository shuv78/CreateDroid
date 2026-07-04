#!/bin/bash
# build-capacitor.sh — Build Capacitor APK
# Sets JAVA_HOME=~/zulu21-jdk, npx cap copy android, cd android, ./gradlew assembleRelease, copy APK.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DATE="$(date +%Y%m%d-%H%M%S)"
DESKTOP_DIR="$HOME/Desktop"

echo "=== build-capacitor.sh: Building Capacitor APK ==="

# Set up build environment
export JAVA_HOME="$HOME/zulu21-jdk"
export ANDROID_HOME="$HOME/android-sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/build-tools/34.0.0:$PATH"

echo "JAVA_HOME=$JAVA_HOME"
echo "ANDROID_HOME=$ANDROID_HOME"
java -version 2>&1 | head -1

# Verify project structure
CAPACITOR_ANDROID_DIR="$PROJECT_DIR/android"
if [ ! -d "$CAPACITOR_ANDROID_DIR" ]; then
    echo "ERROR: Capacitor android directory not found at $CAPACITOR_ANDROID_DIR"
    echo "Run: npx cap add android"
    exit 1
fi

if [ ! -f "$CAPACITOR_ANDROID_DIR/gradlew" ]; then
    echo "ERROR: gradlew not found in $CAPACITOR_ANDROID_DIR"
    exit 1
fi

# Extract version from capacitor.config or package.json
VERSION=""
if [ -f "$PROJECT_DIR/package.json" ]; then
    VERSION=$(node -e "console.log(require('./package.json').version || '')" 2>/dev/null || true)
fi
if [ -z "$VERSION" ] && [ -f "$PROJECT_DIR/version.properties" ]; then
    MAJOR=$(grep -oP '^MAJOR=\K\d+' "$PROJECT_DIR/version.properties" || echo "1")
    MINOR=$(grep -oP '^MINOR=\K\d+' "$PROJECT_DIR/version.properties" || echo "0")
    BUILD=$(grep -oP '^BUILD=\K\d+' "$PROJECT_DIR/version.properties" || echo "0")
    VERSION="${MAJOR}.${MINOR}.${BUILD}"
fi
if [ -z "$VERSION" ]; then
    VERSION="1.0.0"
fi
echo "App version: $VERSION"

# Step 1: npx cap copy
echo ""
echo "--- Running: npx cap copy android ---"
cd "$PROJECT_DIR"
npx cap copy android
COPY_STATUS=$?
if [ $COPY_STATUS -ne 0 ]; then
    echo "ERROR: npx cap copy failed with status $COPY_STATUS"
    exit $COPY_STATUS
fi

# Step 2: Build with gradle
echo ""
echo "--- Running ./gradlew assembleRelease ---"
cd "$CAPACITOR_ANDROID_DIR"
chmod +x gradlew
./gradlew assembleRelease --no-daemon
BUILD_STATUS=$?

if [ $BUILD_STATUS -ne 0 ]; then
    echo "ERROR: Gradle build failed with status $BUILD_STATUS"
    exit $BUILD_STATUS
fi

echo ""
echo "--- Build successful! Copying APK to Desktop ---"

# Find the built APK
APK_SOURCE=""
for apk_pattern in app/build/outputs/apk/release/*.apk; do
    if [ -f "$apk_pattern" ]; then
        APK_SOURCE="$apk_pattern"
        break
    fi
done

# Also check for debug as fallback
if [ -z "$APK_SOURCE" ] || [ ! -f "$APK_SOURCE" ]; then
    for apk_pattern in app/build/outputs/apk/debug/*.apk; do
        if [ -f "$apk_pattern" ]; then
            APK_SOURCE="$apk_pattern"
            break
        fi
    done
fi

if [ -z "$APK_SOURCE" ] || [ ! -f "$APK_SOURCE" ]; then
    echo "WARNING: Could not find APK at expected locations."
    echo "Searching for any .apk ..."
    APK_SOURCE=$(find app/build/outputs -name "*.apk" -type f 2>/dev/null | head -1)
fi

if [ -n "$APK_SOURCE" ] && [ -f "$APK_SOURCE" ]; then
    APK_BASENAME=$(basename "$APK_SOURCE" .apk)
    VERSIONED_NAME="app-${VERSION}-${BUILD_DATE}-release.apk"
    cp "$APK_SOURCE" "$DESKTOP_DIR/$VERSIONED_NAME"
    echo "Copied to: $DESKTOP_DIR/$VERSIONED_NAME"
    echo "Size: $(du -h "$DESKTOP_DIR/$VERSIONED_NAME" | cut -f1)"
else
    echo "ERROR: No APK found to copy."
    exit 1
fi

echo ""
echo "=== build-capacitor.sh: DONE ==="
