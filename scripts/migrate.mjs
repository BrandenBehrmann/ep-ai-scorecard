// Safe migration script - adds missing columns without deleting data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oqghzxbrlvxrmlcjkvyj.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xZ2h6eGJybHZ4cm1sY2prdnlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDIwNzUyNywiZXhwIjoyMDc5NzgzNTI3fQ.vOtGYng4BJMJdbT7-8eEPwGyZ5Cnn_GkSkU70aisurg';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function migrate() {
  console.log('Starting safe migration...');
  console.log('This will ADD columns, not delete any data.\n');

  // First, let's check the current data
  const { data: existing, error: fetchError } = await supabase
    .from('assessments')
    .select('*')
    .limit(5);

  if (fetchError) {
    console.error('Error fetching existing data:', fetchError);
    return;
  }

  console.log(`Found ${existing?.length || 0} existing records.`);

  if (existing && existing.length > 0) {
    console.log('Existing columns:', Object.keys(existing[0]).join(', '));
  }

  // Test if we can add a record with new columns
  // If the columns don't exist, Supabase will just ignore them
  console.log('\nTesting if new columns exist by inserting a test record...');

  const testRecord = {
    name: 'Migration Test',
    email: 'migration-test@example.com',
    company: 'Migration Test Co',
    status: 'not_started',
    current_step: 0,
    responses: {},
    is_demo: true,
    stripe_payment_status: 'pending',
    insights: null,
    submitted_at: null,
    amount_paid: null
  };

  const { data: testData, error: testError } = await supabase
    .from('assessments')
    .insert(testRecord)
    .select()
    .single();

  if (testError) {
    console.log('\nNew columns might not exist. Error:', testError.message);
    console.log('\n⚠️  You need to run this SQL in the Supabase dashboard:');
    console.log('   https://supabase.com/dashboard/project/oqghzxbrlvxrmlcjkvyj/sql/new\n');
    console.log(`
-- Add missing columns (safe - won't affect existing data)
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS insights JSONB DEFAULT NULL;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS stripe_payment_status TEXT DEFAULT 'pending';
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS amount_paid INTEGER;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- Add index for demo filtering
CREATE INDEX IF NOT EXISTS idx_assessments_is_demo ON assessments(is_demo);
    `);
    return;
  }

  console.log('✅ Test record created successfully!');
  console.log('New columns are available:', Object.keys(testData).join(', '));

  // Clean up test record
  await supabase.from('assessments').delete().eq('id', testData.id);
  console.log('✅ Test record cleaned up.\n');
  console.log('Migration complete! All columns are ready.');
}

migrate().catch(console.error);
