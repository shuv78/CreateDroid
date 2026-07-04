# 02 — Feature Library (18 Features)

Each feature: description, code pattern, dependencies, tested status.

## 1. 🗺️ Google Maps
**Description:** Display map with markers, GPS location, directions
**Dependencies:** Google Maps API key, cordova-plugin-googlemaps (Cordova) or @capacitor/google-maps (Capacitor)
**Code Pattern (Cordova):**
```javascript
function initMap(lat, lng) {
  const div = document.getElementById('map');
  plugin.google.maps.Map.getMap(div, {
    camera: { target: { lat, lng }, zoom: 15 }
  });
}
```
**Tested:** ✅ Yes (Cordova) | ✅ Yes (Capacitor)

## 2. 💳 Payment (bKash/Nagad/Stripe)
**Description:** Payment form with amount, merchant number, transaction ID
**Dependencies:** None (manual payment logging)
**Code Pattern:**
```javascript
function processPayment(amount, merchant, method) {
  // Show payment instruction
  // Log to backend for verification
  // Wait for user to confirm payment done
}
```
**Tested:** ✅ Yes

## 3. 📸 Camera + Gallery
**Description:** Take photo, pick from gallery, compress, preview
**Dependencies:** cordova-plugin-camera / @capacitor/camera
**Code Pattern:**
```javascript
async function capturePhoto() {
  const image = await navigator.camera.getPicture({
    quality: 50, destinationType: Camera.DestinationType.DATA_URL
  });
  // Preview image
  document.getElementById('preview').src = 'data:image/jpeg;base64,' + image;
}
```
**Tested:** ✅ Yes

## 4. 📱 Barcode/QR Scanner
**Description:** Scan barcode/QR code, display result
**Dependencies:** html5-qrcode library (CDN) or cordova-plugin-qrscanner
**Code Pattern:**
```javascript
const scanner = new Html5Qrcode("reader");
scanner.start({ facingMode: "environment" }, (decodedText) => {
  alert("Scanned: " + decodedText);
  scanner.stop();
});
```
**Tested:** ✅ Yes (Cordova)

## 5. 🧾 Bluetooth Receipt Printing
**Description:** Connect to Bluetooth thermal printer, print receipt
**Dependencies:** cordova-plugin-bluetooth-printer (custom)
**Code Pattern:** (custom per printer)
**Tested:** ❌ Not tested

## 6. 🔔 Push Notifications (FCM)
**Description:** Receive push notifications, handle taps
**Dependencies:** cordova-plugin-fcm / @capacitor/push-notifications
**Code Pattern:**
```javascript
FCMPlugin.onNotification((data) => {
  if (data.wasTapped) { /* App was in background */ }
  else { /* App was in foreground */ }
});
```
**Tested:** ❌ Not tested

## 7. 📴 Offline Mode
**Description:** Service Worker + IndexedDB for offline access
**Dependencies:** Service Worker API
**Code Pattern:** (in sw.js)
```javascript
self.addEventListener('install', (e) => e.waitUntil(caches.open('v1').then(cache => cache.addAll(['/', '/index.html', '/app.js']))));
self.addEventListener('fetch', (e) => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
```
**Tested:** ✅ Yes

## 8. 🗣️ Bangla/English i18n
**Description:** Multi-language support with Bangla and English
**Dependencies:** None (custom JSON-based)
**Code Pattern:**
```javascript
const lang = localStorage.getItem('lang') || 'bn';
function t(key) { return translations[lang][key] || key; }
```
**Tested:** ✅ Yes

## 9. 🌙 Dark Mode Toggle
**Description:** Toggle light/dark theme, respect system preference
**Dependencies:** CSS variables + localStorage
**Tested:** ✅ Yes

## 10. 🔄 APK Update Check
**Description:** Check for newer version, download APK
**Dependencies:** HTTP request to version endpoint
**Tested:** ❌ Not tested

## 11. 💾 Data Export (CSV/JSON)
**Description:** Export table data to CSV or JSON file
**Dependencies:** Blob + URL.createObjectURL
**Tested:** ✅ Yes

## 12. 📄 PDF Generation
**Description:** Generate PDF from data (reports, invoices)
**Dependencies:** jsPDF library (CDN)
**Tested:** ⚠️ Partial

## 13. 📞 Click-to-Call + SMS
**Description:** Open phone dialer or SMS app
**Dependencies:** `<a href="tel:">` and `<a href="sms:">`
**Tested:** ✅ Yes

## 14. 🔗 Deep Linking
**Description:** Open app from URL / handle custom scheme
**Dependencies:** cordova-plugin-customurlscheme / @capacitor/app
**Tested:** ❌ Not tested

## 15. 🚫 Screen Recording Block
**Description:** Prevent screenshots/recording on sensitive screens
**Dependencies:** FLAG_SECURE (native)
**Code Pattern (java):** `getWindow().setFlags(LayoutParams.FLAG_SECURE, LayoutParams.FLAG_SECURE);`
**Tested:** ❌ Not tested

## 16. 🔑 Social Login
**Description:** Login with Google or Facebook
**Dependencies:** Google Sign-In SDK / Facebook SDK (Cordova plugin)
**Tested:** ❌ Not tested

## 17. ⭐ Rate & Share
**Description:** Share app link, rate on Play Store
**Dependencies:** navigator.share API
**Code Pattern:**
```javascript
navigator.share({ title: 'My App', url: 'https://play.google.com/store/apps/details?id=com.example' });
```
**Tested:** ✅ Yes

## 18. 🔐 Biometric Auth
**Description:** Fingerprint/Face ID login
**Dependencies:** cordova-plugin-fingerprint-aio / @capacitor/biometric-auth
**Code Pattern:**
```javascript
Fingerprint.show({ description: 'Login with fingerprint' })
  .then(() => login())
  .catch(() => showPasswordLogin());
```
**Tested:** ❌ Not tested
