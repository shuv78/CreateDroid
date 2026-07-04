# wf-02 — 🔍 Deep Analyze Existing

## Entry
User says: "analyze this" / "check my app" / "deep analysis" / "problem check karo"

## Step 1 — Framework Detection
```bash
cd "$PROJECT_DIR"
if grep -q "cordova" config.xml 2>/dev/null; then FRAMEWORK="cordova"
elif grep -q "capacitor" package.json 2>/dev/null; then FRAMEWORK="capacitor"
elif grep -q "vite" package.json 2>/dev/null; then FRAMEWORK="vite+capacitor"
else FRAMEWORK="unknown"
fi
```

## Step 2 — Backend Detection
```bash
grep -r "firebase\|firestore\|FIREBASE\|supabase\|supabaseUrl\|SUPABASE" . --include="*.html" --include="*.js" --include="*.jsx" --include="*.json" | head -5
```

## Step 3 — App Type Inference
From detected screens, features, and data models → match to `knowledge/01-category-templates.md`.

## Step 4 — Health Score Calculation
Run all 3 layers and compute:

| Score | Meaning |
|:-----:|:--------|
| 9-10 | ✅ Excellent — ready for production |
| 7-8 | ⚠️ Minor issues |
| 5-6 | 🔴 Needs work |
| 1-4 | ❌ Broken — rebuild recommended |

## Step 5 — Layer 1: Known Pattern Scan
Grep source for 13 patterns from `knowledge/07-bug-patterns.md`.

## Step 6 — Layer 2: Browser Test
Run `scripts/browser-autopsy.sh`.

## Step 7 — Layer 3: Heuristic Analysis
Run `scripts/heuristic-scan.sh`.

## Step 8 — Security Audit
Run `scripts/security-audit.sh`.

## Step 9 — UI Audit
Check:
- Safe-area insets for notch phones
- Responsive layout (320px-480px)
- Dark mode support
- Bangla text rendering
- Touch target size >44px

## Step 10 — Generate Report
```
📊 HEALTH SCORE: 7/10 — ⚠️ Minor Issues

🔍 Framework: Cordova 12.0.1 + Firebase
📁 App Type: Phone Distribution (OPPO)

LAYER 1 — Known Patterns:  2 issues
  • [BUG-03] white_screen_babel_standalone (app.js:45)
  • [BUG-07] const_redeclaration_migration (db.js:12)

LAYER 2 — Browser Test:  PASS (no console errors)

LAYER 3 — Heuristic: 1 issue
  • Missing try/catch on localStorage (settings.js:23)

🔐 Security: 0 issues (clean)
🎨 UI Audit: Safe-area ✅  Responsive ⚠️ (overflow on list page)

Recommendation: Fix Layer 1 issues first, then rebuild.
```

## Step 11 — Ask
"Fix these issues? Say 'kro' to proceed to wf-03-fix."
