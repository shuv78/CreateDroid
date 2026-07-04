# 07 — Bug Pattern Database (GROWS with every fix)

> ⚠️ **This file is auto-growing.** Every time a bug is fixed via wf-03-fix, a pattern is saved here. On future encounters, these patterns are checked FIRST for instant fixes.

## Pattern Index

| # | Pattern Name | Symptom Keywords | Last Seen | Fixed |
|:-:|:-------------|:-----------------|:---------:|:-----:|
| 01 | white_screen_babel_standalone | "white screen" "kali screen" "blank" | 2026-07-05 | ✅ |
| 02 | const_redeclaration_migration | "Uncaught SyntaxError" "Identifier has already been declared" | 2026-07-05 | ✅ |
| 03 | firestore_listener_leak | "app freeze" "slow after login" "too many reads" | 2026-07-05 | ✅ |
| 04 | imei_regex_escape | "IMEI validation fails" "invalid IMEI" | 2026-07-05 | ✅ |
| 05 | firebase_initialize_guard | "Firebase app already exists" "init error" | 2026-07-05 | ✅ |
| 06 | photo_cleanup_timing | "photo not saving" "image upload fails" | 2026-07-05 | ✅ |
| 07 | null_unsub_function | "Cannot read properties of null (reading 'unsubscribe')" | 2026-07-05 | ✅ |
| 08 | missing_esc_in_template | "XSS" "broken template" "IMEI showing raw" | 2026-07-05 | ✅ |
| 09 | dead_collection_redirect | "collection not found" "wrong data showing" | 2026-07-05 | ✅ |
| 10 | fake_notify_button | "notify not working" "silent button" | 2026-07-05 | ✅ |
| 11 | babel_standalone_parse_error | "white screen" + "no console errors" | 2026-07-05 | ✅ |
| 12 | missing_safe_area | "notch cut off" "content under notch" | 2026-07-05 | ⚠️ |
| 13 | localStorage_missing_trycatch | "cannot read from storage" | 2026-07-05 | ⚠️ |

## Pattern Details

### Pattern 01: white_screen_babel_standalone
**Symptom:** "White screen" or "kali screen" — nothing visible, no console errors
**Root Cause:** Babel standalone fails to parse App.jsx due to syntax error. HTML loads but React never renders.
**Evidence:** `type="text/babel"` in index.html script tags + empty console
**Fix:** Use pre-compiled ES5 instead of Babel standalone. Remove `type="text/babel"` and use regular `type="text/javascript"`. Replace JSX with `createElement` calls.
**Fixed by:** wf-03-fix on 2026-07-05

### Pattern 02: const_redeclaration_migration
**Symptom:** "Uncaught SyntaxError: Identifier '...' has already been declared" in console
**Root Cause:** When migrating from modular JS to single HTML, `const`/`let` variables from different files end up in same scope. Second script redeclares already-declared variables.
**Evidence:** Multiple script tags in index.html each using `const`.
**Fix:** Change second+ declarations to plain variable assignments (no `const`/`let`/`var`), or wrap each in an IIFE, or use `var` in global scope.
**Fixed by:** wf-03-fix on 2026-07-05

### Pattern 03: firestore_listener_leak
**Symptom:** "App gets slow" "Firebase reads too high" "unsubscribe error after logout"
**Root Cause:** Multiple `onSnapshot` listeners accumulate without cleanup. On logout, listeners try to update unmounted components.
**Evidence:** `onSnapshot` called without corresponding `unsubscribe()` in cleanup
**Fix:** Store unsubscribe functions in window-scoped array. Call all on logout. Clean array.
**Fixed by:** wf-03-fix on 2026-07-05

### Pattern 04: imei_regex_escape
**Symptom:** "IMEI validation fails" "invalid IMEI shown"
**Root Cause:** Escaped backslash in regex (`\\d`) becomes double-escaped (`\\\\d`) when HTML parses string. Invalid regex matches wrong or nothing.
**Evidence:** IMEI field accepts invalid values or rejects valid ones.
**Fix:** Use single backslash (`\d`) in regex literal, not string. Avoid RegExp constructor.
**Fixed by:** wf-03-fix on 2026-07-05

### Pattern 05: firebase_initialize_guard
**Symptom:** "Firebase app already exists" error
**Root Cause:** Firebase initialized multiple times (page reload, multiple script loads)
**Evidence:** `firebase.initializeApp()` called twice
**Fix:** Guard with `if (!firebase.apps.length) { firebase.initializeApp(config); }`
**Fixed by:** wf-03-fix on 2026-07-05

### Pattern 06: photo_cleanup_timing
**Symptom:** "Photo not saving" "Captured photo lost"
**Root Cause:** Camera plugin's temporary file cleanup runs before the app saves the photo URI. Race condition.
**Evidence:** Photo shows briefly then disappears.
**Fix:** Move photo save logic into `.then()` callback (not outside). Handle the URI immediately.
**Fixed by:** wf-03-fix on 2026-07-05

### Pattern 07: null_unsub_function
**Symptom:** "Cannot read properties of null (reading 'unsubscribe')"
**Root Cause:** Template literal renders "null" or "undefined" as string text instead of showing actual value. Or unsubscribe is called on undefined listener.
**Evidence:** Login screen shows "null" as username after logout (or console error on logout).
**Fix:** Ensure unsubscribe functions exist before calling. Guard: `if (typeof unsub === 'function') unsub();`
**Fixed by:** wf-03-fix on 2026-07-05

### Pattern 08: missing_esc_in_template
**Symptom:** "Broken template" "XSS vulnerability"
**Root Cause:** Dynamic values (IMEI, name) inserted directly into innerHTML without escaping special characters like `<` `>` `&`.
**Evidence:** IMEI with `<` character breaks the page structure.
**Fix:** Always use `esc(str)` function: `str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')`
**Fixed by:** wf-03-fix on 2026-07-05

### Pattern 09: dead_collection_redirect
**Symptom:** "Collection not found" "Wrong data showing"
**Root Cause:** Old code references a removed collection (e.g., 'sales' → 'pending_sales'). No redirect/alias.
**Evidence:** Query returns empty or undefined.
**Fix:** Check if collection exists, redirect to new name. Or maintain a dual-cache fallback.
**Fixed by:** wf-03-fix on 2026-07-05

### Pattern 10: fake_notify_button
**Symptom:** "Notify button does nothing" "Silent button"
**Root Cause:** Button was added in UI but event handler was never implemented. onClick points to undefined function or empty function body.
**Evidence:** Clicking button does nothing, no console output.
**Fix:** Replace with honest message: "Coming soon" or implement actual notification via FCM.
**Fixed by:** wf-03-fix on 2026-07-05

### Pattern 11: babel_standalone_parse_error
**Symptom:** White screen, NO errors in console on modern browsers
**Root Cause:** Babel standalone fails to transpile. Modern browsers may suppress certain parse errors. Script silently fails.
**Evidence:** Using Babel standalone + no content rendered
**Fix:** Pre-compile to ES5. Remove Babel dependency entirely for production.
**Fixed by:** wf-03-fix on 2026-07-05

### Pattern 12: missing_safe_area
**Symptom:** "Notch cut off" "Content hidden under notch"
**Root Cause:** Missing `viewport-fit=cover` in viewport meta + missing `safe-area-inset-*` CSS
**Evidence:** Content hidden behind notch on iPhone X+ / Android notch phones
**Fix:** Add `viewport-fit=cover` and use `env(safe-area-inset-top)` CSS
**Fixed by:** (not yet — use app-about-section-rule skill)

### Pattern 13: localStorage_missing_trycatch
**Symptom:** "Cannot read from storage" in older browsers / private mode
**Root Cause:** `localStorage.getItem()` called without try/catch. Private browsing in some browsers throws on storage access.
**Evidence:** Entire app crashes on startup in private mode
**Fix:** Wrap all localStorage calls: `try { ... } catch(e) { /* storage unavailable */ }`
**Fixed by:** (not yet — documented for future)
