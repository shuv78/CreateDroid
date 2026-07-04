# 06 — Plugin Reference

## Cordova Plugins

| # | Plugin Name | cordova plugin add | Purpose | Tested |
|:-:|:------------|:-------------------|:--------|:------:|
| 1 | **Camera** | `cordova-plugin-camera` | Take photo, pick from gallery | ✅ |
| 2 | **File** | `cordova-plugin-file` | Read/write files | ✅ |
| 3 | **File Transfer** | `cordova-plugin-file-transfer` | Upload/download files | ⚠️ |
| 4 | **FCM** | `cordova-plugin-fcm-with-dependecy-updated` | Push notifications | ❌ |
| 5 | **Fingerprint** | `cordova-plugin-fingerprint-aio` | Biometric auth | ❌ |
| 6 | **QR Scanner** | `phonegap-plugin-barcodescanner` | Scan barcode/QR | ✅ |
| 7 | **Google Maps** | `cordova-plugin-googlemaps` | Maps | ⚠️ |
| 8 | **Splash Screen** | `cordova-plugin-splashscreen` | Splash control | ✅ |
| 9 | **Status Bar** | `cordova-plugin-statusbar` | Status bar config | ✅ |
| 10 | **Vibration** | `cordova-plugin-vibration` | Vibrate on action | ✅ |
| 11 | **Bluetooth** | `cordova-plugin-bluetooth-serial` | Bluetooth printing | ❌ |
| 12 | **Contacts** | `cordova-plugin-contacts` | Read contacts | ❌ |
| 13 | **Calendar** | `cordova-plugin-calendar` | Calendar access | ❌ |
| 14 | **SMS** | `cordova-plugin-sms` | Send SMS | ❌ |
| 15 | **Network** | `cordova-plugin-network-information` | Connection status | ✅ |
| 16 | **Device** | `cordova-plugin-device` | Device info | ✅ |

## Capacitor Plugins

| # | Plugin Name | npm install | Purpose | Tested |
|:-:|:------------|:------------|:--------|:------:|
| 1 | **Camera** | `@capacitor/camera` | Take photo, pick gallery | ✅ |
| 2 | **File System** | `@capacitor/filesystem` | Read/write files | ✅ |
| 3 | **Push** | `@capacitor/push-notifications` | Push notifications | ❌ |
| 4 | **Biometric** | `@capacitor/biometric-auth` | Biometric auth | ❌ |
| 5 | **Maps** | `@capacitor/google-maps` | Google Maps | ❌ |
| 6 | **Status Bar** | `@capacitor/status-bar` | Status bar config | ✅ |
| 7 | **Splash** | `@capacitor/splash-screen` | Splash control | ✅ |
| 8 | **Network** | `@capacitor/network` | Connection status | ✅ |
| 9 | **App** | `@capacitor/app` | App lifecycle, deep links | ✅ |
| 10 | **Share** | `@capacitor/share` | Native share sheet | ✅ |
| 11 | **Clipboard** | `@capacitor/clipboard` | Copy/paste | ❌ |
| 12 | **Haptics** | `@capacitor/haptics` | Haptic feedback | ✅ |

## Cordova Plugin Installation
```bash
cd /path/to/project
cordova plugin add cordova-plugin-camera
# Or for Capacitor:
npm install @capacitor/camera
npx cap sync
```

## Using Plugins in Cordova (Vanilla JS)
```javascript
// Wait for device ready
document.addEventListener('deviceready', function() {
  // Camera
  navigator.camera.getPicture(success, fail, options);
  
  // Fingerprint
  Fingerprint.show({ description: 'Login' })
    .then(() => login())
    .catch(() => showPassword());
  
  // Barcode
  cordova.plugins.barcodeScanner.scan(
    (result) => console.log(result.text),
    (error) => console.error(error)
  );
});
```

## Using Plugins in Capacitor (React)
```javascript
import { Camera, CameraResultType } from '@capacitor/camera';

async function takePhoto() {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  });
  return image.webPath;
}
```

## Plugin Compatibility Matrix

| Feature | Cordova Plugin | Capacitor Plugin |
|:--------|:--------------:|:----------------:|
| Camera | ✅ cordova-plugin-camera | ✅ @capacitor/camera |
| Push | ⚠️ cordova-plugin-fcm (complex) | ✅ @capacitor/push-notifications |
| Maps | ⚠️ cordova-plugin-googlemaps (needs API key) | ❌ @capacitor/google-maps |
| Biometric | ❌ cordova-plugin-fingerprint-aio (not updated) | ✅ @capacitor/biometric-auth |
| Scanner | ✅ phonegap-plugin-barcodescanner | ❌ (use html5-qrcode) |
| Share | ❌ (navigator.share) | ✅ @capacitor/share |
| Auth (social) | ❌ cordova-plugin-googleplus | ❌ (use supabase auth) |
