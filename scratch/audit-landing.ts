import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function auditLanding() {
  console.log('--- AUDITING LANDING DATA FLOW ---');
  
  // Simulated call from SupabaseReviewRepository.getPublicReviews
  console.log('\n[1] Executing SQL Query exactly as SupabaseReviewRepository does:');
  console.log(`supabase.from('reviews').select('*, services(name, slug), review_media(*)').eq('status', 'approved').order('created_at', { ascending: false }).limit(10)`);
  
  const { data, error } = await supabase
    .from('reviews')
    .select('*, services(name, slug), review_media(*)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (error) {
    console.error('❌ Error executing query:', error.message);
  } else {
    console.log(`✅ Query returned ${data?.length} rows.`);
    if (data && data.length > 0) {
      console.log('\n[2] First row data exactly as it arrives to the React Component:');
      const firstRow = data[0];
      console.log({
        id: firstRow.id,
        client_name: firstRow.client_name,
        status: firstRow.status,
        featured: firstRow.featured,
        admin_reply: firstRow.admin_reply,
        admin_reply_at: firstRow.admin_reply_at
      });
    }
  }
}

auditLanding();
