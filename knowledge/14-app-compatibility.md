# 14 — App Compatibility

## Cross-App Understanding

The skill knows these apps and their relationships:

### OPPO Partner Ecosystem
```
admin-app (Cordova + Firebase)
  └── Manages: dealers, products, stock, orders
  └── Users: Admin only

retailer-app (Cordova + Firebase)  
  └── Manages: orders, stock view, profile
  └── Users: Retailers assigned to dealers

Relationship: admin-app pushes stock to retailers. 
              retailers order from admin-app via pending_sales collection.
```

### Dealer CRM (Separate Project)
```
dealer-crm (Capacitor + Supabase)
  └── Manages: dealers, retailers, orders, payments, reports
  └── Users: Unified admin+dealer login
  └── Newer: Replaces both admin-app + retailer-app eventually
```

### Future State
```
unified-crm (Choice of stack)
  └── Option A: Keep Cordova (simpler tech, same as existing)
  └── Option B: Capacitor + Supabase (like dealer-crm, for scalability)
```

## Which Template Works for Which App Type

| App Criteria | Template |
|:-------------|:---------|
| Single file, fast deploy, <3 screens | cordova-firebase (minimal) |
| Multiple screens, Firebase backend | cordova-firebase (full) |
| Complex UI, React-based, Supabase | capacitor-supabase (full) |
| Financial reports, charts, SQL | capacitor-supabase (for Supabase queries) |
| Chat, realtime, live updates | cordova-firebase (Firestore onSnapshot) |
| Offline-first, unreliable network | cordova-firebase (simpler offline) |
| Large app (10+ screens) | capacitor-supabase (React modularity) |

## Merge Compatibility

When user says "merge admin and dealer app":

| Aspect | Merged App |
|:-------|:-----------|
| Auth | Single login, role-based redirect |
| Navigation | Common nav bar, different menus per role |
| Data | Shared products, separate view permissions |
| Backend | Same Firebase/Supabase project, different collections |
| APK | Single APK, role determines UI |

## Migration Path: Cordova → Capacitor

| Step | Action | Risk |
|:-----|:-------|:----:|
| 1 | Create Capacitor project | None |
| 2 | Copy data JS files | None |
| 3 | Rebuild UI screens as React | High (UI may differ) |
| 4 | Add equivalent plugins | Medium (some don't exist) |
| 5 | Wire up same backend | Low (same API) |
| 6 | Test exhaustively | Critical |
| 7 | Deploy new, keep old | Safety net |
