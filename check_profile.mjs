import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pndkqnnsxjpjvxufrdav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZGtxbm5zeGpwanZ4dWZyZGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNjM3MDQsImV4cCI6MjEwMTkzOTcwNH0.jg8WjUv2q6rw3icJH4vTlz4tMLc7simaaVbW6_WWDHo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfile() {
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'froastergym@gmail.com',
    password: 'FroasterGym@2244'
  });
  
  if (signInError) {
       console.log('Failed to sign in:', signInError);
       return;
  }
  console.log('Signed in as:', signInData.user?.email);
  
  const { data: profile, error: profErr } = await supabase.from('profiles').select('*').eq('user_id', signInData.user.id).single();
  console.log('Profile:', profile, profErr);

  const { data: gym, error: gymErr } = await supabase.from('gyms').select('*').eq('owner_id', signInData.user.id).single();
  console.log('Gym:', gym, gymErr);
}

checkProfile();
