#!/bin/bash
# 
# CreateDroid Growth Analyzer
# Reads growth-history.json, analyzes trends, and outputs 
# auto-action suggestions for the Hermes cron agent
#
# Outputs: JSON with analysis + suggestions + auto-actions taken

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
HISTORY_FILE="$SCRIPT_DIR/growth-history.json"
REPO="shuv78/CreateDroid"

if [ ! -f "$HISTORY_FILE" ]; then
  echo '{"error":"No history found. Run tracker.sh first.","suggestions":[],"auto_actions":[]}'
  exit 1
fi

# Run python analysis
python3 -c "
import json, sys
from datetime import datetime, timezone

with open('$HISTORY_FILE') as f:
    data = json.load(f)

entries = data.get('entries', [])
if len(entries) < 1:
    print(json.dumps({'error':'Not enough history (need at least 1 entry)','suggestions':[],'auto_actions':[]}))
    sys.exit(0)

current = entries[-1]
prev = entries[-2] if len(entries) >= 2 else None

# === Extract metrics ===
metrics = {}
if 'stats' in current:
    metrics['stars'] = current['stats'].get('stars', 0)
    metrics['forks'] = current['stats'].get('forks', 0)
    metrics['watchers'] = current['stats'].get('watchers', 0)
    metrics['open_issues'] = current['stats'].get('open_issues', 0)

prev_metrics = {}
if prev and 'stats' in prev:
    prev_metrics['stars'] = prev['stats'].get('stars', 0)
    prev_metrics['forks'] = prev['stats'].get('forks', 0)

# === Calculate deltas ===
stars_delta = metrics.get('stars', 0) - prev_metrics.get('stars', 0) if prev else 0
forks_delta = metrics.get('forks', 0) - prev_metrics.get('forks', 0) if prev else 0

stars_growth_pct = 0
if prev and prev_metrics.get('stars', 0) > 0:
    stars_growth_pct = round((stars_delta / prev_metrics['stars']) * 100, 1)

# === Traffic data ===
traffic = current.get('traffic', {})
visitors = traffic.get('clones', {}).get('uniques', 0) + traffic.get('views', {}).get('uniques', 0)
total_views = traffic.get('views', {}).get('count', 0)
total_clones = traffic.get('clones', {}).get('count', 0)

# === Referrer analysis ===
top_referrers = []
for ref in current.get('referrers', [])[:5]:
    top_referrers.append(f\"{ref.get('referrer','unknown')}({ref.get('uniques',0)})\")

# === Search ranking ===
keywords_found = []
for kw_data in current.get('search_ranking', []):
    if isinstance(kw_data, list) and len(kw_data) > 0:
        for item in kw_data:
            if isinstance(item, dict) and 'keyword' in item:
                keywords_found.append(item)

# === SUGGESTION ENGINE ===
suggestions = []
auto_actions = []

# If stars growth is flat (< 5 new stars this period)
if stars_delta < 5 and prev:
    suggestions.append({
        'priority': 'high',
        'area': 'promotion',
        'message': f'Star growth is slow (+{stars_delta} this period). Consider: posting demo on X/Twitter, adding GIF to README, sharing in Android dev communities.'
    })

# If forks are disproportionately low
total_stars = metrics.get('stars', 0)
total_forks = metrics.get('forks', 0)
if total_stars > 20 and total_forks < 3:
    suggestions.append({
        'priority': 'medium',
        'area': 'contributor_friction',
        'message': 'Forks are low vs stars. Add CONTRIBUTING.md and a simpler PR workflow.'
    })

# If a referrer is driving significant traffic
if top_referrers:
    suggestions.append({
        'priority': 'info',
        'area': 'traffic_sources',
        'message': f'Top traffic sources: {\" | \".join(top_referrers[:3])}'
    })

# Keyword position check
for kw in keywords_found:
    rank = kw.get('rank', 999)
    keyword_name = kw.get('keyword', '')
    if rank <= 5:
        auto_actions.append({
            'action': 'maintain',
            'detail': f'CreateDroid ranks #{rank} for \"{keyword_name}\" — keep it optimized'
        })
    elif rank <= 20:
        suggestions.append({
            'priority': 'low',
            'area': 'seo',
            'message': f'CreateDroid ranks #{rank} for \"{keyword_name}\". Add this keyword to README heading.'
        })
        auto_actions.append({
            'action': 'add_keyword',
            'keyword': keyword_name,
            'detail': f'Adding \"{keyword_name}\" to repo topics and README'
        })

# === Build report ===
report = {
    'timestamp': current.get('timestamp', ''),
    'metrics': {
        'stars': {'current': metrics.get('stars', 0), 'delta': stars_delta, 'growth_pct': stars_growth_pct},
        'forks': {'current': metrics.get('forks', 0), 'delta': forks_delta},
        'visitors': visitors,
        'views': total_views,
        'clones': total_clones
    },
    'suggestions': suggestions,
    'auto_actions': auto_actions,
    'summary': {
        'status': 'growing' if stars_growth_pct > 10 else 'steady' if stars_growth_pct > 0 else 'flat',
        'star_milestone_next': ((metrics.get('stars', 0) // 10) + 1) * 10
    }
}

print(json.dumps(report, indent=2))
" 2>/dev/null || echo '{"error":"Analysis failed","suggestions":[],"auto_actions":[]}'
