const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  console.log('[migrate] applying schema.sql ...');
  try {
    await pool.query(sql);
    console.log('[migrate] done.');
  } catch (err) {
    // Constraint/index already existing is fine on re-runs
    if (err.code === '42710' || err.code === '42P07') {
      console.log('[migrate] some objects already existed — that is fine on re-run.');
    } else {
      console.error('[migrate] failed:', err.message);
      process.exitCode = 1;
    }
  } finally {
    await pool.end();
  }
}

migrate();
