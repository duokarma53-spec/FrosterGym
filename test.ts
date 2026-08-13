import { supabase } from './src/lib/supabase';
async function test() {
  const x = supabase.from('gyms').insert({ name: 'test', slug: 'test', owner_id: '123' });
}
