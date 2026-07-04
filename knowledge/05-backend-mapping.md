# 05 — Backend Mapping

## Decision Tree

```
User says "Need live updates?"
  ├── YES → Firebase (Realtime DB or Firestore with onSnapshot)
  └── NO → Continue

User says "Financial data? Reports with SQL?"
  ├── YES → Supabase (PostgreSQL)
  └── NO → Continue

User says "Many users? Complex auth rules?"
  ├── YES → Supabase (Row Level Security)
  └── NO → Firebase (Simple auth)

User says "Simple app, 1-3 screens"
  ├── YES → No backend needed (localStorage + seed data)
  └── NO → Use one of above
```

## Backend Comparison

| Feature | Firebase | Supabase |
|:--------|:---------|:---------|
| **Database** | NoSQL (JSON-like) | SQL (PostgreSQL) |
| **Auth** | Email, Google, Phone | Email, Google, GitHub + RLS |
| **Realtime** | ✅ Built-in (onSnapshot) | ✅ Realtime subscriptions |
| **Queries** | Simple, limited | Full SQL, joins, aggregates |
| **File Storage** | Firebase Storage | Supabase Storage |
| **Pricing** | Free tier limited | Free tier generous |
| **Offline** | ✅ Multi-tab persistence | ⚠️ Local store |
| **Best for** | Chat, live feeds, quick apps | Finance, reports, complex data |

## Setup Guides

### Firebase (Cordova)
```javascript
// index.html
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script>
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "...firebaseapp.com",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
</script>
```

### Supabase (Capacitor/React)
```javascript
// supabase.js
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Supabase (Cordova — CDN)
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
</script>
```

## Which Backend for Which App

| App Characteristics | Backend |
|:--------------------|:-------:|
| Phone sales, inventory | Firebase (simple CRUD) |
| Dealer CRM with reports | **Supabase** (SQL for reports) |
| Chat, realtime feed | Firebase (first-class realtime) |
| Food delivery with GPS | Firebase + Maps |
| Payment tracking | Supabase (financial data) |
| Quiz/education | Firebase (fast reads) |
| Attendance | Firebase (simple writes) |
| Multi-user with roles | Supabase (RLS) |
