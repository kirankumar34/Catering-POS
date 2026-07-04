# SBBMS — Pre-Launch Security Hardening (One-Shot Agent Spec)

**Context:** SBBMS (Seisuvai Billing & Business Management System) is about to be deployed to production (Render backend + Vercel frontend + Neon Postgres). These issues were identified in an earlier static-analysis security review and must be closed out **before** the system is exposed on a public domain with real customer/financial data.

---

## 0. Read This First (Agent Instructions)

1. This is a security-hardening pass, not a feature pass. Do not refactor unrelated code — touch only what's needed to close each item below.
2. Every fix must be verified with an actual request/test, not just a code read-through — e.g. "confirm the server refuses to start without `JWT_SECRET` set" means actually unset it and try.
3. Do this **before** the production deploy, not after. If a production database or Render/Vercel deployment already exists with these issues live, treat that as an active incident: rotate all secrets and credentials immediately as part of this work, not just fix the code going forward.
4. Do not commit any real secret values anywhere, including in this repo's git history. If a secret was ever committed (check `git log -p -- .env` and similar), it must be treated as compromised and rotated, since removing it from the latest commit does not remove it from history.

---

## 1. Exposed Demo Credentials on Public Login Page

**Issue:** the login page displays or ships demo/test credentials that work in production.

**Investigate:**
```bash
grep -rn "demo\|test@\|password123\|admin@admin" --include=*.tsx --include=*.ts src/ | grep -i "login\|auth"
```

**Fix:**
- Remove any demo credentials rendered in the UI (placeholder text, autofill values, visible hint text) on the production build.
- If demo credentials are useful for a staging/dev environment, gate them behind an environment check (`if (process.env.NODE_ENV !== 'production')`) rather than removing the capability entirely — but they must never appear or function in production.
- If a demo account actually exists in the production database with a known password, delete it or rotate its password and disable/mark it non-production before launch.

---

## 2. Hardcoded JWT Secret Fallback

**Issue:** the JWT signing secret has a hardcoded fallback value in the repo, so even without an environment variable set, tokens are signed with a known, public secret — meaning anyone who reads the source code (or the public repo, if it's public) can forge valid tokens.

**Investigate:**
```bash
grep -rn "JWT_SECRET\|jwtSecret\|secret:" --include=*.ts src/ | grep -v node_modules
```

**Fix:**
- Remove the hardcoded fallback entirely. The app must read the JWT secret only from an environment variable.
- The application should **fail fast at startup** if `JWT_SECRET` is not set in production — not silently fall back to a default. Example pattern:
  ```ts
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required and not set.');
  }
  ```
- Generate a new, strong, random secret for production (e.g. `openssl rand -base64 48`) and set it only in Render's environment variable settings — never commit it.
- **Because a hardcoded secret was previously in the repo, treat it as compromised**: rotate to a new secret before launch even if no production traffic has used it yet, and invalidate any tokens signed with the old value (this happens automatically once the secret changes, since existing tokens will fail verification).

**Verify:** temporarily unset `JWT_SECRET` locally and confirm the app refuses to start, rather than silently running with a fallback.

---

## 3. Inert `ValidationPipe`

**Issue:** a `ValidationPipe` exists in the codebase but is not actually registered/applied in `main.ts`, meaning request payload validation (DTO class-validator rules) is not actually being enforced.

**Investigate:**
```bash
grep -n "ValidationPipe" src/main.ts
```

**Fix:**
- Register it globally in `main.ts`:
  ```ts
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,          // strips unknown properties
    forbidNonWhitelisted: true, // rejects requests with unknown properties
    transform: true,          // auto-transforms payloads to DTO types
  }));
  ```
- **Verify it's actually active**: send a request with an invalid/extra field to an endpoint that has DTO validation decorators and confirm it's rejected with a 400, not silently accepted.
- Spot-check a few key DTOs (auth, order creation, payment) to confirm they actually have `class-validator` decorators — a registered pipe with undecorated DTOs still won't validate anything.

---

## 4. RBAC Gap — STAFF Can Delete Financial Records

**Issue:** role-based access control allows the `STAFF` role to delete financial records (e.g. invoices, payments, orders) that should be restricted to `OWNER`/`SUPER_ADMIN`.

**Investigate:**
```bash
grep -rn "@Roles\|RolesGuard\|STAFF" --include=*.ts src/ | grep -i "delete\|remove"
```

**Fix:**
- Audit every `DELETE` endpoint (and any destructive `PATCH`/soft-delete equivalents) touching financial data: orders, invoices, payments, expenses.
- Restrict these to `OWNER`/`SUPER_ADMIN` roles only via the existing `@Roles()` decorator/guard pattern already used elsewhere in the codebase — don't introduce a new auth pattern, match what's already there.
- **Verify**: attempt a delete request authenticated as a `STAFF`-role user against a financial-record endpoint and confirm it returns 403, not 200.
- While auditing, also check `UPDATE` endpoints on financial records for the same gap — a STAFF user editing a payment amount is nearly as concerning as deleting it; flag (don't necessarily fix unless explicitly asked) if this is also open, since it may be intentional.

---

## 5. JWT Stored in `localStorage`

**Issue:** the frontend stores the JWT in `localStorage`, which is readable by any JavaScript running on the page — making it vulnerable to theft via XSS.

**Fix (frontend + backend coordination required):**
- Move to an **httpOnly, secure, sameSite cookie** for storing the auth token instead of `localStorage`. This requires:
  - Backend: set the JWT as an httpOnly cookie on login (`res.cookie('token', jwt, { httpOnly: true, secure: true, sameSite: 'lax' })`) instead of returning it in the response body for storage.
  - Frontend: remove `localStorage.setItem`/`getItem` calls for the token; rely on the cookie being sent automatically with requests (`credentials: 'include'` on fetch/axios calls).
  - CORS config must allow credentials (`Access-Control-Allow-Credentials: true`) and specify the exact frontend origin (not `*`) for this to work — ties into Section 6.
- This is a larger change than the others — if time-constrained before launch, this can be scheduled as a fast-follow **only if** Sections 1–4 and 6–7 are done first, but flag this explicitly rather than silently deferring it.

---

## 6. Unrestricted CORS

**Issue:** CORS is configured to allow all origins (`*` or equivalent), meaning any website can make authenticated requests to the API from a user's browser.

**Investigate:**
```bash
grep -rn "cors\|Access-Control-Allow-Origin" --include=*.ts src/main.ts
```

**Fix:**
```ts
app.enableCors({
  origin: process.env.CORS_ORIGIN, // e.g. https://sbbms.vercel.app — set via env var, no wildcard
  credentials: true,
});
```
- Set `CORS_ORIGIN` in Render's environment variables to the actual production Vercel URL (and custom domain once added).
- **Verify**: confirm a request from an unrelated origin (e.g. `curl` with a fake `Origin` header, or a quick test from an unrelated local HTML file) is rejected, and a request from the real frontend origin succeeds.

---

## 7. `Float` Instead of `Decimal` for Monetary Fields

**Issue:** monetary values (prices, totals, payments) are stored as `Float`, which uses binary floating-point representation and can introduce rounding errors in financial calculations (e.g. `0.1 + 0.2 !== 0.3` class of bugs) — unacceptable for a billing system.

**Investigate:**
```bash
grep -n "Float" prisma/schema.prisma
```

**Fix:**
- Change monetary fields in `schema.prisma` from `Float` to `Decimal` (Prisma supports `Decimal` backed by Postgres `numeric`):
  ```prisma
  amount  Decimal  @db.Decimal(10, 2)
  ```
- This requires a migration (`npx prisma migrate dev --name monetary-fields-to-decimal` locally, `migrate deploy` in production) — **back up the production database before running this migration** if any real data already exists.
- Update any TypeScript code doing arithmetic on these fields to use Prisma's `Decimal` type correctly (it's not a plain JS number — use `.toNumber()` only for display, keep calculations in `Decimal` via the `decimal.js` API Prisma re-exports, or do arithmetic in the smallest currency unit as integers if simpler).
- **Verify**: create a test transaction with values known to cause float rounding errors (e.g. amounts involving thirds or repeated 0.1-style additions) and confirm totals compute exactly.

---

## 8. Acceptance Criteria

```bash
# No hardcoded JWT fallback
! grep -rn "JWT_SECRET.*||.*['\"]" --include=*.ts src/

# ValidationPipe registered
grep -n "useGlobalPipes" src/main.ts

# CORS restricted, not wildcard
! grep -rn "origin: ['\"]\*['\"]" --include=*.ts src/

# No Float on monetary fields
! grep -n "Float" prisma/schema.prisma

# Demo credentials not in production bundle
! grep -rn "password123\|demo123" --include=*.tsx src/
```

Manual verification (must actually be performed, not assumed):
- [ ] App refuses to start locally with `JWT_SECRET` unset
- [ ] Invalid/extra-field request rejected with 400 on a validated endpoint
- [ ] STAFF-role delete attempt on a financial record returns 403
- [ ] Request from an unauthorized origin is rejected by CORS
- [ ] A financial calculation known to trigger float rounding now computes exactly with `Decimal`
- [ ] No demo credentials visible or functional on the production login page
- [ ] All secrets (JWT secret, DB credentials, demo account password if kept) rotated to new values not present anywhere in git history

---

## 9. Effort Estimate

| Task | Est. hours |
|---|---|
| Remove demo credentials + gate behind env check | 0.5 |
| Fix JWT secret fallback + fail-fast startup check + rotate secret | 0.5–1 |
| Register + verify ValidationPipe | 0.5–1 |
| Audit + fix RBAC on financial delete/update endpoints | 1–2 |
| Move JWT from localStorage to httpOnly cookie (frontend + backend) | 2–4 |
| Restrict CORS to real origin | 0.5 |
| Migrate monetary fields Float → Decimal (schema + code + migration) | 1.5–3 |
| Verification pass on all items above | 1–2 |
| **Total** | **~7.5–14 hours** |

---

## 10. Deliverable Checklist

- [ ] All 7 issues fixed and individually verified per Section 8, not just code-reviewed
- [ ] Any secret ever committed to git history rotated, not just removed from latest commit
- [ ] Production environment variables set on Render/Vercel (never committed): `JWT_SECRET`, `DATABASE_URL`, `CORS_ORIGIN`, `NODE_ENV=production`
- [ ] Production database backed up before running the Decimal migration
- [ ] Final smoke test performed against the actual production URLs after deploy, not just localhost
