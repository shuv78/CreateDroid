# wf-03 — 🔧 Fix Bug

## Entry
User says: "X is broken" / "bug ta fix karo" / "kali screen" / "not working" / result from wf-02

## Step 0 — Bug Pattern Database Check
Before ANY analysis, check `knowledge/07-bug-patterns.md` for matching patterns.

```bash
# Search pattern database for matching bug
grep -A 3 "Symptom:.*$USER_COMPLAINT" knowledge/07-bug-patterns.md
```

If match found → **instant fix** using known root cause + solution. Skip to Step 5.

## Step 1 — Reproduce
Ask: "When does it happen? What do you see?"
- "Kali screen / blank" → Check console errors, JavaScript parse errors
- "Button not working" → Check click handler, event binding
- "Data not showing" → Check API calls, Firestore queries
- "App crashing" → Check for recent code changes

## Step 2 — Backup
Run `scripts/backup.sh`.

## Step 3 — Find Root Cause
Systematic approach:
1. **Syntax validation** → `node -c file.js` or browser console
2. **Dependency check** → Missing imports, wrong CDN URLs
3. **Timing** → Race conditions, undefined before init
4. **Data flow** → Wrong variable names, mismatched Firestore fields
5. **Environment** → API keys, URLs, CORS

For each bug type:

| Bug Symptom | Root Cause Checklist |
|:------------|:---------------------|
| White/blank screen | Babel parse error, missing React UMD, syntax error |
| Data not loading | Wrong collection name, missing permissions, offline |
| Login fails | Wrong auth method, expired token, wrong credentials |
| Button click no action | Undefined function, wrong ID binding, event.prevent |
| UI broken/layout | Missing safe-area, responsive breakpoint, overflow |

## Step 4 — Fix ONE Bug at a Time
1. Make minimal change
2. Test in browser
3. Confirm with user: "Fixed? Check karo."
4. If user says "no" → rollback (`scripts/rollback.sh`) → try different approach

## Step 5 — Save to Bug Pattern Database
```bash
cat >> knowledge/07-bug-patterns.md << 'PATTERN'
### Pattern: [bug_name]
**Symptom:** "[user complaint]"
**Root Cause:** [what was actually wrong]
**Evidence:** [how to detect: grep pattern, console message, etc.]
**Fix:** [what was changed]
**Fixed by:** wf-03-fix on $(date +%Y-%m-%d)
PATTERN
```

## Step 6 — Loop
→ If more bugs remain, go to Step 1
→ If all fixed, run `scripts/build-ship.sh`
→ Report to user: "All bugs fixed. Build and send?"
