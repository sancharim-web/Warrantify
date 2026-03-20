# Warrantify — Product Requirements Document

**Version:** 1.0
**Date:** 2026-03-17
**Status:** Draft

---

## 1. Overview

Warrantify is a personal utility web application that helps users store, track, and manage product warranties in one place. It acts as a digital wallet for warranties — users upload warranty cards, receipts, or PDFs, and the app automatically tracks expiry dates and sends reminders before coverage ends.

## 2. Problem Statement

People frequently lose warranty documents or forget expiration dates. This results in missed repair or replacement opportunities, costing them money and causing frustration. There is no simple, dedicated tool for organizing warranty information across all household products.

## 3. Target Users

| Segment | Description |
|---|---|
| Homeowners | Multiple appliances and home systems with varying warranty periods |
| Tech enthusiasts | Many gadgets and electronics with different coverage terms |
| Families | Managing household purchases across multiple family members |

### User Persona

**Priya, 32, Homeowner**
Bought a washing machine 11 months ago. The motor failed. She knows it had a 1-year warranty but can't find the receipt or warranty card. She calls the brand, gets bounced around, and eventually pays for the repair out of pocket — a repair that would have been free.

## 4. Value Proposition

Never miss warranty coverage again. Warrantify keeps all warranty information organized and accessible, saving users money and reducing frustration through smart tracking and timely reminders.

## 5. Core Features (MVP)

### 5.1 Authentication

| ID | Requirement |
|---|---|
| AUTH-1 | Users can register with email and password via Supabase Auth |
| AUTH-2 | Users can log in via Supabase Auth (session managed automatically) |
| AUTH-3 | All warranty data is private and scoped to the authenticated user via Row Level Security (RLS) |
| AUTH-4 | Supabase Auth handles password hashing, session tokens, and email verification |
| AUTH-5 | OAuth login via Google supported out of the box (optional for MVP) |

### 5.2 Warranty Vault

| ID | Requirement |
|---|---|
| VAULT-1 | Users can add a warranty manually by entering product name, brand, category, purchase date, warranty period, serial number, and notes |
| VAULT-2 | Users can upload photos (JPG/PNG), PDFs, or document scans as attachments to a warranty |
| VAULT-3 | Multiple documents can be attached to a single warranty |
| VAULT-4 | Users can edit or delete any warranty they own |
| VAULT-5 | File uploads are limited to 10 MB per file |

### 5.3 Smart Expiry Tracking

| ID | Requirement |
|---|---|
| EXPIRY-1 | The system auto-calculates the expiry date from purchase date + warranty period |
| EXPIRY-2 | Each warranty has a computed status: **Active**, **Expiring Soon** (≤30 days remaining), or **Expired** |
| EXPIRY-3 | Status is recalculated on every read (not stored statically) |

### 5.4 Dashboard

| ID | Requirement |
|---|---|
| DASH-1 | The dashboard is the landing page after login |
| DASH-2 | Three sections displayed: **Expiring Soon**, **Active Warranties**, **Expired** |
| DASH-3 | Each warranty displays as a card showing: product name, brand, category icon, days remaining (or "Expired"), and status badge |
| DASH-4 | Warranties within each section are sorted by expiry date (soonest first) |
| DASH-5 | Empty states shown when a section has no items |

### 5.5 Product Detail Page

| ID | Requirement |
|---|---|
| DETAIL-1 | Shows all warranty fields: product name, brand, category, purchase date, expiry date, serial number, warranty terms, notes |
| DETAIL-2 | Displays attached documents with inline preview (images render as thumbnails, PDFs render in an iframe) |
| DETAIL-3 | Download link for each attached document |
| DETAIL-4 | Edit and delete actions available on this page |
| DETAIL-5 | Shows brand contact information if provided |

### 5.6 Search & Categories

| ID | Requirement |
|---|---|
| SEARCH-1 | Global search bar filters warranties by product name or brand (client-side for MVP) |
| SEARCH-2 | Category filter chips allow filtering by: Electronics, Appliances, Furniture, Automotive, Home & Garden, Other |
| SEARCH-3 | Search and category filters can be combined |

### 5.7 Reminder Notifications

| ID | Requirement |
|---|---|
| REMIND-1 | Email reminders are sent **30 days** and **7 days** before a warranty expires |
| REMIND-2 | A Supabase Edge Function triggered by pg_cron runs daily at 8:00 AM UTC to check for upcoming expiries |
| REMIND-3 | Each reminder is logged in the database to prevent duplicate sends |
| REMIND-4 | Reminder email contains: product name, days remaining, expiry date, and a link to the app |

## 6. Data Model

> **Note:** The `User` table is managed by Supabase Auth (`auth.users`). Application tables reference `auth.users.id` as the foreign key. A `profiles` table stores any extra user metadata.

### profiles
| Field | Type | Constraints |
|---|---|---|
| id | UUID | Primary key, references auth.users(id) |
| name | Text | Required |
| created_at | Timestamptz | Default now() |

### warranties
| Field | Type | Constraints |
|---|---|---|
| id | UUID | Primary key, default gen_random_uuid() |
| user_id | UUID | Foreign key → auth.users(id), not null |
| product_name | Text | Not null |
| brand | Text | Nullable |
| category | Text | Not null, check constraint (Electronics, Appliances, Furniture, Automotive, Home & Garden, Other) |
| purchase_date | Date | Not null |
| warranty_months | Integer | Not null |
| expiry_date | Date | Generated always as (purchase_date + (warranty_months \* interval '1 month')) stored |
| serial_number | Text | Nullable |
| warranty_terms | Text | Nullable |
| brand_contact | Text | Nullable |
| notes | Text | Nullable |
| created_at | Timestamptz | Default now() |
| updated_at | Timestamptz | Default now(), updated via trigger |

**RLS Policy:** `user_id = auth.uid()` on all operations (select, insert, update, delete).

### documents
| Field | Type | Constraints |
|---|---|---|
| id | UUID | Primary key, default gen_random_uuid() |
| warranty_id | UUID | Foreign key → warranties(id) on delete cascade |
| file_name | Text | Not null |
| storage_path | Text | Not null (path in Supabase Storage bucket) |
| file_type | Text | Not null (image/jpeg, image/png, application/pdf) |
| uploaded_at | Timestamptz | Default now() |

**RLS Policy:** Access allowed only if the parent warranty belongs to `auth.uid()`.

### reminders
| Field | Type | Constraints |
|---|---|---|
| id | UUID | Primary key, default gen_random_uuid() |
| warranty_id | UUID | Foreign key → warranties(id) on delete cascade |
| type | Text | Not null, check constraint (30_day, 7_day) |
| sent_at | Timestamptz | Default now() |

**RLS Policy:** Access scoped via parent warranty's `user_id = auth.uid()`.

## 7. Data Access Layer

> **No custom backend server needed for MVP.** The frontend communicates directly with Supabase using the `@supabase/supabase-js` client. RLS policies enforce authorization at the database level.

### Auth (via Supabase Auth)
| Operation | Supabase Client Method |
|---|---|
| Register | `supabase.auth.signUp({ email, password })` |
| Login | `supabase.auth.signInWithPassword({ email, password })` |
| Google OAuth | `supabase.auth.signInWithOAuth({ provider: 'google' })` |
| Logout | `supabase.auth.signOut()` |
| Get session | `supabase.auth.getSession()` |

### Warranties (via Supabase Client + RLS)
| Operation | Supabase Client Call |
|---|---|
| List (with filters) | `supabase.from('warranties').select('*').eq('category', ...).order('expiry_date')` |
| Create | `supabase.from('warranties').insert({ ... })` |
| Get detail + docs | `supabase.from('warranties').select('*, documents(*)').eq('id', id).single()` |
| Update | `supabase.from('warranties').update({ ... }).eq('id', id)` |
| Delete | `supabase.from('warranties').delete().eq('id', id)` |

### File Storage (via Supabase Storage)
| Operation | Supabase Client Call |
|---|---|
| Upload file | `supabase.storage.from('warranty-docs').upload(path, file)` |
| Get public URL | `supabase.storage.from('warranty-docs').getPublicUrl(path)` |
| Delete file | `supabase.storage.from('warranty-docs').remove([path])` |

### Reminders (via Supabase Edge Function)
| Function | Trigger | Description |
|---|---|---|
| `send-reminders` | Supabase Cron (pg_cron) daily at 8:00 AM UTC | Queries warranties expiring in 30 or 7 days, checks reminders table, sends email via Resend, logs sent reminders |

## 8. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | React + Vite | Fast dev server, modern tooling |
| Styling | Tailwind CSS + shadcn/ui | Rapid, consistent UI with accessible components |
| Forms | React Hook Form + Zod | Type-safe validation with minimal re-renders |
| Data fetching | TanStack Query + Supabase client | Caching, background refetch, loading/error states |
| Backend (BaaS) | Supabase | Managed Postgres, Auth, Storage, Edge Functions — no custom server needed |
| Database | Supabase PostgreSQL | Managed Postgres with RLS for row-level authorization |
| Auth | Supabase Auth | Email/password + OAuth, session management, JWT handled automatically |
| File storage | Supabase Storage | S3-compatible object storage with access policies |
| Email | Resend (via Edge Function) | API-based email delivery, called from Supabase Edge Functions |
| Cron | Supabase pg_cron | Scheduled database-level cron for triggering the reminder Edge Function |
| Serverless functions | Supabase Edge Functions (Deno) | For reminder logic and any server-side processing |

## 9. Project Structure

```
warrantify/
├── src/
│   ├── components/          # WarrantyCard, UploadModal, CategoryChips, etc.
│   ├── pages/               # Dashboard, ProductDetail, Login, Register
│   ├── hooks/               # useWarranties, useAuth, useUpload
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client initialization
│   │   ├── queries.ts       # TanStack Query + Supabase data functions
│   │   └── utils.ts         # Date helpers, constants
│   ├── store/               # Auth context provider
│   └── types/               # TypeScript types matching DB schema
├── supabase/
│   ├── migrations/          # SQL migrations for tables, RLS policies, triggers
│   ├── functions/
│   │   └── send-reminders/  # Edge Function for email reminders
│   ├── seed.sql             # Optional seed data for development
│   └── config.toml          # Supabase local dev config
├── vite.config.ts
├── tailwind.config.ts
└── PRD.md
```

> **Key difference from a traditional backend:** There is no `/backend` folder. Supabase replaces the custom Express server. The only server-side code is the Edge Function for email reminders.

## 10. UI Wireframes (Text)

### Dashboard Layout
```
┌─────────────────────────────────────────────────┐
│  Warrantify              [Search...]   [Avatar]  │
├─────────────────────────────────────────────────┤
│  [All] [Electronics] [Appliances] [Furniture].. │
├─────────────────────────────────────────────────┤
│                                                  │
│  ⚠ Expiring Soon (3)                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Washing  │ │ Laptop   │ │ Sofa     │        │
│  │ Machine  │ │ Dell XPS │ │ IKEA     │        │
│  │ 12 days  │ │ 23 days  │ │ 28 days  │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                  │
│  ✓ Active (5)                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ...    │
│  │ ...      │ │ ...      │ │ ...      │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                  │
│  ✗ Expired (2)                                  │
│  ┌──────────┐ ┌──────────┐                      │
│  │ ...      │ │ ...      │                      │
│  └──────────┘ └──────────┘                      │
│                                                  │
│              [+ Add Warranty]                    │
└─────────────────────────────────────────────────┘
```

### Add Warranty Modal
```
┌───────────────────────────────────┐
│  Add Warranty                  ✕  │
├───────────────────────────────────┤
│  Product Name*    [____________]  │
│  Brand            [____________]  │
│  Category*        [▼ Electronics] │
│  Purchase Date*   [__/__/____]    │
│  Warranty Period*  [__] months    │
│  Serial Number    [____________]  │
│  Brand Contact    [____________]  │
│  Notes            [____________]  │
│                                   │
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐   │
│  │  Drop files here or click │   │
│  │  to upload (JPG, PNG, PDF)│   │
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘   │
│                                   │
│         [Cancel]  [Save]          │
└───────────────────────────────────┘
```

## 11. Build Phases

| Phase | Scope | Dependencies |
|---|---|---|
| 1 | Project scaffolding — Vite + React + TypeScript, Tailwind + shadcn/ui, Supabase project setup, `supabase init` | None |
| 2 | Database schema — SQL migrations for all tables, RLS policies, triggers, generated columns | Phase 1 |
| 3 | Auth UI — Login, Register, and auth context using Supabase Auth, protected routes | Phase 2 |
| 4 | Warranty CRUD — Supabase client queries with TanStack Query, status computation on read | Phase 3 |
| 5 | File upload — Supabase Storage bucket, upload/preview/delete via client | Phase 4 |
| 6 | Dashboard UI — card layout, three sections (Expiring Soon, Active, Expired), category chips | Phase 4 |
| 7 | Add/Edit Warranty UI — modal form, file dropzone, Zod validation | Phases 5 + 6 |
| 8 | Product Detail page — full detail view, document previews, edit/delete | Phase 7 |
| 9 | Search & Categories — search bar, category filter, combined filtering | Phase 6 |
| 10 | Email reminders — Supabase Edge Function + pg_cron + Resend integration | Phase 4 |
| 11 | Polish & deploy — loading skeletons, error toasts, empty states, deploy frontend to Vercel | All |

## 12. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Page load | < 2s on 4G connection |
| Auth session expiry | Managed by Supabase (default 1 hour, auto-refreshed) |
| Max file upload size | 10 MB |
| Supported file types | JPG, PNG, PDF |
| Browser support | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| Mobile responsive | Yes — dashboard and all pages must work on 375px+ screens |

## 13. Out of Scope (MVP)

These are planned for future versions, **not** part of the initial build:

- AI-powered OCR scanning of receipts/warranty cards
- Family/household sharing and multi-user access
- Calendar integration (Google Calendar, Apple Calendar)
- Maintenance schedule reminders
- Mobile native apps (iOS/Android)
- Push notifications (web or mobile)
- Warranty claim tracking workflow
- Multi-language support

## 14. Success Metrics

| Metric | Target |
|---|---|
| User can register and add first warranty | < 3 minutes |
| All CRUD operations functional | 100% of endpoints tested |
| Reminder emails delivered on schedule | 30-day and 7-day emails sent without duplicates |
| Dashboard loads with 50+ warranties | < 1 second |

## 15. Open Questions

1. Should warranty period support days/years in addition to months?
2. Should expired warranties auto-archive after a certain period?
3. Do we need an "extended warranty" field for products with optional extended coverage?
4. Should the reminder schedule be user-configurable (e.g., 60/14/3 days)?
