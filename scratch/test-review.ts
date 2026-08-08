import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSubmitReview() {
  console.log('--- Starting Integration Test: submitReview ---');
  
  // 1. Fetch an existing service ID to maintain referential integrity
  const { data: services, error: serviceError } = await supabase.from('services').select('id').limit(1);
  if (serviceError || !services || services.length === 0) {
    console.error('Failed to fetch a service for testing:', serviceError);
    return;
  }
  const serviceId = services[0].id;
  
  console.log(`Using Service ID: ${serviceId}`);

  // 2. Submit Review (Replicating ReviewService + SupabaseReviewRepository logic exactly)
  try {
    const reviewId = uuidv4();
    const reviewPayload = {
      id: reviewId,
      service_id: serviceId,
      client_name: 'Integration Test User',
      rating: 5,
      review_text: 'This is an automated test review to verify RLS policies work without .select()',
      invitation_id: null,
      status: 'pending',
      featured: false,
      verified: false,
    };

    console.log('Inserting payload:', reviewPayload);

    // This simulates SupabaseReviewRepository.createReview() -> .insert(payload) without .select()
    const { error: insertError } = await supabase
      .from('reviews')
      .insert([reviewPayload]);

    if (insertError) throw new Error(`Failed to create review: ${insertError.message}`);
    
    console.log('✅ SUCCESS! Review created in Supabase (NO 403 Forbidden).');
    
    // 3. Verify it exists in the database
    console.log('\n--- Verifying RLS Read Protection ---');
    const { data: readBack, error: readError } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', reviewId);
      
    if (readError) {
        console.log('Expected Read Error:', readError);
    } else if (readBack && readBack.length === 0) {
        console.log('✅ Expected Empty Read: RLS successfully blocked anonymous user from reading their own pending review.');
    } else {
        console.log('Unexpected Read Success:', readBack);
    }

    // 4. Test review_media insert
    console.log('\n--- Testing review_media insert ---');
    const mediaPayload = {
      review_id: reviewId,
      storage_path: `review-media/${reviewId}/test.jpg`,
      url: `https://test.com/test.jpg`,
      order_index: 0
    };

    const { error: mediaError } = await supabase
      .from('review_media')
      .insert([mediaPayload]);

    if (mediaError) {
        throw new Error(`Failed to insert media: ${mediaError.message}`);
    }
    console.log('✅ SUCCESS! review_media inserted successfully using the generated UUID.');

  } catch (err: any) {
    console.error('❌ FAILED:', err.message);
  }
}

testSubmitReview();
