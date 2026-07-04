#!/bin/bash
#
# CreateDroid Growth Tracker
# Fetches GitHub API metrics for repo growth analysis
# Called by cron job — outputs JSON for the Hermes agent to analyze
#
# Usage: ./tracker.sh [owner/repo]
# Default: shuv78/CreateDroid

REPO="${1:-shuv78/CreateDroid}"
DATA_DIR="$(cd "$(dirname "$0")" && pwd)"
HISTORY_FILE="$DATA_DIR/growth-history.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# GitHub API response
GH_RESPONSE=$(gh api "repos/$REPO" --jq '{stars: .stargazers_count, forks: .forks_count, open_issues: .open_issues_count, watchers: .subscribers_count, language: .language, topics: .topics, created_at: .created_at, pushed_at: .pushed_at, updated_at: .updated_at, description: .description}' 2>/dev/null)

if [ -z "$GH_RESPONSE" ]; then
  echo "{\"error\": \"Failed to fetch repo data for $REPO\", \"timestamp\": \"$TIMESTAMP\"}"
  exit 1
fi

# Traffic data (clones)
TRAFFIC_RESPONSE=$(gh api "repos/$REPO/traffic/clones" --jq '{count: .count, uniques: .uniques}' 2>/dev/null || echo '{"count": 0, "uniques": 0}')

# Traffic data (views)
VIEWS_RESPONSE=$(gh api "repos/$REPO/traffic/views" --jq '{count: .count, uniques: .uniques}' 2>/dev/null || echo '{"count": 0, "uniques": 0}')

# Referrer data
REFERRERS_RESPONSE=$(gh api "repos/$REPO/traffic/popular/referrers" --jq '[.[] | {referrer: .referrer, count: .count, uniques: .uniques}]' 2>/dev/null || echo '[]')

# Search appearance count — simple keyword ranking check
SEARCH_KEYWORDS=("android app builder" "cordova template" "capacitor template" "apk builder" "create android app" "mobile app template" "android template")
SEARCH_RESULTS="["
FIRST=true
for kw in "${SEARCH_KEYWORDS[@]}"; do
  SEARCH_COUNT=$(gh search repos "CreateDroid $kw" --json id --jq 'length' 2>/dev/null || echo 0)
  SEARCH_POSITION=$(gh search repos "$kw" --json name,stargazers_count --limit 30 --jq "[.[] | select(.name == \"CreateDroid\") | {keyword: \"$kw\", rank: index(.) + 1, total_results: length}]" 2>/dev/null || echo "[]")
  if [ "$FIRST" = true ]; then
    SEARCH_RESULTS+="$SEARCH_POSITION"
    FIRST=false
  else
    SEARCH_RESULTS+=",$SEARCH_POSITION"
  fi
done
SEARCH_RESULTS+="]"

# Build output
SNAPSHOT=$(cat <<EOF
{
  "timestamp": "$TIMESTAMP",
  "repo": "$REPO",
  "stats": $GH_RESPONSE,
  "traffic": {
    "clones": $TRAFFIC_RESPONSE,
    "views": $VIEWS_RESPONSE
  },
  "referrers": $REFERRERS_RESPONSE,
  "search_ranking": $SEARCH_RESULTS
}
EOF
)

# Append to history
if [ -f "$HISTORY_FILE" ]; then
  # Read existing, append new entry
  TMP_FILE=$(mktemp)
  python3 -c "
import json, sys
with open('$HISTORY_FILE') as f:
    data = json.load(f)
data['entries'].append(json.loads('''$SNAPSHOT'''))
with open('$TMP_FILE', 'w') as f:
    json.dump(data, f, indent=2)
" 2>/dev/null
  mv "$TMP_FILE" "$HISTORY_FILE"
else
  echo "{\"repo\": \"$REPO\", \"entries\": [$SNAPSHOT]}" > "$HISTORY_FILE"
fi

# Output current snapshot for agent consumption
echo "$SNAPSHOT"
