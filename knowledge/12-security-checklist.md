# 12 — Security Checklist

## Pre-Delivery Security Audit (Run Before Every APK Send)

```
✅ / ❌ — Check every item before delivering APK
```

## 🔐 API Keys & Secrets

| Check | Command | Pass? |
|:------|:--------|:------|
| Firebase API key not restricted? | Check Firebase Console > API restrictions | — |
| Supabase anon key (non-critical)? | anon key is safe; service_role key is NOT | — |
| Hardcoded passwords in HTML? | `grep -r "password.*=" index.html *.js` | — |
| Hardcoded API keys in source? | `grep -rE "(apiKey|secret|token)\s*[:=]\s*['\"][A-Za-z0-9_-]{20,}"` | — |
| Telegram bot token in source? | ❌ **Should NEVER be in app code** | — |

## 📱 App Security

| Check | How | Pass? |
|:------|:----|:------|
| SQL injection in Supabase queries? | Check for raw string concatenation in queries | — |
| HTML injection in display fields? | Check `esc()` usage on dynamic content | — |
| Firestore rules restrictive? | Must not be `true` for all operations | — |
| localStorage contains sensitive data? | Check what's stored (passwords? NO!) | — |
| Auth token expiry handled? | Check if app redirects to login on 401 | — |

## 🛡️ Privacy & Data

| Check | How | Pass? |
|:------|:----|:------|
| Phone numbers visible in APK? | `grep -rE "01[3-9][0-9]{8}" *.html *.js` | — |
| User addresses exposed in code? | Hardcoded addresses? | — |
| Shared preferences in code? | Company secrets? | — |
| Permission rationale? | Does app explain WHY it needs camera/location? | — |

## 📦 APK Security

| Check | How | Pass? |
|:------|:----|:------|
| APK debuggable? | `unzip -p app.apk classes.dex` — check AndroidManifest | — |
| Minification enabled? | Production builds should minify | — |
| ProGuard enabled? | For release builds | — |
| Keystore password in source? | ❌ Should NOT be in HTML/JS code | — |

## 📊 Scoring

| Score | Meaning |
|:-----:|:--------|
| ✅ Pass all | Safe to deliver |
| ⚠️ 1-2 warnings | Inform user, still deliverable |
| ❌ Critical issue | Block delivery, fix first |
