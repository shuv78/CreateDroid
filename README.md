<div align="center">
  <h1>🚀 CreateDroid</h1>
  <p>
    <strong>Build Android apps in 2 commands. No Android Studio required.</strong>
    <br>
    37 app types · 18 features · 4 themes · Cordova + Capacitor · Firebase + Supabase
  </p>
  <p>
    <a href="https://github.com/shuv78/CreateDroid/stargazers">
      <img src="https://img.shields.io/github/stars/shuv78/CreateDroid?style=for-the-badge&logo=github&color=06C755" alt="Stars">
    </a>
    <a href="https://github.com/shuv78/CreateDroid/forks">
      <img src="https://img.shields.io/github/forks/shuv78/CreateDroid?style=for-the-badge&logo=github&color=2196F3" alt="Forks">
    </a>
    <a href="https://github.com/shuv78/CreateDroid/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/shuv78/CreateDroid?style=for-the-badge&color=FF6F00" alt="License">
    </a>
    <br>
    <img src="https://img.shields.io/badge/Cordova-13.0+-35434F?style=flat-square&logo=apache-cordova&logoColor=white" alt="Cordova">
    <img src="https://img.shields.io/badge/Capacitor-6+-11998B?style=flat-square&logo=capacitor&logoColor=white" alt="Capacitor">
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React">
    <img src="https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase">
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase">
    <br>
    <strong>🔧 One Hermes command → Working APK</strong>
  </p>
</div>

---

## ✨ What is CreateDroid?

**CreateDroid is a Hermes Agent skill** that builds production-ready Android APKs from scratch — coding, fixing, building, and shipping — all through natural language. No Android Studio required.

Once installed via one command (`hermes skills install ...`), just tell Hermes what app you need and it handles the rest.

Whether you need a **calculator app** in 5 minutes or a **full e-commerce app** with payment, maps, notifications, and offline sync — CreateDroid has ready-made templates, scripts, and workflows.

---

## 📥 One-Click Install (for Hermes Agent)

```bash
hermes skills install https://raw.githubusercontent.com/shuv78/CreateDroid/main/SKILL.md
```

That's it. One command. Paste it in your Hermes terminal or send it in Telegram DM — skill is installed. Then just say:

> *"Build a scanner app"* or *"Build an e-commerce app with bKash payment"*

CreateDroid loads automatically whenever you mention building an Android app.

### 📦 Manual (No Agent)
```bash
git clone https://github.com/shuv78/CreateDroid.git
cd CreateDroid/templates/cordova-firebase
npm install && cordova platform add android
bash ../scripts/build-cordova.sh
```

---

## 🎯 In 30 Seconds

```bash
hermes skills install https://raw.githubusercontent.com/shuv78/CreateDroid/main/SKILL.md
```
Then in Hermes: *"Build a calculator app with dark theme"*

> **No Android Studio. No Gradle config. No Firebase setup tutorials. Just working code.**

---

## 📱 What You Can Build

| Category | App Types | Complexity |
|:---------|:----------|:----------:|
| 📊 **Business** | Invoice, Inventory, POS, CRM, Expense Tracker, HR | 🟢🟡🔴 |
| 🛒 **E-commerce** | Shop, Bidding, Rental, Classifieds | 🟡🔴 |
| 📰 **Content** | Blog, News, Magazine, Quote, Recipe | 🟢🟡 |
| 💬 **Social** | Chat, Forum, Dating, Social Feed | 🟡🔴 |
| 🎓 **Education** | Quiz, Attendance, Notes, Exam, Course | 🟢🟡 |
| 🛠️ **Utility** | Calculator, Converter, Scanner, Flashlight, Timer, Todo, Notes, Password Manager | 🟢 |
| 🎮 **Entertainment** | Music Player, Video Player, Gallery, Wallpaper, Joke | 🟢🟡 |
| 🌱 **Lifestyle** | Health, Fitness, Diet, Diary, Journal, Prayer Times | 🟢🟡 |
| 🚕 **Service** | Booking, Service Request, Delivery Tracking, Job Portal | 🟡🔴 |
| 🏢 **Dashboard** | Admin Panel, Analytics, Reporting | 🟢🟡 |

> 🔴 = Full-stack (database + auth + real-time + payments)

---

## 🧩 18 Features — Plug & Play

| Feature | Cordova | Capacitor |
|:--------|:-------:|:---------:|
| 📍 Maps + GPS | ✅ | ✅ |
| 💳 Payment (bKash/Nagad/Stripe) | ✅ | ✅ |
| 📸 Camera + Gallery | ✅ | ✅ |
| 📱 QR/Barcode Scanner | ✅ | ✅ |
| 💬 Real-time Chat | ✅ | ✅ |
| 🔔 Push Notifications (FCM) | ✅ | ✅ |
| 🌙 Dark Mode (system/manual) | ✅ | ✅ |
| 📤 Export (CSV/JSON/PDF) | ✅ | ✅ |
| 👆 Biometric Auth | ❌ | ✅ |
| 🖨️ Bluetooth Print | ❌ | ✅ |
| 📡 Offline Sync | ❌ | ✅ |
| 🔗 Deep Linking | ❌ | ✅ |
| 🔐 Social Login | ❌ | ✅ |
| ⭐ Rate + Share | ❌ | ✅ |

---

## 🎨 4 Design Systems

| Theme | Vibe | Primary |
|:------|:-----|:--------|
| **LINE** 🟢 | Clean, minimal, white + green | `#06C755` |
| **Material You** 🎨 | Dynamic color, elevation, ripple | Auto-generated |
| **Dark Minimal** 🌑 | Dark mode native, glass cards | `#0D1117` |
| **iOS 19** 🪟 | Frosted glass, spring animations | `#F2F2F7` |

---

## 🚦 Scale Assessment

Before starting, CreateDroid automatically checks your app's complexity:

```
🟢 Simple  → Calculator, Flashlight, Timer → Build in 5 min
🟡 Medium  → Chat, Scanner, Booking App → Build in 30 min  
🔴 Complex → E-commerce, CRM, Full Backend → Build in 2+ hrs
```

No surprises. You know the scope before you start.

---

## 🛠️ Automation Scripts

| Script | Does |
|:-------|:-----|
| `build-cordova.sh` | One-command Cordova APK build |
| `build-capacitor.sh` | One-command Capacitor APK build |
| `build-ship.sh` | Build + version bump + send APK via Telegram |
| `deep-analyze.sh` | Scan project → detect framework, backend, bug patterns + health score |
| `heuristic-scan.sh` | Find undeclared vars, missing imports, unsafe patterns |
| `security-audit.sh` | API key leak detector, hardcoded password scanner |
| `regression-check.sh` | 3-layer: known bugs + browser test + heuristic |
| `backup.sh` / `rollback.sh` | Emergency backup & restore |
| `health-check.sh` | Verify JDK, Android SDK, network before building |

---

## 🧬 Self-Learning Bug Database

CreateDroid learns. Every bug you fix gets **remembered**. Next time you run a scan, it checks:

- ✅ 13 known bug patterns (IMEI regex, photo cleanup, Firebase leaks, etc.)
- ✅ Previous fixes haven't regressed
- ✅ New code doesn't introduce old mistakes

---

## 🌐 i18n — Built-in Bangla + English

Every template ships with **full Bangla (bn)** and **English (en)** translations. 200+ UI strings per language — login, dashboard, settings, errors, everything. Add more languages in 2 lines.

---

## ⚡ Why CreateDroid?

| Problem | CreateDroid Solution |
|:--------|:---------------------|
| "Android Studio takes 30 min to set up" | **No Android Studio needed.** Just JDK + SDK |
| "I spend hours on boilerplate" | **Full app templates, not stubs.** Real working code |
| "Building APK is confusing" | **One command.** `./build-cordova.sh` → APK on Desktop |
| "My app crashes in production" | **Bug pattern DB** learns from every fix |
| "I need to deliver fast" | **Build + ship** via Telegram in one command |
| "I don't know what I can build" | **37 templates** with clear complexity assessment |

---

## 🚀 Quick Start (Full)

```bash
# Prerequisites
brew install openjdk@17  # Or use zulu17
export ANDROID_HOME=~/android-sdk

# Get CreateDroid
git clone https://github.com/shuv78/CreateDroid.git
cd CreateDroid/templates/cordova-firebase
npm install
cordova platform add android

# Build your APK
cd platforms/android
./gradlew assembleDebug
# APK is at: platforms/android/app/build/outputs/apk/debug/
```

Or use the automated builder:

```bash
bash CreateDroid/scripts/build-cordova.sh
```

---

## 📈 Growth Engine (Hermes Cron — Self-Tracking)

CreateDroid tracks its own growth via Hermes' cron system. Every Sunday, a self-evolving report is delivered to your Telegram:

- ⭐ Star count & weekly delta
- 🍴 Fork count
- 👁️ Unique visitors & clone count
- 🔥 Top traffic sources & search keywords
- 💡 Auto-suggestions for improvement

The growth engine learns — if a strategy isn't working, it adapts and tries something new.

---

## 🤝 Contribute

| Way | How |
|:----|:----|
| ⭐ **Star the repo** | Helps others discover it |
| 🐛 **Report a bug** | Open an issue |
| 💡 **Suggest a feature** | What app type is missing? |
| 🔧 **Submit a PR** | Templates, scripts, workflows |
| 📢 **Share it** | "Know someone building an app? Send them this." |

---

## 📄 License

MIT — Use it freely. Build anything.

---

<div align="center">
  <h3>⭐ If this saved you time, star the repo ⭐</h3>
  <p>
    <a href="https://github.com/shuv78/CreateDroid">
      <img src="https://img.shields.io/github/stars/shuv78/CreateDroid?style=social" alt="Star">
    </a>
  </p>
  <p>
    Built with ❤️ by <a href="https://github.com/shuv78">@shuv78</a>
  </p>
</div>
