# 09 — Build Environment Reference

## JDK

| Version | Path | Used For |
|:-------:|:----|:---------|
| **17** | `~/zulu-17.jdk/Contents/Home` | Cordova builds (AGP 7.4.2 D8 — incompatible with JDK 21) |
| **21** | `~/zulu21-jdk` | Capacitor builds |

### Switch JDK
```bash
# Cordova build
export JAVA_HOME="$HOME/zulu-17.jdk/Contents/Home"

# Capacitor build
export JAVA_HOME="$HOME/zulu21-jdk"
```

## Android SDK

| Path | Build Tools | Platforms |
|:-----|:-----------:|:---------:|
| `~/android-sdk` | 32, 33, 34, 35, 36 | 32, 33, 34, 35, 36 |
| `~/Android/Sdk` | ⚠️ Alternative (same content) | — |

### Env Vars
```bash
export ANDROID_HOME="$HOME/android-sdk"
export ANDROID_SDK_ROOT="$HOME/android-sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/36:$PATH"
```

## Keystore

| Property | Value |
|:---------|:------|
| **Alias** | oppoKey |
| **File** | oppo-release.keystore (varies by project — usually in root or App_Code/) |
| **Format** | JKS |

### Signing Config
```json
{
  "android": {
    "release": {
      "keystore": "oppo-release.keystore",
      "alias": "oppoKey",
      "storePassword": "**REDACTED**",
      "password": "**REDACTED**"
    }
  }
}
```

## Build Commands

### Cordova
```bash
cd /path/to/project
export JAVA_HOME="$HOME/zulu-17.jdk/Contents/Home"
export ANDROID_HOME="$HOME/android-sdk"
cd platforms/android && ./gradlew assembleDebug
```
**APK location:** `platforms/android/app/build/outputs/apk/debug/app-debug.apk`

### Capacitor
```bash
cd /path/to/project
export JAVA_HOME="$HOME/zulu21-jdk"
npm run build
npx cap copy android
cd android && ./gradlew assembleRelease
```
**APK location:** `android/app/build/outputs/apk/debug/app-debug.apk` (or `release/` for release builds)

## Versioning
```properties
# version.properties
MAJOR=2
MINOR=0
BUILD=4
```
Generated into JS: `const APP_VERSION = 'v2.0-B04';`

## Tool Version Requirements

| Tool | Min Version | Check Command |
|:-----|:-----------:|:--------------|
| Node | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Java 17 | 17.0.9+ | `$JAVA_HOME/bin/java -version` |
| Gradle | 7.5+ | `./gradlew --version` |
| Android SDK | build-tools 33+ | `ls $ANDROID_HOME/build-tools/` |
| cordova | 12+ | `cordova -v` |
| Capacitor | 6+ | `npx cap -v` |
| Python | 3.9+ | `python3 --version` |
| Pillow/PIL | 9+ | `python3 -c "from PIL import Image; print('ok')"` |

## Known Build Errors

| Error | Root Cause | Fix |
|:------|:-----------|:----|
| `Unsupported class file major version 65` | JDK 21 too new for AGP 7.4 | Use JDK 17 |
| `AAPT2 error` | Corrupted build cache | `./gradlew clean` |
| `Could not find com.android.tools.build:gradle:7.4.2` | No network, proxy issue | Check internet, try again |
| `SDK location not found` | ANDROID_HOME not set | `export ANDROID_HOME=~/android-sdk` |
| `Keystore was tampered with` | Wrong keystore password | Verify password in build.json |
