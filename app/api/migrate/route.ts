// One-time migration endpoint
// Call GET /api/migrate to check status
// Call POST /api/migrate to add short_code column

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { randomUUID } from 'crypto';

// Generate a short, memorable code like "PS-XK7M2N"
function generateShortCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PS-${code}`;
}

export async function GET() {
  const supabase = createServerClient();

  // Test if all columns exist by trying to select them
  const { data, error } = await supabase
    .from('assessments')
    .select('id, is_demo, insights, stripe_payment_status, short_code')
    .limit(1);

  if (error) {
    return NextResponse.json({
      status: 'migration_needed',
      error: error.message,
      instructions: `
Run this SQL in Supabase Dashboard:

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS insights JSONB DEFAULT NULL;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS stripe_payment_status TEXT DEFAULT 'pending';
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS amount_paid INTEGER;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS short_code VARCHAR(10) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_assessments_is_demo ON assessments(is_demo);
CREATE INDEX IF NOT EXISTS idx_assessments_short_code ON assessments(short_code);
      `.trim()
    }, { status: 400 });
  }

  // Check for assessments without short_code
  const { data: missingCodes } = await supabase
    .from('assessments')
    .select('id')
    .is('short_code', null);

  return NextResponse.json({
    status: 'ready',
    message: 'All columns exist.',
    assessmentsNeedingShortCode: missingCodes?.length || 0
  });
}

export async function POST() {
  const supabase = createServerClient();

  // Get all assessments without short_code
  const { data: assessments, error: fetchError } = await supabase
    .from('assessments')
    .select('id')
    .is('short_code', null);

  if (fetchError) {
    return NextResponse.json({
      status: 'error',
      error: fetchError.message,
      hint: 'short_code column may not exist. Run GET first to see migration instructions.'
    }, { status: 400 });
  }

  if (!assessments || assessments.length === 0) {
    return NextResponse.json({
      status: 'complete',
      message: 'All assessments already have short codes.',
      updated: 0
    });
  }

  // Update each assessment with a unique short code
  let updated = 0;
  const errors: string[] = [];

  for (const assessment of assessments) {
    const shortCode = generateShortCode();
    const { error: updateError } = await supabase
      .from('assessments')
      .update({ short_code: shortCode })
      .eq('id', assessment.id);

    if (updateError) {
      // If duplicate, try again with new code
      const retryCode = generateShortCode();
      const { error: retryError } = await supabase
        .from('assessments')
        .update({ short_code: retryCode })
        .eq('id', assessment.id);

      if (retryError) {
        errors.push(`Failed to update ${assessment.id}: ${retryError.message}`);
      } else {
        updated++;
      }
    } else {
      updated++;
    }
  }

  return NextResponse.json({
    status: errors.length === 0 ? 'complete' : 'partial',
    message: `Updated ${updated} assessments with short codes.`,
    updated,
    errors: errors.length > 0 ? errors : undefined
  });
}
