# wf-09 — 🧠 Learning System (Auto-Triggered)

## Entry
This workflow auto-triggers AFTER every:
- Bug fix (wf-03 completes)
- User correction ("no, that's wrong")
- User preference ("I like [X] better")
- Build failure resolved

## What It Saves

### 1. Bug Patterns → `knowledge/07-bug-patterns.md`
```bash
cat >> knowledge/07-bug-patterns.md << PATTERN
### Pattern: [pattern_name]
**Symptom:** "What the user said was broken"
**Root Cause:** What was actually wrong
**Evidence:** grep pattern, console message, or behavior
**Fix:** What was changed
**Date:** $(date +%Y-%m-%d)
PATTERN
```

### 2. User Preferences → `knowledge/08-user-preferences.md`
```bash
cat >> knowledge/08-user-preferences.md << PREF
### Preference: [preference_name]
**User said:** "User's exact words"
**Meaning:** Non-technical translation
**Applied as:** What was done to honor it
**Date:** $(date +%Y-%m-%d)
PREF
```

### 3. Build Failures → `knowledge/09-build-env.md`
If build fails, save the error + fix:
```bash
cat >> knowledge/09-build-env.md << BFAIL
### Build Error: [error_message_brief]
**Error:** Full error captured
**Root Cause:** Why it happened
**Fix:** How it was resolved
**Date:** $(date +%Y-%m-%d)
BFAIL
```

## Auto-Scan: Check Existing Preferences
On every new task, scan preferences first:
```bash
if grep -q "version.*login" knowledge/08-user-preferences.md; then
  echo "✅ Remember: Version must be on login screen"
fi
```

## Growth Tracking
| Session | Bugs Learned | Preferences Saved | Build Fixes |
|:--------|:------------:|:-----------------:|:-----------:|
| (auto-track in .REGISTRY/learning-stats.json) |
