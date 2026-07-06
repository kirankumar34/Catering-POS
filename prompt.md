# SBBMS — Fix Placeholder JWT_SECRET + Env Hygiene (One-Shot Agent Spec)

**Issue:** `.env` contains `JWT_SECRET="generate-a-long-random-string"` — a literal placeholder, not an actual secret. This also does not exist as a variable in the Railway production environment, which is why the deployed app is crash-looping with `Error: JWT_SECRET environment variable is required and not set.`

---

## 1. Fix local `.env`

1. Generate a real secret:
   ```bash
   openssl rand -base64 48
   ```
2. Replace the placeholder line in `.env`:
   ```
   JWT_SECRET="<paste the generated value here>"
   ```
3. Remove the leading whitespace before `JWT_SECRET` in the file (currently has 3 leading spaces) — most `.env` parsers tolerate this, but keep it clean and consistent with the `DATABASE_URL` line above it.
4. Confirm `.env` is in `.gitignore`:
   ```bash
   grep -n "^\.env$" .gitignore || echo ".env" >> .gitignore
   ```
5. If `.env` was ever committed to git history, treat every secret in it as compromised:
   ```bash
   git log --all --full-history -- .env
   ```
   If this returns any commits, both `JWT_SECRET` (once generated) and the Neon `DATABASE_URL` password should be rotated (Neon: reset the role password from the Neon console), since a value ever pushed to a public/shared repo is not safe to keep using even after removal.

## 2. Fix production (Railway) — this is the part actually causing the crash

Local `.env` changes do **not** propagate to Railway. Set the variable directly:

1. Railway dashboard → backend service → **Variables** tab
2. Add:
   - `JWT_SECRET` = the same value generated in Step 1 (or a separate one — doesn't need to match local, but simpler if it does for consistency in dev/test)
3. Save — Railway auto-redeploys on variable change.
4. Confirm other required variables are also set here (not just in local `.env`):
   - `DATABASE_URL`
   - `CORS_ORIGIN`
   - `NODE_ENV=production`

## 3. Verify

- Local: restart the dev server, confirm no `JWT_SECRET environment variable is required` error on boot.
- Production: check Railway deploy logs after redeploy — `npm run start` should stay running, not crash-loop.
- Functional check: log in and confirm a JWT is issued/accepted (a session that worked before the secret was blank will need to re-login, since old tokens signed under any prior secret are now invalid — this is expected and correct).

---

## Acceptance Criteria

```bash
# No placeholder value left in .env
! grep -n "generate-a-long-random-string" .env

# .env is gitignored
grep -n "^\.env$" .gitignore

# .env was never committed (or has been rotated if it was)
git log --all --full-history -- .env
```

- [ ] Real `JWT_SECRET` generated and set in local `.env`
- [ ] Same (or separate) real secret set in Railway's Variables tab
- [ ] `.env` confirmed in `.gitignore`
- [ ] If `.env` was ever committed, `JWT_SECRET` and Neon DB password rotated
- [ ] Railway deploy logs show the app staying up, no crash-loop
- [ ] Login tested end-to-end against production after redeploy
