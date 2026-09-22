# OCCDO — Modules

Each module is delivered in its milestone. Do not implement later modules early.

## Dashboard (M10)

Summaries from the database:

- Total cooperatives
- Ongoing registrations
- Technical assistance
- Trainings conducted
- Cooperative orientations
- Total membership

Widgets: cooperatives by sector (maintainable; initial five), status, membership growth, top cooperatives by membership, programs & services YTD, compliance status, upcoming activities, announcements, **CDA Portal shortcut** (external URL from system config).

Reusable cards and charts live under `components/dashboard/`.

## Cooperatives (M2–M4)

| Submodule | Purpose |
| --- | --- |
| Masterlist | Paginated, filterable list; create/edit core fields |
| Profile | Single cooperative hub; membership counts; links to related modules |
| Registration / Accreditation | Cases and status workflow |
| Membership | Counts and snapshots |
| Officers / Contacts | Structured officers; primary contact |

## Programs & Services (M5)

Configurable programs and service types. `ServiceDelivery` records what a cooperative received and when. Supports “services for this cooperative” and “cooperatives for this service in a date range.”

## Capacity Building (M6)

Trainings, seminars, orientations, participants. Calendar may later link to `TrainingEvent`.

## Financial Assistance (M7)

Assistance records, grants/support types (**Settings maintenance**, no frozen list), simple fund monitoring. Amounts and status changes are auditable.

## Monitoring & Compliance (M8)

Configurable requirements, compliance records (period, due/submitted dates, status, remarks, document, verifier), inspections/monitoring notes, accreditation status views.

## Documents (M9)

Secure uploads per cooperative; **document types via Settings maintenance** (no frozen list); templates/forms as office resources. Verification status on files.

## Reports (M11)

Same PostgreSQL database. Filter by date range, cooperative, type, sector, barangay, status, program/service, training, assistance type, compliance status. Export details TBD (start with on-screen + print-friendly views).

## Calendar (M12)

Activities, trainings, deadlines. Optional cooperative link.

## Settings (M13)

Users, role assignment (within the four system roles), reference data CRUD (sectors, types, barangays, assistance types, document types, and other catalogs), system configuration including **CDA Portal URL**. `SUPER_ADMIN` is OCCDO’s full application admin; `DEVELOPER` is technical/system only.

## Cross-cutting

| Concern | Where |
| --- | --- |
| Auth / RBAC | M1, enforced every later module |
| Audit log | M1 infrastructure; each module writes on sensitive actions |
| Validation | Zod schemas per action |
| DAL | `lib/dal/*` only |
