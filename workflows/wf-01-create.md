# wf-01 — 🏗️ Create New App

## Entry
User says: "I want [X] app" / "Make me an app" / "[type] app banao"

## Step 1 — Detect Category
Map user's natural language to one of 37 categories in `knowledge/01-category-templates.md`.

Example mappings:
| User says | Category |
|:----------|:---------|
| "shop / store / dokan" | E-commerce |
| "restaurant / hotel / food" | Food/Restaurant |
| "taxi / ride / car" | Ride Booking |
| "phone / mobile / retailer" | Phone Distribution (OPPO) |
| "booking / appointment" | Service Booking |

**Fallback:** Ask 1-2 clarifying questions. "Business app or customer app? What do you sell?"

## Step 2 — Scale Assessment
Use `knowledge/10-scale-assessment.md`. Present 🟢/🟡/🔴 to user.

> 🟢 Simple (5-15 min) / 🟡 Medium (20-40 min) / 🔴 Complex (60-120 min)

**Must get user approval before proceeding.**

## Step 3 — 5 Discovery Questions
Ask in natural language. Map answers to tech decisions:

| Question | Purpose |
|:---------|:--------|
| "Need to take photos?" | Camera plugin |
| "Need location/GPS?" | Maps plugin + permission |
| "Need payments?" | bKash/Stripe |
| "Need live updates?" | Firebase Realtime / Supabase |
| "Different user roles?" | Auth system |

## Step 4 — Auto-Select Stack
| Criteria | Stack |
|:---------|:------|
| 1-3 screens, fast delivery | Cordova + Firebase |
| 4+ screens, complex features | Capacitor + Supabase |
| Realtime needed | Firebase (Realtime DB) |
| Financial data | Supabase (PostgreSQL) |

## Step 5 — Generate Data Model
Map business answers to database schema.

Example: Phone Distribution → `{ products{name,model,price,imei,stock}, dealers{name,area,phone,limit}, orders{}, payments{} }`

## Step 6 — Scaffold from Template
1. Copy base template (`templates/cordova-firebase/` or `templates/capacitor-supabase/`)
2. Customize: app name, package ID, colors
3. Insert data model into screen logic
4. Add features based on discovery answers

## Step 7 — Customize
- Update config.xml / capacitor.config.json with app name
- Update index.html title and meta
- Set color scheme (ask user preference or pick based on category)
- Register project in `.REGISTRY/projects.json`

## Step 8 — Build & Ship
Run `wf-07-build` workflow.

## Step 9 — Post-Creation
- Save project to `.REGISTRY/projects.json`
- Record used features for future reference
- Ask "Add this to favorites?"
