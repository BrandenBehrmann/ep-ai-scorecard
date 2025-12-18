// app/api/assessments/[token]/route.ts
// Revenue Friction Diagnostic - Assessment API
// December 2025 - v2 pivot with legacy support

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { calculateConstraint, calculateScores, isV2Assessment } from '@/lib/scoring';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = createServerClient();

    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error('GET assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const supabase = createServerClient();

    // First, get the current assessment to check version
    const { data: currentAssessment } = await supabase
      .from('assessments')
      .select('version')
      .eq('token', token)
      .single();

    const version = currentAssessment?.version || 'v2_revenue_friction';
    const isV2 = isV2Assessment(version);

    const updateData: Record<string, unknown> = {};

    if (body.responses !== undefined) {
      updateData.responses = body.responses;
    }
    if (body.current_step !== undefined) {
      updateData.current_step = body.current_step;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;

      // Calculate scores/constraints when submitting
      if ((body.status === 'submitted' || body.status === 'pending_review') && body.responses) {
        if (isV2) {
          // ─────────────────────────────────────────────────────────────────
          // v2: Revenue Friction Diagnostic
          // Calculate constraint based on Section 7 (owner-defined)
          // ─────────────────────────────────────────────────────────────────
          const constraintResult = calculateConstraint(body.responses);
          updateData.constraint_result = constraintResult;

          // Keep scores null for v2 - we don't use dimension scoring
          updateData.scores = null;
        } else {
          // ─────────────────────────────────────────────────────────────────
          // v1 Legacy: Original dimension scoring
          // ─────────────────────────────────────────────────────────────────
          const scores = calculateScores(body.responses);
          updateData.scores = {
            total: scores.totalScore,
            percentage: scores.percentage,
            band: scores.band,
            bandLabel: scores.bandLabel,
            control: scores.dimensions.find(d => d.dimension === 'control')?.score || 0,
            clarity: scores.dimensions.find(d => d.dimension === 'clarity')?.score || 0,
            leverage: scores.dimensions.find(d => d.dimension === 'leverage')?.score || 0,
            friction: scores.dimensions.find(d => d.dimension === 'friction')?.score || 0,
            changeReadiness: scores.dimensions.find(d => d.dimension === 'change-readiness')?.score || 0,
            aiInvestment: scores.dimensions.find(d => d.dimension === 'ai-investment')?.score || 0,
            dimensions: scores.dimensions,
            topPriorities: scores.topPriorities,
            strengths: scores.strengths,
          };
        }
      }
    }

    const { data: assessment, error } = await supabase
      .from('assessments')
      .update(updateData)
      .eq('token', token)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { error: 'Failed to update assessment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error('PATCH assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment' },
      { status: 500 }
    );
  }
}
