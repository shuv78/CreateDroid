#!/bin/bash
# backup.sh — Timestamped backup: tar.gz the entire project directory to .BACKUP/, keep only last 5 backups
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/.BACKUP"
MAX_BACKUPS=5
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PROJECT_NAME=$(basename "$PROJECT_DIR")
BACKUP_FILE="${BACKUP_DIR}/${PROJECT_NAME}-${TIMESTAMP}.tar.gz"

echo "=== backup.sh ==="
echo "Project: $PROJECT_DIR"
echo "Backup to: $BACKUP_FILE"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Files/dirs to exclude
EXCLUDES=(
    "--exclude=node_modules"
    "--exclude=.BACKUP"
    "--exclude=platforms/android/app/build"
    "--exclude=android/app/build"
    "--exclude=**/.gradle"
    "--exclude=**/build"
    "--exclude=*.log"
)

# Create tar.gz
echo "Creating backup archive..."
tar -czf "$BACKUP_FILE" \
    "${EXCLUDES[@]}" \
    -C "$(dirname "$PROJECT_DIR")" \
    "$PROJECT_NAME" 2>/dev/null || {
    # Fallback: run from project dir
    cd "$PROJECT_DIR"
    tar -czf "$BACKUP_FILE" \
        --exclude=node_modules \
        --exclude=.BACKUP \
        --exclude='platforms/android/app/build' \
        --exclude='android/app/build' \
        --exclude='**/.gradle' \
        --exclude='**/build' \
        .
}

echo "Created: $BACKUP_FILE"
echo "Size: $(du -h "$BACKUP_FILE" | cut -f1)"

# Count existing backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)
echo "Current backups: $BACKUP_COUNT (max $MAX_BACKUPS)"

# Remove oldest backups if over limit
if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    REMOVE_COUNT=$((BACKUP_COUNT - MAX_BACKUPS))
    echo "Removing $REMOVE_COUNT oldest backup(s)..."
    ls -1t "$BACKUP_DIR"/*.tar.gz | tail -n "$REMOVE_COUNT" | while read -r old_backup; do
        rm -f "$old_backup"
        echo "  Removed: $(basename "$old_backup")"
    done
fi

echo ""
echo "Backups in $BACKUP_DIR:"
ls -1lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | awk '{print "  " $NF " (" $5 ")"}'

echo ""
echo "=== backup.sh: DONE ==="
