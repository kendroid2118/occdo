# OCCDO — Project Scope

## 1. Product

**Name:** OCCDO (Ormoc City Cooperatives Development Office) Cooperative Management Information System  
**Client:** LGU Ormoc  
**Type:** Internal government MIS  
**Users:** OCCDO personnel and administrators (not a public cooperative portal in v1)

OCCDO is a web-based system for LGU staff to manage cooperative records, services delivered, compliance, and reports in one place. It replaces fragmented spreadsheets, paper files, and ad-hoc tracking with a single auditable source of truth.

## 2. Problem

OCCDO currently needs a centralized way to:

- Keep an authoritative cooperative masterlist and profile
- Track registration and LGU accreditation
- Record membership and officers
- Log programs, services, trainings, and financial assistance
- Monitor compliance and documents
- Produce filtered statistical reports
- Coordinate activities on a calendar
- Administer users and reference data with auditability

## 3. Primary domain entity

The **Cooperative** is the hub. Programs, trainings, assistance, compliance, documents, and calendar items must reference a cooperative (or be office-wide events that optionally link to cooperatives). Cooperative identity fields are not duplicated across modules.

## 4. In scope (product vision)

The system will eventually cover:

1. Cooperative profiles and masterlist
2. Registration / accreditation
3. Membership statistics
4. Technical assistance
5. Trainings conducted
6. Programs and services
7. Financial assistance
8. Monitoring and compliance
9. Cooperative documents
10. Reports and analytics
11. Calendar / activities
12. User and system administration
13. Dashboard summaries sourced from live data

## 5. Out of scope (v1 / this program of work)

Unless OCCDO later confirms otherwise, do **not** build:

- A public-facing cooperative self-service portal (v1 is **internal-only**; keep routing so a portal can be added later)
- Online payment / e-wallet disbursement
- CDA national system **integration** (dashboard CDA Portal is an external shortcut link only)
- GIS / mapping beyond barangay as a filter
- Mobile native apps
- A separate reporting data warehouse
- Invented official seals, logos, or legal citations
- Hardcoded business classifications in application logic
- Legacy data import until OCCDO delivers source files
- Extra membership classifications beyond male/female/total until OCCDO specifies them
- CDA statutory report formats until OCCDO provides them

## 6. Design direction

Use the supplied OCCDO dashboard as a **business and information-architecture reference**, not a pixel-perfect mock.

UI goals:

- Minimalist government dashboard
- Professional LGU appearance
- Clean typography and generous whitespace
- Responsive desktop and tablet layout
- Accessible controls (keyboard, labels, focus)
- Reusable dashboard cards and chart components
- Collapsible sidebar
- Clear data hierarchy

Use OCCDO/Ormoc branding **only** if assets exist in the repository. None are present at planning time. Do not invent official seals.

## 7. Roles (confirmed interpretation)

| Role | Intent |
| --- | --- |
| `DEVELOPER` | Technical / system maintenance (hosting, env, schema) |
| `SUPER_ADMIN` | OCCDO full application admin (users, reference data, configuration) |
| `ADMIN` | OCCDO administrative and management functions |
| `USER` | Authorized OCCDO personnel |

Authorization is enforced server-side. Hidden UI is not a security control.

## 8. Development constraint

Do not build the entire system in one task. Implement against `TASKS.md`, one task or tightly related group at a time. YAGNI applies: do not implement a module merely because it will be useful later.

## 9. Deployment

Production target: **Hostinger Cloud** (Node.js-capable Cloud/VPS, not PHP shared hosting). See `docs/ARCHITECTURE.md` and `docs/DECISIONS.md`.

## 10. Repository status at planning

As of the bootstrap phase, the repository contained only `.cursor/rules/`. This is a **new** project. Scaffolding starts at milestone M0.

Confirmed product decisions: `docs/DECISIONS.md`. Seed lists: `docs/REFERENCE_DATA.md`.
