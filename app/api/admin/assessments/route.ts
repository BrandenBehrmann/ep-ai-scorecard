// app/api/admin/assessments/route.ts
// Admin API to list all assessments

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();

    const { data: assessments, error } = await supabase
      .from('assessments')
      .select('id, token, name, email, company, status, created_at, updated_at, scores, insights')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch assessments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch assessments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ assessments });
  } catch (error) {
    console.error('Admin assessments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}
