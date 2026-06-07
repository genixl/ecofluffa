# Ecofluffa — Overall App Experience Improvements

## Summary
Implementing 11 targeted experience improvements across customer, provider, and admin roles.
No new DB tables required — everything works on existing schema + Supabase realtime.

---

## Proposed Changes

### 1. 🔔 Toast Notification System (Global)
A lightweight global toast composable + component so every action gives silent feedback.

#### [NEW] `app/composables/useToast.ts`
- `showToast(message, type: 'success' | 'error' | 'info')` global state
- Auto-dismiss after 3 seconds

#### [NEW] `app/components/ToastNotification.vue`
- Fixed bottom-right corner, animated slide-in/slide-out
- Green ✓ for success, red ✗ for error, blue ℹ for info

#### [MODIFY] `app/app.vue`
- Mount `<ToastNotification />` globally

**Used in:** order booking, profile save, address save/delete, order cancel, status update

---

### 2. 💀 Loading Skeletons (Global Component)
Replace all "Loading…" text with animated skeleton placeholders.

#### [NEW] `app/components/SkeletonCard.vue`
- Animated shimmer placeholder card (matches `OrderCard`, `ServiceCard` sizes)
- Props: `rows`, `width`

**Used in:** `customer/orders.vue`, `provider/orders.vue`, `provider/index.vue`, `customer/order/[id].vue`, `provider/order/[id].vue`

---

### 3. ⚠️ Cancel Order Confirmation Modal (Customer)
Prevent accidental order cancellations with a confirm dialog.

#### [MODIFY] `app/pages/customer/order/[id].vue`
- Replace direct `cancelOrder()` call with a modal asking "Are you sure?"
- Modal shows order ID and warning that this cannot be undone
- Uses existing modal pattern from `admin/contacts.vue`

---

### 4. 📊 Order Tracking Progress Bar (Customer)
Improve the `OrderFlowTimeline` to be more visual and informative.

#### [MODIFY] `app/components/OrderFlowTimeline.vue`
- Upgrade from simple dots to a **connected step bar** with:
  - Filled circles with icons per step (pending → washing → ready → delivered)
  - Connector lines between steps (filled = done, grey = upcoming)
  - Active step has a pulse animation
  - Cancelled state shown in red

---

### 5. 🔍 Orders List Status Filter (Provider)
Add filter tabs to the provider orders list.

#### [MODIFY] `app/pages/provider/orders.vue`
- Add tab bar: **All | Pending | Washing | Ready | Delivered**
- Badge counts per tab (e.g. "Pending (3)")
- Highlight today's pickups with an orange "Today" badge in the table
- Sort by pickup date (soonest first)

---

### 6. 🚨 Order Urgency Indicators (Provider)
Flag orders whose pickup is today or overdue.

#### [MODIFY] `app/pages/provider/index.vue`
- Add urgency helper: if `pickup_date === today` → show orange **"Today"** badge on `OrderCard`
- If pickup date is in the past and status is still `pending` → show red **"Overdue"** badge

#### [MODIFY] `app/components/OrderCard.vue`
- Accept optional `urgency?: 'today' | 'overdue' | null` prop
- Render colored pill badge in the card top-right corner

---

### 7. 📈 Provider Dashboard Stats Improvements
Enhance the existing stat cards with more context.

#### [MODIFY] `app/pages/provider/index.vue`
- Add **revenue estimate** stat card: sum `total_estimate` values of delivered orders
- Show **today's pickups** count as a 5th card with highlighted styling

#### [MODIFY] `app/composables/useProviderOrders.ts`
- Add `todayOrders` computed — orders with `pickup_date === today`
- Add `revenueEstimate` computed — sum delivered order totals

---

### 8. ⚡ Real-Time Order Status Updates (Supabase Realtime)
Both customer and provider see status changes live without refreshing.

#### [MODIFY] `app/composables/usePlatform.ts`
- Subscribe to `orders` table changes on `loadAll()`
- On `UPDATE` event → patch the matching order in `orders` state reactively
- Unsubscribe on component unmount (cleanup via `onUnmounted`)

**Effect:** Provider changes status → customer's page updates automatically, and vice versa.

---

### 9. 🏠 Admin Dashboard Improvements
Add order overview and user stats to the existing admin dashboard.

#### [MODIFY] `app/pages/admin/index.vue`
- Add a **Platform Overview** section with stat cards:
  - Total orders (all time)
  - Active orders (pending + washing + ready)
  - Total customers
  - Total providers
- Add a **Recent Orders** table (last 10 across all providers) with status badges

#### [MODIFY] `app/composables/useAdminPlatform.ts`
- Add `allOrders`, `platformStats` computed refs

---

## Execution Order

1. Toast system (used everywhere else)
2. Skeleton component (replaces loading states everywhere)
3. `OrderFlowTimeline` upgrade
4. Cancel order confirmation modal
5. Provider orders filter + urgency indicators
6. Provider dashboard stats
7. Real-time updates
8. Admin dashboard

## Verification Plan
- Manually test each flow: booking → cancel confirmation, status change → realtime update
- Verify toast appears on save/error
- Verify skeleton shows during data load
- Verify provider urgency badges appear for today/overdue orders
- Verify admin stats reflect correct counts
