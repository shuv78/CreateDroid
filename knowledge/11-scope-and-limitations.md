# 11 — Scope and Limitations

## ✅ CAN CREATE (37+ App Types)

### Business & Management (7)
CRM, Inventory, Order Management, Retail POS, Service Booking, Fleet Management, Job Portal

### E-Commerce & Sales (5)
E-commerce Shop, Food Delivery, Restaurant Menu, Laundry/Dry Clean, Beauty/Salon

### Real Estate & Property (3)
Real Estate Listings, Property Rental, Hotel Booking

### Transportation (3)
Ride/Taxi Booking, Delivery Tracking, Vehicle Service

### Social & Communication (3)
Chat/Messaging, Social Feed, Membership/Club

### Freelance & Marketplace (4)
Freelancer Marketplace, NGO/Donation, Government Service, Phone Distribution (OPPO)

### Health & Education (5)
Doctor Appointment, Health/Fitness, Education/Quiz, Online Course, Attendance Tracker

### Utilities & Tools (4)
Utility App, Notes/Directory, Diet/Nutrition, Baby/Child Tracker

### Content & Events (4)
News Reader, Event Management, Travel Planner, Forms/Survey

### + Special
Phone Distribution (OPPO-specific CRM)

### Technical Limitations within "CAN"
| Aspect | Limitation |
|:-------|:-----------|
| **Multi-platform** | Android only. iOS needs Mac + Xcode setup |
| **App Store** | Cannot upload to Play Store — user must do this |
| **Custom Server** | Small apps only. Large scale needs real server backend |
| **Performance** | WebView apps are 200-500ms slower than native |
| **Animations** | Complex 60fps animations not possible |
| **Camera** | Basic capture only. No real-time filters |
| **File size** | APK with WebView + engine ≈ 6MB minimum |

## ❌ CANNOT CREATE (10 App Types)

| App Type | Why Not |
|:---------|:--------|
| **🎮 3D Games (Unity)** | Needs native OpenGL rendering. WebView can't do 3D. |
| **📺 Live Streaming Apps** | Needs native encoders/decoders for low-latency streaming. |
| **🌐 AR/VR Apps** | Needs native ARKit/ARCore. WebView AR is too slow. |
| **🎬 Video/Podcast Editor** | WebView audio/video latency >200ms, no frame-level control. |
| **🔵 Bluetooth Headphone Companion** | Needs BLE GATT server. Web Bluetooth is limited. |
| **🛡️ VPN/Network Tools** | Needs VPN API — only accessible from native code. |
| **🤖 On-Device AI/ML** | TensorFlow Lite needs native bindings; too heavy for WebView. |
| **👻 Launcher/System Apps** | System permissions only available to native APKs. |
| **🎵 Background Music Player** | WebView is suspended in background. Audio stops. |
| **🔐 Password Manager** | Needs autofill framework integration — native only. |

## ⚠️ CAN with Significant Caveats

| App | Caveat |
|:----|:-------|
| **Chat app** | Needs Firebase Realtime (costs scale with users). Free tier ≈ 100 concurrent. |
| **Food delivery with GPS tracking** | GPS background tracking drains battery. Killed by Android Doze. |
| **E-commerce with payments** | Payment must redirect to bKash/Nagad app or webpage. In-app payment not possible. |
| **Push notifications** | FCM configuration is complex. Need google-services.json and Firebase project setup. |
| **Social media feed** | Infinite scroll performance degrades with 1000+ items. Need pagination. |
| **Multi-language** | Bangla rendering depends on device font support. Noto Sans Bengali recommended. |

## Real-World Examples Created

| App | Stack | Status |
|:----|:------|:-------|
| Admin App (OPPO) | Cordova + Firebase + Firestore | ✅ **Running in production** |
| Retailer App (OPPO) | Cordova + Firebase + Firestore | ✅ **Running in production** |
| Dealer CRM | Capacitor + React + Supabase | ✅ **Working** |
