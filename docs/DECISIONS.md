# OCCDO — Confirmed Decisions

Recorded from OCCDO/LGU answers (2026-09-22). Open items stay listed; do not invent values for TBA/to-follow items.

| # | Topic | Decision | Status |
| --- | --- | --- | --- |
| 1 | Sectors / dashboard classification | Initial **5 sectors**: Multi-Purpose, Agriculture, Transport, Credit, Others. **Must be maintainable** (Settings → Reference Data). Not hardcoded in application logic. | Confirmed |
| 2 | CDA Portal | Dashboard **shortcut link only**. No CDA API integration in v1. URL is system-configurable. | Confirmed |
| 3 | Barangays | Official Ormoc list after Ordinance 52 s. 2021 (plebiscite 2022-10-08): **85 barangays** (Poblacion Districts 1–29 merged/renamed to East, West, South, North). Seed from `docs/REFERENCE_DATA.md`. Still maintainable. | Confirmed |
| 4 | Extra membership classes (youth, PWD, …) | **TBA**. Keep male/female/total only until OCCDO specifies more. | Open |
| 5 | Legacy Excel/paper migration | **To follow**. No import work until files/rules arrive. | Open |
| 6 | Financial assistance kinds | **Maintenance** (configurable `AssistanceType`). No frozen list. | Confirmed |
| 7 | Document types | **Maintenance** (configurable `DocumentType`). No frozen list. | Confirmed |
| 8 | Official seal/logo | Do not invent. Use text wordmark until OCCDO provides assets. | Confirmed |
| 9 | Hosting | **Cloud (Hostinger)**. Target Node.js-capable Hostinger Cloud/VPS (not PHP shared hosting). | Confirmed |
| 10 | Audience | **Internal-only** for v1. Architecture must not block a later public portal (separate route group, no internal data on unauthenticated routes). | Confirmed |
| 11 | CDA report formats | **To follow**. | Open |
| 12 | Top operational admin role | **SUPER_ADMIN** is OCCDO’s full application admin. `DEVELOPER` remains technical/system maintenance only. | Confirmed |

## Implications

- Dashboard “Cooperatives by Sector” uses the five seed values until staff add/rename/deactivate rows.
- `CooperativeType` stays a separate maintainable FK for future CDA/type reporting; do not duplicate sector names in code.
- CDA widget: external `https://` link, `rel="noopener noreferrer"`, `target="_blank"`.
- Production: Hostinger + PostgreSQL + env via `lib/env.ts`. Prefer Upstash Redis for rate limits if Hostinger has no Redis.
- Public portal is **out of v1 scope**; keep `(dashboard)` authenticated and avoid coupling business URLs to “internal-only forever.”
