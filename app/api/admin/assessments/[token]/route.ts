// app/api/admin/assessments/[token]/route.ts
// Admin API to update assessment with manual insights and status

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { Json } from '@/lib/database.types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const supabase = createServerClient();

    // First, fetch the current assessment to get existing insights
    const { data: assessment, error: fetchError } = await supabase
      .from('assessments')
      .select('insights, status')
      .eq('token', token)
      .single();

    if (fetchError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {};

    // Handle status change (e.g., releasing report)
    if (body.status) {
      updateData.status = body.status;
    }

    // Handle released_at timestamp
    if (body.released_at) {
      updateData.released_at = body.released_at;
    }

    // Handle insights update (manual insights and executive override)
    if (body.manual_insights !== undefined || body.executive_override !== undefined) {
      const currentInsights = (assessment.insights as Record<string, unknown>) || {};
      const updatedInsights = {
        ...currentInsights,
      };

      if (body.manual_insights !== undefined) {
        updatedInsights.manualInsights = body.manual_insights;
      }
      if (body.executive_override !== undefined) {
        updatedInsights.executiveOverride = body.executive_override;
      }

      updateData.insights = updatedInsights as Json;
    }

    // Only update if there's something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true, message: 'No changes to update' });
    }

    // Update the assessment
    const { error: updateError } = await supabase
      .from('assessments')
      .update(updateData)
      .eq('token', token);

    if (updateError) {
      console.error('Failed to update assessment:', updateError);
      return NextResponse.json(
        { error: 'Failed to update assessment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin update error:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment' },
      { status: 500 }
    );
  }
}
