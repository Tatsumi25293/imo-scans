const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  console.log("Testing Supabase Insert...");
  const { data, error } = await supabase.from('series').insert({
    title: 'اختبار الربط الفعلي',
    slug: 'test-real-integration',
    description: 'هذا اختبار للتأكد من أن الإدخال يعمل.',
    status: 'ongoing',
    type: 'manhwa'
  }).select().single();

  if (error) {
    console.error("❌ DB Insert failed:", error.message);
    return;
  }
  
  console.log("✅ DB Insert success! ID:", data.id);
  
  console.log("Testing Storage Upload...");
  const blankImage = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082', 'hex');
  
  const { data: storageData, error: storageError } = await supabase.storage.from('covers').upload('test-cover.png', blankImage, {
    contentType: 'image/png',
    upsert: true
  });
  
  if (storageError) {
    console.error("❌ Storage Upload failed:", storageError.message);
    return;
  }
  
  console.log("✅ Storage Upload success! Path:", storageData.path);
  
  // Clean up
  console.log("Cleaning up test data...");
  await supabase.from('series').delete().eq('id', data.id);
  await supabase.storage.from('covers').remove(['test-cover.png']);
  
  console.log("✅ All tests passed!");
}

test();
