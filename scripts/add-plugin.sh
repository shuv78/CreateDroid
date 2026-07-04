#!/bin/bash
# add-plugin.sh — One-command plugin installer for Cordova/Capacitor
# Accept plugin name, install plugin, add to config.xml / capacitor.config.json
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Define plugin mappings
declare -A CORDOVA_PLUGINS
CORDOVA_PLUGINS["camera"]="cordova-plugin-camera"
CORDOVA_PLUGINS["barcode"]="phonegap-plugin-barcodescanner"
CORDOVA_PLUGINS["push"]="cordova-plugin-fcm-with-dependecy-updated"
CORDOVA_PLUGINS["maps"]="cordova-plugin-googlemaps"
CORDOVA_PLUGINS["fingerprint"]="cordova-plugin-fingerprint-aio"
CORDOVA_PLUGINS["file"]="cordova-plugin-file"
CORDOVA_PLUGINS["bluetooth-print"]="cordova-plugin-bluetooth-printer"
CORDOVA_PLUGINS["sms"]="cordova-plugin-sms"

declare -A CAPACITOR_PLUGINS
CAPACITOR_PLUGINS["camera"]="@capacitor/camera"
CAPACITOR_PLUGINS["barcode"]="@capacitor-mlkit/barcode-scanning"
CAPACITOR_PLUGINS["push"]="@capacitor/push-notifications"
CAPACITOR_PLUGINS["maps"]="@capacitor/google-maps"
CAPACITOR_PLUGINS["fingerprint"]="@capacitor/biometric"
CAPACITOR_PLUGINS["file"]="@capacitor/filesystem"
CAPACITOR_PLUGINS["bluetooth-print"]="cordova-plugin-bluetooth-printer"
CAPACITOR_PLUGINS["sms"]="capacitor-sms"

echo "=== add-plugin.sh ==="
echo ""

# Validate args
PLUGIN_NAME="${1:-}"
if [ -z "$PLUGIN_NAME" ]; then
    echo "Usage: $0 <plugin-name>"
    echo ""
    echo "Available plugins:"
    for p in camera barcode push maps fingerprint file bluetooth-print sms; do
        echo "  - $p"
    done
    echo ""
    echo "Examples:"
    echo "  $0 camera"
    echo "  $0 push"
    exit 1
fi

# Check if plugin name is valid
VALID=false
for p in camera barcode push maps fingerprint file bluetooth-print sms; do
    if [ "$PLUGIN_NAME" = "$p" ]; then
        VALID=true
        break
    fi
done

if [ "$VALID" = false ]; then
    echo "ERROR: Unknown plugin '$PLUGIN_NAME'."
    echo "Available: camera, barcode, push, maps, fingerprint, file, bluetooth-print, sms"
    exit 1
fi

echo "Plugin: $PLUGIN_NAME"
echo ""

# Detect project type
echo "-- Detecting project type --"
PROJECT_TYPE=""

if [ -f "$PROJECT_DIR/config.xml" ]; then
    PROJECT_TYPE="cordova"
    echo "Detected: Cordova"
elif [ -f "$PROJECT_DIR/capacitor.config.json" ] || [ -f "$PROJECT_DIR/capacitor.config.ts" ]; then
    PROJECT_TYPE="capacitor"
    echo "Detected: Capacitor"
else
    echo "ERROR: Could not detect project type (no config.xml or capacitor.config.json)"
    exit 1
fi

echo ""

# Install the plugin
if [ "$PROJECT_TYPE" = "cordova" ]; then
    PLUGIN_SPEC="${CORDOVA_PLUGINS[$PLUGIN_NAME]}"
    echo "-- Installing Cordova plugin: $PLUGIN_SPEC --"
    
    cd "$PROJECT_DIR"
    
    # Check if already installed
    if grep -q "$PLUGIN_SPEC" "$PROJECT_DIR/config.xml" 2>/dev/null; then
        echo "Plugin already in config.xml. Reinstalling..."
    fi
    
    # Install via cordova CLI
    if command -v cordova >/dev/null 2>&1; then
        echo "Running: cordova plugin add $PLUGIN_SPEC --save"
        cordova plugin add "$PLUGIN_SPEC" --save
    elif command -v npx >/dev/null 2>&1; then
        echo "Running: npx cordova plugin add $PLUGIN_SPEC --save"
        npx cordova plugin add "$PLUGIN_SPEC" --save
    else
        echo "ERROR: Neither 'cordova' nor 'npx' found."
        exit 1
    fi
    
    echo ""
    echo "Plugin added to config.xml automatically."
    
elif [ "$PROJECT_TYPE" = "capacitor" ]; then
    PLUGIN_SPEC="${CAPACITOR_PLUGINS[$PLUGIN_NAME]}"
    echo "-- Installing Capacitor plugin: $PLUGIN_SPEC --"
    
    cd "$PROJECT_DIR"
    
    # Install via npm
    echo "Running: npm install $PLUGIN_SPEC"
    npm install "$PLUGIN_SPEC" --save
    
    # Sync with native projects
    echo "Running: npx cap sync"
    npx cap sync
    
    echo ""
    echo "Plugin installed. capacitor.config.json not modified (Capacitor auto-discovers plugins)."
fi

echo ""
echo "=== add-plugin.sh: Plugin '$PLUGIN_NAME' installed successfully ==="
echo ""

# Show verification
echo "Verification:"
if [ "$PROJECT_TYPE" = "cordova" ]; then
    echo "  Plugin in config.xml:"
    grep -A2 "$PLUGIN_NAME\|${CORDOVA_PLUGINS[$PLUGIN_NAME]}" "$PROJECT_DIR/config.xml" 2>/dev/null || echo "  (check manually)"
else
    echo "  Plugin in package.json:"
    node -e "const p=require('${PROJECT_DIR}/package.json'); console.log('  '+JSON.stringify(p.dependencies&&p.dependencies['${PLUGIN_SPEC}']||'not found'))" 2>/dev/null
fi
