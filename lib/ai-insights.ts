// lib/ai-insights.ts
import OpenAI from 'openai';
import { ScorecardResult } from './scoring';

// Lazy initialization to avoid build-time errors
let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
}

export interface AIInsights {
  executiveSummary: string;
  dimensionInsights: {
    dimension: string;
    insight: string;
    recommendation: string;
  }[];
  aiInvestmentAnalysis: {
    currentState: string;
    budgetReadiness: string;
    recommendations: string[];
  };
  implementationRoadmap: {
    phase: string;
    timeline: string;
    actions: string[];
  }[];
  keyTakeaways: string[];
}

export async function generateInsights(
  scores: ScorecardResult,
  responses: Record<string, string | string[] | number>,
  company: string
): Promise<AIInsights> {
  const openai = getOpenAI();

  const prompt = `You are an expert business operations consultant analyzing the results of a Pragma Score assessment for ${company}.

## Assessment Scores
Overall Score: ${scores.percentage}/100 (${scores.bandLabel})

Dimension Breakdown:
${scores.dimensions.map(d => `- ${d.label}: ${d.score}/${d.maxScore} (${d.percentage}%, ${d.interpretation})`).join('\n')}

Top Priorities: ${scores.topPriorities.join(', ') || 'None identified'}
Strengths: ${scores.strengths.join(', ') || 'None identified'}

## Selected Responses
${Object.entries(responses)
  .filter(([, value]) => typeof value === 'string' && value.length > 20)
  .slice(0, 10)
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}

## Task
Generate comprehensive insights in JSON format with the following structure:
{
  "executiveSummary": "2-3 paragraphs summarizing overall operational health and key findings",
  "dimensionInsights": [
    {
      "dimension": "Control|Clarity|Leverage|Friction|Change Readiness|AI Investment",
      "insight": "Specific observation about this dimension based on their score and responses",
      "recommendation": "Actionable recommendation to improve this area"
    }
  ],
  "aiInvestmentAnalysis": {
    "currentState": "Assessment of their current AI spending and awareness",
    "budgetReadiness": "How prepared they are to budget for AI implementation",
    "recommendations": ["Specific AI budgeting recommendations"]
  },
  "implementationRoadmap": [
    {
      "phase": "Phase name (e.g., 'Quick Wins', 'Foundation', 'Optimization')",
      "timeline": "e.g., 'Weeks 1-2', 'Month 1-3'",
      "actions": ["Specific action items"]
    }
  ],
  "keyTakeaways": ["3-5 key points they should remember"]
}

Focus on actionable, specific insights rather than generic advice. Reference their actual responses where relevant.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert business operations consultant. Respond only with valid JSON matching the requested structure.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(content) as AIInsights;
  } catch (error) {
    console.error('Error generating AI insights:', error);

    // Return fallback insights
    return {
      executiveSummary: `Based on the Pragma Score assessment, ${company} scored ${scores.percentage}/100, placing them in the "${scores.bandLabel}" category. This indicates ${
        scores.band === 'critical' ? 'significant operational challenges that require immediate attention' :
        scores.band === 'at-risk' ? 'areas of operational stress that should be addressed' :
        scores.band === 'stable' ? 'solid operational foundations with room for optimization' :
        'excellent operational health with opportunities for continued growth'
      }.`,
      dimensionInsights: scores.dimensions.map(d => ({
        dimension: d.label,
        insight: `Scored ${d.percentage}% in ${d.label}, indicating ${d.interpretation} performance.`,
        recommendation: `Focus on improving ${d.label.toLowerCase()} to strengthen overall operations.`
      })),
      aiInvestmentAnalysis: {
        currentState: 'Assessment of AI investment readiness is pending detailed analysis.',
        budgetReadiness: 'Budget readiness evaluation requires additional context.',
        recommendations: [
          'Establish baseline AI spending metrics',
          'Define clear AI investment goals',
          'Create a phased budget allocation plan'
        ]
      },
      implementationRoadmap: [
        {
          phase: 'Assessment & Planning',
          timeline: 'Weeks 1-2',
          actions: ['Review detailed report', 'Identify quick wins', 'Schedule strategy session']
        },
        {
          phase: 'Foundation Building',
          timeline: 'Month 1-2',
          actions: ['Address top priority areas', 'Implement key recommendations', 'Establish metrics']
        },
        {
          phase: 'Optimization',
          timeline: 'Month 3+',
          actions: ['Refine processes', 'Scale improvements', 'Monitor progress']
        }
      ],
      keyTakeaways: scores.topPriorities.length > 0
        ? scores.topPriorities.slice(0, 3)
        : ['Review your dimensional scores', 'Focus on lowest-scoring areas', 'Book a strategy session for detailed guidance']
    };
  }
}
