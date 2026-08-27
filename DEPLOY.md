# Lumora one-project Vercel deployment

Use one Vercel project connected to `bernardahorlu7-gif/lumora`.

## Required Vercel project settings

- **Root Directory:** repository root `/` (not `backend`)
- **Framework Preset:** Other
- **Build Command:** empty
- **Output Directory:** empty
- **Install Command:** `npm install`
- **Production Branch:** `master`

The repository root contains the public site, `api/index.js`, and the staff portal files. Vercel must be pointed at this root directory.

The API health endpoint only confirms that the server started. Use `/api/health/db`
to verify that PostgreSQL is configured and reachable before testing login.

## Required environment variables

```text
DATABASE_URL=your hosted PostgreSQL connection string
DATABASE_SSL=true
JWT_SECRET=long-random-secret
JWT_EXPIRES_IN=8h
CORS_ORIGIN=https://your-project.vercel.app
APP_URL=https://your-project.vercel.app
```

Optional integrations can remain disabled for the demo. Do not commit `.env` or credentials.

## First deployment checks

Open these exact paths after deployment:

```text
/
/login.html
/staff_portal_dashboard/code.html
/api/health
```

Expected results:

- `/` displays the Lumora public homepage.
- `/login.html` displays the staff login.
- `/staff_portal_dashboard/code.html` redirects to login when unauthenticated.
- `/api/health` returns JSON with `ok: true`.

If `/api/health` works but `/` says `Cannot GET /`, the Vercel Root Directory is set to `backend`. Change it to `/` and redeploy. This symptom cannot be fixed by a frontend URL; it means the wrong project directory is being served.

## Database setup

Run from the repository root against the hosted database:

```text
npm run migrate
npm run seed
```

The seeded demo logins are documented in `backend/DEPLOYMENT.md`. Replace the fictional company tax, payment, and account data before production use.
