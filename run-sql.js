import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    await client.connect();
    
    // 1. Verify current schema
    const checkRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='membership_plans' 
      AND column_name IN ('pt_included', 'diet_included');
    `);
    
    if (checkRes.rows.length > 0) {
      console.log('Columns already exist:', checkRes.rows);
    } else {
      console.log('Columns do not exist. Executing ALTER TABLE...');
      // 2. Execute migration
      await client.query(`
        ALTER TABLE public.membership_plans
        ADD COLUMN pt_included boolean NOT NULL DEFAULT false,
        ADD COLUMN diet_included boolean NOT NULL DEFAULT false;
      `);
      console.log('Successfully added columns.');
    }
    
    // 3. Verify they exist now
    const verifyRes = await client.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name='membership_plans' 
      AND column_name IN ('pt_included', 'diet_included');
    `);
    console.log('Current schema for new columns:', verifyRes.rows);
    
    // 4. Verify existing plans
    const countRes = await client.query(`SELECT count(*) FROM public.membership_plans;`);
    console.log(`Total membership plans: ${countRes.rows[0].count}`);
    
    const sampleRes = await client.query(`SELECT name, pt_included, diet_included FROM public.membership_plans LIMIT 1;`);
    console.log('Sample plan:', sampleRes.rows);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
