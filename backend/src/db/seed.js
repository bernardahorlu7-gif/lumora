require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, query } = require('./pool');

async function seed() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@lumorademoore.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const adminName = process.env.SEED_ADMIN_NAME || 'Lumora Admin';

  const demoUsers = [
    { name: 'Bernard Moore', email: 'bernard@lumoraproperties.com', role: 'admin' },
    { name: 'Isaac Kwame Selorm Agbesi', email: 'isaac@lumoraproperties.com', role: 'accountant' },
    { name: 'Eric Attakorah', email: 'eric@lumoraproperties.com', role: 'project_manager' },
  ];
  const demoPassword = process.env.SEED_DEMO_PASSWORD || 'LumoraDemo!2026';

  const existing = await query('SELECT id FROM users WHERE lower(email) = lower($1)', [adminEmail]);
  if (existing.rowCount === 0) {
    const hash = await bcrypt.hash(adminPassword, 12);
    await query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')`,
      [adminName, adminEmail, hash]
    );
    console.log(`[seed] created admin user: ${adminEmail} / ${adminPassword} (CHANGE THIS PASSWORD IMMEDIATELY)`);
  } else {
    console.log('[seed] admin user already exists, skipping.');
  }

  for (const demoUser of demoUsers) {
    const exists = await query('SELECT id FROM users WHERE lower(email) = lower($1)', [demoUser.email]);
    if (exists.rowCount === 0) {
      const hash = await bcrypt.hash(demoPassword, 12);
      await query('INSERT INTO users (full_name, email, password_hash, role) VALUES ($1,$2,$3,$4)', [demoUser.name, demoUser.email, hash, demoUser.role]);
      console.log(`[seed] created demo founder account: ${demoUser.email}`);
    }
  }

  await query(`INSERT INTO company_settings (key, value) VALUES
    ('company', '{"companyName":"Lumora DeMoore Properties","address":"Ofankor Barrier, Accra, Ghana","tin":"DEMO-TIN-000000000","vatNumber":"DEMO-VAT-000000000"}'),
    ('payment', '{"paymentInstructions":"Demo payment: MTN MoMo 024 000 0000, account name Lumora DeMoore Properties."}'),
    ('tax', '{"vatRate":0.15,"nhilRate":0.025,"getfundRate":0.025,"withholdingRate":0}')
    ON CONFLICT (key) DO NOTHING`);

  const clientCheck = await query('SELECT id FROM clients LIMIT 1');
  if (clientCheck.rowCount === 0) {
    const client = await query(
      `INSERT INTO clients (name, company_name, contact_person, email, phone, address)
       VALUES ('Mensah Holdings', 'Mensah Holdings Ltd', 'Kwabena Mensah', 'kwabena@mensahholdings.com', '+233 24 000 0000', 'East Legon, Accra')
       RETURNING id`
    );
    const clientId = client.rows[0].id;

    const admin = await query('SELECT id FROM users WHERE lower(email) = lower($1)', [adminEmail]);
    const adminId = admin.rows[0].id;

    await query(
      `INSERT INTO projects (reference_code, name, description, service, location, scope, highlights, completion_date, is_published, client_id, status, contract_type, supplies_materials, budget, project_manager_id, created_by)
       VALUES ('LDP-2026-001', 'Prestige Building - East Legon', 'Four-storey commercial office building, architectural finishing and civil works.', 'Construction Solutions', 'East Legon, Accra', 'Civil works, architectural finishing, and project coordination.', '["Commercial delivery","Architectural finishing"]', '2026-08-01', true, $1, 'completed', 'general_contracting', true, 4500000, $2, $2)`,
      [clientId, adminId]
    );
    console.log('[seed] created demo client and project.');
  } else {
    console.log('[seed] demo data already present, skipping.');
  }

  await pool.end();
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
