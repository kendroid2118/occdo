# OCCDO — Implementation Plan

Work proceeds **one milestone at a time**. Complete tasks in `TASKS.md`. Do not implement later modules because they appear in this plan.

## Milestones

| ID | Name | Intent |
| --- | --- | --- |
| M0 | Project Foundation | Next.js app, tooling, folders, env, Prisma wiring, app shell |
| M1 | Authentication & RBAC | Auth.js sessions, roles, rate limit, audit infrastructure |
| M2 | Cooperative Masterlist | Reference data + cooperative CRUD list |
| M3 | Cooperative Profiles | Profile view, officers/contacts, membership snapshots |
| M4 | Registration / Accreditation | Cases and status workflow |
| M5 | Programs & Services | Catalog + service delivery records |
| M6 | Capacity Building | Trainings, seminars, participants |
| M7 | Financial Assistance | Assistance records and fund monitoring |
| M8 | Monitoring & Compliance | Requirements and compliance records |
| M9 | Documents | Secure upload/download and types |
| M10 | Dashboard & Analytics | Live KPIs and widgets |
| M11 | Reports | Filtered operational reports |
| M12 | Calendar / Activities | Activities, trainings, deadlines |
| M13 | Administration & Settings | Users, reference data UI, config |
| M14 | Security Hardening | Headers, upload review, dependency/audit pass |
| M15 | QA / UAT / Production Readiness | Tests, UAT, deploy checklist |

## Dependencies

```text
M0 → M1 → M2 → M3 → M4
                ↓
          M5, M6, M7, M8  (after M2; M3/M4 preferred first)
                ↓
               M9
                ↓
          M10, M11, M12
                ↓
               M13
                ↓
          M14 → M15
```

M5–M8 may start after a stable cooperative master (M2). Prefer finishing M3–M4 first so profile and accreditation are real.

M10 must not ship hardcoded KPIs. If dashboard chrome is needed earlier for layout, show empty/loading states until M10 queries exist. CDA Portal is a configurable shortcut, not a module.

M13 is where sector, barangay, assistance-type, and document-type **maintenance UIs** land. Until then, seed + Prisma is enough for M2.

Production (M15): Hostinger Cloud/VPS, Node 20+, PostgreSQL, HTTPS. No PHP shared hosting.

## M0 (next implementation)

- Scaffold Next.js 15 App Router, React 19, TypeScript strict
- Tailwind, Radix, Lucide
- `lib/` layout per architecture rules
- `lib/env.ts` + `.env.example`
- Prisma + PostgreSQL connection (minimal schema until M1/M2)
- Scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, `db:migrate`, `db:seed`
- Vitest + Playwright harness
- Collapsible shell layout without module features
- No invented logos

## Definition of done (every task)

Feature works; MVC boundaries held; validation/authz/rate limit as required; transactions for multi-step writes; no secrets; TypeScript and lint pass; relevant tests run; `TASKS.md` updated; no unrelated edits.

## Quality gates (when a milestone claims complete)

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

User-flow milestones also run `npm run test:e2e` for the flows in scope.
