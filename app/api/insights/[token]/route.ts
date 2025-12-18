// app/api/insights/[token]/route.ts
// Revenue Friction Diagnostic - Diagnostic Generation API
// December 2025 - v2 pivot with legacy support

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { generateDiagnosticWithFallback } from '@/lib/premium-insights';
import { isV2Assessment, calculateConstraint } from '@/lib/scoring';
import type { Json, ConstraintResult } from '@/lib/database.types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = createServerClient();

    // Fetch the assessment
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

    // Check if assessment is ready for insights
    const validStatuses = ['submitted', 'pending_review', 'report_ready', 'released'];
    if (!validStatuses.includes(assessment.status)) {
      return NextResponse.json(
        { error: 'Assessment not yet submitted' },
        { status: 400 }
      );
    }

    // Check if we already have insights
    if (assessment.insights) {
      return NextResponse.json({
        insights: assessment.insights,
        cached: true,
        version: assessment.version || 'v1_legacy'
      });
    }

    const version = assessment.version || 'v1_legacy';
    const isV2 = isV2Assessment(version);

    if (isV2) {
      // ─────────────────────────────────────────────────────────────────────
      // v2: Revenue Friction Diagnostic
      // Generate diagnostic based on constraint_result
      // ─────────────────────────────────────────────────────────────────────
      if (!assessment.constraint_result) {
        return NextResponse.json(
          { error: 'Constraint analysis not calculated. Please resubmit the assessment.' },
          { status: 400 }
        );
      }

      const constraintResult = assessment.constraint_result as unknown as ConstraintResult;

      const diagnostic = await generateDiagnosticWithFallback(
        assessment.company,
        assessment.name,
        constraintResult,
        assessment.responses as Record<string, string | string[] | number>
      );

      // Save diagnostic to insights field
      const { error: updateError } = await supabase
        .from('assessments')
        .update({
          insights: JSON.parse(JSON.stringify(diagnostic)) as Json,
          status: 'report_ready'
        })
        .eq('token', token);

      if (updateError) {
        console.error('Failed to save diagnostic:', updateError);
      }

      return NextResponse.json({
        insights: diagnostic,
        cached: false,
        version: 'v2_revenue_friction'
      });
    } else {
      // ─────────────────────────────────────────────────────────────────────
      // v1 Legacy: Return error - legacy insights generation deprecated
      // ─────────────────────────────────────────────────────────────────────
      return NextResponse.json({
        error: 'Legacy v1 assessment. Insight generation is deprecated for v1 assessments.',
        version: 'v1_legacy'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Generate diagnostic error:', error);
    return NextResponse.json(
      { error: 'Failed to generate diagnostic', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST to regenerate diagnostic (force refresh)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = createServerClient();

    // Fetch the assessment
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

    const version = assessment.version || 'v1_legacy';
    const isV2 = isV2Assessment(version);

    if (isV2) {
      // ─────────────────────────────────────────────────────────────────────
      // v2: Revenue Friction Diagnostic
      // RECALCULATE constraint_result to include pattern analysis
      // ─────────────────────────────────────────────────────────────────────
      const responses = assessment.responses as Record<string, string | string[] | number>;
      if (!responses) {
        return NextResponse.json(
          { error: 'No responses found' },
          { status: 400 }
        );
      }

      // Recalculate constraint with pattern analysis
      const constraintResult = calculateConstraint(responses);

      // Generate diagnostic with pattern analysis
      const diagnostic = await generateDiagnosticWithFallback(
        assessment.company,
        assessment.name,
        constraintResult,
        responses
      );

      // Save new diagnostic AND updated constraint_result
      await supabase
        .from('assessments')
        .update({
          insights: JSON.parse(JSON.stringify(diagnostic)) as Json,
          constraint_result: JSON.parse(JSON.stringify(constraintResult)) as Json,
          status: 'report_ready'
        })
        .eq('token', token);

      return NextResponse.json({
        insights: diagnostic,
        constraintResult, // Include for debugging
        regenerated: true,
        version: 'v2_revenue_friction'
      });
    } else {
      // ─────────────────────────────────────────────────────────────────────
      // v1 Legacy: Cannot regenerate
      // ─────────────────────────────────────────────────────────────────────
      return NextResponse.json({
        error: 'Cannot regenerate insights for v1 legacy assessments',
        version: 'v1_legacy'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Regenerate diagnostic error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate diagnostic' },
      { status: 500 }
    );
  }
}
