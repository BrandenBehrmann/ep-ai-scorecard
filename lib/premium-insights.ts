// Pragma Score Premium Insights Generator
// $1,500 Value Business Diagnostic - December 2025
// Uses ONLY data provided by the customer - NO invented numbers

import OpenAI from 'openai';
import {
  extractBusinessProfile,
  parseHourlyRate,
  parseEmployeeCount,
  parseAnnualRevenue,
  type BusinessProfile
} from './scoring';

// Lazy initialization - avoid module-level instantiation for build compatibility
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface AhaMoment {
  headline: string; // The one-line insight
  explanation: string; // Why this matters
  evidence: string[]; // Their exact quotes that prove it
  implication: string; // What happens if they ignore this
}

export interface FinancialCalculation {
  item: string;
  yourData: string; // Quote the data they gave us
  calculation: string; // Show the actual math
  annualImpact: number;
  basis: 'from-your-answers' | 'industry-average' | 'conservative-estimate';
}

export interface EPImplementation {
  title: string;
  whatEPBuilds: string; // Specific deliverable
  yourProblem: string; // Quote their specific issue
  outcome: string; // What changes
  timeframe: string;
  investmentRange: string;
}

export interface ActionItem {
  action: string;
  why: string; // Tie to their specific quote
  steps: string[];
  timeRequired: string;
  cost: string;
  result: string;
  canEPDoThis: boolean; // Can EP implement this for them
}

export interface DimensionAnalysis {
  dimension: string;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  interpretation: 'critical' | 'needs-work' | 'stable' | 'strong';
  diagnosis: string;
  yourQuote: string; // Their exact words
  whatThisCosts: string; // Quantified in their terms
  quickFix: string;
}

export interface PremiumReportInsights {
  generatedAt: string;
  assessmentId: string;
  companyName: string;
  contactName: string;

  // Business Profile (from their answers)
  businessProfile: {
    revenue: string;
    employees: string;
    industry: string;
    ownerHourlyValue: string;
    revenueGoal: string;
    biggestConstraint: string;
  };

  // THE AHA MOMENT (The insight worth $1,500)
  ahaMoment: AhaMoment;

  // Executive Summary
  executiveSummary: {
    verdict: string;
    readinessScore: number;
    readinessLevel: string;
    inOneYear: string;
    ifYouAct: string;
  };

  // Root Cause
  rootCause: {
    surface: string;
    underlying: string;
    root: string;
    howWeKnow: string[];
  };

  // Dimension Breakdown
  dimensionInsights: DimensionAnalysis[];

  // Financial Impact (using THEIR numbers)
  financialImpact: {
    totalOpportunityCost: number;
    calculations: FinancialCalculation[];
    bottomLine: string;
  };

  // What EP Can Build For You
  epImplementations: EPImplementation[];

  // DIY Action Plan
  actionPlan: {
    thisWeek: ActionItem[];
    thisMonth: ActionItem[];
  };

  // Three Paths Forward
  nextSteps: {
    diy: {
      title: string;
      description: string;
      forYouIf: string;
      epRole: string;
    };
    jumpstart: {
      title: string;
      description: string;
      forYouIf: string;
      investment: string;
    };
    partnership: {
      title: string;
      description: string;
      forYouIf: string;
      investment: string;
    };
  };

  // For backwards compatibility with old report page
  coreDiagnosis?: {
    governingThought: string;
    thesis: string;
    evidenceChain: { quote: string; interpretation: string }[];
  };
  rootCauseAnalysis?: {
    surfaceSymptom: string;
    intermediateIssue: string;
    rootCause: string;
    explanation: string;
    supportingEvidence: string[];
  };
}

// ============================================================================
// QUESTION LABELS
// ============================================================================

const questionLabels: Record<string, string> = {
  // Profile
  'profile-1': 'Annual Revenue',
  'profile-2': 'Employee Count',
  'profile-3': 'Industry',
  'profile-4': '12-Month Revenue Goal',
  'profile-5': 'Owner Hours Per Week',
  'profile-6': 'Owner Hourly Value',
  // Sales
  'sales-1': 'Customer Acquisition Channels',
  'sales-2': 'Average Deal Size',
  'sales-3': 'Close Rate',
  'sales-4': 'Sales Cycle Length',
  'sales-5': 'Repeat vs New Revenue',
  'sales-6': 'Biggest Revenue Constraint',
  // Tech
  'tech-1': 'Current Tools',
  'tech-2': 'Tools That Work Well',
  'tech-3': 'Tools That Frustrate',
  'tech-4': 'System Integration Level',
  'tech-5': 'Monthly Software Spend',
  // Control
  'control-1': 'What Breaks If Owner Away',
  'control-2': 'Documentation Level',
  'control-3': 'Recovery If Top Person Quits',
  'control-4': 'Owner Approval Requirement',
  'control-5': 'Single-Person Bottlenecks',
  // Clarity
  'clarity-1': 'Revenue Awareness',
  'clarity-2': 'Project Tracking Method',
  'clarity-3': 'Customer Inquiry Response Time',
  'clarity-4': 'Where Data Lives',
  'clarity-5': 'Blindsided By Problems',
  // Leverage
  'leverage-1': 'Time On Low-Value Tasks',
  'leverage-2': 'Most Repetitive Process',
  'leverage-3': 'Reactive vs Proactive',
  'leverage-4': 'What Clone Would Do',
  'leverage-5': 'What Would You Do With 10 Extra Hours',
  // Friction
  'friction-1': 'Biggest Daily Frustration',
  'friction-2': 'Double Data Entry',
  'friction-3': 'Onboarding Time',
  'friction-4': 'Top Blockers',
  'friction-5': 'Time Hunting For Info',
  // Change
  'change-1': 'Last Successful Implementation',
  'change-2': 'What Happened Last Time',
  'change-3': 'Team Attitude To Change',
  'change-4': 'Who Owns Implementation',
  'change-5': 'Biggest Barrier To Improvement',
  'change-6': 'Speed To Act',
  // Vision
  'vision-1': 'What Would Make This Worth It',
  'vision-2': 'Ideal Week',
  'vision-3': 'One Thing To Fix',
  'vision-4': 'What Already Tried',
  'vision-5': 'Work Preference',
};

// ============================================================================
// HELPER: Format responses for prompt
// ============================================================================

function formatResponsesForPrompt(responses: Record<string, string | string[] | number>): string {
  const formatted: string[] = [];
  for (const [key, value] of Object.entries(responses)) {
    const label = questionLabels[key] || key;
    let displayValue: string;
    if (Array.isArray(value)) {
      displayValue = value.join(', ');
    } else if (typeof value === 'number') {
      displayValue = `${value}/5`;
    } else {
      displayValue = String(value);
    }
    formatted.push(`[${label}]: "${displayValue}"`);
  }
  return formatted.join('\n');
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

export async function generatePremiumInsights(
  companyName: string,
  contactName: string,
  responses: Record<string, string | string[] | number>,
  scores: {
    total: number;
    percentage: number;
    band: string;
    bandLabel: string;
    dimensions: { dimension: string; label: string; score: number; maxScore: number; percentage: number; interpretation: string }[];
  },
  assessmentId: string
): Promise<PremiumReportInsights> {

  // Extract business profile
  const profile = extractBusinessProfile(responses);
  const ownerHourlyRate = parseHourlyRate(profile.ownerHourlyRate);
  const employeeCount = parseEmployeeCount(profile.employeeCount);
  const annualRevenue = parseAnnualRevenue(profile.annualRevenue);

  const formattedResponses = formatResponsesForPrompt(responses);

  // Pre-format dimension scores
  const dimensionData = scores.dimensions.map(d =>
    `${d.label}: ${d.score}/${d.maxScore} (${d.percentage}%) - ${d.interpretation.toUpperCase()}`
  ).join('\n');

  const systemPrompt = `You are a senior business diagnostician for Ena Pragma (EP), a consulting firm that doesn't just diagnose problems - we BUILD and IMPLEMENT solutions.

## YOUR MISSION

Create an "aha moment" for this business owner - the ONE insight that connects multiple symptoms to a root cause they haven't seen. This insight is worth $1,500 because it changes how they think about their business.

## CRITICAL RULES - NON-NEGOTIABLE

### Rule 1: Use ONLY Their Data
You have access to THEIR specific numbers:
- Owner hourly value: $${ownerHourlyRate}/hour (from their answer)
- Employee count: ${employeeCount} people (from their answer)
- Annual revenue: ${annualRevenue > 0 ? '$' + annualRevenue.toLocaleString() : 'Not provided'}
- Industry: ${profile.industry}

EVERY financial calculation MUST reference their data. Format: "Based on your answer that you work ${profile.ownerHoursPerWeek}, at your stated rate of ${profile.ownerHourlyRate}..."

If they didn't provide a number, say "Based on industry averages for ${profile.industry}..." and mark it as "industry-average" or "conservative-estimate".

### Rule 2: Quote Them
Quote their EXACT words at least 10 times. Put quotes in quotation marks. This proves you read their answers.

### Rule 3: The AHA Moment
Find the ONE pattern they couldn't see. Connect 3+ of their answers to reveal a root cause. Example:
"You said [quote 1], and separately mentioned [quote 2], and your biggest frustration is [quote 3]. These aren't three problems - they're all symptoms of ONE root cause: [insight]."

### Rule 4: EP Builds, Not Just Advises
EP is a ONE STOP SHOP. We diagnose problems AND we build solutions:
- We implement systems (CRM, project management, documentation)
- We build automations (Zapier, Make, custom integrations)
- We create SOPs and training
- We integrate AI tools
- We provide ongoing operational partnership

Position EVERY recommendation with: "You could do this yourself, OR EP can build this for you in [timeframe]."

### Rule 5: No Fluff
- No consulting buzzwords
- No vague recommendations ("improve communication")
- No placeholder text
- Every claim backed by their data or marked as estimate
- Financial calculations show the math

## OUTPUT REQUIREMENTS

The report must feel like EP understands their specific business - not a template. Reference their industry (${profile.industry}), their goal ("${profile.revenueGoal}"), and their biggest constraint ("${profile.revenueConstraint}").`;

  const userPrompt = `BUSINESS DIAGNOSTIC: ${companyName}
Contact: ${contactName}

=== BUSINESS PROFILE (Use these exact numbers) ===
Annual Revenue: ${profile.annualRevenue}
Employees: ${profile.employeeCount}
Industry: ${profile.industry}
Owner Hours/Week: ${profile.ownerHoursPerWeek}
Owner Hourly Value: ${profile.ownerHourlyRate} ($${ownerHourlyRate}/hr)
Revenue Goal: ${profile.revenueGoal}
Biggest Constraint: ${profile.revenueConstraint}
Work Preference: ${profile.workPreference}
Current Tools: ${profile.currentTools.join(', ') || 'Not specified'}

=== SCORES (Use these exactly) ===
Overall: ${scores.percentage}% - ${scores.bandLabel}

${dimensionData}

=== THEIR RESPONSES (Quote these) ===
${formattedResponses}

---

Generate a JSON report with this structure:

{
  "generatedAt": "${new Date().toISOString()}",
  "assessmentId": "${assessmentId}",
  "companyName": "${companyName}",
  "contactName": "${contactName}",

  "businessProfile": {
    "revenue": "${profile.annualRevenue}",
    "employees": "${profile.employeeCount}",
    "industry": "${profile.industry}",
    "ownerHourlyValue": "${profile.ownerHourlyRate}",
    "revenueGoal": "${profile.revenueGoal}",
    "biggestConstraint": "${profile.revenueConstraint}"
  },

  "ahaMoment": {
    "headline": "The ONE insight that explains multiple problems (one powerful sentence)",
    "explanation": "Why this matters and how it connects their symptoms (2-3 sentences)",
    "evidence": ["Quote 1 from their answers", "Quote 2 that connects", "Quote 3 that proves it"],
    "implication": "If they ignore this, in 12 months... (specific consequence)"
  },

  "executiveSummary": {
    "verdict": "One sentence assessment of their business state",
    "readinessScore": ${scores.percentage},
    "readinessLevel": "${scores.bandLabel}",
    "inOneYear": "If nothing changes, specifically what happens based on their answers",
    "ifYouAct": "If they address the root cause, what becomes possible"
  },

  "rootCause": {
    "surface": "What they THINK the problem is (often from friction-1 or vision-3)",
    "underlying": "What's actually causing that",
    "root": "The root cause - fix this and multiple symptoms improve",
    "howWeKnow": ["Quote 1 that reveals this", "Quote 2", "Quote 3"]
  },

  "dimensionInsights": [
    {
      "dimension": "control",
      "label": "Control",
      "score": ${scores.dimensions.find(d => d.dimension === 'control')?.score || 0},
      "maxScore": ${scores.dimensions.find(d => d.dimension === 'control')?.maxScore || 20},
      "percentage": ${scores.dimensions.find(d => d.dimension === 'control')?.percentage || 0},
      "interpretation": "${scores.dimensions.find(d => d.dimension === 'control')?.interpretation || 'needs-work'}",
      "diagnosis": "What this score means for THEIR specific business",
      "yourQuote": "Quote their answer that most reveals this issue",
      "whatThisCosts": "In YOUR terms: X hours/week at $${ownerHourlyRate}/hr = $Y/year",
      "quickFix": "ONE specific action they could take this week"
    }
    // ... repeat for clarity, leverage, friction, change-readiness (5 total)
  ],

  "financialImpact": {
    "totalOpportunityCost": (sum of all calculations),
    "calculations": [
      {
        "item": "Specific cost item from THEIR answers",
        "yourData": "You said '[their exact quote]'",
        "calculation": "X hrs/week × $${ownerHourlyRate}/hr × 48 weeks",
        "annualImpact": (number),
        "basis": "from-your-answers"
      }
    ],
    "bottomLine": "Summary: Based on YOUR numbers, you're leaving approximately $X on the table annually. Here's why this matters for your goal of '${profile.revenueGoal}'..."
  },

  "epImplementations": [
    {
      "title": "What EP Would Build",
      "whatEPBuilds": "Specific system, automation, or process EP would create",
      "yourProblem": "You said '[quote their specific issue]'",
      "outcome": "After EP builds this, you'll have [specific result]",
      "timeframe": "2-4 weeks",
      "investmentRange": "$X,XXX - $X,XXX"
    }
  ],

  "actionPlan": {
    "thisWeek": [
      {
        "action": "Specific action",
        "why": "Because you said '[their quote]'",
        "steps": ["Step 1", "Step 2", "Step 3"],
        "timeRequired": "X hours",
        "cost": "$0 or specific cost",
        "result": "What changes when done",
        "canEPDoThis": true/false
      }
    ],
    "thisMonth": [...]
  },

  "nextSteps": {
    "diy": {
      "title": "Self-Implementation",
      "description": "Take this report and implement the action plan yourself",
      "forYouIf": "You have ${profile.ownerHoursPerWeek === '70+ hours' ? 'limited' : 'some'} time to dedicate AND someone to own implementation",
      "epRole": "We're here if you get stuck - hourly consulting available"
    },
    "jumpstart": {
      "title": "EP Jumpstart",
      "description": "EP builds the foundation: [list 2-3 specific things from epImplementations]",
      "forYouIf": "You want results fast and would rather invest money than time",
      "investment": "$5,000 - $15,000 depending on scope"
    },
    "partnership": {
      "title": "Ongoing Partnership",
      "description": "EP as your fractional operations team - we handle implementation, optimization, and new initiatives",
      "forYouIf": "You want operational excellence without hiring a full-time ops person",
      "investment": "Starting at $2,500/month"
    }
  }
}

REMEMBER:
1. Use THEIR exact numbers - Owner rate: $${ownerHourlyRate}/hr, Revenue: ${annualRevenue > 0 ? '$' + annualRevenue.toLocaleString() : 'not provided'}
2. Quote them at least 10 times
3. Show math for every financial calculation
4. Position EP as builder/implementer, not just advisor
5. The AHA moment must connect 3+ of their answers to ONE root cause
6. Every recommendation includes "you can DIY or EP can build this"`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4, // Lower for consistency
      max_tokens: 6000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const insights = JSON.parse(content) as PremiumReportInsights;

    // FORCE correct scores (AI sometimes ignores)
    insights.executiveSummary.readinessScore = scores.percentage;
    insights.executiveSummary.readinessLevel = scores.bandLabel;

    insights.dimensionInsights = insights.dimensionInsights.map((dim) => {
      const matchingScore = scores.dimensions.find(s => s.dimension === dim.dimension);
      if (matchingScore) {
        return {
          ...dim,
          score: matchingScore.score,
          maxScore: matchingScore.maxScore,
          percentage: matchingScore.percentage,
          interpretation: matchingScore.interpretation as 'critical' | 'needs-work' | 'stable' | 'strong',
        };
      }
      return dim;
    });

    // Add backwards compatibility fields
    insights.coreDiagnosis = {
      governingThought: insights.ahaMoment.headline,
      thesis: insights.ahaMoment.explanation,
      evidenceChain: insights.ahaMoment.evidence.map(e => ({ quote: e, interpretation: '' }))
    };
    insights.rootCauseAnalysis = {
      surfaceSymptom: insights.rootCause.surface,
      intermediateIssue: insights.rootCause.underlying,
      rootCause: insights.rootCause.root,
      explanation: insights.ahaMoment.explanation,
      supportingEvidence: insights.rootCause.howWeKnow
    };

    return insights;
  } catch (error) {
    console.error('Premium insights generation failed:', error);
    throw error;
  }
}

// ============================================================================
// FALLBACK GENERATOR
// ============================================================================

export function generateFallbackInsights(
  companyName: string,
  contactName: string,
  responses: Record<string, string | string[] | number>,
  scores: {
    total: number;
    percentage: number;
    band: string;
    bandLabel: string;
    dimensions: { dimension: string; label: string; score: number; maxScore: number; percentage: number; interpretation: string }[];
  },
  assessmentId: string
): PremiumReportInsights {
  const profile = extractBusinessProfile(responses);
  const weakest = [...scores.dimensions].sort((a, b) => a.percentage - b.percentage)[0];

  return {
    generatedAt: new Date().toISOString(),
    assessmentId,
    companyName,
    contactName,
    businessProfile: {
      revenue: profile.annualRevenue,
      employees: profile.employeeCount,
      industry: profile.industry,
      ownerHourlyValue: profile.ownerHourlyRate,
      revenueGoal: profile.revenueGoal,
      biggestConstraint: profile.revenueConstraint,
    },
    ahaMoment: {
      headline: `Your ${weakest.label.toLowerCase()} is creating a ceiling on growth`,
      explanation: `Based on your assessment, ${weakest.label} scored ${weakest.percentage}% - this is likely the root constraint limiting your progress toward "${profile.revenueGoal}".`,
      evidence: ['Assessment data analyzed'],
      implication: `Without addressing ${weakest.label.toLowerCase()}, reaching your goal will be significantly harder.`,
    },
    executiveSummary: {
      verdict: `${companyName} has operational gaps that need addressing for sustainable growth.`,
      readinessScore: scores.percentage,
      readinessLevel: scores.bandLabel,
      inOneYear: `If nothing changes, ${weakest.label.toLowerCase()} issues will continue constraining growth.`,
      ifYouAct: `Addressing ${weakest.label.toLowerCase()} could unlock significant capacity.`
    },
    rootCause: {
      surface: profile.revenueConstraint || 'Operational constraints',
      underlying: `Low ${weakest.label} score indicates systemic issues`,
      root: 'Foundation work needed in core operations',
      howWeKnow: ['Assessment scores indicate this pattern']
    },
    dimensionInsights: scores.dimensions.map(dim => ({
      dimension: dim.dimension,
      label: dim.label,
      score: dim.score,
      maxScore: dim.maxScore,
      percentage: dim.percentage,
      interpretation: dim.interpretation as 'critical' | 'needs-work' | 'stable' | 'strong',
      diagnosis: `${dim.label} at ${dim.percentage}% indicates ${dim.interpretation} performance.`,
      yourQuote: 'See detailed responses',
      whatThisCosts: 'Analysis pending',
      quickFix: 'Review responses and identify specific improvements.'
    })),
    financialImpact: {
      totalOpportunityCost: 0,
      calculations: [],
      bottomLine: 'Full financial analysis requires AI processing. Schedule a strategy session for detailed impact analysis.'
    },
    epImplementations: [{
      title: 'Operations Foundation',
      whatEPBuilds: 'Core systems and documentation',
      yourProblem: profile.revenueConstraint || 'Operational efficiency',
      outcome: 'Structured foundation for scale',
      timeframe: '4-6 weeks',
      investmentRange: 'Custom quote needed'
    }],
    actionPlan: {
      thisWeek: [{
        action: 'Review this assessment with your team',
        why: 'Alignment on current state enables focused improvement',
        steps: ['Share assessment', 'Discuss scores', 'Identify quick wins'],
        timeRequired: '1 hour',
        cost: '$0',
        result: 'Team alignment on priorities',
        canEPDoThis: true
      }],
      thisMonth: []
    },
    nextSteps: {
      diy: {
        title: 'Self-Implementation',
        description: 'Use this assessment to guide your own improvements.',
        forYouIf: 'You have time and internal capacity',
        epRole: 'Hourly consulting available if needed'
      },
      jumpstart: {
        title: 'EP Jumpstart',
        description: 'EP builds the operational foundation for you.',
        forYouIf: 'You want fast results without the learning curve',
        investment: '$5,000 - $15,000'
      },
      partnership: {
        title: 'Ongoing Partnership',
        description: 'EP as your fractional operations team.',
        forYouIf: 'You want ongoing operational excellence',
        investment: 'Starting at $2,500/month'
      }
    },
    // Backwards compatibility
    coreDiagnosis: {
      governingThought: `Your ${weakest.label.toLowerCase()} is creating a ceiling on growth`,
      thesis: `Based on your assessment, ${weakest.label} scored ${weakest.percentage}%.`,
      evidenceChain: [{ quote: 'Assessment data analyzed', interpretation: '' }]
    },
    rootCauseAnalysis: {
      surfaceSymptom: profile.revenueConstraint || 'Operational constraints',
      intermediateIssue: `Low ${weakest.label} score`,
      rootCause: 'Foundation work needed',
      explanation: 'The assessment reveals this as the priority area.',
      supportingEvidence: ['Assessment scores indicate this pattern']
    }
  };
}

// ============================================================================
// MAIN EXPORT WITH FALLBACK
// ============================================================================

export async function generateInsightsWithFallback(
  companyName: string,
  contactName: string,
  responses: Record<string, string | string[] | number>,
  scores: {
    total: number;
    percentage: number;
    band: string;
    bandLabel: string;
    dimensions: { dimension: string; label: string; score: number; maxScore: number; percentage: number; interpretation: string }[];
  },
  assessmentId: string
): Promise<PremiumReportInsights> {
  try {
    return await generatePremiumInsights(companyName, contactName, responses, scores, assessmentId);
  } catch (error) {
    console.error('AI generation failed, using fallback:', error);
    return generateFallbackInsights(companyName, contactName, responses, scores, assessmentId);
  }
}
