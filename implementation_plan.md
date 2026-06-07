# Ecofluffa — Full Supabase Backend Integration

## Overview

The app is a **Nuxt 4** laundry marketplace with three roles: **Customer**, **Provider**, and **Admin**. Currently, all data is hardcoded in `app/data/*.ts` files and all "state" lives in Vue's `useState` (in-memory, reset on reload). 

**Goal:** Replace every hardcoded data file and in-memory store with a real Supabase backend (PostgreSQL DB + Supabase Auth), wire every page to the database, delete all `app/data/` files, and replace all composables with live-data versions.

---

## User Review Required

> [!IMPORTANT]
> **Role stored in database:** Each user's role (`customer`, `provider`, `admin`) will be stored in a `profiles` table linked to `auth.users`. On login/register Supabase Auth handles credentials — no fake `login(role)` call anymore.

> [!IMPORTANT]  
> **Provider identity:** Currently all provider pages hardcode "Ocean Breeze Laundry". After this change, the logged-in provider will see only **their own** orders/services. A provider's business name comes from their `profiles` row.

> [!WARNING]
> **All existing hardcoded data will be deleted** — the `app/data/` folder and its 6 files (`platform.ts`, `customerOrders.ts`, `customerProviders.ts`, `customerServices.ts`, `providerOrders.ts`, `contactSubmissions.ts`) will be removed. You will seed real data via the Supabase dashboard or the `schema.sql` seed section.

> [!CAUTION]
> **You must run `schema.sql` in the Supabase SQL editor before starting the dev server**, otherwise the app will fail to load any data.

---

## Open Questions

None — proceeding with full implementation.

---

## Proposed Changes

### 1. Dependencies & Config

#### [MODIFY] [package.json](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/package.json)
- Add `@supabase/supabase-js` and `@nuxtjs/supabase` module.

#### [MODIFY] [nuxt.config.ts](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/nuxt.config.ts)
- Register `@nuxtjs/supabase` module.
- Add `supabase` config block with `redirect: false` (we handle redirects manually).

#### [NEW] `.env` (project root)
- `SUPABASE_URL`, `SUPABASE_KEY` (anon key) environment variables.

---

### 2. Database Schema

#### [NEW] `schema.sql` (project root)
Full PostgreSQL schema with:

| Table | Purpose |
|---|---|
| `profiles` | Extended user info: `role`, `full_name`, `phone`, linked to `auth.users` |
| `providers` | Provider business: `name`, `location`, `pickup_fee`, `rating`, `review_count` |
| `services` | Platform-level service catalog: `id`, `title`, `category`, `price_label`, `description`, `turnaround`, `popular` |
| `provider_services` | Junction: which provider offers which service, with `price`, `unit`, `turnaround` |
| `orders` | Core orders: `customer_id`, `provider_id`, `status`, `pickup_date`, `pickup_time`, `pickup_address`, `notes`, `total_estimate` |
| `order_services` | Line items per order: `order_id`, `service_title`, `price`, `description` |
| `order_messages` | Chat per order: `order_id`, `from_role`, `sender_name`, `body` |
| `order_activities` | Audit log: `order_id`, `type`, `title`, `detail`, `actor_role`, `actor_name` |
| `contact_submissions` | Support form: `name`, `email`, `subject`, `message`, `status`, `admin_response` |

Includes:
- Row Level Security (RLS) policies for all tables
- Seed data (providers, services, provider_services) matching current hardcoded data
- Trigger to auto-create `profiles` row on `auth.users` insert

---

### 3. Supabase Types

#### [NEW] `app/types/supabase.ts`
- TypeScript types for all DB tables generated from schema.
- `Database`, `Tables<T>`, `OrderStatus` union type.

---

### 4. Composables (replace all hardcoded versions)

#### [MODIFY] [useAuth.ts](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/composables/useAuth.ts)
Replace fake `login()` with:
- `signIn(email, password)` → Supabase Auth sign-in, then fetch profile row for role
- `signUp(email, password, fullName, role)` → Supabase Auth sign-up + insert profile
- `signOut()` → Supabase Auth sign-out
- Reactive `user`, `profile`, `role`, `isLoggedIn`, `isCustomer`, `isProvider`, `isAdmin`

#### [MODIFY] [usePlatform.ts](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/composables/usePlatform.ts)
Replace in-memory state with Supabase queries:
- `fetchOrders()` — query `orders` join `profiles`, `providers`
- `createOrder()` — insert into `orders` + `order_services` + `order_activities`
- `updateOrderStatus()` — update `orders.status` + insert `order_activities`
- `addMessage()` — insert `order_messages` + `order_activities`
- `getMessagesForOrder()` — query `order_messages`
- `rescheduleOrder()`, `cancelOrder()` — update + activity log
- Computed stats derived from DB data

#### [MODIFY] [useCustomerOrders.ts](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/composables/useCustomerOrders.ts)
- Filter orders by `customer_id = auth.user.id`

#### [MODIFY] [useProviderOrders.ts](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/composables/useProviderOrders.ts)
- Filter orders by `provider_id` matching the logged-in provider's profile

#### [MODIFY] [useAdminPlatform.ts](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa\app\composables\useAdminPlatform.ts)
- Full platform view (all orders, all users)

#### [MODIFY] [useContactSubmissions.ts](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/composables/useContactSubmissions.ts)
- `submitContactForm()` → insert into `contact_submissions`
- `respondToSubmission()`, `resolveSubmission()` → update row
- Queries filter by status

#### [NEW] `app/composables/useServices.ts`
- `fetchServices()` — query `services` table
- `fetchProviders()` — query `providers` + `provider_services`
- `getProvidersForService(serviceId)` — join query

#### [NEW] `app/composables/useProviderProfile.ts`
- `fetchMyProfile()` — fetch provider's own `providers` row
- `updateService()`, `addService()`, `removeService()` — mutate `provider_services`

---

### 5. Middleware (Auth Guards)

#### [NEW] `app/middleware/auth.ts`
- Checks Supabase session; redirects to `/auth/login` if not logged in.

#### [NEW] `app/middleware/role.ts`
- Checks `profile.role` and blocks wrong-role access (e.g. customer can't access `/admin`).

---

### 6. Pages (wire to DB, remove hardcoded refs)

#### [MODIFY] [login.vue](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/pages/auth/login.vue)
- Call `useAuth().signIn()` instead of fake `login()`.
- Show Supabase error messages.
- Role selector removed — role comes from DB profile.

#### [MODIFY] [register.vue](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/pages/auth/register.vue)
- Call `useAuth().signUp()` with full name, role, email, password.

#### [MODIFY] [customer/index.vue](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/pages/customer/index.vue)
- Greet with real user name from profile.
- Stats from live DB query.

#### [MODIFY] [customer/services.vue](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/pages/customer/services.vue)
- Replace `HARDCODED_LAUNDRY_SERVICES` / `HARDCODED_LAUNDRY_PROVIDERS` with `useServices()` composable.

#### [MODIFY] [customer/orders.vue](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/pages/customer/orders.vue)
- Live orders from DB filtered by customer.

#### [MODIFY] [customer/order/[id].vue](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/pages/customer/order/%5Bid%5D.vue)
- Fetch single order from DB.
- Messages/activities from DB.

#### [MODIFY] [order/new.vue](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/pages/order/new.vue)
- Replace `HARDCODED_LAUNDRY_PROVIDERS` / `HARDCODED_LAUNDRY_SERVICES` with DB queries.
- Submit creates real DB order.

#### [MODIFY] [provider/index.vue](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/pages/provider/index.vue)
- Stats & orders from DB, scoped to logged-in provider.

#### [MODIFY] [provider/services.vue](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/pages/provider/services.vue)
- Load services from `provider_services` for logged-in provider.
- Add/Edit/Remove persisted to DB.

#### [MODIFY] [provider/orders.vue](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/pages/provider/orders.vue)
- Live orders filtered to provider.

#### [MODIFY] [provider/order/[id].vue](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/pages/provider/order/%5Bid%5D.vue)
- Status updates, messages persisted to DB.
- Provider name from profile (not hardcoded "Ocean Breeze").

#### [MODIFY] [admin/index.vue](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/pages/admin/index.vue)
- Stats from live DB (total orders, users, providers, etc.).

#### [MODIFY] [admin/orders.vue](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/pages/admin/orders.vue)
- All orders from DB.

#### [MODIFY] [admin/contacts.vue](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/pages/admin/contacts.vue)
- Contact submissions from DB.

#### [MODIFY] [contact.vue](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/pages/contact.vue)
- Form submits to `contact_submissions` table.

#### [MODIFY] [providers/[id].vue](file:///c:/Users/Lcheruiyot/Desktop/new/Proj/Ecofluffa/app/pages/providers/%5Bid%5D.vue)
- Fetch provider from DB by ID.

---

### 7. Delete Hardcoded Data Files

#### [DELETE] `app/data/platform.ts`
#### [DELETE] `app/data/customerOrders.ts`
#### [DELETE] `app/data/customerProviders.ts`
#### [DELETE] `app/data/customerServices.ts`
#### [DELETE] `app/data/providerOrders.ts`
#### [DELETE] `app/data/contactSubmissions.ts`

---

## Verification Plan

### Automated Checks
- `npm run build` — TypeScript and Nuxt compilation must pass with zero errors.

### Manual Verification
1. Run `schema.sql` in Supabase SQL editor → tables created with seed data.
2. Set `SUPABASE_URL` and `SUPABASE_KEY` in `.env`.
3. `npm run dev` → app loads.
4. Register as Customer → redirected to `/customer`, data loads from DB.
5. Register as Provider → `/provider` shows DB orders scoped to that provider.
6. Log in as Admin → `/admin` shows aggregate stats from DB.
7. Customer books order → appears in provider & admin dashboards.
8. Provider updates status → customer order detail reflects change.
9. Contact form submits → appears in admin contacts page.
10. Page refresh → data persists (no in-memory reset).
