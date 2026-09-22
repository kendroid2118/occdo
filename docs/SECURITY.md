# OCCDO — Security

This is an LGU information system. Security outranks convenience. Fail closed.

## 1. Authentication

- Auth.js v5, session-based.
- `trustHost: true` only when required for a supported reverse proxy.
- Never treat client session state as proof of authorization.
- Aggressive rate limits on login, password reset, and recovery (IP + identifier where appropriate).
- Password hashes never returned from DAL or included in logs/audit metadata.

## 2. RBAC

Roles: `DEVELOPER` (technical/system), `SUPER_ADMIN` (OCCDO full application admin), `ADMIN`, `USER`.

Every protected Server Action and Route Handler independently:

1. Authenticates the session
2. Rate-limits
3. Validates input (Zod)
4. Calls `requireRole([...])`
5. Then runs business logic / DAL

UI may hide controls the user cannot use. That is not authorization.

## 3. Validation and injection

Validate Server Action input, route handlers, query params, form data, env, and (later) uploads. No unvalidated input in DAL. Parameterized Prisma queries only.

## 4. IDOR / data scoping

Lookups by id must confirm the record exists and is in scope. v1 is a single office; still do not accept client-supplied role or unrestricted bulk ids.

## 5. Secrets and environment

Secrets only in environment variables, accessed through `lib/env.ts`. Never:

- hardcode secrets
- commit `.env`
- put server secrets in `NEXT_PUBLIC_*`
- log tokens, passwords, OTP, cookies, or connection strings
- expose Prisma or credentials to Client Components

## 6. Rate limiting

Centralize in `lib/rate-limit.ts`. Sliding window. Authenticated actions by `userId`; public by IP. Typed error on limit exceeded; never silent drop.

## 7. Audit

Record actor, action, entity type, entity id, timestamp, source, and non-secret before/after metadata for:

- cooperative create/modify
- status and accreditation changes
- financial assistance changes
- compliance verification
- document operations
- user administration and role changes

## 8. File uploads (M9)

- Max size enforced server-side
- MIME allowlist; do not trust extension or client `Content-Type` alone
- Server-generated stored filenames; reject path traversal
- Store outside public/executable paths
- Authorize before download; no public URLs for sensitive files
- Verification status is a business field, not a substitute for access control

## 9. HTTP and sessions

Production (Hostinger Cloud, HTTPS): CSP, HSTS (`max-age=63072000; includeSubDomains; preload`), `X-Content-Type-Options`, Referrer-Policy, Permissions-Policy. Do not enable HSTS on local HTTP. `trustHost: true` only if Hostinger’s reverse proxy requires it.

## 10. Error handling

Typed errors for validation, authn, authz, rate limit, not found, conflict, business rule, infrastructure. Clients must not receive stack traces, SQL, or secrets.

## 11. Logging

Structured logs without PII beyond what operations need. No secrets.

## 12. Threats to keep in view

Broken access control, XSS, CSRF (server actions + origin), SSRF (none planned; do not add unvalidated URL fetches), mass assignment (Zod pick lists), brute force on login, insecure defaults in seed/demo data.
