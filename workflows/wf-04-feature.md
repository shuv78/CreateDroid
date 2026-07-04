# wf-04 — ➕ Add Feature to Existing App

## Entry
User says: "add [X]" / "I need [feature]" / "feature lagao"

## Step 0 — Check Feature Library
Look up `knowledge/02-feature-library.md` for the 18 features.

If feature not in library:
1. Check `knowledge/06-plugin-reference.md` (maybe it needs a plugin)
2. If still not found → "This feature is custom. I'll need to build it. ~30 min extra. Okay?"

## Step 1 — Compatibility Check
| Feature | Requires | Check |
|:--------|:---------|:------|
| Maps | Google Maps API key, cordova-plugin-googlemaps | Check config.xml |
| Payment | Internet, merchant number | — |
| Camera | Camera permission, cordova-plugin-camera | Check AndroidManifest |
| Scanner | Camera, html5-qrcode lib | Check index.html scripts |
| Chat | Firebase Realtime DB / Supabase Realtime | Check backend |
| Notifications | cordova-plugin-fcm, google-services.json | Check config |
| Biometric | cordova-plugin-fingerprint-aio | Check plugin list |

## Step 2 — Backup
Run `scripts/backup.sh`.

## Step 3 — Install Required Plugin
Run `scripts/add-plugin.sh <plugin-name>`.

## Step 4 — Insert Feature
From template, copy the feature file to app:
- Cordova: Copy `templates/cordova-firebase/features/feature-X.html` to project
- Capacitor: Copy `templates/capacitor-supabase/src/features/useX.js` to project

Then:
1. Add feature UI link to navigation/menu
2. Add event handler for the feature
3. Wire up to existing data flow

## Step 5 — Integration Test
1. Open app in browser
2. Test feature flow end-to-end
3. Check console for errors
4. Confirm with user

## Step 6 — Update Project Registry
Update `.REGISTRY/projects.json` with new feature.

## Step 7 — Build
Ask: "Build APK now? Or test more?"
