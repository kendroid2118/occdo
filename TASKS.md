# OCCDO — Task Backlog

Authoritative development backlog. Complete **one task or tightly related group** at a time. Update this file when a task changes status.

Confirmed product decisions: `docs/DECISIONS.md`. Seed lists: `docs/REFERENCE_DATA.md`.

Statuses: `TODO` | `IN PROGRESS` | `BLOCKED` | `READY FOR QA` | `DONE`

---

## OCCDO-000 — Project planning / bootstrap documentation

- **Milestone:** Planning
- **Status:** DONE
- **Objective:** Inspect the empty repository, record architecture and domain design, and create the backlog. No application implementation.
- **Files/modules affected:** `docs/*`, `TASKS.md`, `.cursor/rules/project-architecture.mdc` (overview only)
- **Dependencies:** None
- **Acceptance criteria:** Scope, architecture, database design, modules, security, implementation plan, and this backlog exist; repo is not scaffolded as an app yet.
- **Security considerations:** Docs must not include real credentials or invented official seals.
- **Testing requirements:** None (documentation only)

## OCCDO-047 — Record OCCDO confirmed decisions

- **Milestone:** Planning
- **Status:** DONE
- **Objective:** Capture OCCDO answers (sectors, CDA shortcut, barangays, maintenance catalogs, Hostinger, internal-only, SUPER_ADMIN) without implementing the app.
- **Files/modules affected:** `docs/DECISIONS.md`, `docs/REFERENCE_DATA.md`, planning docs, this backlog
- **Dependencies:** OCCDO-000
- **Acceptance criteria:** Decisions documented; seed sector/barangay lists written; open items (membership extras, migration, CDA reports) remain TBA.
- **Security considerations:** No secrets; no invented logos; CDA is an outbound link only.
- **Testing requirements:** None (documentation only)

---

# M0 — Project Foundation

## OCCDO-001 — Scaffold Next.js 15 App Router application

- **Milestone:** M0
- **Status:** DONE
- **Objective:** Create the Next.js 15 + React 19 + TypeScript strict app in `C:\projects\occdo` without extra frameworks.
- **Files/modules affected:** `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`
- **Dependencies:** OCCDO-000
- **Acceptance criteria:** `npm run dev` starts; TypeScript `strict` and `noImplicitAny` are on; App Router is used; no `any`.
- **Security considerations:** Do not commit `.env`; no secrets in source.
- **Testing requirements:** Confirm `tsc --noEmit` configuration exists (full typecheck script in OCCDO-003).

## OCCDO-002 — Tailwind, Radix UI, Lucide React

- **Milestone:** M0
- **Status:** DONE
- **Objective:** Add styling and UI primitives required by architecture rules.
- **Files/modules affected:** `package.json`, Tailwind config, `app/globals.css`, `components/ui/` (minimal primitives only)
- **Dependencies:** OCCDO-001
- **Acceptance criteria:** Tailwind works; Radix and `lucide-react` installed; no alternate CSS framework.
- **Security considerations:** None beyond dependency choice (maintained packages only).
- **Testing requirements:** Visual check of a placeholder page (dev server). Browser verification of layout comes with OCCDO-008.

## OCCDO-003 — Tooling scripts, ESLint, Prettier

- **Milestone:** M0
- **Status:** DONE
- **Objective:** Add required npm scripts and lint/format tooling.
- **Files/modules affected:** `package.json`, ESLint/Prettier configs
- **Dependencies:** OCCDO-001
- **Acceptance criteria:** Scripts exist: `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, `db:migrate`, `db:seed` (seed/migrate may stub until Prisma exists). `npm run lint` and `npm run typecheck` run clean on the scaffold.
- **Security considerations:** None.
- **Testing requirements:** Execute `lint` and `typecheck`.

## OCCDO-004 — MVC folder structure

- **Milestone:** M0
- **Status:** DONE
- **Objective:** Create `lib/actions`, `lib/dal`, `lib/auth`, `lib/validation`, `components/`, `db/`, `prisma/`, `tests/` with brief barrel or placeholder modules so imports have a home.
- **Files/modules affected:** directories listed in `docs/ARCHITECTURE.md`
- **Dependencies:** OCCDO-001
- **Acceptance criteria:** Structure matches architecture rules; no Prisma imports outside `lib/dal/`.
- **Security considerations:** Placeholders must not expose env secrets.
- **Testing requirements:** None beyond lint/typecheck.

## OCCDO-005 — Validated environment module

- **Milestone:** M0
- **Status:** DONE
- **Objective:** Centralize env access with Zod in `lib/env.ts`; add `.env.example`.
- **Files/modules affected:** `lib/env.ts`, `lib/env/schema.ts`, `.env.example`, `.gitignore`
- **Dependencies:** OCCDO-004
- **Acceptance criteria:** No scattered `process.env` in app code; `.env` gitignored; example file has placeholders only (`DATABASE_URL`, `AUTH_SECRET`, Upstash placeholders).
- **Security considerations:** Never commit real secrets; no `NEXT_PUBLIC_` for server secrets.
- **Testing requirements:** Unit test that schema rejects missing required vars (Vitest after OCCDO-007, or in same group if Vitest lands first).

## OCCDO-006 — Prisma and PostgreSQL wiring

- **Milestone:** M0
- **Status:** DONE
- **Objective:** Initialize Prisma v6+ against PostgreSQL with a **minimal** schema (e.g. health/meta only or empty baseline). Full domain models wait for M1/M2.
- **Files/modules affected:** `prisma/schema.prisma`, `lib/dal/` Prisma client wrapper, `package.json` db scripts
- **Dependencies:** OCCDO-005
- **Acceptance criteria:** Prisma client is imported only from DAL; `db:migrate` script is defined; connection URL comes from `lib/env.ts`.
- **Security considerations:** Connection string only via env; never log it.
- **Testing requirements:** `prisma generate` succeeded. `prisma migrate deploy` could not run — PostgreSQL not reachable at `localhost:5432` (no Docker/local service). Re-run migrate when the database is available.

## OCCDO-007 — Vitest and Playwright harness

- **Milestone:** M0
- **Status:** DONE
- **Objective:** Baseline unit and e2e runners with a trivial passing test each.
- **Files/modules affected:** `vitest.config.mts`, `playwright.config.ts`, `tests/unit/`, `tests/e2e/`
- **Dependencies:** OCCDO-001, OCCDO-003
- **Acceptance criteria:** `npm run test` and `npm run test:e2e` execute successfully on a smoke test.
- **Security considerations:** E2E must not embed production credentials.
- **Testing requirements:** Run both scripts.

## OCCDO-008 — App shell (sidebar, header)

- **Milestone:** M0
- **Status:** DONE
- **Objective:** Minimalist collapsible sidebar + header matching navigation IA as **inactive/placeholder** links. No module CRUD.
- **Files/modules affected:** `components/layout/*`, `app/(dashboard)/layout.tsx`
- **Dependencies:** OCCDO-002
- **Acceptance criteria:** Responsive desktop/tablet shell; accessible collapse control; no invented official seal (text wordmark “OCCDO” / “LGU Ormoc” only unless a real asset is added later).
- **Security considerations:** Do not imply the user is authenticated; M1 will wrap this layout.
- **Testing requirements:** Browser check of collapse and navigation landmarks; basic a11y (keyboard on toggle).

## OCCDO-009 — Seed runner stub and demo-data policy

- **Milestone:** M0
- **Status:** DONE
- **Objective:** `db/seed.ts` runnable stub that documents fixtures vs production; no fake production users with real passwords.
- **Files/modules affected:** `db/seed.ts`
- **Dependencies:** OCCDO-006
- **Acceptance criteria:** `npm run db:seed` runs without inserting secrets; comments state demo data must be labeled.
- **Security considerations:** No real credentials.
- **Testing requirements:** `prisma migrate status` up to date (`20260922000000_init_app_meta` already applied; not reapplied). `npm run db:seed` exit 0. Prisma read of `AppMeta` (`id=occdo`, `name=OCCDO`) succeeded. No secrets in seed output.

---

# M1 — Authentication & RBAC

## OCCDO-010 — Auth.js user/session Prisma models

- **Milestone:** M1
- **Status:** DONE
- **Objective:** Add `User`, `Account`, `Session`, `VerificationToken` with `role` enum and `isActive`; password hash never in default selects.
- **Files/modules affected:** `prisma/schema.prisma`, `lib/dal/users.ts`, migration
- **Dependencies:** OCCDO-006
- **Acceptance criteria:** Migration applies; DAL cannot return `passwordHash` on list/get-for-ui helpers.
- **Security considerations:** Explicit `select`; hash column excluded from UI queries.
- **Testing requirements:** DAL unit/integration test that selected user shape has no hash. `prisma validate` pass; `migrate status` up to date; `tsc --noEmit` pass; user-select + users DAL tests pass.

## OCCDO-011 — Auth.js v5 session authentication

- **Milestone:** M1
- **Status:** DONE
- **Objective:** Configure Auth.js with credentials (or approved provider), `AUTH_SECRET` via `lib/env.ts`, session cookies.
- **Files/modules affected:** `lib/auth/*`, `app/api/auth/[...nextauth]/route.ts` (Auth.js requirement)
- **Dependencies:** OCCDO-010, OCCDO-005
- **Acceptance criteria:** Sign-in establishes a server session; `trustHost` only if reverse-proxy documented.
- **Security considerations:** Constant-time password compare via a standard hasher (e.g. bcrypt/argon as already common with Auth.js); no secret logging.
- **Testing requirements:** Integration test of session helper with mocked user. `tsc --noEmit` pass; authorize/session/password unit tests pass.

## OCCDO-012 — Login UI and auth rate limiting

- **Milestone:** M1
- **Status:** DONE
- **Objective:** Accessible login page; rate limit by IP + identifier via `lib/rate-limit.ts`.
- **Files/modules affected:** `app/(auth)/login/`, `lib/rate-limit.ts`, login action
- **Dependencies:** OCCDO-011
- **Acceptance criteria:** Failed and successful attempts; typed rate-limit error; no user enumeration beyond existing project pattern (generic error preferred).
- **Security considerations:** Aggressive limits; generic login failure message.
- **Testing requirements:** Unit test rate-limit error mapping; e2e successful login against seed user. `tsc --noEmit` pass; login error/rate-limit unit tests pass; login e2e pass.

## OCCDO-013 — `roleActionClient` and `requireRole`

- **Milestone:** M1
- **Status:** DONE
- **Objective:** Shared Server Action wrapper: auth → rate limit → Zod → role check.
- **Files/modules affected:** `lib/auth/action-client.ts`, `lib/auth/rbac.ts`
- **Dependencies:** OCCDO-011, OCCDO-012
- **Acceptance criteria:** Unauthorized and forbidden return typed errors; roles match `DEVELOPER | SUPER_ADMIN | ADMIN | USER`.
- **Security considerations:** Server-side only; no client-trusted role.
- **Testing requirements:** Unit tests for each deny/allow path. `tsc --noEmit` pass; rbac + action-client unit tests pass.

## OCCDO-014 — Audit log schema and DAL

- **Milestone:** M1
- **Status:** DONE
- **Objective:** `AuditLog` table and `lib/dal/audit.ts` write helper that strips secret keys from metadata.
- **Files/modules affected:** Prisma schema, `lib/dal/audit.ts`
- **Dependencies:** OCCDO-010
- **Acceptance criteria:** Writer persists actor, action, entity type/id, timestamp, source, metadata; rejects/redacts password-like keys.
- **Security considerations:** Never store passwords, tokens, or raw secrets.
- **Testing requirements:** Unit test redaction. `prisma validate` pass; migrate status up to date; `tsc --noEmit` pass; audit-redact unit tests pass.

## OCCDO-015 — Protect dashboard routes

- **Milestone:** M1
- **Status:** DONE
- **Objective:** Unauthenticated users cannot open dashboard shell; sign-out works.
- **Files/modules affected:** middleware or layout session check, `app/(dashboard)/layout.tsx`
- **Dependencies:** OCCDO-011, OCCDO-008
- **Acceptance criteria:** Anonymous request redirects to login; authenticated USER can see shell.
- **Security considerations:** Middleware is extra defense; actions still call `requireRole`.
- **Testing requirements:** Playwright: unauthenticated redirect; authenticated access.

---

# M2 — Cooperative Masterlist

## OCCDO-016 — Cooperative reference tables

- **Milestone:** M2
- **Status:** DONE
- **Objective:** Prisma models for type, sector, status, accreditation status, barangay (shape in `docs/DATABASE_DESIGN.md`).
- **Files/modules affected:** `prisma/schema.prisma`, DAL list-active helpers, seed from `docs/REFERENCE_DATA.md`
- **Dependencies:** OCCDO-006
- **Acceptance criteria:** FKs ready; `isActive` supported; no hardcoded type/sector/status strings in business logic; seed **5 sectors** and **85 Ormoc barangays**; catalogs remain editable later (OCCDO-042).
- **Security considerations:** Seed is reference data, not production user credentials.
- **Testing requirements:** Migration + seed of reference rows.

## OCCDO-017 — Cooperative master model and indexes

- **Milestone:** M2
- **Status:** DONE
- **Objective:** `Cooperative` table with initial fields from the project brief and FKs to reference data.
- **Files/modules affected:** `prisma/schema.prisma`, migration
- **Dependencies:** OCCDO-016, OCCDO-010
- **Acceptance criteria:** Unique `cooperativeCode`; nullable unique `registrationNumber`; membership counts default 0; indexes for list/report filters.
- **Security considerations:** None beyond usual PII in contact fields (minimize DAL select).
- **Testing requirements:** Migration applies on dev DB.

## OCCDO-018 — Cooperative validation + DAL + actions

- **Milestone:** M2
- **Status:** DONE
- **Objective:** Zod schemas; DAL create/update/get/list (paginated, DB-level filter/sort); Server Actions with `requireRole` and audit on create/update.
- **Files/modules affected:** `lib/validation/cooperative.ts`, `lib/dal/cooperatives.ts`, `lib/actions/cooperatives.ts`
- **Dependencies:** OCCDO-017, OCCDO-013, OCCDO-014
- **Acceptance criteria:** Views do not import DAL/Prisma; pagination at DB; status/type via IDs; audit entries on write.
- **Security considerations:** RBAC on writes; no mass assignment beyond Zod; IDOR-safe get-by-id.
- **Testing requirements:** Schema tests; DAL list filter test; action forbidden-role test.

## OCCDO-019 — Cooperative masterlist UI

- **Milestone:** M2
- **Status:** DONE
- **Objective:** Filterable, paginated masterlist and create/edit form using reference dropdowns.
- **Files/modules affected:** `app/(dashboard)/cooperatives/**`, reusable table/filter components
- **Dependencies:** OCCDO-018, OCCDO-008
- **Acceptance criteria:** Desktop/tablet usable; accessible labels; empty and error states; numbers/names from DB not hardcoded.
- **Security considerations:** UI hide is not authz.
- **Testing requirements:** Playwright: create cooperative as ADMIN; list shows it. Browser verification of the flow.

---

# M3 — Cooperative Profiles

## OCCDO-020 — Cooperative profile page

- **Milestone:** M3
- **Status:** DONE
- **Objective:** Read-only hub for one cooperative (identity, status, membership counts, remarks) with link to edit.
- **Files/modules affected:** `app/(dashboard)/cooperatives/[id]/`
- **Dependencies:** OCCDO-019
- **Acceptance criteria:** 404 for unknown id; authorized roles only; no Prisma in the page.
- **Security considerations:** IDOR: id from URL still authorized server-side.
- **Testing requirements:** E2E profile render; negative unauthorized if feasible.

## OCCDO-021 — Officers / contacts

- **Milestone:** M3
- **Status:** DONE
- **Objective:** Officer position reference + CRUD scoped to a cooperative.
- **Files/modules affected:** Prisma, `lib/dal/officers.ts`, actions, profile UI section
- **Dependencies:** OCCDO-020
- **Acceptance criteria:** Officers listed on profile; primary contact flag; audit on changes.
- **Security considerations:** `cooperativeId` cannot be swapped to another record by the client without authz check.
- **Testing requirements:** Unit validation; e2e add officer.

## OCCDO-022 — Membership snapshots

- **Milestone:** M3
- **Status:** DONE
- **Objective:** Updating membership counts writes a `MembershipSnapshot` and audits the change.
- **Files/modules affected:** Prisma, DAL, profile membership form
- **Dependencies:** OCCDO-020
- **Acceptance criteria:** Master counts and snapshot stay consistent in a transaction; male + female need not equal total until OCCDO confirms the rule (document current behavior).
- **Security considerations:** Transactional write; audit.
- **Testing requirements:** Integration test of transactional update.

---

# M4 — Registration / Accreditation

## OCCDO-023 — Accreditation case model and workflow actions

- **Milestone:** M4
- **Status:** DONE
- **Objective:** `AccreditationCase` with configurable case statuses; changes update cooperative accreditation fields in a transaction and write audit logs.
- **Files/modules affected:** Prisma, DAL, `lib/actions/accreditation.ts`
- **Dependencies:** OCCDO-017, OCCDO-013, OCCDO-014
- **Acceptance criteria:** No hardcoded workflow strings; status change audited.
- **Security considerations:** Role-gated decisions (ADMIN+ for decide/approve unless OCCDO says otherwise).
- **Testing requirements:** Action tests for transition + audit.

## OCCDO-024 — Registration / accreditation UI

- **Milestone:** M4
- **Status:** DONE
- **Objective:** List and detail of cases; file/decide within RBAC.
- **Files/modules affected:** `app/(dashboard)/cooperatives/` registration routes
- **Dependencies:** OCCDO-023
- **Acceptance criteria:** Filters by case status; linked cooperative visible.
- **Security considerations:** Server-side role checks.
- **Testing requirements:** Playwright happy path; browser verification.

---

# M5 — Programs & Services

## OCCDO-025 — Program and service type catalogs

- **Milestone:** M5
- **Status:** DONE
- **Objective:** Configurable `Program` and `ServiceType` with DAL/admin-ready models (settings UI may wait for M13).
- **Files/modules affected:** Prisma, seed fixtures labeled demo, DAL
- **Dependencies:** OCCDO-016
- **Acceptance criteria:** Catalog is data, not code constants.
- **Security considerations:** Writes restricted to ADMIN+.
- **Testing requirements:** Seed + list DAL test.

## OCCDO-026 — Service delivery records

- **Milestone:** M5
- **Status:** DONE
- **Objective:** Record services a cooperative received (date, type, optional program, remarks).
- **Files/modules affected:** Prisma `ServiceDelivery`, DAL, actions, UI under Programs & Services
- **Dependencies:** OCCDO-025, OCCDO-017
- **Acceptance criteria:** Query by cooperative and by service + date range at DB level.
- **Security considerations:** Audit creates; RBAC.
- **Testing requirements:** DAL filter tests; e2e create delivery.

---

# M6 — Capacity Building / Trainings

## OCCDO-027 — Training events

- **Milestone:** M6
- **Status:** DONE
- **Objective:** `TrainingEvent` for trainings, seminars, orientations.
- **Files/modules affected:** Prisma, DAL, actions, Capacity Building UI
- **Dependencies:** OCCDO-013, OCCDO-006
- **Acceptance criteria:** Date/venue/title stored; kind is reference or constrained enum documented in schema.
- **Security considerations:** RBAC on create/update.
- **Testing requirements:** Validation + e2e create event.

## OCCDO-028 — Training participants

- **Milestone:** M6
- **Status:** DONE
- **Objective:** Participants linked to events and optionally to a cooperative.
- **Files/modules affected:** `TrainingParticipant`, UI, DAL
- **Dependencies:** OCCDO-027, OCCDO-017
- **Acceptance criteria:** Can list participants per event and events per cooperative.
- **Security considerations:** PII minimization in lists.
- **Testing requirements:** DAL queries; e2e add participant.

---

# M7 — Financial Assistance

## OCCDO-029 — Assistance types and records

- **Milestone:** M7
- **Status:** TODO
- **Objective:** Configurable assistance types and `AssistanceRecord` (amount, dates, status, fund source).
- **Files/modules affected:** Prisma, DAL, actions, Financial Assistance UI
- **Dependencies:** OCCDO-017, OCCDO-014
- **Acceptance criteria:** All amount/status changes audited; transactional where status + ledger both write.
- **Security considerations:** ADMIN+ for approve/release; never log full bank details if added later.
- **Testing requirements:** Audit on status change; validation of amounts.

## OCCDO-030 — Fund monitoring entries

- **Milestone:** M7
- **Status:** TODO
- **Objective:** Simple ledger entries against an assistance record.
- **Files/modules affected:** `FundLedgerEntry`, UI
- **Dependencies:** OCCDO-029
- **Acceptance criteria:** Entries cannot exist without parent assistance; sums queryable for monitoring.
- **Security considerations:** Audit writes.
- **Testing requirements:** Integration transaction test.

---

# M8 — Monitoring & Compliance

## OCCDO-031 — Configurable compliance requirements

- **Milestone:** M8
- **Status:** TODO
- **Objective:** `ComplianceRequirement` master data; no hardcoded checklist in logic.
- **Files/modules affected:** Prisma, DAL
- **Dependencies:** OCCDO-016
- **Acceptance criteria:** Inactive requirements excluded from new records but preserved historically.
- **Security considerations:** ADMIN+ to mutate catalog.
- **Testing requirements:** DAL list-active test.

## OCCDO-032 — Compliance records

- **Milestone:** M8
- **Status:** TODO
- **Objective:** Records with period, due/submitted dates, status, remarks, optional document, verifier fields.
- **Files/modules affected:** Prisma, DAL, actions, Monitoring UI
- **Dependencies:** OCCDO-031, OCCDO-017, OCCDO-014
- **Acceptance criteria:** Verification sets `verifiedById`/`verifiedAt` server-side from session, not client; audited.
- **Security considerations:** Client cannot spoof verifier.
- **Testing requirements:** Verification action test; e2e create record.

---

# M9 — Documents

## OCCDO-033 — Document types and secure upload

- **Milestone:** M9
- **Status:** TODO
- **Objective:** `CooperativeDocument` with server-generated stored names, MIME allowlist, size cap, storage outside public.
- **Files/modules affected:** Prisma, upload action, storage helper, Documents UI
- **Dependencies:** OCCDO-017, OCCDO-014
- **Acceptance criteria:** Original filename not used as path; download authorized; audit upload.
- **Security considerations:** Path traversal, MIME allowlist, authz on get, no public URLs.
- **Testing requirements:** Unit tests for filename generation and rejection of disallowed types; e2e upload as authorized user.

## OCCDO-034 — Document verification and templates stub

- **Milestone:** M9
- **Status:** TODO
- **Objective:** Verification status on documents; optional office `DocumentTemplate` list without unsafe public file serving.
- **Files/modules affected:** actions, Documents UI
- **Dependencies:** OCCDO-033
- **Acceptance criteria:** Verify action audited; templates follow same storage rules if files exist.
- **Security considerations:** Same as uploads.
- **Testing requirements:** Verify-action unit test.

---

# M10 — Dashboard & Analytics

## OCCDO-035 — Dashboard summary DAL

- **Milestone:** M10
- **Status:** TODO
- **Objective:** Aggregations for KPIs and breakdowns from PostgreSQL (counts, by type/sector/status, membership total, YTD deliveries, compliance rollup).
- **Files/modules affected:** `lib/dal/dashboard.ts`, `lib/actions` or server page data via controller pattern
- **Dependencies:** OCCDO-017, OCCDO-026, OCCDO-027, OCCDO-032
- **Acceptance criteria:** No hardcoded KPI numbers; empty DB shows zeros.
- **Security considerations:** Role-gated dashboard; no extra PII in aggregates.
- **Testing requirements:** Integration tests with seeded cooperatives.

## OCCDO-036 — Dashboard UI widgets

- **Milestone:** M10
- **Status:** TODO
- **Objective:** Reusable cards/charts; upcoming activities and announcements; **CDA Portal** external shortcut from `SystemConfig`.
- **Files/modules affected:** `components/dashboard/*`, `app/(dashboard)/dashboard/page.tsx`
- **Dependencies:** OCCDO-035, OCCDO-008
- **Acceptance criteria:** Matches modern LGU IA (not pixel-copy); responsive; accessible text alternatives for charts; sector chart uses DB sectors; CDA link opens a new tab with `noopener noreferrer` and is hidden when URL is empty. No CDA API calls.
- **Security considerations:** Server-fetched data only; outbound link is not an integration; do not embed CDA in an iframe unless OCCDO later asks.
- **Testing requirements:** Browser verification of widgets against seed data; e2e dashboard load; CDA shortcut present when configured.

---

# M11 — Reports

## OCCDO-037 — Report filters and cooperative/membership reports

- **Milestone:** M11
- **Status:** TODO
- **Objective:** Filter by date range, cooperative, type, sector, barangay, status at DB level.
- **Files/modules affected:** `lib/dal/reports.ts`, `lib/validation/reports.ts`, Reports UI
- **Dependencies:** OCCDO-017
- **Acceptance criteria:** No load-all-then-filter in JS; pagination or explicit cap.
- **Security considerations:** RBAC; no export of password/user secrets.
- **Testing requirements:** DAL filter tests.

## OCCDO-038 — Assistance, training, compliance, summary reports

- **Milestone:** M11
- **Status:** TODO
- **Objective:** Remaining report views using the same filter pipeline.
- **Files/modules affected:** Reports UI, DAL
- **Dependencies:** OCCDO-037, OCCDO-026, OCCDO-027, OCCDO-029, OCCDO-032
- **Acceptance criteria:** Each report answers the module question with filters documented in UI.
- **Security considerations:** Same as OCCDO-037.
- **Testing requirements:** One e2e per report family or equivalent integration coverage.

---

# M12 — Calendar / Activities

## OCCDO-039 — Calendar activities

- **Milestone:** M12
- **Status:** TODO
- **Objective:** `CalendarActivity` with type (activity/training/deadline), dates, optional cooperative/training links.
- **Files/modules affected:** Prisma, DAL, actions, Calendar UI
- **Dependencies:** OCCDO-013
- **Acceptance criteria:** Upcoming query for dashboard; list/month view sufficient for v1 (no need for full Google Calendar clone).
- **Security considerations:** RBAC on create; optional cooperative FK validated.
- **Testing requirements:** DAL upcoming test; e2e create activity.

## OCCDO-040 — Announcements

- **Milestone:** M12
- **Status:** TODO
- **Objective:** Simple announcements for the dashboard widget.
- **Files/modules affected:** Prisma, DAL, Settings or Calendar admin UI
- **Dependencies:** OCCDO-013
- **Acceptance criteria:** Published/unexpired/active filter; ADMIN+ to publish.
- **Security considerations:** XSS: render announcement body safely (no raw HTML unless sanitized later — start with plain text).
- **Testing requirements:** Unit filter; e2e create announcement.

---

# M13 — Administration & Settings

## OCCDO-041 — User administration

- **Milestone:** M13
- **Status:** TODO
- **Objective:** Create/disable users, assign one of the four roles; audit role changes.
- **Files/modules affected:** Settings Users UI, `lib/actions/users.ts`, DAL
- **Dependencies:** OCCDO-010, OCCDO-013, OCCDO-014
- **Acceptance criteria:** Cannot set `SUPER_ADMIN`/`DEVELOPER` without `SUPER_ADMIN` or `DEVELOPER`; disabled users cannot sign in. OCCDO full admin is `SUPER_ADMIN`.
- **Security considerations:** Prevent last SUPER_ADMIN lockout; never return hashes; audit.
- **Testing requirements:** Role-change audit test; forbidden USER cannot open user admin.

## OCCDO-042 — Reference data and system configuration UI

- **Milestone:** M13
- **Status:** TODO
- **Objective:** CRUD for configurable catalogs (sectors, types, statuses, barangays, programs, **assistance types**, requirements, **document types**) and non-secret system config including **CDA Portal URL**.
- **Files/modules affected:** `app/(dashboard)/settings/**`
- **Dependencies:** OCCDO-016, OCCDO-025, OCCDO-031
- **Acceptance criteria:** Deactivate not hard-delete when referenced; SUPER_ADMIN can add/rename sectors, assistance types, and document types without a code change; config has no secrets in client payloads.
- **Security considerations:** `SUPER_ADMIN` (and `DEVELOPER` for system config); audit mutations.
- **Testing requirements:** E2E add a sector; deactivate a type; historical cooperative still shows the old name.

---

# M14 — Security Hardening

## OCCDO-043 — Security headers and production HTTPS assumptions

- **Milestone:** M14
- **Status:** TODO
- **Objective:** CSP, HSTS (prod only), X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- **Files/modules affected:** `next.config.ts` or headers helper
- **Dependencies:** OCCDO-001
- **Acceptance criteria:** Headers present in production build config; HSTS not applied to local HTTP.
- **Security considerations:** CSP must not be weakened “to make a feature work” without review.
- **Testing requirements:** Assert header config in unit test or documented production checklist.

## OCCDO-044 — Security review pass

- **Milestone:** M14
- **Status:** TODO
- **Objective:** Review uploads, RBAC on all actions, audit coverage, env usage, dependency audit.
- **Files/modules affected:** Cross-cutting; findings filed as new tasks if needed
- **Dependencies:** OCCDO-033, OCCDO-013, OCCDO-041
- **Acceptance criteria:** Checklist in `docs/SECURITY.md` verified; gaps become TASKS, not silent debt.
- **Security considerations:** Entire milestone.
- **Testing requirements:** `npm audit` (or equivalent) recorded; existing authz tests still pass.

---

# M15 — QA / UAT / Production Readiness

## OCCDO-045 — Automated quality gates

- **Milestone:** M15
- **Status:** TODO
- **Objective:** `lint`, `typecheck`, `test`, `build`, and critical Playwright flows all pass.
- **Files/modules affected:** CI config if added; tests
- **Dependencies:** M0–M14 tasks marked DONE or explicitly deferred
- **Acceptance criteria:** Commands actually executed; failures not hidden.
- **Security considerations:** No secrets in CI logs.
- **Testing requirements:** Run the full gate set.

## OCCDO-046 — UAT and production checklist

- **Milestone:** M15
- **Status:** TODO
- **Objective:** OCCDO staff UAT on masterlist, profile, dashboard numbers, and one report; **Hostinger Cloud** production env (Node 20+ VPS/Cloud, PostgreSQL, HTTPS), backups, migrate, seed policy (no demo cooperatives in prod).
- **Files/modules affected:** ops notes as needed (short); not a second architecture rewrite
- **Dependencies:** OCCDO-045
- **Acceptance criteria:** Written UAT result; app runs on Hostinger Node hosting (not PHP shared); production seed does not include demo cooperatives unless OCCDO asks; backups confirmed by operator.
- **Security considerations:** Production `.env` never committed; HSTS/HTTPS on; `trustHost` only if Hostinger proxy requires it.
- **Testing requirements:** UAT script executed by humans; record outcomes.

---

## Status legend

| Status | Meaning |
| --- | --- |
| TODO | Not started |
| IN PROGRESS | Actively being implemented |
| BLOCKED | Waiting on OCCDO, environment, or another task |
| READY FOR QA | Implementation done, awaiting verification |
| DONE | Acceptance criteria met and tests executed |
