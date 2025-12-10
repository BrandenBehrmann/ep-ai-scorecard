// app/api/insights/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { generateInsights } from '@/lib/ai-insights';
import { ScorecardResult } from '@/lib/scoring';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = createServerClient();

    // Fetch assessment
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', token)
      .single();

    if (error || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Check if assessment is submitted
    if (assessment.status !== 'submitted' && assessment.status !== 'report_ready') {
      return NextResponse.json(
        { error: 'Assessment not yet submitted' },
        { status: 400 }
      );
    }

    // Check if scores exist
    if (!assessment.scores) {
      return NextResponse.json(
        { error: 'Scores not calculated yet' },
        { status: 400 }
      );
    }

    // Generate insights
    const scores = assessment.scores as unknown as ScorecardResult;
    const responses = (assessment.responses as Record<string, string | string[] | number>) || {};
    const insights = await generateInsights(scores, responses, assessment.company);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Insights generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
