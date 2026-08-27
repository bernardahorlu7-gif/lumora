# Lumora Nexus — Backend

Real backend for the Lumora DeMoore CRM / Operations Portal: staff login, a
project/client/quote database, server-side quote calculations, PDF
generation, document storage, role-based permissions, and email/Teams
notification hooks.

The Stitch-designed pages (staff dashboard, quotation builder, public site,
client profile, etc.) are served as static files from `public/`. They're
still visual-only — the previous message covers what's needed to wire them
up to these APIs (a login page and fetch calls to replace the mock data).

This has been tested end-to-end against a real PostgreSQL database:
login → create project → create quote → generate PDF → download PDF →
permission checks (staff correctly blocked from admin actions) → email/Teams
gracefully logging "not configured" instead of failing.

## 1. Requirements

- Node.js 18+
- A PostgreSQL database (local, or a free tier on Railway / Render / Supabase)

## 2. Setup

```bash
npm install
cp .env.example .env
```

Open `.env` and fill in at minimum:

- `DATABASE_URL` — your Postgres connection string
- `JWT_SECRET` — generate one with:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

Then create the schema and seed an admin account:

```bash
npm run migrate
npm run seed
```

The seed script prints the admin login it created
(`admin@lumorademoore.com` / `ChangeMe123!` by default — **change this
password immediately** via `POST /api/auth/change-password` after your
first login, or set `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` /
`SEED_ADMIN_NAME` in `.env` before seeding).

Run it:

```bash
npm start        # production
npm run dev       # auto-restarts on file changes
```

The API is at `http://localhost:4000/api`, health check at
`GET /api/health`.

## 3. What's real vs. what needs your input

| Piece | Status |
|---|---|
| Staff login, JWT auth, roles/permissions | Fully working |
| Projects, clients, milestones/delay tracking | Fully working |
| Quote calculation (overhead/profit/contingency/tax/down payment) | Fully working |
| PDF quote generation | Fully working |
| Document upload/download (local disk) | Fully working |
| Document storage on S3 | **Stubbed** — see `src/services/storage.js`. Fill in the `s3Adapter` methods with `@aws-sdk/client-s3` calls and set `STORAGE_DRIVER=s3` once you have a bucket. |
| Email (quote sending, notifications) | Wired to `nodemailer`, but **inactive** until you set real `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` and `EMAIL_ENABLED=true` in `.env`. Until then it logs "skipped_not_configured" instead of failing. |
| Microsoft Teams notifications | Wired to an Incoming Webhook, but **inactive** until you set `TEAMS_WEBHOOK_URL` and `TEAMS_ENABLED=true`. To get a webhook URL: open the target Teams channel → `...` → Connectors → Incoming Webhook → Create. |
| Frontend wired to these APIs | **Not yet done.** The HTML pages under `public/` are still the original static mockups. |

Nothing here silently pretends to work — every unconfigured integration
logs to the `notifications_log` table with a `skipped_not_configured`
status rather than throwing an error, so the rest of the app keeps working
while you're waiting on credentials.

## 4. Business rules already encoded

- Down payment defaults to **70%** when Lumora is supplying materials and
  **50%** when it isn't (`DOWN_PAYMENT_WITH_MATERIALS_PCT` /
  `DOWN_PAYMENT_WITHOUT_MATERIALS_PCT` in `.env`). This is calculated
  server-side per quote and stored on the quote row so it doesn't drift if
  you change the default later.
- Every generated quote PDF includes a cost-variation/escalation clause and
  a delay-responsibility clause (the party causing a delay bears the
  related costs), matching what you described for your contract terms.
  Toggle the escalation clause per-quote via `escalationClause` on quote
  creation.
- Project milestones support a `delayCausedBy` field
  (`lumora` / `client` / `third_party` / `none`); marking a milestone
  delayed fires a Teams notification once that's configured.

## 5. API overview

All routes except `/api/auth/login` and `/api/health` require
`Authorization: Bearer <token>`.

- `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/change-password`
- `GET/POST/PUT/DELETE /api/clients`
- `GET/POST/PUT /api/projects`, `POST /api/projects/:id/milestones`
- `GET/POST/PUT /api/quotes`, `POST /api/quotes/:id/generate-pdf`,
  `POST /api/quotes/:id/send`, `POST /api/quotes/:id/status`
- `POST /api/documents` (multipart upload), `GET /api/documents/:id/download`
- `GET/POST/PUT /api/users` (admin only for create/update)
- `GET /api/dashboard/summary`
- `GET/POST /api/invoices`, `GET /api/invoices/:id`
- `POST /api/invoices/:id/issue`, `POST /api/invoices/:id/payments`, `POST /api/invoices/:id/generate-pdf`

Public integration endpoints do not require authentication:

- `GET /api/public/projects` — published project cards only
- `GET /api/public/projects/:id` — one published project, with public-safe fields
- `POST /api/public/quote-requests` — stores a website quote request for staff follow-up
- `POST /api/public/contact-requests` — stores a website contact request
- `GET /api/public/quote-requests`, `GET /api/public/contact-requests` — authenticated staff inboxes (requires `clients:read`)

The existing authenticated project API now accepts `service`, `location`, `scope`,
`highlights`, `completionDate`, and `isPublished`. Public project responses never
include budgets, margins, client contact details, staff notes, or documents.

## 6. Deploying

Any Node host works. Quick path with Railway or Render:

1. Push this project to a GitHub repo.
2. Create a new Postgres database on the platform, copy its connection
   string into `DATABASE_URL`.
3. Create a new web service pointing at the repo, build command
   `npm install`, start command `npm start`.
4. Set all the `.env` variables in the platform's environment settings
   (never commit `.env` — it's gitignored).
5. Run `npm run migrate` and `npm run seed` once, either as a one-off
   platform job or by temporarily SSH'ing in / running locally against the
   production `DATABASE_URL`.
6. If you don't set `STORAGE_DRIVER=s3`, uploaded files land on the
   container's local disk — fine for testing, but most platforms wipe local
   disk on redeploy, so plan to wire up the S3 adapter before relying on
   document storage in production.

## 7. Project layout

```
src/
  index.js              Express app entry point
  db/
    schema.sql           full Postgres schema
    pool.js               connection pool + transaction helper
    migrate.js / seed.js
  middleware/
    auth.js                JWT verification + permission/role guards
    errorHandler.js
  routes/
    auth.js clients.js projects.js quotes.js documents.js users.js dashboard.js
  services/
    quoteCalculator.js     pure calculation functions
    pdfGenerator.js         PDFKit quote rendering
    storage.js               local/S3 storage abstraction
    email.js teams.js         notification integrations
    permissions.js             role -> permission map
    activityLog.js
public/                    static frontend (Stitch mockups, not yet wired to the API)
uploads/                    local file storage (gitignored)
```
