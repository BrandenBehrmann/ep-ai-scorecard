// app/api/assessments/route.ts
// Create new assessments (both demo and paid)

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { randomUUID } from 'crypto';

// Generate a short, memorable code like "PS-XK7M2N"
function generateShortCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PS-${code}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, is_demo = false, stripe_session_id } = body;

    // Validate required fields
    if (!name || !email || !company) {
      return NextResponse.json(
        { error: 'Name, email, and company are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Generate a unique token for URL access (keep for backwards compatibility)
    const token = randomUUID();

    // Generate a short code for cleaner URLs
    const shortCode = generateShortCode();

    // Create the assessment record
    const { data: assessment, error } = await supabase
      .from('assessments')
      .insert({
        name,
        email,
        company,
        token, // URL access token (backwards compatible)
        short_code: shortCode, // New cleaner URL code
        is_demo,
        stripe_session_id,
        stripe_payment_status: is_demo ? 'paid' : 'pending', // Demo assessments skip payment
        status: 'not_started',
        current_step: 0,
        responses: {},
      })
      .select()
      .single();

    if (error) {
      console.error('Create assessment error:', error);
      return NextResponse.json(
        { error: 'Failed to create assessment', details: error.message },
        { status: 500 }
      );
    }

    // Cast to include short_code which may not be in types yet
    const assessmentWithCode = assessment as typeof assessment & { short_code?: string };

    return NextResponse.json({
      success: true,
      id: assessment.id,
      token: assessment.token,
      shortCode: assessmentWithCode.short_code || shortCode,
      portalUrl: `/assessment/portal?token=${assessment.token}${is_demo ? '&demo=true' : ''}`,
      // Cleaner URLs using short code
      portalUrlShort: `/a/${assessmentWithCode.short_code || shortCode}`,
      reportUrlShort: `/r/${assessmentWithCode.short_code || shortCode}`,
    });
  } catch (error) {
    console.error('POST assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}

// GET all assessments (admin use)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const is_demo = searchParams.get('is_demo');
    const status = searchParams.get('status');

    const supabase = createServerClient();
    let query = supabase.from('assessments').select('*').order('created_at', { ascending: false });

    if (email) {
      query = query.eq('email', email);
    }
    if (is_demo !== null) {
      query = query.eq('is_demo', is_demo === 'true');
    }
    if (status) {
      query = query.eq('status', status as 'not_started' | 'in_progress' | 'submitted' | 'report_ready');
    }

    const { data: assessments, error } = await query.limit(100);

    if (error) {
      console.error('List assessments error:', error);
      return NextResponse.json(
        { error: 'Failed to list assessments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ assessments });
  } catch (error) {
    console.error('GET assessments error:', error);
    return NextResponse.json(
      { error: 'Failed to list assessments' },
      { status: 500 }
    );
  }
}
