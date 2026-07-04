# CreateDroid Growth Engine 🤖📈

This directory powers CreateDroid's **self-evolving growth tracking system**.

Every week, an automated Hermes cron job:
1. 📊 **Fetches** repo stats via GitHub API (stars, forks, clones, referrers, search rankings)
2. 📈 **Analyzes** trends vs previous weeks
3. 💡 **Suggests** improvements (keywords, README tweaks, promotion tactics)
4. 🤖 **Auto-acts** on confident improvements (updates topics, patches README)
5. 📬 **Reports** to the repo owner on Telegram

### Files
| File | Role |
|:-----|:-----|
| `tracker.sh` | Fetches GitHub API data → saves to `growth-history.json` |
| `analyzer.sh` | Reads history → produces analysis + suggestions + auto-actions |
| `growth-history.json` | Persistent metrics database (append-only) |

### How It Evolves
The analyzer's suggestion engine improves over time:
- If an auto-action led to more stars → it does more of that
- If a keyword stopped working → it drops it, tries another
- If README changes increase traffic → it notes what worked

### Privacy
Only public GitHub data is used. No personal data is collected.
