# wf-06 — 🆘 Emergency Rollback

## Entry
User says: "undo" / "kharap hoye geche" / "destroyed" / "broke everything" / "puranota chai"

## Step 1 — Calm User
"Don't worry. I have a backup system. Let me restore immediately."

## Step 2 — Find Last Backup
```bash
ls -lt "$PROJECT_DIR/.BACKUP/" | head -5
```
Show list to user:
```
Available backups:
1. myapp-2026-07-05-143022.tar.gz  (Just now — before last change)
2. myapp-2026-07-05-120000.tar.gz  (Earlier today)
Which one? (1/2)
```

## Step 3 — Restore
Run `scripts/rollback.sh <number>`.

## Step 4 — Verify
- Check app loads in browser
- Check console for errors
- Confirm with user: "Dekhun, previous version back. Now work from here?"

## Step 5 — Save to Error Database
Record what went wrong in `knowledge/07-bug-patterns.md` (new entry):
```
Symptom: "undo / broke after [change]"
Root Cause: [what the bad change was]
Prevention: [how to avoid next time]
```
