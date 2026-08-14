const { Client } = require('pg');

async function check() {
  const connectionString = "postgresql://postgres.pndkqnnsxjpjvxufrdav:NGTnmI8SVyaJhnnc@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    
    // Get constraints
    const res = await client.query(`
      SELECT c.conname, pg_get_constraintdef(c.oid) AS constraint_def
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE t.relname = 'expenses' AND c.conname = 'expenses_category_check';
    `);
    console.log(res.rows);
    
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

check();
