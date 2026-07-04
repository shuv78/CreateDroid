# wf-07 — 📲 Build & Ship

## Entry
User says: "build" / "send apk" / "apk banao" / "telegram e pathao"

## Prerequisites
- About section with version MUST exist (`app-about-section-rule`)
- Project must be in `.REGISTRY/projects.json` or user provides path
- No uncommitted critical errors in browser console

## Step 0 — Environment Health Check
Run `scripts/health-check.sh`. Bail if any fails.

## Step 1 — Verify About Section
Read index.html — ensure it has:
- APP_VERSION variable
- Version displayed on login screen
- Changelog or about screen with version

If not found → create/update → rebuild needed.

## Step 2 — Version Bump
Run `scripts/bump-version.sh [major|minor|build]`.

Default: bump BUILD. If user asks for major release: "Major = incompatible changes. Confirm?"

## Step 3 — Build
### Cordova:
```bash
export JAVA_HOME="$HOME/zulu-17.jdk/Contents/Home"
export ANDROID_HOME="$HOME/android-sdk"
cd platforms/android && ./gradlew assembleDebug
```

### Capacitor:
```bash
export JAVA_HOME="$HOME/zulu21-jdk"
npm run build && npx cap copy android && cd android && ./gradlew assembleRelease
```

## Step 4 — APK Verification
```bash
# Check file exists
ls -lh "path/to/app.apk"

# Check size (report if >15MB)
APK_SIZE=$(stat -f%z "path/to/app.apk")
if [ $APK_SIZE -gt 15728640 ]; then echo "⚠️ APK is large: $(echo "scale=1; $APK_SIZE/1048576" | bc)MB"; fi

# Extract and check version in APK
unzip -p "path/to/app.apk" assets/www/index.html 2>/dev/null | grep -o "APP_VERSION.*" | head -1
```

## Step 5 — Security Check
Run `scripts/security-audit.sh`. Report any findings.

## Step 6 — Copy to Desktop
```bash
cp "path/to/app.apk" "$HOME/Desktop/AppName-v1.2.3.apk"
```

## Step 7 — Send via Telegram
```bash
curl -F chat_id="639719170" \
     -F document=@"$HOME/Desktop/AppName-v1.2.3.apk" \
     -F caption="📲 *AppName v1.2.3*%0ABuild: $(date +%Y-%m-%d)" \
     https://api.telegram.org/bot${TOKEN}/sendDocument
```

## Step 8 — Post-Delivery
1. Record sent version in `.REGISTRY/projects.json`
2. Purge old backups: keep last 5
3. Ask: "Test kore dekhen. Kichu problem hole bolben."
