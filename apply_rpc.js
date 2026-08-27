import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  await client.connect();
  const sql = fs.readFileSync('supabase/migrations/20260827_add_setup_staff_rpc.sql', 'utf8');
  await client.query(sql);
  console.log('RPC migration applied successfully.');
  await client.end();
}

run().catch(console.error);
