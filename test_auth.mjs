import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pndkqnnsxjpjvxufrdav.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZGtxbm5zeGpwanZ4dWZyZGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNjM3MDQsImV4cCI6MjEwMTkzOTcwNH0.jg8WjUv2q6rw3icJH4vTlz4tMLc7simaaVbW6_WWDHo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log("Attempting sign in...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@froaster.com',
    password: 'wrongpassword'
  });
  
  if (error) {
    console.error("AUTH ERROR:", error);
    console.error("STATUS:", error.status);
    console.error("NAME:", error.name);
  } else {
    console.log("SUCCESS");
  }
}

testAuth();
