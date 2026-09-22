# OCCDO — Architecture

## 1. Style

Next.js does not provide MVC. Enforce it explicitly:

```text
View (app/, components/)
  → Controller (lib/actions/, app/api/)
    → DAL (lib/dal/)
      → Prisma
        → PostgreSQL
```

Rules:

- Only `lib/dal/` may import the Prisma client.
- Pages, components, Server Actions, and Route Handlers must not import Prisma.
- Views must not call DAL functions directly.
- Prefer Server Components. Use `"use client"` only for genuine browser interactivity.

## 2. Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 App Router |
| UI | React 19, TypeScript strict, Tailwind CSS, Radix UI, Lucide React |
| Auth | Auth.js v5 (session-based) |
| Validation | Zod at every application boundary |
| Database | PostgreSQL via Prisma ORM v6+ |
| Rate limit | `@upstash/ratelimit` (or compatible Redis) |
| Unit / integration | Vitest |
| E2E | Playwright |

Do not introduce another major framework, ORM, auth system, or validation library without approval.

## 3. Request flow

```text
Request
  → Authentication
  → Rate limit
  → Zod validation
  → Authorization / RBAC
  → Business logic
  → DAL
  → Database
```

Protected Server Actions use:

```text
roleActionClient
  → rate limiting
  → Zod parse
  → requireRole([...])
  → business rules
  → DAL
  → transaction when required
  → typed result
```

## 4. Folder structure (target)

```text
app/
  (auth)/
  (dashboard)/
    dashboard/
    cooperatives/
    programs/
    capacity-building/
    financial-assistance/
    monitoring/
    reports/
    documents/
    calendar/
    settings/
  api/                    # only for devices, webhooks, M2M — not default UI I/O
components/
  ui/
  layout/
  dashboard/
lib/
  actions/
  dal/
  auth/
  validation/
  rate-limit.ts
  env.ts
db/
  seed.ts
prisma/
  schema.prisma
  migrations/
docs/
tests/
  unit/
  integration/
  e2e/
TASKS.md
```

UI-to-backend communication uses type-safe Server Actions. Route Handlers exist only when HTTP is genuinely required.

## 5. Information architecture (navigation)

```text
Dashboard
Cooperatives
  Cooperative Masterlist
  Cooperative Profile
  Registration / Accreditation
  Membership
  Officers / Contacts
Programs & Services
  Programs
  Services Availed
  Beneficiaries
Capacity Building
  Trainings
  Seminars
  Participants
Financial Assistance
  Assistance Records
  Grants / Support
  Fund Monitoring
Monitoring & Compliance
  Compliance Records
  Requirements
  Inspections / Monitoring
  Accreditation Status
Reports
  Cooperative, Membership, Assistance, Training, Compliance, Summary
Documents
  Cooperative Documents
  Templates / Forms
Calendar
  Activities, Trainings, Deadlines
Settings
  Users, Roles, Reference Data, System Configuration
```

Sidebar is collapsible. Navigation visibility may hide items the role cannot use; **every action still authorizes on the server**.

## 6. Reference data

Cooperative types, sectors, statuses, accreditation statuses, barangays, program/service catalogs, assistance types, compliance requirements, document types, and similar classifications are **database-backed reference records**.

Do not scatter string literals such as `"Multi-Purpose"` or `"Accredited"` as business logic switches. UI and reports join or select by stable IDs (and optional codes). Seed/demo rows must be clearly marked as fixtures.

## 7. Dashboard

Dashboard widgets read aggregated queries (or small DAL summary functions) against PostgreSQL. Do not hardcode KPI values from the reference design except temporary seed/demo data.

Sector chart uses maintainable `CooperativeSector` rows (initial five in `docs/REFERENCE_DATA.md`).

**CDA Portal** is an external shortcut (`SystemConfig.cdaPortalUrl` or equivalent). It is not an integration: open in a new tab with `noopener noreferrer`. If the URL is empty, hide the widget.

v1 routes under `(dashboard)` stay authenticated. A future public portal would be a separate route group, not a relaxation of existing authz.

## 8. Extensibility

- Add cooperative fields via Prisma migrations; avoid JSON catch-alls for first-class OCCDO data.
- New classifications are new reference rows (or a new reference table if the concept is distinct).
- Reporting filters use indexed columns and foreign keys on operational tables — no separate reporting database in this phase.

## 9. Environment

All environment variables are validated in `lib/env.ts`. Never commit `.env`. Maintain `.env.example` with placeholders only.

## 10. Hosting (Hostinger Cloud)

- Run Next.js on Hostinger **Cloud/VPS with Node.js 20+** (not PHP shared hosting).
- PostgreSQL on the same VPS or Hostinger’s managed database; `DATABASE_URL` only via env.
- Rate limiting: Upstash Redis unless Hostinger provides Redis.
- Production: HTTPS, `AUTH_SECRET`, `trustHost: true` only if Hostinger’s reverse proxy requires it.
- Build: `next build` then Node start process; no committed `.env`.
