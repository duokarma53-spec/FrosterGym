import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pndkqnnsxjpjvxufrdav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZGtxbm5zeGpwanZ4dWZyZGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNjM3MDQsImV4cCI6MjEwMTkzOTcwNH0.jg8WjUv2q6rw3icJH4vTlz4tMLc7simaaVbW6_WWDHo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addOwner() {
  const email = 'froastergym@gmail.com';
  const password = 'FroasterGym@2244';

  console.log(`Attempting to sign up ${email}...`);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Froaster Gym Owner' } }
  });

  if (error) {
    if (error.message.includes('already registered')) {
        console.log('User already registered. Attempting to update password...');
        // To update password we need an admin client or we login and update, but with Anon key we can't update another user's password without logging in.
        // Let's try to sign in first
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (signInError) {
             console.log('Failed to sign in:', signInError);
        } else {
             console.log('Successfully signed in:', signInData.user?.id);
             // Verify the profile
             const { data: profile, error: profErr } = await supabase.from('profiles').select('*').eq('user_id', signInData.user.id).single();
             console.log('Profile:', profile, profErr);
             
             // If not owner, we can try to update but we are just users. We might need service_role key to bypass RLS, but we only have anon key.
             // Usually on signup, a trigger creates a gym and sets role to 'owner'.
        }
    } else {
        console.error('SignUp Error:', error);
    }
  } else {
    console.log('Successfully signed up:', data.user?.id);
    if (data.session) {
      const { data: profile, error: profErr } = await supabase.from('profiles').select('*').eq('user_id', data.user.id).single();
      console.log('New Profile:', profile, profErr);
    }
  }
}

addOwner();
