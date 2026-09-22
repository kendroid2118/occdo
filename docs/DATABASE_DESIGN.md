# OCCDO — Database Design

PostgreSQL + Prisma. Schema is implemented **incrementally** per milestone. This document is the target model, not a mandate to create every table in M0.

## 1. Design principles

- Cooperative is the central entity; other modules use `cooperativeId`.
- Classifications are reference tables with `id`, `code`, `name`, `sortOrder`, `isActive`, timestamps.
- Multi-step writes use `prisma.$transaction`.
- Explicit `select`; never return password hashes, tokens, or secrets.
- Tenant/office scoping can be added later (`officeId`) if OCCDO confirms multiple offices; v1 assumes a single OCCDO office (internal Hostinger deployment).
- Indexes follow actual `WHERE` / `JOIN` / `ORDER BY` / filter patterns used by lists and reports.

## 2. Reference data

Configurable. Do not hardcode these lists in application logic.

| Model | Purpose | Seed / maintenance |
| --- | --- | --- |
| `CooperativeSector` | Dashboard “by sector” | **Confirmed seed (5):** Multi-Purpose, Agriculture, Transport, Credit, Others. SUPER_ADMIN maintains. |
| `CooperativeType` | Optional type reporting | Independent FK; no frozen list yet; maintainable. |
| `CooperativeStatus` | Operational status | Maintainable (Accredited, Ongoing Registration, Registered, For Validation, Renewal-related as initial suggestions). |
| `AccreditationStatus` | LGU accreditation state | Maintainable. CDA itself is not a subsystem. |
| `Barangay` | Address and report filter | **85 official Ormoc barangays** — `docs/REFERENCE_DATA.md`. Maintainable. |
| `OfficerPosition` | Officers | Maintainable. |
| `Program` / `ServiceType` | Catalog of programs and services | Maintainable. |
| `AssistanceType` | Grants / support kinds | **Maintenance only** — no frozen list. |
| `ComplianceRequirement` | Configurable checklist items | Maintainable. |
| `DocumentType` | Upload classification | **Maintenance only** — no frozen list. |
| `ActivityType` | Calendar | Maintainable. |
| `SystemConfig` | Key/value office settings | Includes `cdaPortalUrl` for the dashboard shortcut. |

Sectors and types are **independent FKs**. Dashboard charts use sectors (the confirmed five, plus any rows staff add later).

### Reference table shape

```text
id              String @id @default(cuid())
code            String @unique
name            String
description     String?
sortOrder       Int @default(0)
isActive        Boolean @default(true)
createdAt       DateTime
updatedAt       DateTime
```

Deactivate (`isActive = false`) rather than deleting rows that are already referenced.

## 3. Cooperative (master record)

```text
Cooperative
  id
  cooperativeCode          unique, system or staff-assigned
  registrationNumber       nullable, unique when present (CDA / registration no.)
  name
  acronym                  nullable
  typeId                   → CooperativeType
  sectorId                 → CooperativeSector
  address                  street / additional address text
  barangayId               → Barangay
  contactPerson
  contactNumber
  email                    nullable
  dateRegistered           nullable
  dateAccredited           nullable
  accreditationStatusId    → AccreditationStatus
  statusId                 → CooperativeStatus
  totalMembers             Int @default(0)
  maleMembers              Int @default(0)
  femaleMembers            Int @default(0)
  remarks                  nullable
  createdAt
  updatedAt
  createdById              → User
  updatedById              → User
```

Field list is **not complete**. Additional OCCDO columns are added via migration. Avoid encoding future membership classes (youth, PWD, etc.) until confirmed; a later `MembershipBreakdown` or extra count columns can be added safely.

**Indexes (initial):** `cooperativeCode`, `registrationNumber`, `name`, `typeId`, `sectorId`, `barangayId`, `statusId`, `accreditationStatusId`, `dateRegistered`, `dateAccredited`.

Membership totals on the master record support dashboard KPIs. Historical growth uses snapshots (below), not by rewriting history on the master row.

## 4. Related cooperative records

### Officers / contacts

```text
CooperativeOfficer
  id, cooperativeId, positionId, fullName, contactNumber, email
  isPrimaryContact, startDate, endDate, isActive
  remarks, createdAt, updatedAt
```

The master `contactPerson` remains the quick-list field; officers are the structured list.

### Membership history (for “Membership Growth”)

```text
MembershipSnapshot
  id, cooperativeId, asOfDate
  totalMembers, maleMembers, femaleMembers
  source            e.g. MANUAL | IMPORT | PROFILE_UPDATE
  recordedById, createdAt
  @@unique([cooperativeId, asOfDate])
```

### Registration / accreditation

```text
AccreditationCase
  id, cooperativeId
  caseType              REGISTRATION | ACCREDITATION | RENEWAL
  statusId              → reference (case workflow status)
  filedAt, decidedAt
  remarks
  createdById, updatedById, timestamps
```

Status changes on both `Cooperative` and `AccreditationCase` write audit logs. Workflow states are reference data.

## 5. Programs, services, capacity building, assistance

These answer: “What did this cooperative receive?” and “Which cooperatives received service X in date range Y?”

```text
Program
  catalog item (configurable)

ServiceType
  catalog item (configurable)

ServiceDelivery
  id, cooperativeId
  programId?            nullable FK
  serviceTypeId
  deliveredAt
  quantity / beneficiaryCount nullable
  remarks, recordedById, timestamps

TrainingEvent
  id, title, trainingKind   TRAINING | SEMINAR | ORIENTATION
  startAt, endAt, venue
  programId?, serviceTypeId?
  remarks, timestamps

TrainingParticipant
  id, trainingEventId
  cooperativeId?        nullable (walk-in / individual)
  fullName, sex?, contactNumber?
  attendanceStatus, timestamps

AssistanceRecord
  id, cooperativeId, assistanceTypeId
  amount, requestedAt, approvedAt, releasedAt
  statusId, fundSource, remarks
  createdById, timestamps

FundLedgerEntry          (fund monitoring; M7)
  id, assistanceRecordId, entryDate, amount, entryKind, remarks
```

Do not merge these into one generic “event” table. Reporting needs distinct entities. Shared patterns (cooperative FK, dates, type FK, remarks, actor) are enough.

Beneficiaries: v1 can treat the **cooperative** as the beneficiary of office services. Individual-member beneficiaries are a later addition if OCCDO confirms.

## 6. Compliance

```text
ComplianceRequirement
  configurable master (code, name, frequency, isActive)

ComplianceRecord
  id, cooperativeId, requirementId
  reportingPeriod       e.g. 2026 or 2026-Q1 (string or year+periodType)
  dueDate, submittedDate
  statusId              → compliance status reference
  remarks
  documentId?           → CooperativeDocument
  verifiedById, verifiedAt
  timestamps
```

No hardcoded checklist in application code.

## 7. Documents

```text
CooperativeDocument
  id, cooperativeId, documentTypeId
  reportingPeriod?
  originalFilename      display only; never used as storage path
  storedFilename        server-generated
  mimeType, sizeBytes
  verificationStatus
  uploadedById, uploadedAt
  verifiedById, verifiedAt
```

Storage path is server-controlled, outside executable/public URL space. Enforce size limits, MIME allowlist, and authorization on download. See `docs/SECURITY.md`.

Templates/forms (office-level, not per cooperative) are a separate `DocumentTemplate` in M9 if needed.

## 8. Calendar and communications

```text
CalendarActivity
  id, title, activityTypeId
  startAt, endAt
  cooperativeId?        optional
  trainingEventId?      optional
  relatedDeadline?      e.g. compliance due
  location, remarks, createdById, timestamps

Announcement
  id, title, body, publishedAt, expiresAt, isActive
  createdById
```

Dashboard “Upcoming Activities” and “Announcements” read these tables.

## 9. Identity, RBAC, audit

Auth.js v5 session models (`User`, `Account`, `Session`, `VerificationToken`) plus:

```text
User
  id, name, email unique, emailVerified
  passwordHash          never selected by default DAL
  role                  DEVELOPER | SUPER_ADMIN | ADMIN | USER
  isActive
  createdAt, updatedAt

AuditLog
  id
  actorId?              nullable for system
  action                e.g. COOPERATIVE_CREATE
  entityType            e.g. Cooperative
  entityId
  occurredAt
  source                e.g. WEB
  metadata              Json  before/after; no secrets

SystemConfig
  key                   unique  e.g. cdaPortalUrl
  value                 string (non-secret)
  updatedById, updatedAt
```

Never store passwords, tokens, or raw credentials in `metadata` or `SystemConfig`. Secrets stay in environment variables.

Audit at least: cooperative create/update, status and accreditation changes, assistance changes, compliance verification, document operations, user administration, role changes.

## 10. Reporting (same database)

List/report queries filter operational tables by:

- date range (event or cooperative dates)
- cooperative
- type, sector, barangay, status
- program/service, training, assistance type
- compliance status

Use Prisma `where` + indexes. No reporting replica in this phase.

## 11. Seed / demo data

Seed data is fixtures only. Mark demo cooperatives clearly if used in development. Never seed production credentials.
