# wf-05 — 🎨 Modify / Update Existing App

## Entry
User says: "change design" / "update" / "redesign" / "data change" / "migrate"

## Sub-Workflow A: Change Design Theme
### Entry: "look change karo" / "design change" / "new theme"
1. Ask: "Which design? (1) LINE (2) Material You (3) Dark Minimal (4) iOS 19"
2. Show preview descriptions from `knowledge/03-design-systems.md`
3. Backup
4. Replace CSS files with new theme
5. Update HTML class references if needed
6. Test in browser
7. Build APK

## Sub-Workflow B: Update Seed Data
### Entry: "data update" / "new products" / "prices change"
1. Find seed data file (seed-data.js, data.js, or hardcoded in code)
2. Backup
3. Apply changes
4. Verify in browser
5. Build

## Sub-Workflow C: Add/Remove Screens
### Entry: "add page" / "remove screen" / "new section"
1. Map current screen flow
2. Plan: which screen to add/remove
3. For add: copy from template, add to router
4. For remove: remove from router, delete file
5. Test navigation
6. Build

## Sub-Workflow D: Migrate Cordova → Capacitor
### Entry: "migrate to capacitor" / "new version" / "rebuild in capacitor"
1. Create new Capacitor project from template
2. Copy business logic (JS data files, calculations)
3. Rebuild UI screens as React components
4. Add Capacitor plugins matching old Cordova plugins
5. Set up same backend (Firebase/Supabase)
6. Test all features in browser
7. Build APK
8. Only delete old project after user confirms new one works

## Sub-Workflow E: Merge Two Apps
### Entry: "merge" / "combine" / "admin and dealer same"
1. Analyze both apps' screens and features
2. Create unified router with role-based access
3. Merge data models
4. Single login → redirect based on role
5. Test both roles
6. Build single APK
