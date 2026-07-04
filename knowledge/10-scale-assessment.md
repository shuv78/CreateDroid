# 10 — Scale Assessment

## Before ANY task — Assess Scale

| Step | Question | Purpose |
|:----:|:---------|:--------|
| 1 | "How many screens?" | Determine scaffolding time |
| 2 | "Need login/registration?" | Auth system +20% time |
| 3 | "Need backend?" | Server setup +30% time |
| 4 | "Photos/camera?" | Plugin +30% time |
| 5 | "Payments?" | Integration +50% time |

## 🟢 SIMPLE (5-15 minutes)

**Characteristics:** 1-3 screens, no auth, no backend (or simple Firebase)

**App types:** Calculator, notes, directory, contact list, utility converter
**Features max:** 0-2
**Screens:** Home only, maybe detail
**Template:** cordova-firebase (minimal)
**Build:** Single gradle command

**How to recognize user request:**
- "Calculator banao"
- "Contact list"
- "Price list show korbe"
- "Notes app"

## 🟡 MEDIUM (20-40 minutes)

**Characteristics:** 3-5 screens, login required, backend DB

**App types:** Shop, booking, inventory, attendance, form/survey
**Features max:** 2-4
**Screens:** Login, dashboard, list, form, profile
**Backend:** Firebase or Supabase
**Template:** cordova-firebase (full) or capacitor-supabase (if complex)

**How to recognize:**
- "Shop app"
- "Booking system"
- "Product inventory"
- "Customer management"
- "** korte hobe" (need to do X)

## 🔴 COMPLEX (60-120 minutes)

**Characteristics:** 5-10 screens, realtime features, push notifications, GPS, payments

**App types:** Food delivery, chat, CRM, marketplace, ride booking
**Features max:** 4-6
**Screens:** Login, dashboard, list, detail, form, profile, settings, chat, maps
**Backend:** Firebase Realtime + Auth + Storage + FCM
**Build:** May need multiple cycles

**How to recognize:**
- "Delivery app"
- "Chat app"
- "Full CRM"
- "Marketplace"
- Multiple "and" clauses in request

## 🔴🔴 VERY COMPLEX (2+ sessions)

**Characteristics:** Needs native features, multiple integrations, very large scope

**App types:** Social media platform, video streaming, marketplace with chat + payments + delivery
**Features:** 7+
**Warning signs:**
- "Facebook er moto" (like Facebook)
- "Full marketplace"
- "YouTube er moto" (like YouTube)
- Request mentions 3+ major features
- Realtime chat + payments + location + push + file upload all in one

## Present to User

Always present scale before executing:

```
🟢 Simple (10 min)
I'll create a contact list app. One screen, search, add/edit/delete contacts. No login needed.

Proceed? (Say "kro")
```

If user wants Complex but says "fast":
```
🔴 Complex (60 min) — This needs multiple features: login, products, cart, payments, and GPS tracking.

I can do it, but it will take ~1 hour. Or I can start now and deliver in pieces — first the working app, then GPS later.

Shall I start?
```
