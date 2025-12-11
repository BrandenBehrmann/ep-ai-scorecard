// Pragma Score Premium Insights Generator
// $1,500 Value Assessment - McKinsey-Style Business Diagnostic
// Hypothesis-Led Analysis with Pyramid Principle Structure

import OpenAI from 'openai';

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
// TYPE DEFINITIONS - Simplified for Focused Output
// ============================================================================

export interface CoreDiagnosis {
  governingThought: string; // The ONE insight that explains everything
  thesis: string; // 2-3 sentence hypothesis about their business
  evidenceChain: {
    quote: string;
    interpretation: string;
  }[];
}

export interface RootCauseAnalysis {
  surfaceSymptom: string;
  intermediateIssue: string;
  rootCause: string;
  explanation: string;
  supportingEvidence: string[];
}

export interface FinancialQuantification {
  item: string;
  calculation: string; // Show the actual math
  annualImpact: number;
  confidence: 'high' | 'medium' | 'estimate';
}

export interface ActionItem {
  action: string;
  why: string;
  howTo: string[];
  timeRequired: string;
  cost: string;
  expectedResult: string;
  prerequisite: string | null;
}

export interface DimensionAnalysis {
  dimension: string;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  interpretation: 'critical' | 'needs-work' | 'stable' | 'strong';
  diagnosis: string; // 2-3 sentences of ACTUAL insight
  keyEvidence: string; // Their exact quoted answer
  whatThisMeans: string; // Business implication
  immediateAction: string; // ONE specific action
}

export interface PremiumReportInsights {
  generatedAt: string;
  assessmentId: string;
  companyName: string;
  contactName: string;

  // THE CORE (Pyramid Principle - Start with the answer)
  executiveSummary: {
    verdict: string; // 1 sentence truth
    readinessScore: number; // Use the ACTUAL calculated score
    readinessLevel: string;
    inOneYear: string; // "If nothing changes, in 12 months..."
    ifYouAct: string; // "If you address the root cause..."
  };

  // THE DIAGNOSIS
  coreDiagnosis: CoreDiagnosis;
  rootCauseAnalysis: RootCauseAnalysis;

  // THE DIMENSIONS (Using ACTUAL scores)
  dimensionInsights: DimensionAnalysis[];

  // THE MONEY (Real math, not fluff)
  financialImpact: {
    totalAnnualWaste: number;
    calculations: FinancialQuantification[];
    assumptions: string[];
    conservativeNote: string;
  };

  // THE PLAN (Sequential, dependent actions)
  actionPlan: {
    thisWeek: ActionItem[];
    thisMonth: ActionItem[];
    thisQuarter: ActionItem[];
    dependencies: string[]; // "Do X before Y because..."
  };

  // THE TOOLS (Only what they actually need)
  toolStack: {
    tool: string;
    monthlyPrice: string;
    whyThisTool: string; // Tied to their specific problem
    alternative: string;
    setupInstructions: string;
  }[];

  // THE OPTIONS (Clear paths forward)
  nextSteps: {
    optionA: {
      name: string;
      description: string;
      whoItsFor: string;
    };
    optionB: {
      name: string;
      description: string;
      whoItsFor: string;
    };
    optionC: {
      name: string;
      description: string;
      whoItsFor: string;
    };
  };

  // For EP team manual additions
  epRecommendations?: {
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    placeholder: boolean;
  }[];
}

// ============================================================================
// QUESTION LABELS FOR CONTEXT
// ============================================================================

const questionLabels: Record<string, string> = {
  'control-1': 'What breaks if you take 2 weeks off?',
  'control-2': 'How much of your core business process is documented?',
  'control-3': 'Recovery time if top performer quits',
  'control-4': 'Percentage of decisions requiring owner approval',
  'control-5': 'Critical functions bottlenecked by single person',
  'control-6': 'How often projects stall due to unavailability',
  'clarity-1': 'Do you know current monthly revenue without checking?',
  'clarity-2': 'How do you track project/order status?',
  'clarity-3': 'How quickly can anyone answer "where\'s my order?"',
  'clarity-4': 'How do you know if an employee is performing well?',
  'clarity-5': 'Where does your critical business data live?',
  'clarity-6': 'How often are you surprised by visible problems?',
  'leverage-1': 'Revenue per employee',
  'leverage-2': 'Percentage of time on repetitive tasks',
  'leverage-3': 'Most time-consuming manual process',
  'leverage-4': 'Time IN the business vs ON the business',
  'leverage-5': 'What would you 10x without adding headcount?',
  'leverage-6': 'Recurring vs new customer revenue',
  'friction-1': '#1 frustration in daily operations',
  'friction-2': 'Same info entered into multiple systems',
  'friction-3': 'Time to onboard new employee',
  'friction-4': 'Top 3 reasons work gets stuck',
  'friction-5': 'Time per week looking for information',
  'friction-6': 'How often do mistakes require rework?',
  'change-1': 'Last successful system or process change',
  'change-2': 'What happened with last tool implementation?',
  'change-3': 'Team attitude toward new technology',
  'change-4': 'Who owns and champions new implementations?',
  'change-5': 'Biggest barrier to operational improvements',
  'change-6': 'How quickly could you act on high-ROI improvement?',
  'ai-invest-1': 'How do you currently track AI/automation tool spending?',
  'ai-invest-2': 'Current monthly spending on AI tools',
  'ai-invest-3': 'Is there a dedicated budget for AI initiatives?',
  'ai-invest-4': 'How do you evaluate ROI on AI investments?',
  'ai-invest-5': 'Confidence in estimating AI implementation costs',
  'ai-invest-6': 'Biggest concerns about AI costs',
};

// ============================================================================
// HELPER FUNCTIONS
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
    formatted.push(`Q: ${label}\nA: "${displayValue}"`);
  }
  return formatted.join('\n\n');
}

// ============================================================================
// MAIN AI GENERATION FUNCTION
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

  const formattedResponses = formatResponsesForPrompt(responses);

  // Pre-format dimension data so AI doesn't hallucinate scores
  const dimensionData = scores.dimensions.map(d =>
    `${d.label}: ${d.score}/${d.maxScore} (${d.percentage}%) - ${d.interpretation.toUpperCase()}`
  ).join('\n');

  const systemPrompt = `You are a senior McKinsey-trained business diagnostician. Your job is to find the ONE root cause that explains multiple symptoms in their business.

## YOUR METHODOLOGY

### The Pyramid Principle
Start with the answer. Your governing thought should explain 80% of what's wrong. Everything else supports that one insight.

### Hypothesis-Led Diagnosis
1. Form a hypothesis about the root cause
2. Find evidence in their answers that proves/disproves it
3. Trace surface symptoms back to the root
4. Quantify the impact with real math

### What Makes This Worth $1,500
- NOT reformatting their answers back to them
- NOT generic recommendations anyone could give
- NOT impressive-sounding numbers without math
- YES finding patterns THEY couldn't see
- YES connecting dots between different answers
- YES specific actions with clear ROI
- YES being honest about what we don't know

## CRITICAL RULES

### On Scores
The scores are ALREADY CALCULATED. You MUST use these exact numbers:
- Overall: ${scores.percentage}% (${scores.bandLabel})
${dimensionData}

DO NOT generate different scores. These numbers are final.

### On Financial Calculations
Show your math. Example:
- BAD: "You're losing $50,000 per year"
- GOOD: "Owner time on $50/hr work: 10 hrs/week × $150 opportunity cost × 48 weeks = $72,000/year"

Use these rates:
- Owner opportunity cost: $150/hour
- Senior employee: $75/hour
- General employee: $50/hour
- Work weeks per year: 48

Be CONSERVATIVE. It's better to underestimate than overpromise.

### On Recommendations
Every tool recommendation must include:
- Actual monthly price (Dec 2025 pricing)
- Why THIS tool for THEIR specific problem (quote their answer)
- Setup time in hours
- A cheaper alternative

### On the Root Cause
Find ONE thing that, if fixed, would improve multiple dimensions. This is the insight worth $1,500.

Example pattern: "You said projects stall when you're unavailable AND your top frustration is giving people their to-dos AND critical data lives in employee knowledge. These aren't three problems—they're one: your business runs on verbal instructions instead of documented systems."

### On Tone
- Direct, not diplomatic
- Specific, not vague
- Honest about uncertainty
- Zero consulting buzzwords
- Talk like a smart friend who runs businesses`;

  const userPrompt = `BUSINESS DIAGNOSTIC: ${companyName}
Contact: ${contactName}

=== CALCULATED SCORES (USE THESE EXACTLY) ===
Overall: ${scores.total}/100 (${scores.percentage}%)
Band: ${scores.bandLabel}

Dimensions:
${dimensionData}

=== THEIR EXACT RESPONSES ===
${formattedResponses}

---

Analyze this data and return JSON with this structure:

{
  "generatedAt": "${new Date().toISOString()}",
  "assessmentId": "${assessmentId}",
  "companyName": "${companyName}",
  "contactName": "${contactName}",

  "executiveSummary": {
    "verdict": "One sentence truth about their business state",
    "readinessScore": ${scores.percentage},
    "readinessLevel": "${scores.bandLabel}",
    "inOneYear": "If nothing changes, in 12 months [specific consequence based on their answers]",
    "ifYouAct": "If you address [root cause], you could [specific benefit with estimated impact]"
  },

  "coreDiagnosis": {
    "governingThought": "The ONE insight that explains 80% of their problems",
    "thesis": "2-3 sentence hypothesis: 'Based on your responses, [company] is [diagnosis]. The root cause is [X], which manifests as [symptom 1], [symptom 2], and [symptom 3].'",
    "evidenceChain": [
      {"quote": "Their exact words from a response", "interpretation": "What this actually reveals about their business"},
      {"quote": "Another exact quote", "interpretation": "How this connects to the pattern"},
      {"quote": "Third quote", "interpretation": "Why this confirms the diagnosis"}
    ]
  },

  "rootCauseAnalysis": {
    "surfaceSymptom": "What they probably THINK the problem is",
    "intermediateIssue": "What's actually causing that symptom",
    "rootCause": "The underlying issue they need to fix",
    "explanation": "2-3 sentences explaining the causal chain",
    "supportingEvidence": ["Quote 1 that proves this", "Quote 2", "Quote 3"]
  },

  "dimensionInsights": [
    {
      "dimension": "control",
      "label": "Control",
      "score": ${scores.dimensions.find(d => d.dimension === 'control')?.score || 0},
      "maxScore": ${scores.dimensions.find(d => d.dimension === 'control')?.maxScore || 17},
      "percentage": ${scores.dimensions.find(d => d.dimension === 'control')?.percentage || 0},
      "interpretation": "${scores.dimensions.find(d => d.dimension === 'control')?.interpretation || 'needs-work'}",
      "diagnosis": "2-3 sentences of REAL insight about what this score means for THEM specifically",
      "keyEvidence": "Quote their most revealing answer for this dimension",
      "whatThisMeans": "The business implication they might not have considered",
      "immediateAction": "ONE specific action they can take this week"
    },
    // ... repeat for all 6 dimensions using the EXACT scores provided above
  ],

  "financialImpact": {
    "totalAnnualWaste": (number - sum of all calculations),
    "calculations": [
      {
        "item": "Specific waste item based on their answers",
        "calculation": "X hrs/week × $Y/hr × 48 weeks",
        "annualImpact": (number),
        "confidence": "high|medium|estimate"
      }
    ],
    "assumptions": ["List the assumptions behind your calculations"],
    "conservativeNote": "These estimates are conservative because [reason]. Actual impact could be [X]% higher."
  },

  "actionPlan": {
    "thisWeek": [
      {
        "action": "Specific action",
        "why": "Why this matters (tied to their specific problem)",
        "howTo": ["Step 1", "Step 2", "Step 3"],
        "timeRequired": "X hours",
        "cost": "$0 or specific cost",
        "expectedResult": "What they'll have when done",
        "prerequisite": null or "Must complete X first"
      }
    ],
    "thisMonth": [...],
    "thisQuarter": [...],
    "dependencies": ["Do X before Y because...", "Complete A before starting B because..."]
  },

  "toolStack": [
    {
      "tool": "Tool Name",
      "monthlyPrice": "$X/month (or Free tier)",
      "whyThisTool": "Because you said '[quote their answer]', you need [specific capability]. This tool does that.",
      "alternative": "Alternative Tool ($X/mo) if budget is tight",
      "setupInstructions": "Go to [URL], create account, do [specific first step]"
    }
  ],

  "nextSteps": {
    "optionA": {
      "name": "Self-Implementation",
      "description": "Take this report and run. You have everything you need to execute the action plan yourself.",
      "whoItsFor": "Business owners with 4+ hours/week to dedicate AND a team member who can own implementation"
    },
    "optionB": {
      "name": "EP Jumpstart",
      "description": "EP implements Phase 1 (the foundation) in 2 weeks. You get the systems without the learning curve.",
      "whoItsFor": "Business owners who want results fast and would rather invest money than time"
    },
    "optionC": {
      "name": "Ongoing Partnership",
      "description": "Monthly partnership: EP handles implementation, optimization, and new initiatives as your fractional operations team.",
      "whoItsFor": "Growing businesses that need operational expertise but aren't ready for full-time ops hire"
    }
  },

  "epRecommendations": [
    {
      "id": "ep-1",
      "title": "[EP TEAM WILL ADD]",
      "description": "Placeholder for manual insights from the EP team",
      "priority": "high",
      "placeholder": true
    }
  ]
}

CRITICAL REMINDERS:
1. Use the EXACT scores provided. Do not generate different numbers.
2. Quote their actual words at least 8 times. This is how they know you read their answers.
3. Show math for every financial calculation. No unexplained numbers.
4. The governing thought should connect at least 3 different symptoms to ONE root cause.
5. Every tool recommendation must tie to a specific quote from their answers.
6. Be honest about confidence levels. "Estimate" is fine when you're extrapolating.`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5, // Lower temperature for more consistent output
      max_tokens: 8000, // Reduced - focused output doesn't need 16k
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const insights = JSON.parse(content) as PremiumReportInsights;

    // FORCE the correct scores - AI sometimes ignores instructions
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
  const weakest = [...scores.dimensions].sort((a, b) => a.percentage - b.percentage)[0];
  const strongest = [...scores.dimensions].sort((a, b) => b.percentage - a.percentage)[0];

  return {
    generatedAt: new Date().toISOString(),
    assessmentId,
    companyName,
    contactName,
    executiveSummary: {
      verdict: `${companyName} has foundation gaps that need addressing before scaling.`,
      readinessScore: scores.percentage,
      readinessLevel: scores.bandLabel,
      inOneYear: `If nothing changes, ${weakest.label.toLowerCase()} issues will continue constraining growth.`,
      ifYouAct: `Addressing ${weakest.label.toLowerCase()} could unlock significant operational capacity.`
    },
    coreDiagnosis: {
      governingThought: `The business is constrained by ${weakest.label.toLowerCase()} issues.`,
      thesis: `Based on the assessment, ${companyName} scores ${scores.percentage}% on operational readiness. The primary constraint is ${weakest.label} (${weakest.percentage}%), which limits growth potential.`,
      evidenceChain: [
        { quote: 'See responses', interpretation: 'Full AI analysis unavailable - using calculated scores' }
      ]
    },
    rootCauseAnalysis: {
      surfaceSymptom: `Low ${weakest.label} score (${weakest.percentage}%)`,
      intermediateIssue: 'Systemic gaps in this area',
      rootCause: 'Foundation work needed',
      explanation: 'The assessment reveals this as the priority area for improvement.',
      supportingEvidence: ['Assessment score data']
    },
    dimensionInsights: scores.dimensions.map(dim => ({
      dimension: dim.dimension,
      label: dim.label,
      score: dim.score,
      maxScore: dim.maxScore,
      percentage: dim.percentage,
      interpretation: dim.interpretation as 'critical' | 'needs-work' | 'stable' | 'strong',
      diagnosis: `${dim.label} at ${dim.percentage}% indicates ${dim.interpretation} performance.`,
      keyEvidence: 'See detailed responses',
      whatThisMeans: dim.percentage < 50 ? 'This area needs immediate attention.' : 'This area is functioning adequately.',
      immediateAction: 'Review responses and identify specific improvements.'
    })),
    financialImpact: {
      totalAnnualWaste: 0,
      calculations: [],
      assumptions: ['Full financial analysis requires AI processing'],
      conservativeNote: 'Schedule strategy session for detailed financial impact analysis.'
    },
    actionPlan: {
      thisWeek: [{
        action: 'Review this assessment with your team',
        why: 'Alignment on current state enables focused improvement',
        howTo: ['Share assessment', 'Discuss scores', 'Identify quick wins'],
        timeRequired: '1 hour',
        cost: '$0',
        expectedResult: 'Team alignment on priorities',
        prerequisite: null
      }],
      thisMonth: [],
      thisQuarter: [],
      dependencies: ['Complete team review before starting improvements']
    },
    toolStack: [
      {
        tool: 'Notion',
        monthlyPrice: 'Free tier available',
        whyThisTool: 'Central hub for documentation and processes',
        alternative: 'Google Docs (Free)',
        setupInstructions: 'Go to notion.so, create workspace, start with Team Wiki template'
      }
    ],
    nextSteps: {
      optionA: {
        name: 'Self-Implementation',
        description: 'Use this assessment to guide your own improvements.',
        whoItsFor: 'Teams with capacity to drive change internally'
      },
      optionB: {
        name: 'EP Jumpstart',
        description: 'Let EP implement the foundation in 2 weeks.',
        whoItsFor: 'Businesses that want fast results'
      },
      optionC: {
        name: 'Ongoing Partnership',
        description: 'Monthly operational partnership with EP.',
        whoItsFor: 'Growing businesses needing ongoing support'
      }
    },
    epRecommendations: [{
      id: 'ep-1',
      title: '[EP TEAM WILL ADD]',
      description: 'Placeholder for manual insights',
      priority: 'high',
      placeholder: true
    }]
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
