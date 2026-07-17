# EcoFluffa – Full Technical Documentation

> **Version:** 1.0
> **Stack:** Nuxt 4 · Vue 3 · TypeScript · Supabase · Tailwind CSS v4 · Cloudinary
> **Last Updated:** July 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Configuration Files](#4-configuration-files)
5. [Database Schema](#5-database-schema)
6. [TypeScript Types and Enums](#6-typescript-types-and-enums)
7. [Authentication and Session Management](#7-authentication-and-session-management)
8. [Routing and Navigation](#8-routing-and-navigation)
9. [Middleware](#9-middleware)
10. [Layouts](#10-layouts)
11. [Pages Reference](#11-pages-reference)
12. [Composables Reference](#12-composables-reference)
13. [Components Reference](#13-components-reference)
14. [Plugins](#14-plugins)
15. [Real-Time Subscriptions](#15-real-time-subscriptions)
16. [Notification System](#16-notification-system)
17. [Styling and Design System](#17-styling-and-design-system)
18. [Image Management (Cloudinary)](#18-image-management-cloudinary)
19. [Order Lifecycle and Flow](#19-order-lifecycle-and-flow)
20. [Role-Based Access Control](#20-role-based-access-control)
21. [Environment Variables](#21-environment-variables)
22. [Scripts and Commands](#22-scripts-and-commands)

---

## 1. Project Overview

**EcoFluffa** is a laundry pickup and delivery marketplace platform. It connects customers who need laundry done with local laundry service providers. The platform is built as a single-page application (SPA) with server-side rendering (SSR) support via Nuxt.

### Core User Roles

| Role | Description |
|---|---|
| **Customer** | End users who browse providers, book pickups, track orders, and rate services |
| **Provider** | Laundry businesses that sign up, list services, receive orders, and manage their workflow |
| **Admin** | Platform administrators who approve/disable providers, manage custom services, view reports, and handle support |

### Key Capabilities

- **Provider discovery** - Browse and compare approved laundry providers
- **Service booking** - Select services, schedule pickup, and create orders
- **Order lifecycle management** - pending to washing to ready to delivered status flow with real-time updates
- **Messaging** - Per-order message threads between customers, providers, and admins
- **Ratings and reviews** - Post-delivery customer ratings per order (1-5 stars)
- **Notifications** - In-app bell notifications + browser (Web Notifications API) push alerts
- **Dark mode** - Full theme support via CSS custom properties

---

## 2. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Nuxt | ^4.4.6 |
| UI Library | Vue | ^3.5.34 |
| Router | Vue Router | ^5.0.7 |
| Language | TypeScript | (Nuxt built-in) |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime) | ^2.0.9 |
| Supabase JS Client | @supabase/supabase-js | ^2.107.0 |
| CSS Framework | Tailwind CSS | ^4.3.0 (Vite plugin) |
| Icon Library | @nuxt/icon | ^2.2.2 |
| Image CDN | Cloudinary | (unsigned upload API) |
| Fonts | Google Fonts - Inter | (via CSS import) |

---

## 3. Project Structure

```
Ecofluffa/
├── .env                        # Environment variables (gitignored)
├── .gitignore
├── db.sql                      # Supabase DDL schema (reference only)
├── nuxt.config.ts              # Nuxt configuration
├── package.json                # Dependencies and scripts
├── tailwind.config.ts          # Tailwind brand-colour extensions
├── tsconfig.json               # TypeScript config
├── public/
│   ├── favicon.ico
│   ├── hero-1.jpg              # Section image
│   ├── hero-bg.jpeg            # Home page background
│   └── images/sections/        # Section images
└── app/
    ├── app.vue                 # Root application component
    ├── assets/
    │   └── css/main.css        # Global styles, CSS custom properties, Tailwind
    ├── components/             # Reusable UI components (22 files)
    ├── composables/            # Vue composables / business logic (14 files)
    ├── layouts/                # Page layouts (3 files)
    ├── middleware/             # Route guards (4 files)
    ├── pages/                  # File-based routing
    │   ├── index.vue           # Public landing page
    │   ├── about.vue
    │   ├── browse.vue
    │   ├── contact.vue
    │   ├── admin/              # Admin dashboard pages
    │   ├── auth/               # Login and registration
    │   ├── customer/           # Customer dashboard pages
    │   ├── order/              # Order creation pages
    │   ├── provider/           # Provider dashboard pages
    │   └── providers/          # Public provider profile pages
    ├── plugins/
    │   └── auth-profile.client.ts  # Client-only auth sync plugin
    └── types/
        └── supabase.ts         # All TypeScript types, interfaces, constants
```

---

## 4. Configuration Files

### nuxt.config.ts

Key configuration decisions:

- **`redirect: false`** - Authentication redirects are handled manually by Nuxt middleware, not by the `@nuxtjs/supabase` module's built-in redirect system.
- **Tailwind v4** is loaded as a Vite plugin rather than a PostCSS plugin.
- All sensitive keys are read from environment variables.
- Runtime config exposes Supabase and Cloudinary keys to the client side safely.

```ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/icon', '@nuxtjs/supabase'],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
      cloudinaryCloudName: process.env.NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '',
      cloudinaryUploadPreset: process.env.NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '',
    }
  },
  vite: { plugins: [tailwindcss()] },
  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    redirect: false,
    types: false,
  },
})
```

### tailwind.config.ts

Extends Tailwind's theme with brand colours:

| Token | Value |
|---|---|
| `brand-blue` | `#0F4C81` |
| `brand-orange` | `#FF6B35` |
| `brand-gray` | `#F4F7F6` |
| `brand-white` | `#FFFFFF` |
| `brand-charcoal` | `#1A1D20` |

---

## 5. Database Schema

All tables live in the `public` schema of a Supabase (PostgreSQL) project.

### `profiles`

Extends Supabase's `auth.users`. Created/updated on sign-up.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | References `auth.users(id)` |
| `full_name` | text | Default `''` |
| `phone` | text | Default `''` |
| `alternate_phone` | text | Default `''` |
| `preferred_pickup_notes` | text | Default `''` |
| `role` | text | `'customer' OR 'provider' OR 'admin'`. Default `'customer'` |
| `provider_id` | uuid | FK to `providers(id)`, nullable |
| `created_at` | timestamptz | Auto |

### `providers`

Laundry businesses registered on the platform.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | `uuid_generate_v4()` |
| `name` | text | Business name |
| `location` | text | Default `''` |
| `pickup_fee` | text | Default `'Free pickup'` |
| `rating` | numeric | Default `4.5`, recalculated on each new rating |
| `review_count` | integer | Auto-maintained |
| `phone` | text | Default `''` |
| `is_listed` | boolean | `false` until admin approves |
| `approval_status` | text | `'pending' OR 'approved' OR 'disabled'`. Default `'pending'` |
| `photo_url` | text | Cloudinary URL, nullable |
| `created_at` | timestamptz | Auto |

### `services`

Global laundry service catalogue plus provider-owned custom services.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `title` | text | Service name |
| `category` | text | `'Everyday' OR 'Premium' OR 'Specialty'`. Default `'Everyday'` |
| `price_label` | text | Display price string |
| `description` | text | |
| `turnaround` | text | e.g. `"24hrs"` |
| `popular` | boolean | Default `false` |
| `provider_id` | uuid | FK to `providers(id)`, `null` for global catalog services |
| `approval_status` | text | `'pending' OR 'approved' OR 'rejected'`. Global default `'approved'`, custom default `'pending'` |
| `created_at` | timestamptz | Auto |

**Rule:** A service with `provider_id = null` is a catalog service (shared, visible to all). A service with a non-null `provider_id` is a custom service belonging to that provider, requiring admin approval before becoming visible to customers.

### `provider_services`

Links providers to the services they offer, with provider-specific pricing.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `provider_id` | uuid | FK to `providers(id)` |
| `service_id` | uuid | FK to `services(id)` |
| `price` | text | Provider-set price string |
| `unit` | text | e.g. `"per kg"`, `"per item"` |
| `turnaround` | text | Provider-set turnaround |
| `created_at` | timestamptz | Auto |

### `orders`

Pickup and delivery orders placed by customers.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | Format: `EF-{last4digits_of_timestamp}` |
| `customer_id` | uuid | FK to `profiles(id)` |
| `provider_id` | uuid | FK to `providers(id)` |
| `status` | text | `'pending' OR 'washing' OR 'ready' OR 'delivered' OR 'cancelled'` |
| `pickup_date` | date | |
| `pickup_time` | time | |
| `pickup_address` | text | |
| `customer_name` | text | Denormalised at booking time |
| `customer_phone` | text | Denormalised at booking time |
| `notes` | text | Default `''` |
| `total_estimate` | text | Calculated string |
| `delivery_confirmed` | boolean | Set `true` by customer |
| `delivery_confirmed_at` | timestamptz | Nullable |
| `created_at` | timestamptz | Auto |

### `order_services`

Items included in an order (snapshot at booking time).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `order_id` | text | FK to `orders(id)` |
| `title` | text | Snapshot of service title |
| `price` | text | Snapshot of agreed price |
| `description` | text | |
| `created_at` | timestamptz | Auto |

### `order_messages`

Per-order chat messages between customer, provider, and admin.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `order_id` | text | FK to `orders(id)` |
| `from_role` | text | `'customer' OR 'provider' OR 'admin'` |
| `sender_name` | text | |
| `body` | text | |
| `created_at` | timestamptz | Auto |

### `order_activities`

Audit log for all order events.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `order_id` | text | FK to `orders(id)` |
| `type` | text | `'status' OR 'message' OR 'booking' OR 'admin'` |
| `title` | text | Short label |
| `detail` | text | Full description |
| `actor_role` | text | `'customer' OR 'provider' OR 'admin'` |
| `actor_name` | text | |
| `created_at` | timestamptz | Auto |

### `contact_submissions`

Support enquiries submitted via the Contact page.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | |
| `email` | text | |
| `subject` | text | |
| `message` | text | |
| `status` | text | `'new' OR 'responded' OR 'resolved'` |
| `admin_response` | text | Nullable |
| `responded_at` | timestamptz | Nullable |
| `created_at` | timestamptz | Auto |

### `customer_addresses`

Saved pickup address book for customers.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid | FK to `auth.users(id)` |
| `label` | text | e.g. `"Home"`, `"Office"` |
| `address` | text | Full address string |
| `is_default` | boolean | Only one address per user should be `true` |
| `created_at` | timestamptz | Auto |

### `ratings`

One rating per delivered order.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `order_id` | text UNIQUE | FK to `orders(id)` |
| `provider_id` | uuid | FK to `providers(id)` |
| `customer_id` | uuid | FK to `profiles(id)` |
| `score` | integer | 1 to 5 CHECK constraint |
| `comment` | text | Default `''` |
| `created_at` | timestamptz | Auto |

### Entity Relationship Summary

```
auth.users
  └── profiles (1:1)
        └── providers (1:0..1 via provider_id)
              ├── provider_services (1:many)
              │     └── services (many:1)
              └── orders (1:many)
                    ├── order_services (1:many)
                    ├── order_messages (1:many)
                    ├── order_activities (1:many)
                    └── ratings (1:0..1)

customer_addresses (many to auth.users)
contact_submissions (standalone)
```

---

## 6. TypeScript Types and Enums

All types are defined in `app/types/supabase.ts`.

### Union Types

```ts
type OrderStatus   = 'pending' | 'washing' | 'ready' | 'delivered' | 'cancelled'
type UserRole      = 'customer' | 'provider' | 'admin'
type ContactStatus = 'new' | 'responded' | 'resolved'
type ActivityType  = 'status' | 'message' | 'booking' | 'admin'
type ApprovalStatus        = 'pending' | 'approved' | 'disabled'
type ServiceApprovalStatus = 'pending' | 'approved' | 'rejected'
```

### Key Interfaces

- **`Profile`** - User profile (extends auth user with role, phone, provider_id)
- **`Provider`** - Laundry business entity
- **`Service`** - Catalog or custom service definition
- **`ProviderService`** - A provider's priced offering of a service (joinable to `provider` and `service`)
- **`Order`** - A customer's order (can include joined `customer`, `provider`, `order_services`)
- **`OrderService`** - Snapshot of a service item within an order
- **`OrderMessage`** - A single chat message on an order thread
- **`OrderActivity`** - An event in the order audit log
- **`Rating`** - Post-delivery customer rating
- **`ContactSubmission`** - A support message from the contact form

### Constants

```ts
// The valid, ordered progression of statuses (excluding 'cancelled')
const ORDER_FLOW: OrderStatus[] = ['pending', 'washing', 'ready', 'delivered']

// Human-readable status labels
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending', washing: 'Washing',
  ready: 'Ready', delivered: 'Delivered', cancelled: 'Cancelled',
}

// Service category filter options
const SERVICE_CATEGORIES = ['All', 'Everyday', 'Premium', 'Specialty'] as const

// Placeholder string used to detect incomplete provider profiles
const PROVIDER_PLACEHOLDER_LOCATION = 'Update your location'
```

### Utility Functions

```ts
// Returns true if the service belongs to the global catalog (no provider)
function isCatalogService(service: Service): boolean

// Returns true if the service should be visible to customers
function isServiceVisibleToCustomers(service: Service): boolean
```

---

## 7. Authentication and Session Management

Authentication is handled through Supabase Auth integrated via `@nuxtjs/supabase`.

### Sign-Up Flow (useAuth.signUp)

1. Call `supabase.auth.signUp(email, password, { data: { full_name, role } })`
2. If no session is returned (email confirmation required), attempt `signInWithPassword` immediately
3. If sign-in fails with "confirm"/"verified" error, surface `needsEmailConfirmation: true` to the UI
4. On success: call `ensureProfile(userId, fullName, role)` to upsert the profile row
5. If role is `'provider'`: call `ensureProviderLink(userId, fullName)` to create the provider row and link it
6. Redirect to role-specific dashboard via `getRedirectPath(role)`

### Sign-In Flow (useAuth.signIn)

1. Call `supabase.auth.signInWithPassword(email, password)`
2. Resolve the `userId` from response data or retry via `waitForSessionUserId()`
3. Call `ensureProfile(userId, fullName, metaRole)` - creates the profile if it does not exist yet
4. If role is `'provider'`: ensure provider row exists and is linked
5. Redirect to role dashboard

### ensureProfile - Retry Logic

The profile row is sometimes not immediately available after sign-up (Supabase trigger race condition). The function retries with progressive delays before giving up:

```ts
const PROFILE_RETRY_MS = [150, 300, 500, 800, 1200] // milliseconds
```

### ensureProviderLink - Three-Step Process

When a user registers as a provider:

1. **Set role to `'provider'`** in `profiles` table first (required for RLS `WITH CHECK`)
2. **Insert a new `providers` row** with default values
3. **Update `profiles.provider_id`** to link the profile to the newly created provider row

### Sign-Out

```ts
await supabase.auth.signOut()
profile.value = null
authUserId.value = null
usePlatform().resetPlatformData()
```

All cached platform data (orders, messages, etc.) is cleared on sign-out.

### Reactive State

| State Key | Type | Description |
|---|---|---|
| `auth-profile` | `Profile OR null` | Cached user profile |
| `auth-loading` | `boolean` | Loading indicator |
| `auth-user-id` | `string OR null` | Fallback user ID when `useSupabaseUser()` lags |

### Computed Properties

| Name | Returns | Description |
|---|---|---|
| `role` | `UserRole OR null` | Current user's role from profile |
| `userName` | `string` | Full name or email fallback |
| `isLoggedIn` | `boolean` | Whether user is authenticated |
| `isCustomer` | `boolean` | |
| `isProvider` | `boolean` | |
| `isAdmin` | `boolean` | |

---

## 8. Routing and Navigation

Nuxt 4 uses file-based routing. All route groups:

### Public Routes

| Path | File | Description |
|---|---|---|
| `/` | `pages/index.vue` | Marketing landing page |
| `/about` | `pages/about.vue` | About EcoFluffa |
| `/browse` | `pages/browse.vue` | Public provider browser |
| `/contact` | `pages/contact.vue` | Contact / support form |
| `/providers/:id` | `pages/providers/[id].vue` | Public provider profile page |
| `/order/new` | `pages/order/new.vue` | New order creation wizard |
| `/order/:id` | `pages/order/[id].vue` | Public order status tracker |
| `/auth/login` | `pages/auth/login.vue` | Login page |
| `/auth/register` | `pages/auth/register.vue` | Registration page |

### Customer Dashboard Routes (protected)

| Path | File | Description |
|---|---|---|
| `/customer` | `pages/customer/index.vue` | Dashboard overview |
| `/customer/browse` | `pages/customer/browse.vue` | Browse providers |
| `/customer/services` | `pages/customer/services.vue` | Browse and book services |
| `/customer/orders` | `pages/customer/orders.vue` | List of customer's orders |
| `/customer/order/:id` | `pages/customer/order/[id].vue` | Order detail with messaging |
| `/customer/providers/:id` | `pages/customer/providers/[id].vue` | Provider profile from customer dashboard |
| `/customer/profile` | `pages/customer/profile.vue` | Edit personal profile and addresses |

### Provider Dashboard Routes (protected)

| Path | File | Description |
|---|---|---|
| `/provider` | `pages/provider/index.vue` | Provider dashboard overview |
| `/provider/setup` | `pages/provider/setup.vue` | Onboarding / profile completion wizard |
| `/provider/orders` | `pages/provider/orders.vue` | List of provider's orders |
| `/provider/order/:id` | `pages/provider/order/[id].vue` | Order detail with messaging |
| `/provider/services` | `pages/provider/services.vue` | Manage offered services |
| `/provider/profile` | `pages/provider/profile.vue` | Business profile management |

### Admin Dashboard Routes (protected)

| Path | File | Description |
|---|---|---|
| `/admin` | `pages/admin/index.vue` | Overview with platform stats |
| `/admin/providers` | `pages/admin/providers.vue` | Approve/disable providers |
| `/admin/custom-services` | `pages/admin/custom-services.vue` | Approve/reject custom services |
| `/admin/customers` | `pages/admin/customers.vue` | Customer list |
| `/admin/contacts` | `pages/admin/contacts.vue` | Support inbox |
| `/admin/reports` | `pages/admin/reports.vue` | Analytics and reports |

---

## 9. Middleware

### auth.ts (named middleware)

**Purpose:** Redirect unauthenticated users to `/auth/login`.

Public routes that bypass this middleware:
- `'/'`, `'/customer/browse'`, `'/about'`, `'/contact'`, `'/auth/login'`, `'/auth/register'`
- Any path starting with `'/customer/providers'`

Checks `useSupabaseUser()` first; if null, falls back to `supabase.auth.getUser()` to handle session-cookie lag after sign-in.

### dashboard.global.ts (global middleware)

**Purpose:** Redirect logged-in users away from the marketing home page (`/`) to their role dashboard.

- Only activates on path `'/'`
- Calls `waitForAuthReady()` and `fetchProfile()` before computing the redirect path

### role.ts (named middleware)

**Purpose:** Enforce role-based route access.

| Route prefix | Allowed roles |
|---|---|
| `/admin` | `admin` only |
| `/provider` | `provider`, `admin` |
| `/customer` | `customer`, `admin` |

Redirects cross-role access to the correct dashboard.

### provider-onboarding.ts (named middleware)

**Purpose:** Force providers who haven't completed their profile setup to `/provider/setup`.

- Runs only on `/provider/**` routes (excluding `/provider/setup` itself)
- Calls `fetchMyProvider()` and checks `needsOnboarding.value`
- Redirects to `/provider/setup` if the provider has an incomplete business profile or no services

---

## 10. Layouts

### default.vue

Minimal layout with no chrome. Used for the marketing pages (home, about, contact, browse).

### auth.vue

Centred card layout with an animated background gradient and floating bubble decoration.

- Background: `linear-gradient(135deg, brand-blue to #1565c0 to #0d47a1)`
- Animated CSS bubbles using `@keyframes float`
- EcoFluffa logo link to `/`
- Used for `/auth/login` and `/auth/register`

### dashboard.vue

Full application shell used by all customer, provider, and admin pages.

**Structure:**
- Top Navbar (`AppNavbar`)
- Left sidebar (fixed, collapsible on mobile)
  - Role label + icon
  - Bell icon with unread notification badge
  - Role-specific navigation links (computed based on current path)
  - "Enable Notifications" prompt or toggle
  - Logout button
- Main content area via `<slot />`
- Mobile hamburger button and overlay

**Navigation items by role:**

| Role | Nav Links |
|---|---|
| Customer | Dashboard, Find Services, Browse Providers, My Orders, Profile |
| Provider (needs onboarding) | Complete setup |
| Provider (ready) | Dashboard, Orders, My Services, Business Profile |
| Admin | Overview, Providers, Custom Services, Customers, Support, Reports |

---

## 11. Pages Reference

### Landing Page (/)

- Hero section with CTA buttons (Book a Pickup, Browse Providers)
- "How It Works" - 3-step explainer with skewed parallelogram images
- "Featured Providers" - Shows first 3 approved+listed providers from `useServices()`
- "Why EcoFluffa" - Feature reasons grid
- Uses glassmorphism cards (`.glass-card`) with backdrop-filter blur
- Layout: `default`

### Browse Page (/browse and /customer/browse)

- Provider grid with search and filter capability
- Uses `useServices()` to load providers and their offered services

### Order Creation (/order/new)

- Multi-step wizard: select provider → select services → schedule pickup → confirm
- Calls `usePlatform().createOrder()` on submission
- Order ID format: `EF-{last4digits_of_Unix_ms_timestamp}`

### Order Detail (/order/:id and /customer/order/:id)

Customer order detail page includes:
- `OrderFlowTimeline` - Visual status progress bar
- `OrderMessagesPanel` - Messaging thread for the order
- `OrderStatusBadge` - Current status chip
- Delivery confirmation button (when status is `delivered`)
- `RatingModal` - Post-delivery rating form (if delivered and not yet rated)
- `ReceiptModal` - View or print order receipt

### Provider Dashboard (/provider)

- Stats cards: incoming orders, washing, ready, delivered
- Incoming orders list with status advance controls
- Activity feed showing recent order events

### Provider Setup (/provider/setup)

- Full onboarding wizard: business name, location, phone, photo upload, services selection, pickup fee
- Submits for admin approval via `submitForApproval()`
- Must be completed before accessing any other provider dashboard page

### Provider Services (/provider/services)

- Add catalog services (from global list) with custom price/unit/turnaround
- Create custom services (submitted as `pending` for admin review)
- Update or remove existing service offerings

### Admin Overview (/admin)

- Platform-level stats: orders today, last 7 days, last 30 days, total, active, pending, delivered, cancelled
- Total providers / listed providers / total customers counts

### Admin Providers (/admin/providers)

- Table of all providers with approval status
- Actions: Approve (sets `is_listed: true, approval_status: 'approved'`), Disable, Restore

### Admin Custom Services (/admin/custom-services)

- Pending custom services submitted by providers
- Actions: Approve / Reject

### Admin Contacts (/admin/contacts)

- Support inbox with all contact form submissions
- Status flow: new / responded / resolved
- Respond with admin notes, mark resolved

### Admin Reports (/admin/reports)

- Monthly Active Users (unique customers with orders in last 30 days)
- Total delivered orders, total orders
- Top service by booking count
- Provider performance table (avg. rating and completed orders)

### Contact Page (/contact)

- Public form: name, email, subject, message
- Calls `useContactSubmissions().submitContactForm()`

---

## 12. Composables Reference

All composables are auto-imported by Nuxt from `app/composables/`.

---

### useAuth

**File:** `app/composables/useAuth.ts`

Authentication and profile management composable.

#### State

| Name | Type | Nuxt State Key |
|---|---|---|
| `profile` | `Profile OR null` | `'auth-profile'` |
| `loading` | `boolean` | `'auth-loading'` |
| `authUserId` | `string OR null` | `'auth-user-id'` |

#### Methods

| Method | Signature | Description |
|---|---|---|
| `signIn` | `(email, password) => Promise` | Log in and redirect |
| `signUp` | `(email, password, fullName, role) => Promise` | Register and redirect |
| `signOut` | `() => void` | Log out and clear all state |
| `fetchProfile` | `(userId?) => Promise<Profile OR null>` | Load profile from DB |
| `ensureProfile` | `(userId, fullName, role) => Promise<Profile OR null>` | Upsert profile with retry |
| `ensureProviderLink` | `(userId, fullName) => Promise<{success, error?}>` | Create and link provider row |
| `getRedirectPath` | `(role?) => string` | Returns `/admin`, `/provider`, or `/customer` |
| `waitForAuthReady` | `() => Promise<boolean>` | Waits for session to be available |

#### Computed

`role`, `userName`, `isLoggedIn`, `isCustomer`, `isProvider`, `isAdmin`

---

### usePlatform

**File:** `app/composables/usePlatform.ts`

Central data hub shared across the entire application. Manages orders, messages, activities, ratings, and Supabase Realtime subscriptions.

#### State

| Name | Type | Nuxt State Key |
|---|---|---|
| `orders` | `Order[]` | `'platform-orders'` |
| `activities` | `OrderActivity[]` | `'platform-activities'` |
| `messages` | `OrderMessage[]` | `'platform-messages'` |
| `ratings` | `Rating[]` | `'platform-ratings'` |
| `loaded` | `boolean` | `'platform-loaded'` |

#### Data Loading Methods

| Method | Description |
|---|---|
| `loadAll(force?)` | Fetches orders, activities, messages, ratings, then subscribes to Realtime. Guards with the `loaded` flag |
| `fetchOrders()` | Loads orders with joined customer, provider, and order_services |
| `fetchActivities()` | Loads last 100 activities, newest first |
| `fetchMessages()` | Loads all messages, oldest first |
| `fetchRatings()` | Loads all ratings |
| `resetPlatformData()` | Unsubscribes Realtime and clears all state |

#### Order Mutation Methods

| Method | Description |
|---|---|
| `createOrder(payload)` | Validates provider, generates order ID, inserts order + services, logs activity, sends notifications |
| `updateOrderStatus(id, status, actor, actorName)` | Updates DB and local state, logs activity |
| `cancelOrder(id, actorName, actor?)` | Shorthand for `updateOrderStatus` with `'cancelled'` |
| `rescheduleOrder(id, newTime, actorName)` | Updates pickup_time and logs activity |
| `confirmDelivery(orderId, actorName)` | Sets `delivery_confirmed: true`, logs activity, sends notifications |

#### Messaging Methods

| Method | Description |
|---|---|
| `addMessage(orderId, fromRole, senderName, body)` | Optimistically inserts message, sends to DB, logs activity |
| `getMessagesForOrder(orderId)` | Returns filtered and sorted messages for an order |

#### Rating Methods

| Method | Description |
|---|---|
| `getRatingForOrder(orderId)` | Returns the rating for an order or null |
| `submitRating(orderId, providerId, score, comment)` | Inserts rating, recalculates provider avg, sends notifications |

#### Computed Properties

| Name | Description |
|---|---|
| `recentActivities` | All activities sorted newest-first |
| `adminStats` | `{ totalOrders, activeOrders, pending, delivered, cancelled, messageCount, totalProviders, totalCustomers }` |
| `customerStats` | `{ active, ready, completed, pending }` |
| `providerStats` | `{ incoming, washing, ready, delivered }` |
| `providerIncomingOrders` | Orders with status `pending`, `washing`, or `ready` |

---

### useCustomerOrders

**File:** `app/composables/useCustomerOrders.ts`

Customer-scoped view over `usePlatform()`. Filters orders to those belonging to the current user.

#### Computed

`orders` (filtered by customer_id), `stats`, `recentActivities`

#### Methods

Delegates to `usePlatform()`: `getOrderById`, `updateOrderStatus`, `cancelOrder`, `rescheduleOrder`, `confirmDelivery`, `addMessage`, `getMessagesForOrder`, `loadAll`, `getRatingForOrder`, `submitRating`

---

### useProviderOrders

**File:** `app/composables/useProviderOrders.ts`

Provider-scoped view over `usePlatform()`. Filters orders by `provider_id`.

#### Computed

`orders` (filtered by provider_id), `stats`, `incomingOrders`, `recentActivities`

#### Methods

Delegates to `usePlatform()`: `getOrderById`, `updateOrderStatus`, `getNextStatus`, `getFlowStepIndex`, `addMessage`, `getMessagesForOrder`, `loadAll`

---

### useAdminPlatform

**File:** `app/composables/useAdminPlatform.ts`

Admin-specific data: platform statistics, provider management, custom service moderation, customer list, and analytics reports.

#### State

| Name | Type | Nuxt State Key |
|---|---|---|
| `stats` | `AdminPlatformStats OR null` | `'admin-platform-stats'` |
| `providers` | `Provider[]` | `'admin-providers'` |
| `customers` | `Profile[]` | `'admin-customers'` |
| `reports` | `AdminReportsData OR null` | `'admin-reports'` |
| `pendingCustomServices` | `Service[]` | `'admin-pending-services'` |

#### Methods

| Method | Description |
|---|---|
| `loadStats(force?)` | Parallel query for all stat counters + provider/customer counts |
| `loadProviders()` | Fetch all providers ordered by created_at |
| `approveProvider(id)` | Set `approval_status='approved'`, `is_listed=true` |
| `disableProvider(id)` | Set `approval_status='disabled'`, `is_listed=false` |
| `restoreProvider(id)` | Re-approve and re-list a disabled provider |
| `loadPendingCustomServices()` | Services with `provider_id IS NOT NULL AND approval_status='pending'` |
| `approveCustomService(id)` | Set `approval_status='approved'` |
| `rejectCustomService(id)` | Set `approval_status='rejected'` |
| `loadCustomers()` | Uses `supabase.rpc('get_customers')` |
| `loadReports()` | Computes MAU, top service, provider performance table |

#### Report Types

```ts
interface AdminPlatformStats {
  orders: {
    today: number; last7Days: number; last30Days: number;
    total: number; active: number; pending: number;
    delivered: number; cancelled: number;
  }
  totalProviders: number
  listedProviders: number
  totalCustomers: number
}

interface AdminReportsData {
  monthlyActiveUsers: number
  totalDelivered: number
  totalOrders: number
  topService: string
  topServiceCount: number
  providerPerformance: ProviderPerformanceRow[]
}
```

---

### useServices

**File:** `app/composables/useServices.ts`

Public-facing service and provider catalog. Handles filtering for visibility (approved, listed, complete profile, has services).

#### State

| Name | Type | Nuxt State Key |
|---|---|---|
| `services` | `Service[]` | `'services-list'` (catalog only) |
| `providers` | `Provider[]` | `'providers-list'` (visible only) |
| `providerServices` | `ProviderService[]` | `'provider-services-list'` (visible offers) |
| `loading` | `boolean` | `'services-loading'` |

#### Provider Visibility Rules

A provider appears on the public portal only if ALL of these are true:

1. `approval_status === 'approved'`
2. `is_listed === true`
3. Has at least one visible service offer
4. `name`, `location` (not placeholder), and `phone` are all non-empty

A custom service is visible to customers only if `approval_status === 'approved'`.

#### Methods

| Method | Description |
|---|---|
| `fetchAll(force?)` | Loads all services, providers, and provider_services; applies visibility filters |
| `refreshCatalog()` | Force-refreshes via `fetchAll(true)` |
| `getProvidersForService(serviceId)` | Returns `{provider, offer}[]` for a given service |
| `getServiceById(id)` | Returns service or null |
| `getProviderById(id)` | Returns provider or null |
| `createService(data)` | Creates a service; custom if `provider_id` is set (sets `approval_status='pending'`) |

---

### useProviderProfile

**File:** `app/composables/useProviderProfile.ts`

Provider's own profile and service management.

#### State

| Name | Type | Nuxt State Key |
|---|---|---|
| `provider` | `Provider OR null` | `'my-provider'` |
| `myServices` | `ProviderService[]` | `'my-provider-services'` |
| `catalogServices` | `Service[]` | `'my-catalog-services'` |
| `ratings` | `Rating[]` | `'my-provider-ratings'` |
| `loading` | `boolean` | `'provider-profile-loading'` |

#### Computed Properties

| Name | Description |
|---|---|
| `needsOnboarding` | `true` if provider has incomplete details or zero services |
| `isPendingApproval` | `true` if `approval_status='pending'` and onboarding is complete |
| `isDisabled` | `true` if `approval_status='disabled'` |
| `isApproved` | `true` if `approval_status='approved'` |
| `canPublish` | `true` if business details complete and has at least one service |

#### Methods

| Method | Description |
|---|---|
| `fetchMyProvider()` | Parallel load of provider, services, catalog, ratings |
| `updateProvider(payload)` | Update business fields (name, location, phone, pickup_fee, photo_url) |
| `updatePersonalProfile(fullName, phone)` | Update auth user's profile row |
| `addService(serviceId, price, unit, turnaround)` | Add a catalog service offering |
| `updateService(id, price, unit, turnaround)` | Update a service offering |
| `removeService(id)` | Remove a service offering |
| `submitForApproval()` | Sets `approval_status='pending', is_listed=false` to submit for admin review |
| `getCatalogServicesAvailableToAdd()` | Catalog services not yet offered by this provider |
| `isProviderBusinessComplete(provider)` | Returns `true` if name, location (not placeholder), and phone are all filled |

---

### useAddresses

**File:** `app/composables/useAddresses.ts`

Customer's saved address book management.

#### Methods

| Method | Description |
|---|---|
| `fetchAddresses()` | Load all addresses for the current user |
| `addAddress(payload)` | Create a new address |
| `updateAddress(id, payload)` | Update an existing address |
| `deleteAddress(id)` | Delete an address |
| `setDefault(id)` | Clear existing default and set new default |

#### Computed

`defaultAddress` - Returns the address where `is_default = true`

#### Utility

`mapsUrl(address)` - Generates a Google Maps search URL from an address string

---

### useContactSubmissions

**File:** `app/composables/useContactSubmissions.ts`

Contact form submissions management.

#### Methods

| Method | Description |
|---|---|
| `submitContactForm(name, email, subject, message)` | Public form submission; inserts with `status='new'` |
| `fetchSubmissions()` | Admin: load all submissions ordered newest first |
| `respondToSubmission(id, response)` | Admin: save reply, set `status='responded'` |
| `resolveSubmission(id)` | Admin: set `status='resolved'` |
| `getSubmissionById(id)` | Lookup from local state |

#### Computed

`getNewSubmissions`, `getRespondedSubmissions`, `getResolvedSubmissions`

---

### useCloudinaryUpload

**File:** `app/composables/useCloudinaryUpload.ts`

Image upload to Cloudinary via unsigned upload preset.

#### Validations

- Max file size: 5 MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Images are stored in the `ecofluffa/providers` Cloudinary folder

#### Usage

```ts
const { uploading, uploadPhoto } = useCloudinaryUpload()
const { url, error } = await uploadPhoto(file)
// url is the Cloudinary secure_url string, or null on failure
```

---

### useToast

**File:** `app/composables/useToast.ts`

Global toast notification queue. State key: `'app-toasts'`.

```ts
const { show, success, error, info, warn, dismiss } = useToast()
show('Message', 'success', 4000)  // type: 'success' | 'error' | 'info' | 'warning'
```

Toasts are auto-dismissed after the specified duration (default 4000ms).

---

### useInAppNotifications

**File:** `app/composables/useInAppNotifications.ts`

In-app bell notification system. State key: `'inapp-notifications'`.

```ts
interface InAppNotification {
  id: string
  type: 'order_update' | 'new_message'
  title: string
  body: string
  orderId?: string
  role: 'customer' | 'provider' | 'admin'
  read: boolean
  createdAt: string
}
```

- Capped at 50 notifications to prevent unbounded memory growth
- `unreadCount` - computed count of unread notifications
- `markAllRead()` / `markRead(id)` - mark notifications as read

---

### useWebNotifications

**File:** `app/composables/useWebNotifications.ts`

Browser Web Notifications API wrapper. State key: `'web-notif-permission'`.

| Method/Property | Description |
|---|---|
| `init()` | Reads current `Notification.permission` |
| `requestPermission()` | Requests browser permission from the user |
| `notify(title, options?)` | Fires a browser notification if permission is granted |
| `isGranted` | Computed: `true` if permission is granted |
| `isDenied` | Computed: `true` if permission is denied |
| `isDefault` | Computed: `true` if permission not yet requested |
| `isSupported` | Computed: `true` if Web Notifications API is available |

---

### useTheme

**File:** `app/composables/useTheme.ts`

Dark/light mode toggle. State key: `'theme-dark'`.

| Method/Property | Description |
|---|---|
| `isDark` | Reactive boolean for current theme |
| `initTheme()` | Reads from `localStorage` or `prefers-color-scheme` |
| `toggleTheme()` | Switches between dark and light |
| `setTheme(dark)` | Explicitly set theme |

- Theme persisted to `localStorage` under key `'ecofluffa-theme'`
- Applied via `document.documentElement.setAttribute('data-theme', 'dark' OR 'light')`

---

## 13. Components Reference

All components are auto-imported from `app/components/`.

| Component | Description |
|---|---|
| `AppNavbar` | Top navigation bar with logo, dark-mode toggle, and auth links |
| `AppFooter` | Site footer with navigation links |
| `AppButton` | Styled button with `variant` prop: `primary`, `secondary`, `ghost`, `danger` |
| `InputField` | Labelled input with error state display |
| `SectionHeader` | Section title and subtitle display component |
| `SkeletonCard` | Loading placeholder card |
| `ToastNotification` | Global toast overlay (reads from `useToast()`) |
| `NotificationPanel` | Bell dropdown panel showing in-app notifications with mark-read |
| `ActivityFeed` | Renders `OrderActivity[]` as a vertical timeline list |
| `OrderCard` | Compact order summary card with status badge |
| `OrderFlowTimeline` | Horizontal/vertical order status progress indicator |
| `OrderMessagesPanel` | Full chat thread for an order with send form |
| `OrderStatusBadge` | Coloured pill chip for any order status |
| `ProviderCard` | Provider listing card (name, location, rating, services preview) |
| `ProviderCompareCard` | Side-by-side provider comparison card |
| `ProviderAvatar` | Circular provider photo with initials fallback |
| `ProviderPhotoUpload` | Photo upload widget using `useCloudinaryUpload()` |
| `RatingModal` | Star rating and comment form modal |
| `ReceiptModal` | Printable order receipt modal |
| `ServiceCard` | Compact service item card |
| `CustomerStatCard` | Dashboard stat metric card with icon and value |
| `ContactSubmissionList` | Admin contact inbox list with status filter tabs |

---

## 14. Plugins

### auth-profile.client.ts

**File:** `app/plugins/auth-profile.client.ts`

**Runs:** Client-side only (`.client.ts` suffix enforced by Nuxt)

**Purpose:** Bootstraps authentication state on every page load and keeps it in sync.

**Behaviour:**

1. On plugin init: calls `supabase.auth.getUser()` - if user found, calls `fetchProfile(userId)`
2. Registers `supabase.auth.onAuthStateChange()` - re-fetches profile on any auth event (sign-in, sign-out, token refresh)
3. Watches the reactive `useSupabaseUser()` ref - syncs `authUserId` and `profile` when it changes

This plugin ensures that `profile` and `authUserId` are always populated before any page renders, eliminating race conditions where middleware or page code runs before auth state is ready.

---

## 15. Real-Time Subscriptions

Real-time updates are managed in `usePlatform()` via a single Supabase channel named `'platform-orders-realtime'`. A module-level `_realtimeChannel` variable guards against duplicate subscriptions.

### INSERT on `orders`

Triggered when a new order is placed.

- Fetches full order data via `fetchOrders()` to get joined relations
- **Provider notification:** Notified when an order is placed for their business
- **Admin notification:** Notified of every new order placed on the platform

### UPDATE on `orders`

Triggered on any order field change (most commonly `status`).

- Updates the matching order in `orders.value` in-place using spread merge
- Compares old vs. new status to determine if a meaningful status change occurred
- **Customer:** Notified of every status change on their own orders
- **Provider:** Notified when their order changes status (uses `PROVIDER_STATUS_MESSAGES` lookup map)
- **Admin:** Notified of all status changes with old to new label displayed

### INSERT on `order_messages`

Triggered when any message is sent on any order.

- Deduplication check prevents same message appearing twice (realtime vs. optimistic insert)
- Does NOT notify the sender's own role
- Shows toast + browser notification + in-app bell notification to all other parties

### Channel Lifecycle

```
loadAll()           → subscribeToRealtime() → _realtimeChannel is created
resetPlatformData() → unsubscribeRealtime() → _realtimeChannel = null
```

---

## 16. Notification System

Three layers of notifications work together simultaneously:

### Layer 1: Toast Notifications (useToast)

- Ephemeral banner messages shown at the bottom of the screen
- Auto-dismiss after configurable duration (default 4000ms)
- Types: `success` (green), `error` (red), `info` (blue), `warning` (amber)
- Rendered by `ToastNotification` component globally in `app.vue`

### Layer 2: Browser Web Notifications (useWebNotifications)

- Native OS-level push notifications via the Web Notifications API
- Requires explicit user permission (`Notification.requestPermission()`)
- Dashboard layout shows a "Enable Notifications" prompt if permission is `'default'`
- Toggle switch in the sidebar allows enabling/disabling once permission is granted

### Layer 3: In-App Bell Notifications (useInAppNotifications)

- In-memory queue of notification objects (capped at 50)
- Displayed in `NotificationPanel` which opens from the bell icon in the dashboard sidebar
- Unread count badge shown on the bell icon (shows "9+" when count exceeds 9)
- Notification types: `'order_update'` and `'new_message'`

### Notification Trigger Matrix

| Event | Customer | Provider | Admin |
|---|---|---|---|
| New order placed | - | Yes (their orders) | Yes |
| Order status changed | Yes | Yes (their orders) | Yes |
| New message received | Yes (if not sender) | Yes (if not sender) | Yes (if not sender) |
| Rating submitted | Yes (confirmation) | Yes (new rating received) | - |
| Delivery confirmed | Yes (confirmation) | Yes (customer confirmed) | - |
| Order placed (own order) | Yes (confirmation) | - | - |

---

## 17. Styling and Design System

### Global CSS (app/assets/css/main.css)

The stylesheet imports Google Fonts Inter, Tailwind CSS v4, and defines a comprehensive CSS custom property design token system.

### CSS Design Tokens

All tokens are defined on `:root` (light mode) and overridden on `[data-theme="dark"]`.

#### Background Tokens

| Token | Light Mode | Dark Mode |
|---|---|---|
| `--bg-base` | `#F4F7F6` | `#0D1117` |
| `--bg-surface` | `#FFFFFF` | `#161B22` |
| `--bg-elevated` | `#FFFFFF` | `#1C2431` |
| `--bg-subtle` | `#F0F4F8` | `#21262D` |

#### Text Tokens

| Token | Light Mode | Dark Mode |
|---|---|---|
| `--text-primary` | `#1A1D20` | `#E6EDF3` |
| `--text-muted` | `#6B7280` | `#8B949E` |
| `--text-faint` | `#9CA3AF` | `#6E7681` |

#### Brand Tokens

| Token | Light Mode | Dark Mode |
|---|---|---|
| `--brand-blue` | `#0F4C81` | `#58A6FF` |
| `--brand-blue-light` | `#E8F0FB` | `#1C2B3A` |
| `--brand-orange` | `#FF6B35` | `#FF8C5A` |

#### Border Tokens

| Token | Light Mode | Dark Mode |
|---|---|---|
| `--border-color` | `#E5E7EB` | `#30363D` |
| `--border-subtle` | `#F3F4F6` | `#21262D` |

#### Shadow Tokens

| Token | Light Mode | Dark Mode |
|---|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | `0 1px 3px rgba(0,0,0,0.3)` |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.10)` | `0 4px 16px rgba(0,0,0,0.4)` |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.12)` | `0 8px 32px rgba(0,0,0,0.5)` |

#### Blue Palette Scale

Ten-step scale from `--blue-50` (lightest) to `--blue-900` (darkest), used for gradients and accent colours throughout.

### Semantic Utility Classes

| Class | Effect |
|---|---|
| `.bg-surface` | `background-color: var(--bg-surface)` |
| `.bg-elevated` | `background-color: var(--bg-elevated)` |
| `.bg-subtle` | `background-color: var(--bg-subtle)` |
| `.text-primary` | `color: var(--text-primary)` |
| `.text-muted` | `color: var(--text-muted)` |
| `.text-faint` | `color: var(--text-faint)` |
| `.border-theme` | `border-color: var(--border-color)` |
| `.shadow-theme-sm/md/lg` | Themed box shadows |
| `.transition-theme` | Smooth 250ms transition for all theme-sensitive properties |
| `.hero-gradient` | Brand blue 3-stop radial gradient background |
| `.gradient-blue-light/medium/dark/accent/soft` | Pre-built blue gradient combinations |
| `.page-bg-container` | Full-viewport container with dark overlay support |
| `.image-hover-zoom` | Container with zoom-on-hover effect for images |
| `.text-on-image` | Text with shadow for legibility over background images |
| `.sidebar-overlay` | Mobile sidebar backdrop with blur effect |

### Typography

- Font: Inter (Google Fonts, weights 300-900)
- `-webkit-font-smoothing: antialiased` enabled globally
- `scroll-behavior: smooth` on html element

### Scrollbar Customisation

Thin 6px scrollbar styled with border-color, using `::-webkit-scrollbar` selectors.

---

## 18. Image Management (Cloudinary)

Provider profile photos are stored on Cloudinary.

### Upload Flow

1. Provider selects file via `ProviderPhotoUpload` component
2. File is validated (size ≤ 5MB, allowed MIME type)
3. `useCloudinaryUpload().uploadPhoto(file)` posts multipart form data to the Cloudinary upload API
4. Uses unsigned upload preset (no API secret exposed client-side)
5. Files are stored in the `ecofluffa/providers` folder on Cloudinary
6. Returned `secure_url` is saved to `providers.photo_url` via `useProviderProfile().updateProvider()`

### Required Environment Variables

```env
NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

---

## 19. Order Lifecycle and Flow

### Status Flow

```
[Customer places order]
         |
         v
      PENDING  -----> CANCELLED  (customer or admin cancels)
         |
         v (provider accepts)
      WASHING
         |
         v (provider marks ready)
       READY
         |
         v (provider delivers)
     DELIVERED
         |
         v (customer confirms)
  delivery_confirmed = true
         |
         v (customer rates)
      RATING submitted
```

### Status Descriptions

| Status | Meaning | Who Can Advance |
|---|---|---|
| `pending` | Order placed, awaiting provider acceptance | Provider or Admin |
| `washing` | Items picked up and being washed | Provider |
| `ready` | Washing complete, ready for delivery | Provider |
| `delivered` | Delivered to customer | Provider or Admin |
| `cancelled` | Order cancelled | Customer or Admin |

### Order ID Format

`EF-{last 4 digits of Unix millisecond timestamp}`

Example: `EF-4523`

### Order Creation Guard

Before creating an order, the system verifies:
1. Provider `approval_status === 'approved'`
2. Provider `is_listed === true`

If either check fails, order creation returns `null`.

### Delivery Confirmation Flow

After provider marks order as `delivered`:
1. Customer can click "Confirm Delivery" which sets `delivery_confirmed: true` and records `delivery_confirmed_at`
2. An activity log entry is created
3. Notifications sent to both customer (confirmation) and provider (customer confirmed)
4. `RatingModal` becomes available to the customer

### Rating Recalculation

After a rating is submitted, the system:
1. Queries all ratings for the affected provider
2. Calculates the new average score
3. Updates `providers.rating` and `providers.review_count` in the database
4. Updates local cache in `orders.value`

---

## 20. Role-Based Access Control

### Route Protection Matrix

| Route Pattern | Auth Required | Allowed Roles |
|---|---|---|
| `/`, `/about`, `/browse`, `/contact` | No | Everyone |
| `/providers/*`, `/customer/browse` | No | Everyone |
| `/auth/*` | No (redirected if logged in) | Everyone |
| `/order/new`, `/order/:id` | No | Everyone |
| `/customer/**` | Yes | customer, admin |
| `/provider/**` | Yes | provider, admin |
| `/admin/**` | Yes | admin only |

### Middleware Execution Order for Protected Routes

For a request to `/customer/order/123`:

1. `dashboard.global.ts` - Checks if on `/` (no, skips)
2. `auth.ts` - Verifies user is logged in
3. `role.ts` - Verifies user role permits `/customer/**` access

For a request to `/provider/orders`:

1. `dashboard.global.ts` - Skips
2. `auth.ts` - Verifies logged in
3. `role.ts` - Verifies `provider` or `admin` role
4. `provider-onboarding.ts` - Verifies provider has completed setup

### Admin Access to Other Role Areas

The `role.ts` middleware explicitly allows `admin` access to both `/customer/**` and `/provider/**` routes, enabling admins to access all areas of the platform for support and management purposes.

---

## 21. Environment Variables

All environment variables must be defined in `.env` at the project root.

```env
# Supabase - Required
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=your-anon-public-key

# Cloudinary - Required for provider photo uploads
NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

**Security Notes:**
- Only use the Supabase anon (public) key - never the service role key on the client side
- The Cloudinary upload preset must be configured as unsigned in the Cloudinary dashboard

---

## 22. Scripts and Commands

```bash
# Start the development server (http://localhost:3000)
npm run dev

# Build for production SSR
npm run build

# Generate static site
npm run generate

# Preview production build
npm run preview

# Run Nuxt prepare (generates .nuxt/, type declarations, etc.)
npm run postinstall
```

---

## Appendix A: Key Design Decisions

| Decision | Rationale |
|---|---|
| `supabase.redirect: false` | Full control over all redirects via the Nuxt middleware chain |
| Module-level `_realtimeChannel` | Prevents duplicate Supabase Realtime subscriptions across multiple composable calls |
| `authUserId` state separate from `useSupabaseUser()` | `useSupabaseUser()` can lag by several hundred ms after `signInWithPassword`; `authUserId` acts as an immediate fallback |
| Order ID as `EF-{last4ms}` text primary key | Human-readable, easy to communicate verbally or in support tickets |
| Optimistic message insertion | Instantly shows sent messages before DB confirmation; temp record is replaced with the real DB record on success |
| Profile upsert with retry delays | Supabase auth triggers can be slow; retrying with progressive delays ensures the profile is available immediately after sign-up |
| CSS custom properties for theme | Allows full dark/light mode support in both Tailwind utilities and inline styles without JavaScript-driven class swapping |
| Denormalised customer name/phone on orders | Snapshot at booking time means customer profile changes do not alter past order records |
| Custom services require admin approval | Ensures service quality and prevents spam; providers can propose services but admins have final say |
| `delivery_confirmed` separate from `delivered` status | Separates provider's delivery action from customer's receipt confirmation, enabling the rating flow |

---

## Appendix B: Supabase RLS and RPC Notes

The application assumes Supabase Row Level Security (RLS) is enabled. General policy assumptions:

- **Profiles:** Users can only read/update their own profile row
- **Providers:** Providers can insert their own row only after their profile `role='provider'` is set (guarded by `get_my_role()` function in RLS WITH CHECK); admins have full access
- **Orders:** Customers see their own orders; providers see orders assigned to their `provider_id`; admins see all
- **Messages and Activities:** Scoped to the order's customer and provider; admins see all
- **Ratings:** Customers can insert one rating per order (UNIQUE constraint on `order_id`); all authenticated users can read

Custom Supabase RPC functions referenced in the codebase:

| Function | Used By | Returns |
|---|---|---|
| `count_customers()` | `useAdminPlatform.loadStats()` | Count of users with `role='customer'` |
| `get_customers()` | `useAdminPlatform.loadCustomers()` | List of customer profiles |
| `get_my_role()` | Supabase RLS policies (internal) | Current user's role string |

---

*End of EcoFluffa Technical Documentation*
