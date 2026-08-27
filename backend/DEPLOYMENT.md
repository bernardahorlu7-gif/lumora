# Lumora demo deployment

This demo uses two Vercel projects:

1. The existing public frontend in `stitch_lumora_lift_service_integration-2-main-6`.
2. This backend, deployed from `lumora-nexus-backend`.

Vercel does not provide durable PostgreSQL or persistent local disk. Use a free
Postgres provider such as Neon or Supabase and an S3-compatible bucket for
uploads. The local storage adapter is for development only.

## Backend environment variables

Set `DATABASE_URL`, `DATABASE_SSL=true`, `JWT_SECRET`, `JWT_EXPIRES_IN=8h`,
`CORS_ORIGIN` to the deployed frontend URL, and `APP_URL` to the API URL.
Use the values in `.env.example` for the demo tax defaults. Keep
`EMAIL_ENABLED=false`, `TEAMS_ENABLED=false`, and `STORAGE_DRIVER=local` only
for local testing. For a real Vercel deployment, configure S3-compatible
storage and set `STORAGE_DRIVER=s3` after implementing provider credentials.

Run migrations against the hosted database before the first request:

```text
npm run migrate
npm run seed
```

The public frontend must set `window.LUMORA_API_URL` to the deployed API URL
plus `/api`, and `window.LUMORA_STAFF_PORTAL_URL` to the backend login URL,
before loading `integration.js`. For example:

```html
<script>
	window.LUMORA_API_URL = 'https://lumora-api.vercel.app/api';
	window.LUMORA_STAFF_PORTAL_URL = 'https://lumora-api.vercel.app/login.html';
</script>
<script src="../integration.js"></script>
```

Do not leave either value pointing at `localhost` in a deployed frontend.

## Demo logins

All seeded founder accounts use `LumoraDemo!2026` unless `SEED_DEMO_PASSWORD`
is set before seeding. Change these passwords immediately after the demo:

- `bernard@lumoraproperties.com` - admin
- `isaac@lumoraproperties.com` - accountant
- `eric@lumoraproperties.com` - project manager

These accounts, TIN, VAT number, tax rates, and payment details are fictional
demo data. The tax defaults are configurable examples, not tax or financing
advice; confirm current Ghana Revenue Authority treatment with a qualified
Ghanaian accountant before production use.