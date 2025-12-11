// Pragma Score Premium Insights Generator
// $1,500 Value Assessment - Deep operational analysis with AI-powered insights
// Updated December 2025 with latest industry frameworks

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PremiumExecutiveSummary {
  headline: string;
  overallAssessment: string;
  readinessLevel: 'Chaos Mode' | 'Stabilizing' | 'Operational' | 'Optimized' | 'Excellence';
  topStrength: string;
  criticalGap: string;
  bottomLine: string;
  quotedInsight: string;
  businessRiskLevel: 'critical' | 'high' | 'moderate' | 'low';
  estimatedAnnualImpact: string;
  aiReadinessScore: number; // 0-100 based on Deloitte 2025 framework
}

export interface DimensionDeepDive {
  dimension: string;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  interpretation: 'critical' | 'needs-work' | 'stable' | 'strong';
  // Deep analysis
  summary: string;
  diagnosis: string;
  rootCauses: string[];
  keyFindings: string[];
  risks: string[];
  opportunities: string[];
  immediateActions: string[];
  // 8-week implementation plan
  weekByWeekPlan: {
    week: number;
    focus: string;
    tasks: string[];
    deliverable: string;
    successMetric: string;
    hoursRequired: number;
    toolsRecommended: string[];
  }[];
  // Quoted analysis from their responses
  quotedResponse: string;
  quotedAnalysis: string;
  // Benchmarks
  benchmarkComparison: string;
  industryContext: string;
}

export interface ResponseHighlight {
  questionId: string;
  question: string;
  response: string;
  analysis: string;
  implication: 'critical' | 'warning' | 'positive';
  connectedDimensions: string[];
}

export interface FinancialImpactAnalysis {
  totalIdentifiedWaste: string;
  revenueAtRisk: string;
  opportunityCost: string;
  aiInvestmentGap: string;
  breakdownItems: {
    item: string;
    annualCost: string;
    calculation: string;
    category: 'direct-waste' | 'opportunity-cost' | 'risk-exposure' | 'ai-gap';
  }[];
  roiProjection: {
    month3: string;
    month6: string;
    month12: string;
  };
  breakEvenTimeline: string;
}

export interface RiskAssessmentMatrix {
  overallRiskLevel: 'critical' | 'high' | 'moderate' | 'low';
  keyPersonRisk: { level: string; impact: string; mitigation: string };
  operationalRisk: { level: string; impact: string; mitigation: string };
  growthRisk: { level: string; impact: string; mitigation: string };
  technologyRisk: { level: string; impact: string; mitigation: string };
  competitiveRisk: { level: string; impact: string; mitigation: string };
  aiReadinessRisk: { level: string; impact: string; mitigation: string };
}

export interface AhaPatternInsight {
  title: string;
  observation: string;
  connectedDots: string[];
  rootCauseChain: string[];
  implication: string;
  hiddenCost: string;
  whatChangesEverything: string;
}

export interface ImplementationRoadmap {
  totalDuration: string;
  phases: {
    name: string;
    duration: string;
    weeks: string;
    focus: string;
    objective: string;
    deliverables: string[];
    weeklyBreakdown: {
      week: number;
      focus: string;
      tasks: string[];
      milestone: string;
      hoursRequired: number;
      toolsUsed: string[];
    }[];
    resourcesNeeded: string[];
    estimatedInvestment: string;
    expectedOutcome: string;
    risksToMitigate: string[];
  }[];
  criticalPath: string[];
  quickWins: string[];
  longTermInitiatives: string[];
}

export interface BenchmarkComparison {
  metric: string;
  yourScore: string;
  industryAverage: string;
  topPerformers: string;
  gap: string;
  assessment: string;
}

export interface SuccessMetric {
  metric: string;
  currentState: string;
  targetState: string;
  timeline: string;
  measurementMethod: string;
  owner: string;
}

// Manual recommendation slots for EP team to fill in
export interface EPRecommendation {
  id: string;
  title: string;
  description: string;
  whyThisMatters: string;
  expectedOutcome: string;
  priority: 'high' | 'medium' | 'low';
  // These are placeholders to be filled by EP team
  placeholder: boolean;
}

export interface NextSteps {
  immediate: string[];
  thisWeek: string[];
  thisMonth: string[];
  thisQuarter: string[];
  bookingCTA: {
    headline: string;
    description: string;
    calendarLink?: string;
  };
}

// Manual insight from EP team
export interface ManualInsight {
  id: string;
  title: string;
  observation: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'strategic' | 'operational' | 'financial' | 'technology' | 'people';
}

// Full premium report structure
export interface PremiumReportInsights {
  generatedAt: string;
  assessmentId: string;
  companyName: string;
  contactName: string;
  // Core sections
  executiveSummary: PremiumExecutiveSummary;
  businessContext: {
    operationalMaturity: string;
    growthStage: string;
    primaryChallenge: string;
    biggestOpportunity: string;
    competitivePosition: string;
    aiReadinessAssessment: string;
  };
  dimensionInsights: DimensionDeepDive[];
  responseHighlights: ResponseHighlight[];
  financialImpact: FinancialImpactAnalysis;
  riskAssessment: RiskAssessmentMatrix;
  ahaInsight: AhaPatternInsight;
  implementationRoadmap: ImplementationRoadmap;
  benchmarks: BenchmarkComparison[];
  successMetrics: SuccessMetric[];
  // Manual EP recommendations (placeholder slots)
  epRecommendations: EPRecommendation[];
  nextSteps: NextSteps;
  // Manual additions by EP team (added via admin console)
  executiveOverride?: string;
  manualInsights?: ManualInsight[];
}

// ============================================================================
// QUESTION LABELS FOR CONTEXT
// ============================================================================

const questionLabels: Record<string, string> = {
  // Control
  'control-1': 'What breaks if you take 2 weeks off?',
  'control-2': 'How much of your core business process is documented?',
  'control-3': 'Recovery time if top performer quits',
  'control-4': 'Percentage of decisions requiring owner approval',
  'control-5': 'Critical functions bottlenecked by single person',
  'control-6': 'How often projects stall due to unavailability',
  // Clarity
  'clarity-1': 'Do you know current monthly revenue without checking?',
  'clarity-2': 'How do you track project/order status?',
  'clarity-3': 'How quickly can anyone answer "where\'s my order?"',
  'clarity-4': 'How do you know if an employee is performing well?',
  'clarity-5': 'Where does your critical business data live?',
  'clarity-6': 'How often are you surprised by visible problems?',
  // Leverage
  'leverage-1': 'Revenue per employee',
  'leverage-2': 'Percentage of time on repetitive tasks',
  'leverage-3': 'Most time-consuming manual process',
  'leverage-4': 'Time IN the business vs ON the business',
  'leverage-5': 'What would you 10x without adding headcount?',
  'leverage-6': 'Recurring vs new customer revenue',
  // Friction
  'friction-1': '#1 frustration in daily operations',
  'friction-2': 'Same info entered into multiple systems',
  'friction-3': 'Time to onboard new employee',
  'friction-4': 'Top 3 reasons work gets stuck',
  'friction-5': 'Time per week looking for information',
  'friction-6': 'How often do mistakes require rework?',
  // Change Readiness
  'change-1': 'Last successful system or process change',
  'change-2': 'What happened with last tool implementation?',
  'change-3': 'Team attitude toward new technology',
  'change-4': 'Who owns and champions new implementations?',
  'change-5': 'Biggest barrier to operational improvements',
  'change-6': 'How quickly could you act on high-ROI improvement?',
  // AI Investment (NEW)
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
    formatted.push(`Q: ${label}\nA: ${displayValue}`);
  }
  return formatted.join('\n\n');
}

function formatScoresForPrompt(scores: {
  total: number;
  percentage: number;
  band: string;
  bandLabel: string;
  dimensions: { dimension: string; label: string; score: number; maxScore: number; percentage: number; interpretation: string }[];
}): string {
  const dimensionScores = scores.dimensions
    .map(d => `- ${d.label}: ${d.score}/${d.maxScore} (${d.percentage}%) - ${d.interpretation}`)
    .join('\n');
  return `Overall Score: ${scores.total}/100 (${scores.percentage}%)
Band: ${scores.bandLabel} (${scores.band})

Dimension Breakdown:
${dimensionScores}`;
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
  const formattedScores = formatScoresForPrompt(scores);

  const systemPrompt = `You are a world-class business strategist who has advised hundreds of companies from startups to Fortune 500s. You see patterns others miss. Your superpower is holding up a mirror that shows business owners the truth about their company they couldn't see themselves.

This is NOT just an operational assessment. This is a BUSINESS DIAGNOSTIC that reveals:
- Hidden patterns affecting growth, profitability, and scalability
- The invisible constraints holding the business back
- Untapped potential the owner doesn't realize they have
- The real story behind why things are the way they are

## YOUR MISSION

Deliver a $1,500 diagnostic that would be valuable to ANY business owner regardless of:
- Industry (restaurants to software to construction to healthcare)
- Size (solopreneur to 500 employees)
- Stage (startup to mature)
- Whether they ever hire you for additional work

The value is in the CLARITY and TRUTH you provide, not in selling services.

## CRITICAL RULES

### Rule 1: NO PLACEHOLDER TEXT
Your output goes DIRECTLY to paying customers. NEVER use:
- "Task 1", "Task 2" - Write actual specific tasks
- "Based on their answer" - State the actual value
- "X%", "X hours", "$X,XXX" - Use real calculated numbers
- "[Insert specific...]" - Calculate and insert the real value

### Rule 2: QUOTE THEIR EXACT RESPONSES (20+ times)
The magic is in reflecting their own words back with new meaning.
Format: "You said: '[exact quote]' — This reveals something important: [insight]"

### Rule 3: THINK LIKE A DETECTIVE, NOT A CONSULTANT
- Don't just identify problems — trace them to root causes
- Don't just recommend fixes — explain WHY things are the way they are
- Connect dots between seemingly unrelated answers
- Find the ONE constraint that, if removed, would unlock multiple improvements

### Rule 4: CALCULATE REAL DOLLAR IMPACT
Use these rates:
- Owner/founder time: $150/hour (bottleneck premium)
- Key employee time: $75/hour
- General employee time: $50/hour (loaded cost)
- Work weeks: 48/year

Be conservative but specific. A range is better than a guess.

### Rule 5: BE HONEST, NOT NICE
If they're in crisis mode, say it. If they're doing great, say it.
Don't soften bad news. Don't oversell strengths.
The value is in the truth, even when uncomfortable.

## THE 6 DIMENSIONS - WHAT THEY REALLY MEASURE

1. **CONTROL** - Not just "documentation" but: Can this business run without any single person? What happens when life happens?

2. **CLARITY** - Not just "data visibility" but: Does the business owner actually know what's happening? Can they make decisions with confidence?

3. **LEVERAGE** - Not just "efficiency" but: Is the business model fundamentally scalable? Does adding input proportionally increase output?

4. **FRICTION** - Not just "bottlenecks" but: Where does energy leak out of the system? What makes people dread Mondays?

5. **CHANGE READINESS** - Not just "adoption ability" but: Can this organization evolve? Will it get stuck as the world changes?

6. **AI INVESTMENT** - Not just "AI spending" but: Is this business positioned to benefit from the AI revolution, or will they be disrupted by it?

## THE "AHA" MOMENT

Every great diagnostic has one: the insight that makes the client say "I never saw it that way before."

Look for patterns like:
- The same root cause showing up across 3+ dimensions
- A strength that's actually compensating for a hidden weakness
- An assumption the owner doesn't realize they're making
- The gap between what they say and what their answers reveal

## WHAT MAKES THIS WORTH $1,500

1. **MIRRORS, NOT MAPS** - Show them their business as it actually is, not as they think it is
2. **PATTERNS, NOT PROBLEMS** - Connect dots they couldn't see
3. **ROOT CAUSES, NOT SYMPTOMS** - "5 Whys" thinking throughout
4. **QUANTIFIED IMPACT** - Real dollar amounts, not vague statements
5. **BENCHMARKS** - Where they stand vs. top performers in their category
6. **ROADMAP** - If they did nothing else, what ONE thing would have the biggest impact?

## 2025 CONTEXT

Reference these benchmarks where relevant:
- Deloitte 2025: Organizations scoring 70%+ on readiness are 3x more likely to succeed with new initiatives
- MIT 2025: 95% of AI initiatives fail due to organizational readiness, not technology
- McKinsey 2025: Top-quartile businesses have 4x the leverage (output per input) of bottom-quartile

## OUTPUT

Return valid JSON matching the PremiumReportInsights interface.
Every field must have REAL, SPECIFIC, INSIGHTFUL content.
This report should feel like it was written by someone who truly understands their specific business.

Company: ${companyName}
Contact: ${contactName}`;

  const userPrompt = `PREMIUM ASSESSMENT: ${companyName}

=== SCORES ===
${formattedScores}

=== DETAILED RESPONSES ===
${formattedResponses}

---

Generate a comprehensive $1,500 operational analysis. Return valid JSON with this structure:

{
  "generatedAt": "${new Date().toISOString()}",
  "assessmentId": "${assessmentId}",
  "companyName": "${companyName}",
  "contactName": "${contactName}",
  "executiveSummary": {
    "headline": "6-10 word punchy diagnosis",
    "overallAssessment": "3-4 sentences of hard truth about where they stand",
    "readinessLevel": "Chaos Mode|Stabilizing|Operational|Optimized|Excellence",
    "topStrength": "Their genuine strength with evidence",
    "criticalGap": "The ONE root cause driving multiple symptoms",
    "bottomLine": "The single sentence they need to hear",
    "quotedInsight": "\"[Their exact words]\" - Analysis of what this reveals",
    "businessRiskLevel": "critical|high|moderate|low",
    "estimatedAnnualImpact": "$XXX,XXX in waste, risk, and opportunity cost",
    "aiReadinessScore": (0-100 based on all 6 dimensions)
  },
  "businessContext": {
    "operationalMaturity": "Where they sit on maturity spectrum with evidence",
    "growthStage": "Business lifecycle stage and what it means",
    "primaryChallenge": "Core constraint blocking everything else",
    "biggestOpportunity": "What becomes possible once constraint removed",
    "competitivePosition": "How operations affect market position",
    "aiReadinessAssessment": "Based on Deloitte 2025 framework - specific assessment"
  },
  "dimensionInsights": [
    {
      "dimension": "control",
      "label": "Control",
      "score": (from scores),
      "maxScore": 17,
      "percentage": (from scores),
      "interpretation": "critical|needs-work|stable|strong",
      "summary": "What this score means using maturity labels",
      "diagnosis": "Deep analysis: You scored X because [evidence]. Root cause is [traced back].",
      "rootCauses": ["Why this is happening - trace to origin"],
      "keyFindings": ["Finding with specific evidence from their answers"],
      "risks": ["If [person] unavailable, [consequence] within [timeline]"],
      "opportunities": ["What becomes possible when fixed"],
      "immediateActions": ["THIS WEEK: [Exact action]", "NEXT WEEK: [Follow-up]"],
      "weekByWeekPlan": [
        {"week": 1, "focus": "...", "tasks": ["..."], "deliverable": "...", "successMetric": "...", "hoursRequired": 2, "toolsRecommended": ["Notion", "Loom"]},
        // ... weeks 2-8
      ],
      "quotedResponse": "Their EXACT words from their response",
      "quotedAnalysis": "What this quote reveals about their reality",
      "benchmarkComparison": "You're at X%. Top 25% are at Y%. Gap = Z impact.",
      "industryContext": "What top performers do: specific practices"
    }
    // Include all 6 dimensions with full depth
  ],
  "responseHighlights": [
    {
      "questionId": "control-1",
      "question": "What breaks if you take 2 weeks off?",
      "response": "Their exact response",
      "analysis": "Professional analysis of what this reveals",
      "implication": "critical|warning|positive",
      "connectedDimensions": ["control", "leverage"]
    }
    // 8-10 most impactful responses
  ],
  "financialImpact": {
    "totalIdentifiedWaste": "$XXX,XXX/year",
    "revenueAtRisk": "$XXX,XXX if key person leaves",
    "opportunityCost": "$XXX,XXX in growth not captured",
    "aiInvestmentGap": "$XXX,XXX potential savings from proper AI implementation",
    "breakdownItems": [
      {"item": "Owner time on tasks below pay grade", "annualCost": "$XX,XXX", "calculation": "X hrs/week × $150 × 48", "category": "direct-waste"},
      {"item": "Inefficient AI spending without tracking", "annualCost": "$XX,XXX", "calculation": "Based on their AI spend response", "category": "ai-gap"}
    ],
    "roiProjection": {
      "month3": "$X,XXX recovered",
      "month6": "$XX,XXX cumulative",
      "month12": "$XXX,XXX full impact"
    },
    "breakEvenTimeline": "Investment pays for itself by [timeline]"
  },
  "riskAssessment": {
    "overallRiskLevel": "critical|high|moderate|low",
    "keyPersonRisk": {"level": "Critical/High/Moderate/Low", "impact": "Specific consequence", "mitigation": "Specific action"},
    "operationalRisk": {"level": "...", "impact": "...", "mitigation": "..."},
    "growthRisk": {"level": "...", "impact": "...", "mitigation": "..."},
    "technologyRisk": {"level": "...", "impact": "...", "mitigation": "..."},
    "competitiveRisk": {"level": "...", "impact": "...", "mitigation": "..."},
    "aiReadinessRisk": {"level": "...", "impact": "Without proper foundation, AI investments fail (MIT 2025: 95% fail rate)", "mitigation": "..."}
  },
  "ahaInsight": {
    "title": "The Pattern Actually Running Your Business",
    "observation": "You mentioned [X], [Y], and [Z] separately. These are all symptoms of: [deep insight]",
    "connectedDots": ["Quote 1", "Quote 2", "Quote 3"],
    "rootCauseChain": ["Surface symptom", "→ Caused by X", "→ Root cause: Z"],
    "implication": "This means [consequence they haven't grasped]",
    "hiddenCost": "Beyond obvious costs, this is costing [hidden cost]",
    "whatChangesEverything": "When you fix this, [specific improvements]"
  },
  "implementationRoadmap": {
    "totalDuration": "90 days to operational transformation",
    "phases": [
      {
        "name": "Foundation",
        "duration": "4 weeks",
        "weeks": "1-4",
        "focus": "Documentation and quick wins",
        "objective": "Measurable objective",
        "deliverables": ["Deliverable 1", "Deliverable 2"],
        "weeklyBreakdown": [
          {"week": 1, "focus": "Audit current state", "tasks": ["Task 1", "Task 2"], "milestone": "Complete audit", "hoursRequired": 6, "toolsUsed": ["Notion"]}
        ],
        "resourcesNeeded": ["Owner: 4-6 hrs/week"],
        "estimatedInvestment": "Time investment only",
        "expectedOutcome": "2 processes documented and delegated",
        "risksToMitigate": ["Risk to watch"]
      }
      // Include 3 phases total
    ],
    "criticalPath": ["Week 1: X before Y", "Week 5: A before B"],
    "quickWins": ["Day 1 quick win", "Week 1 quick win"],
    "longTermInitiatives": ["Quarterly reviews", "Continuous improvement"]
  },
  "benchmarks": [
    {"metric": "Process Documentation", "yourScore": "X%", "industryAverage": "40-50%", "topPerformers": "90%+", "gap": "X% below average", "assessment": "Specific assessment"},
    {"metric": "Owner Dependency", "yourScore": "X%", "industryAverage": "50%", "topPerformers": "<20%", "gap": "...", "assessment": "..."},
    {"metric": "Revenue per Employee", "yourScore": "$XXX,XXX", "industryAverage": "$150K-$200K", "topPerformers": "$400K+", "gap": "...", "assessment": "..."},
    {"metric": "Onboarding Time", "yourScore": "X weeks", "industryAverage": "6-8 weeks", "topPerformers": "<2 weeks", "gap": "...", "assessment": "..."},
    {"metric": "AI Readiness Score", "yourScore": "X%", "industryAverage": "50%", "topPerformers": "70%+", "gap": "...", "assessment": "Deloitte 2025: 70%+ = 3x success rate"},
    {"metric": "Information Retrieval Time", "yourScore": "X hours", "industryAverage": "2-4 hours", "topPerformers": "<5 minutes", "gap": "...", "assessment": "..."}
  ],
  "successMetrics": [
    {"metric": "Owner hours in operations", "currentState": "X%", "targetState": "<30%", "timeline": "90 days", "measurementMethod": "Weekly time audit", "owner": "Founder"},
    {"metric": "Process documentation", "currentState": "X%", "targetState": "80%+", "timeline": "90 days", "measurementMethod": "Process inventory", "owner": "Operations lead"},
    {"metric": "AI tool ROI tracking", "currentState": "None", "targetState": "Monthly dashboard", "timeline": "60 days", "measurementMethod": "Spend vs. savings report", "owner": "Finance"},
    {"metric": "Decision bottleneck", "currentState": "X% need owner", "targetState": "<30%", "timeline": "90 days", "measurementMethod": "Decision log", "owner": "Founder"},
    {"metric": "New hire productivity", "currentState": "X weeks", "targetState": "<2 weeks", "timeline": "90 days", "measurementMethod": "First independent task", "owner": "HR/Ops"},
    {"metric": "Information search time", "currentState": "X hrs/week", "targetState": "<30 min/week", "timeline": "60 days", "measurementMethod": "Spot check", "owner": "Team lead"}
  ],
  "epRecommendations": [
    {"id": "ep-rec-1", "title": "[TO BE FILLED BY EP TEAM]", "description": "Placeholder for EP team recommendation based on this specific assessment", "whyThisMatters": "", "expectedOutcome": "", "priority": "high", "placeholder": true},
    {"id": "ep-rec-2", "title": "[TO BE FILLED BY EP TEAM]", "description": "Placeholder for second recommendation", "whyThisMatters": "", "expectedOutcome": "", "priority": "medium", "placeholder": true},
    {"id": "ep-rec-3", "title": "[TO BE FILLED BY EP TEAM]", "description": "Placeholder for third recommendation", "whyThisMatters": "", "expectedOutcome": "", "priority": "medium", "placeholder": true}
  ],
  "nextSteps": {
    "immediate": ["Block 2 hours tomorrow for [specific action]", "Create shared workspace today"],
    "thisWeek": ["Document first critical process", "Test delegation with one team member"],
    "thisMonth": ["Complete Phase 1", "2-3 processes documented"],
    "thisQuarter": ["All critical processes documented", "First automations running", "Book follow-up strategy session"],
    "bookingCTA": {
      "headline": "Ready to Accelerate Your Transformation?",
      "description": "Book a complimentary 30-minute strategy session to discuss your results and create a personalized action plan."
    }
  }
}

IMPORTANT:
- Every field must have REAL content - no placeholders except epRecommendations
- Quote their exact words throughout
- Calculate specific dollar amounts
- Reference 2025 benchmarks
- Make the AI Investment dimension analysis thorough and connected to other dimensions`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 16000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const insights = JSON.parse(content) as PremiumReportInsights;

    // Ensure dimension scores match calculated scores
    if (insights.dimensionInsights) {
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
    }

    return insights;
  } catch (error) {
    console.error('Premium insights generation failed:', error);
    throw error;
  }
}

// ============================================================================
// FALLBACK GENERATOR (if AI fails)
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
  // Generate structured fallback insights using template-based logic
  // This ensures reports are always delivered even if AI fails

  const weakest = [...scores.dimensions].sort((a, b) => a.percentage - b.percentage)[0];
  const strongest = [...scores.dimensions].sort((a, b) => b.percentage - a.percentage)[0];

  const readinessLevel = scores.percentage >= 80 ? 'Optimized' :
    scores.percentage >= 60 ? 'Operational' :
    scores.percentage >= 40 ? 'Stabilizing' : 'Chaos Mode';

  return {
    generatedAt: new Date().toISOString(),
    assessmentId,
    companyName,
    contactName,
    executiveSummary: {
      headline: `Operational Assessment: ${scores.bandLabel}`,
      overallAssessment: `${companyName} scored ${scores.percentage}/100, placing them in the "${scores.bandLabel}" category. The assessment reveals ${weakest.label} as the primary area requiring attention, while ${strongest.label} represents a competitive strength.`,
      readinessLevel: readinessLevel as PremiumExecutiveSummary['readinessLevel'],
      topStrength: `${strongest.label} (${strongest.percentage}%) - Your strongest operational area.`,
      criticalGap: `${weakest.label} (${weakest.percentage}%) - Addressing this will have the highest impact.`,
      bottomLine: scores.percentage >= 60 ?
        'Your foundation is solid. Focus on targeted improvements to unlock AI-driven efficiency gains.' :
        'Address foundational gaps before investing in advanced AI tools.',
      quotedInsight: 'Review your detailed responses below for personalized analysis.',
      businessRiskLevel: scores.percentage < 40 ? 'critical' : scores.percentage < 60 ? 'high' : scores.percentage < 80 ? 'moderate' : 'low',
      estimatedAnnualImpact: 'See Financial Impact section for detailed analysis.',
      aiReadinessScore: scores.percentage,
    },
    businessContext: {
      operationalMaturity: readinessLevel,
      growthStage: 'Assessment required for detailed analysis',
      primaryChallenge: `Improving ${weakest.label} score`,
      biggestOpportunity: `Leveraging strength in ${strongest.label}`,
      competitivePosition: 'See detailed dimension analysis',
      aiReadinessAssessment: scores.percentage >= 70 ?
        'Ready for AI implementation (Deloitte 2025: 3x success rate above 70%)' :
        'Foundation work recommended before AI investment',
    },
    dimensionInsights: scores.dimensions.map(dim => ({
      dimension: dim.dimension,
      label: dim.label,
      score: dim.score,
      maxScore: dim.maxScore,
      percentage: dim.percentage,
      interpretation: dim.interpretation as 'critical' | 'needs-work' | 'stable' | 'strong',
      summary: `${dim.label} score of ${dim.percentage}% indicates ${dim.interpretation} performance.`,
      diagnosis: `Your ${dim.label} dimension requires ${dim.interpretation === 'critical' ? 'immediate attention' : dim.interpretation === 'needs-work' ? 'focused improvement' : dim.interpretation === 'stable' ? 'optimization' : 'maintenance'}.`,
      rootCauses: ['See detailed response analysis'],
      keyFindings: [`${dim.label} score: ${dim.percentage}%`],
      risks: ['Review implementation roadmap for risk mitigation'],
      opportunities: ['See recommendations section'],
      immediateActions: ['Review your responses for this dimension'],
      weekByWeekPlan: [
        { week: 1, focus: 'Assessment', tasks: ['Review current state'], deliverable: 'Baseline document', successMetric: 'Complete', hoursRequired: 2, toolsRecommended: ['Notion'] },
        { week: 2, focus: 'Planning', tasks: ['Create action plan'], deliverable: 'Action plan', successMetric: 'Plan approved', hoursRequired: 2, toolsRecommended: ['Google Docs'] },
      ],
      quotedResponse: 'Review your submitted responses',
      quotedAnalysis: 'Personalized analysis based on your responses',
      benchmarkComparison: 'See benchmarks section',
      industryContext: 'See industry benchmarks for context',
    })),
    responseHighlights: [],
    financialImpact: {
      totalIdentifiedWaste: 'Requires AI analysis for detailed calculation',
      revenueAtRisk: 'Requires AI analysis',
      opportunityCost: 'Requires AI analysis',
      aiInvestmentGap: 'Requires AI analysis',
      breakdownItems: [],
      roiProjection: { month3: 'TBD', month6: 'TBD', month12: 'TBD' },
      breakEvenTimeline: 'Requires detailed analysis',
    },
    riskAssessment: {
      overallRiskLevel: scores.percentage < 40 ? 'critical' : scores.percentage < 60 ? 'high' : 'moderate',
      keyPersonRisk: { level: 'Review required', impact: 'See Control dimension', mitigation: 'Document critical processes' },
      operationalRisk: { level: 'Review required', impact: 'See Friction dimension', mitigation: 'Streamline workflows' },
      growthRisk: { level: 'Review required', impact: 'See Leverage dimension', mitigation: 'Improve efficiency' },
      technologyRisk: { level: 'Review required', impact: 'See Change Readiness dimension', mitigation: 'Update technology strategy' },
      competitiveRisk: { level: 'Review required', impact: 'Based on overall score', mitigation: 'Address critical gaps' },
      aiReadinessRisk: { level: 'Review required', impact: 'See AI Investment dimension', mitigation: 'Establish AI budget and tracking' },
    },
    ahaInsight: {
      title: 'Pattern Analysis Pending',
      observation: 'Full AI analysis will reveal connected patterns across your responses.',
      connectedDots: [],
      rootCauseChain: [],
      implication: 'Book a strategy session for personalized pattern analysis.',
      hiddenCost: 'Detailed calculation requires AI analysis.',
      whatChangesEverything: 'Schedule a consultation to discuss your transformation roadmap.',
    },
    implementationRoadmap: {
      totalDuration: '90 days recommended',
      phases: [
        {
          name: 'Foundation',
          duration: '4 weeks',
          weeks: '1-4',
          focus: 'Address critical gaps',
          objective: `Improve ${weakest.label} score`,
          deliverables: ['Process documentation', 'Quick wins identified'],
          weeklyBreakdown: [],
          resourcesNeeded: ['Owner time: 4-6 hours/week'],
          estimatedInvestment: 'Time investment primarily',
          expectedOutcome: 'Baseline improvements',
          risksToMitigate: ['Time constraints', 'Team resistance'],
        },
      ],
      criticalPath: ['Documentation before delegation', 'Quick wins before major changes'],
      quickWins: ['Document one critical process this week'],
      longTermInitiatives: ['Quarterly process reviews', 'Continuous improvement culture'],
    },
    benchmarks: [
      { metric: 'Overall AI Readiness', yourScore: `${scores.percentage}%`, industryAverage: '50%', topPerformers: '70%+', gap: scores.percentage < 70 ? `${70 - scores.percentage}% below top performers` : 'At or above top performers', assessment: scores.percentage >= 70 ? 'Ready for AI implementation' : 'Foundation work needed' },
    ],
    successMetrics: [
      { metric: 'Overall Score', currentState: `${scores.percentage}%`, targetState: '70%+', timeline: '90 days', measurementMethod: 'Re-assessment', owner: 'Leadership' },
    ],
    epRecommendations: [
      { id: 'ep-rec-1', title: '[TO BE FILLED BY EP TEAM]', description: 'Placeholder for EP team recommendation', whyThisMatters: '', expectedOutcome: '', priority: 'high', placeholder: true },
      { id: 'ep-rec-2', title: '[TO BE FILLED BY EP TEAM]', description: 'Placeholder for EP team recommendation', whyThisMatters: '', expectedOutcome: '', priority: 'medium', placeholder: true },
      { id: 'ep-rec-3', title: '[TO BE FILLED BY EP TEAM]', description: 'Placeholder for EP team recommendation', whyThisMatters: '', expectedOutcome: '', priority: 'medium', placeholder: true },
    ],
    nextSteps: {
      immediate: ['Review this assessment thoroughly', 'Identify your top 3 priorities'],
      thisWeek: ['Document your most critical process', 'Share results with key stakeholders'],
      thisMonth: ['Begin implementing quick wins', 'Schedule follow-up assessment'],
      thisQuarter: ['Complete Phase 1 of roadmap', 'Measure progress against success metrics'],
      bookingCTA: {
        headline: 'Ready to Accelerate Your Transformation?',
        description: 'Book a complimentary strategy session to discuss your results and create a personalized action plan.',
      },
    },
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
