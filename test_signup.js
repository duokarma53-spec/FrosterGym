import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function run() {
  const email = `test+${Date.now()}@example.com`;
  console.log('Signing up', email);
  const { data, error } = await tempClient.auth.signUp({
    email,
    password: 'password123'
  });
  console.log('Error:', error);
  console.log('User:', data.user?.id);
  console.log('Session:', data.session ? 'EXISTS' : 'NULL');
}
run();
