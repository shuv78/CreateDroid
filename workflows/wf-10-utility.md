# wf-10 — 🛠️ Utility Commands

## Commands

### "skill check" — Self-Diagnosis
```bash
# Verify all required files exist
MISSING=0
for file in "SKILL.md" "workflows/wf-01-create.md" "knowledge/01-category-templates.md" "scripts/build-cordova.sh"; do
  if [ ! -f "$SKILL_DIR/$file" ]; then
    echo "❌ MISSING: $file"
    MISSING=$((MISSING+1))
  fi
done

for dir in "workflows" "knowledge" "scripts" "templates/cordova-firebase" "templates/capacitor-supabase"; do
  if [ ! -d "$SKILL_DIR/$dir" ]; then
    echo "❌ MISSING: $dir/"
    MISSING=$((MISSING+1))
  fi
done

if [ $MISSING -eq 0 ]; then echo "✅ All skill files intact!"; else echo "⚠️ $MISSING issues found. Use 'skill fix' to restore."; fi
```

### "skill fix" — Auto-Repair
- If golden copies exist in `knowledge/15-golden-copies.md` → restore
- Otherwise → recreate from known-good content in `templates/`

### "skill reset" — Full Restore
- Clear current skill directory
- Re-extract from golden copies

### "health check" — Environment Verification
Run `scripts/health-check.sh`.

### "backup project" — Full Timestamped Backup
Run `scripts/backup.sh`.

### "list projects" — Show Registry
```bash
cat .REGISTRY/projects.json 2>/dev/null | python3 -m json.tool 2>/dev/null
```

### "register project [path]" — Add to Registry
```bash
# Detects and registers
```

### "purge backups" — Clean Old Backups
Run `scripts/purge-old-backups.sh`.
