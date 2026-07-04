# wf-08 — 🔄 Resume / Continue

## Entry
User says: "continue" / "resume" / "ki cholchilo?" / "from where we left"

## Step 1 — Read Session History
Use `session_search()` to find recent activity for this project.

## Step 2 — Read Project Registry
```bash
cat .REGISTRY/projects.json 2>/dev/null
```

## Step 3 — Check Last State
Check:
- What was the last workflow being executed?
- What step was incomplete?
- Was an APK built and sent? What version?
- Any known bugs reported?

## Step 4 — Report Summary
```
🔄 Resuming from July 5, 2026

📱 Project: Dealer CRM (Capacitor + Supabase)
🆕 Last Version: v2.0-B04 (Sent: July 5)
📋 Status: About section was incomplete
⏸️ Last Step: wf-07-build (Step 1 — Need to add version to login screen)
🐛 Known: None reported after delivery

Continue from where we left off? (Say "kro")
```

## Step 5 — Ask
User confirms → redirect to relevant workflow on the incomplete step.
