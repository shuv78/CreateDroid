# 15 — Golden Copies (Emergency Fallbacks)

> 🏛️ These are known-good versions of critical files. If the skill files become corrupted, these are the fallback sources.

## Purpose
The `skill-self-heal.sh` script checks skill files against this manifest. If any file is missing or corrupt (wrong size), it logs the issue and offers to restore from golden copy logic embedded in the script itself.

## File Integrity Reference

| File | Expected Size Range | Notes |
|:-----|:------------------:|:------|
| `SKILL.md` | 3KB-5KB | Core orchestrator |
| `workflows/wf-01-create.md` | 2KB-4KB | Create workflow |
| `workflows/wf-02-analyze.md` | 2KB-4KB | Analyze workflow |
| `workflows/wf-03-fix.md` | 2KB-4KB | Fix workflow |
| `workflows/wf-04-feature.md` | 1KB-3KB | Feature workflow |
| `workflows/wf-05-modify.md` | 1KB-3KB | Modify workflow |
| `workflows/wf-06-emergency.md` | 0.5KB-2KB | Emergency workflow |
| `workflows/wf-07-build.md` | 2KB-4KB | Build workflow |
| `workflows/wf-08-resume.md` | 0.5KB-2KB | Resume workflow |
| `workflows/wf-09-learn.md` | 1KB-3KB | Learning workflow |
| `workflows/wf-10-utility.md` | 1KB-3KB | Utility workflow |
| `knowledge/01-category-templates.md` | 2KB-5KB | App categories |
| `knowledge/02-feature-library.md` | 5KB-10KB | 18 features |
| `knowledge/03-design-systems.md` | 2KB-5KB | 4 themes |
| `knowledge/04-business-models.md` | 4KB-8KB | Data schemas |
| `knowledge/05-backend-mapping.md` | 2KB-5KB | Backend guide |
| `knowledge/06-plugin-reference.md` | 4KB-8KB | Plugin list |
| `knowledge/07-bug-patterns.md` | 5KB-15KB | Bug patterns (grows) |
| `knowledge/08-user-preferences.md` | 1KB-3KB | Preferences (grows) |
| `knowledge/09-build-env.md` | 3KB-6KB | Build env |
| `knowledge/10-scale-assessment.md` | 2KB-5KB | Scale guide |
| `knowledge/11-scope-and-limitations.md` | 2KB-5KB | Scope |
| `knowledge/12-security-checklist.md` | 2KB-4KB | Security |
| `knowledge/13-offline-patterns.md` | 3KB-7KB | Offline patterns |
| `knowledge/14-app-compatibility.md` | 1KB-3KB | App relations |
| `knowledge/15-golden-copies.md` | 2KB-5KB | This file |

## Recovery Strategy

### If SKILL.md is missing:
The skill is loaded by Hermes from `SKILL.md`. If missing, Hermes reports error. Recreate using `wf-10-utility` → "skill fix" command.

### If workflow files are missing:
Each workflow can be re-extracted from memory / skill fix script. The fix script recreates any missing file from known-good content stored in-heap.

### If knowledge files are missing:
The skill can still function (workflows have inline instructions). Knowledge files provide depth but are not critical for basic operation.

### If scripts are missing:
Critical scripts (`build-cordova.sh`, `build-ship.sh`) are needed for APK delivery. The `skill-heal.sh` script recreates them from embedded fallback content.

## Self-Heal Priority

| Priority | File | Reason |
|:--------:|:-----|:-------|
| 🔴 P0 | `SKILL.md` | Skill won't load without it |
| 🔴 P0 | `scripts/build-cordova.sh` | Cannot build APK |
| 🔴 P0 | `scripts/build-ship.sh` | Cannot deliver APK |
| 🟡 P1 | `workflows/wf-01-create.md` through `wf-10-utility.md` | Core workflows |
| 🟡 P1 | `knowledge/09-build-env.md` | Build environment |
| 🟢 P2 | All other files | Depth/quality improvements |
