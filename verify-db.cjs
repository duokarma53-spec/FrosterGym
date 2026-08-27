const { Client } = require('pg');

async function checkRLS() {
  const client = new Client({
    connectionString: "postgresql://postgres:NGTnmI8SVyaJhnnc@db.pndkqnnsxjpjvxufrdav.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Check if RLS is enabled for main tables
    const res = await client.query(`
      SELECT relname, relrowsecurity 
      FROM pg_class 
      WHERE relname IN ('members', 'payments', 'expenses', 'staff_permissions', 'profiles')
    `);
    
    console.log("--- RLS STATUS ---");
    res.rows.forEach(r => console.log(`${r.relname}: ${r.relrowsecurity}`));
    
    // Check actual policies
    const policies = await client.query(`
      SELECT tablename, policyname, roles, cmd, qual 
      FROM pg_policies 
      WHERE tablename IN ('members', 'payments', 'expenses', 'staff_permissions', 'profiles')
    `);
    
    console.log("\n--- RLS POLICIES ---");
    policies.rows.forEach(p => {
      console.log(`Table: ${p.tablename} | Policy: ${p.policyname} | Cmd: ${p.cmd} | Qual: ${p.qual}`);
    });
    
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

checkRLS();
