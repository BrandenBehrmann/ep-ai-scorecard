// app/api/insights/[token]/route.ts
// Generate premium AI-powered insights for an assessment

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { generateInsightsWithFallback } from '@/lib/premium-insights';
import type { Json } from '@/lib/database.types';

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

    // Check if assessment is submitted
    if (assessment.status !== 'submitted' && assessment.status !== 'report_ready') {
      return NextResponse.json(
        { error: 'Assessment not yet submitted' },
        { status: 400 }
      );
    }

    // Check if we already have insights
    if (assessment.insights) {
      return NextResponse.json({
        insights: assessment.insights,
        cached: true
      });
    }

    // Check if we have scores
    if (!assessment.scores) {
      return NextResponse.json(
        { error: 'Assessment scores not calculated' },
        { status: 400 }
      );
    }

    // Type assertion for scores
    const scores = assessment.scores as {
      total: number;
      percentage: number;
      band: string;
      bandLabel: string;
      dimensions: { dimension: string; label: string; score: number; maxScore: number; percentage: number; interpretation: string }[];
    };

    // Generate premium insights
    const insights = await generateInsightsWithFallback(
      assessment.company,
      assessment.name,
      assessment.responses as Record<string, string | string[] | number>,
      {
        total: scores.total,
        percentage: scores.percentage,
        band: scores.band,
        bandLabel: scores.bandLabel,
        dimensions: scores.dimensions,
      },
      assessment.id
    );

    // Save insights to database
    const { error: updateError } = await supabase
      .from('assessments')
      .update({
        insights: JSON.parse(JSON.stringify(insights)) as Json,
        status: 'report_ready'
      })
      .eq('token', token);

    if (updateError) {
      console.error('Failed to save insights:', updateError);
    }

    return NextResponse.json({
      insights,
      cached: false
    });
  } catch (error) {
    console.error('Generate insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST to regenerate insights (force refresh)
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

    if (!assessment.scores) {
      return NextResponse.json(
        { error: 'Assessment scores not calculated' },
        { status: 400 }
      );
    }

    // Type assertion for scores
    const scores = assessment.scores as {
      total: number;
      percentage: number;
      band: string;
      bandLabel: string;
      dimensions: { dimension: string; label: string; score: number; maxScore: number; percentage: number; interpretation: string }[];
    };

    // Force regenerate insights
    const insights = await generateInsightsWithFallback(
      assessment.company,
      assessment.name,
      assessment.responses as Record<string, string | string[] | number>,
      {
        total: scores.total,
        percentage: scores.percentage,
        band: scores.band,
        bandLabel: scores.bandLabel,
        dimensions: scores.dimensions,
      },
      assessment.id
    );

    // Save new insights
    await supabase
      .from('assessments')
      .update({
        insights: JSON.parse(JSON.stringify(insights)) as Json,
        status: 'report_ready'
      })
      .eq('token', token);

    return NextResponse.json({
      insights,
      regenerated: true
    });
  } catch (error) {
    console.error('Regenerate insights error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate insights' },
      { status: 500 }
    );
  }
}
