// One-time migration endpoint
// Call GET /api/migrate to add missing columns

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { randomUUID } from 'crypto';

export async function GET() {
  const supabase = createServerClient();

  // Test if new columns exist by trying to select them
  const { data, error } = await supabase
    .from('assessments')
    .select('id, is_demo, insights, stripe_payment_status')
    .limit(1);

  if (error) {
    // Columns don't exist yet
    return NextResponse.json({
      status: 'migration_needed',
      error: error.message,
      instructions: `
The following columns need to be added to the assessments table.
Run this SQL in Supabase Dashboard (https://supabase.com/dashboard/project/oqghzxbrlvxrmlcjkvyj/sql/new):

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS insights JSONB DEFAULT NULL;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS stripe_payment_status TEXT DEFAULT 'pending';
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS amount_paid INTEGER;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_assessments_is_demo ON assessments(is_demo);
      `.trim()
    }, { status: 400 });
  }

  // Try to insert a test record with new columns
  const testToken = randomUUID();
  const { error: insertError } = await supabase
    .from('assessments')
    .insert({
      name: 'Migration Test',
      email: 'test@migration.com',
      company: 'Test',
      token: testToken,
      is_demo: true,
      stripe_payment_status: 'pending',
      insights: null,
      status: 'not_started',
      current_step: 0,
      responses: {}
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({
      status: 'migration_needed',
      error: insertError.message,
      hint: 'Some columns may be missing. Check the error message.'
    }, { status: 400 });
  }

  // Clean up test record
  await supabase.from('assessments').delete().eq('email', 'test@migration.com');

  return NextResponse.json({
    status: 'ready',
    message: 'All columns exist. Database is ready for use.'
  });
}
