// Pragma Score Premium Insights Generator
// $1,500 Value Assessment - Complete Business Diagnostic
// December 2025 - Full-spectrum analysis: Revenue, Operations, Technology, Growth

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
  aiReadinessScore: number;
}

export interface DimensionDeepDive {
  dimension: string;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  interpretation: 'critical' | 'needs-work' | 'stable' | 'strong';
  summary: string;
  diagnosis: string;
  rootCauses: string[];
  keyFindings: string[];
  risks: string[];
  opportunities: string[];
  immediateActions: string[];
  weekByWeekPlan: {
    week: number;
    focus: string;
    tasks: string[];
    deliverable: string;
    successMetric: string;
    hoursRequired: number;
    toolsRecommended: string[];
  }[];
  quotedResponse: string;
  quotedAnalysis: string;
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

export interface EPRecommendation {
  id: string;
  title: string;
  description: string;
  whyThisMatters: string;
  expectedOutcome: string;
  priority: 'high' | 'medium' | 'low';
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

export interface ManualInsight {
  id: string;
  title: string;
  observation: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'strategic' | 'operational' | 'financial' | 'technology' | 'people';
}

// Specific tool recommendation with real data
export interface ToolRecommendation {
  name: string;
  category: string;
  monthlyPrice: string;
  setupTime: string;
  whyThisTool: string;
  expectedImpact: string;
  alternative: string;
  getStartedStep: string;
}

// Quick win with immediate action
export interface QuickWin {
  title: string;
  timeToComplete: string;
  cost: string;
  expectedResult: string;
  exactSteps: string[];
  toolNeeded: string;
}

// Full premium report structure
export interface PremiumReportInsights {
  generatedAt: string;
  assessmentId: string;
  companyName: string;
  contactName: string;
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
  // NEW: Specific actionable sections
  toolRecommendations: ToolRecommendation[];
  quickWins: QuickWin[];
  epRecommendations: EPRecommendation[];
  nextSteps: NextSteps;
  executiveOverride?: string;
  manualInsights?: ManualInsight[];
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

  const systemPrompt = `You are a senior business transformation advisor at Ena Pragma (EP), a consulting firm that doesn't just diagnose—it builds, implements, and scales.

## EP'S PHILOSOPHY
- We see the FULL picture: revenue, operations, technology, people, growth
- We don't add work—we REMOVE friction and MULTIPLY capacity
- Every recommendation must be something they can act on TODAY or hire EP to implement
- This report should be so valuable they'd pay $1,500 even if they never hire us again

## WHAT BUSINESS OWNERS ACTUALLY WANT (December 2025 Research)

Based on current market data:
1. **REVENUE GROWTH** - Not just efficiency, but actual top-line impact
2. **TIME BACK** - 75% of SMBs cite "working IN vs ON the business" as top frustration
3. **CLEAR ROI** - 85% expect AI tools to pay for themselves within 90 days
4. **SIMPLE IMPLEMENTATION** - They want results, not projects
5. **COMPETITIVE EDGE** - 77% see AI as essential for survival, not just optimization

## 2025 AUTOMATION LANDSCAPE (REAL DATA)

**Tool Pricing (Current as of Dec 2025):**
- Zapier: Free tier / $19.99/mo Professional (750 tasks)
- Make.com: $9/mo for 10,000 operations (BEST VALUE for SMBs)
- n8n: Free self-hosted / €20/mo cloud
- ChatGPT Team: $25/user/mo
- Claude Pro: $20/user/mo
- Notion: Free / $8/user/mo Plus
- HubSpot: Free CRM / $45/mo Starter
- QuickBooks: $30/mo Simple Start
- Calendly: Free / $10/mo Standard
- Loom: Free / $12.50/mo Business
- Slack: Free / $7.25/user/mo Pro

**ROI Benchmarks (Salesforce 2025 SMB Report):**
- SMBs with AI see 91% report revenue boost
- Average time savings: 12.5 hours/week per employee
- 240% average ROI from workflow automation
- Break-even on automation tools: typically 30-60 days

## YOUR OUTPUT REQUIREMENTS

### 1. NO FLUFF - ONLY ACTIONABLE SPECIFICS
Bad: "Consider implementing a project management tool"
Good: "Set up Monday.com ($8/seat/mo) this week. Create three boards: Active Projects, Client Pipeline, Internal Tasks. Takes 2 hours. Your status meetings will shrink from 1 hour to 15 minutes."

### 2. QUOTE THEIR EXACT WORDS (minimum 15 times)
Their own words reflected back create the "aha" moment.
Format: "You said '[exact quote]' — Here's what that actually means for your business..."

### 3. SPECIFIC TOOL RECOMMENDATIONS WITH REAL PRICING
Every tool recommendation must include:
- Exact monthly cost
- Setup time in hours
- Expected result in plain terms
- A cheaper alternative if budget is tight

### 4. THREE "DO THIS TODAY" QUICK WINS
Each must be completable in under 2 hours with zero budget.

### 5. THE "HIDDEN MULTIPLIER" INSIGHT
Find the ONE thing that's constraining multiple areas. The insight they couldn't see themselves.

### 6. EP PARTNERSHIP POSITIONING
End with clear options:
- Option A: "Take this report and run with it" (they have everything they need)
- Option B: "Want EP to implement Phase 1 in 2 weeks?" (done-for-you)
- Option C: "Monthly partnership for ongoing optimization" (retained advisory)

No pressure, no pitch—just clear paths forward.

## FINANCIAL CALCULATIONS

Use these rates:
- Owner time: $150/hour (opportunity cost of bottleneck)
- Senior employee: $75/hour
- General employee: $50/hour (fully loaded)
- Work weeks: 48/year

Calculate CONSERVATIVELY. Under-promise, over-deliver.

## DIMENSION INTERPRETATION

Each dimension reveals something specific:
1. **CONTROL** = Can this business survive without any single person?
2. **CLARITY** = Does leadership actually know what's happening?
3. **LEVERAGE** = Is growth capped by the current model?
4. **FRICTION** = Where is energy leaking from the system?
5. **CHANGE READINESS** = Can this organization evolve when needed?
6. **AI INVESTMENT** = Is the business positioned for the AI economy?

Company: ${companyName}
Contact: ${contactName}`;

  const userPrompt = `PRAGMA SCORE ASSESSMENT: ${companyName}

=== SCORES ===
${formattedScores}

=== THEIR EXACT RESPONSES ===
${formattedResponses}

---

Generate a complete business diagnostic. Return valid JSON with this structure:

{
  "generatedAt": "${new Date().toISOString()}",
  "assessmentId": "${assessmentId}",
  "companyName": "${companyName}",
  "contactName": "${contactName}",

  "executiveSummary": {
    "headline": "6-10 word punchy truth (not generic)",
    "overallAssessment": "3-4 sentences: where they are, what's holding them back, what's possible. Reference their specific situation.",
    "readinessLevel": "Chaos Mode|Stabilizing|Operational|Optimized|Excellence",
    "topStrength": "Specific strength with evidence from their answers",
    "criticalGap": "The ONE root issue affecting multiple areas",
    "bottomLine": "The single sentence truth they need to hear",
    "quotedInsight": "\"[Their exact words]\" — What this reveals about their business",
    "businessRiskLevel": "critical|high|moderate|low",
    "estimatedAnnualImpact": "Conservative dollar estimate of waste + opportunity cost",
    "aiReadinessScore": 0-100
  },

  "businessContext": {
    "operationalMaturity": "Where they sit on maturity spectrum with specific evidence",
    "growthStage": "What growth stage signals from their answers",
    "primaryChallenge": "The core constraint - traced back to root cause",
    "biggestOpportunity": "What becomes possible when constraint removed - be specific",
    "competitivePosition": "How current state affects their market position",
    "aiReadinessAssessment": "Specific assessment against 2025 benchmarks"
  },

  "dimensionInsights": [
    {
      "dimension": "control",
      "label": "Control",
      "score": (from scores),
      "maxScore": 17,
      "percentage": (from scores),
      "interpretation": "critical|needs-work|stable|strong",
      "summary": "2 sentences on what this score means for their specific business",
      "diagnosis": "You scored X because [specific evidence]. The root cause is [traced back].",
      "rootCauses": ["Specific cause 1", "Specific cause 2"],
      "keyFindings": ["Finding with specific evidence from answers"],
      "risks": ["If [specific person/function] unavailable, [consequence] within [timeline]"],
      "opportunities": ["When this is fixed, [specific benefit]"],
      "immediateActions": ["THIS WEEK: [Specific action with exact steps]", "NEXT WEEK: [Follow-up]"],
      "weekByWeekPlan": [
        {
          "week": 1,
          "focus": "Specific focus",
          "tasks": ["Exact task 1", "Exact task 2"],
          "deliverable": "Concrete deliverable",
          "successMetric": "How they know it's done",
          "hoursRequired": 3,
          "toolsRecommended": ["Tool 1", "Tool 2"]
        }
      ],
      "quotedResponse": "Their EXACT words",
      "quotedAnalysis": "What this quote reveals - be insightful",
      "benchmarkComparison": "You're at X%. Top performers: Y%. Gap: Z% = $W annual impact",
      "industryContext": "What best-in-class businesses do differently"
    }
    // Include ALL 6 dimensions
  ],

  "responseHighlights": [
    {
      "questionId": "question-id",
      "question": "The question asked",
      "response": "Their exact response",
      "analysis": "Insightful analysis of what this reveals",
      "implication": "critical|warning|positive",
      "connectedDimensions": ["dimension1", "dimension2"]
    }
    // 8-10 most revealing responses
  ],

  "financialImpact": {
    "totalIdentifiedWaste": "$XX,XXX/year (conservative)",
    "revenueAtRisk": "$XX,XXX if key constraints not addressed",
    "opportunityCost": "$XX,XXX in growth not captured",
    "aiInvestmentGap": "$XX,XXX potential from proper AI implementation",
    "breakdownItems": [
      {
        "item": "Owner time on $50/hr tasks",
        "annualCost": "$XX,XXX",
        "calculation": "X hrs/week × $150 × 48 weeks",
        "category": "direct-waste"
      }
    ],
    "roiProjection": {
      "month3": "What's realistic by month 3",
      "month6": "Cumulative by month 6",
      "month12": "Full year potential"
    },
    "breakEvenTimeline": "Specific timeline with reasoning"
  },

  "riskAssessment": {
    "overallRiskLevel": "critical|high|moderate|low",
    "keyPersonRisk": {"level": "Critical/High/Moderate/Low", "impact": "Specific impact", "mitigation": "Specific action"},
    "operationalRisk": {"level": "...", "impact": "...", "mitigation": "..."},
    "growthRisk": {"level": "...", "impact": "...", "mitigation": "..."},
    "technologyRisk": {"level": "...", "impact": "...", "mitigation": "..."},
    "competitiveRisk": {"level": "...", "impact": "...", "mitigation": "..."},
    "aiReadinessRisk": {"level": "...", "impact": "...", "mitigation": "..."}
  },

  "ahaInsight": {
    "title": "The Hidden Multiplier",
    "observation": "You mentioned [X], [Y], and [Z] separately. They're all symptoms of ONE thing: [insight]",
    "connectedDots": ["Quote 1 from their answers", "Quote 2", "Quote 3"],
    "rootCauseChain": ["Surface symptom", "→ Caused by", "→ Root cause"],
    "implication": "This means [business consequence they haven't grasped]",
    "hiddenCost": "Beyond the obvious, this is costing [hidden impact]",
    "whatChangesEverything": "When you fix this ONE thing, [cascading benefits]"
  },

  "toolRecommendations": [
    {
      "name": "Tool Name",
      "category": "Category (CRM/Automation/Communication/etc)",
      "monthlyPrice": "$X/month or Free tier available",
      "setupTime": "X hours",
      "whyThisTool": "Specific reason tied to their responses",
      "expectedImpact": "Save X hours/week or Increase Y by Z%",
      "alternative": "Cheaper alternative if budget tight",
      "getStartedStep": "Exact first step: Go to X, click Y, create Z"
    }
    // 4-6 specific tools based on their needs
  ],

  "quickWins": [
    {
      "title": "Quick Win Title",
      "timeToComplete": "30 minutes - 2 hours",
      "cost": "$0 or minimal",
      "expectedResult": "Specific measurable result",
      "exactSteps": ["Step 1", "Step 2", "Step 3"],
      "toolNeeded": "Tool name or 'None'"
    }
    // 3 quick wins they can do TODAY
  ],

  "implementationRoadmap": {
    "totalDuration": "90 days to meaningful transformation",
    "phases": [
      {
        "name": "Phase 1: Quick Wins & Foundation",
        "duration": "2 weeks",
        "weeks": "1-2",
        "focus": "Immediate relief + setup for bigger changes",
        "objective": "Specific measurable objective",
        "deliverables": ["Deliverable 1", "Deliverable 2"],
        "weeklyBreakdown": [
          {
            "week": 1,
            "focus": "Specific focus",
            "tasks": ["Exact task 1", "Exact task 2"],
            "milestone": "What's true by end of week",
            "hoursRequired": 4,
            "toolsUsed": ["Tool 1"]
          }
        ],
        "resourcesNeeded": ["Owner: X hrs/week", "Team: Y hrs/week"],
        "estimatedInvestment": "$X in tools + Y hours",
        "expectedOutcome": "Specific measurable outcome",
        "risksToMitigate": ["Risk 1"]
      }
      // 3 phases: Quick Wins (2 weeks), Build (4 weeks), Scale (6 weeks)
    ],
    "criticalPath": ["Do X before Y", "Complete A before starting B"],
    "quickWins": ["Today: X", "This week: Y"],
    "longTermInitiatives": ["Quarterly: X", "Ongoing: Y"]
  },

  "benchmarks": [
    {
      "metric": "Specific metric",
      "yourScore": "Their score",
      "industryAverage": "Average",
      "topPerformers": "Top 25%",
      "gap": "Specific gap",
      "assessment": "What this means + action"
    }
    // 6-8 relevant benchmarks
  ],

  "successMetrics": [
    {
      "metric": "Specific metric to track",
      "currentState": "Where they are now",
      "targetState": "Where to aim (90 days)",
      "timeline": "When to expect change",
      "measurementMethod": "How to measure",
      "owner": "Who owns this"
    }
    // 6 key metrics
  ],

  "epRecommendations": [
    {
      "id": "ep-1",
      "title": "[EP TEAM WILL ADD]",
      "description": "Placeholder for manual insight",
      "whyThisMatters": "",
      "expectedOutcome": "",
      "priority": "high",
      "placeholder": true
    }
  ],

  "nextSteps": {
    "immediate": ["Do this in the next 2 hours", "Then this"],
    "thisWeek": ["Complete by Friday"],
    "thisMonth": ["30-day milestone"],
    "thisQuarter": ["90-day vision"],
    "bookingCTA": {
      "headline": "Three Paths Forward",
      "description": "Option A: Run with this report—you have everything you need. Option B: Want EP to implement Phase 1 in 2 weeks? Option C: Ongoing partnership for continuous optimization. Book a 30-minute call to discuss which fits: [link]"
    }
  }
}

CRITICAL REMINDERS:
- Quote their EXACT words at least 15 times throughout
- Every tool recommendation needs REAL current pricing (Dec 2025)
- Financial calculations must be conservative and show the math
- Quick wins must be completable TODAY with ZERO budget
- No placeholder text anywhere except epRecommendations
- This report should be valuable even if they never contact EP again`;

  try {
    const openai = getOpenAIClient();
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

  const readinessLevel = scores.percentage >= 80 ? 'Optimized' :
    scores.percentage >= 60 ? 'Operational' :
    scores.percentage >= 40 ? 'Stabilizing' : 'Chaos Mode';

  return {
    generatedAt: new Date().toISOString(),
    assessmentId,
    companyName,
    contactName,
    executiveSummary: {
      headline: `${scores.bandLabel}: Clear Path Forward`,
      overallAssessment: `${companyName} scored ${scores.percentage}/100. ${weakest.label} needs immediate attention while ${strongest.label} is a competitive advantage to leverage.`,
      readinessLevel: readinessLevel as PremiumExecutiveSummary['readinessLevel'],
      topStrength: `${strongest.label} (${strongest.percentage}%)`,
      criticalGap: `${weakest.label} (${weakest.percentage}%)`,
      bottomLine: scores.percentage >= 60 ?
        'Foundation is solid—focus on targeted improvements.' :
        'Address foundation gaps before scaling.',
      quotedInsight: 'Review detailed analysis below.',
      businessRiskLevel: scores.percentage < 40 ? 'critical' : scores.percentage < 60 ? 'high' : 'moderate',
      estimatedAnnualImpact: 'See Financial Impact section.',
      aiReadinessScore: scores.percentage,
    },
    businessContext: {
      operationalMaturity: readinessLevel,
      growthStage: 'See detailed analysis',
      primaryChallenge: `Improving ${weakest.label}`,
      biggestOpportunity: `Leveraging ${strongest.label}`,
      competitivePosition: 'See dimension analysis',
      aiReadinessAssessment: scores.percentage >= 70 ? 'Ready for AI' : 'Foundation work needed',
    },
    dimensionInsights: scores.dimensions.map(dim => ({
      dimension: dim.dimension,
      label: dim.label,
      score: dim.score,
      maxScore: dim.maxScore,
      percentage: dim.percentage,
      interpretation: dim.interpretation as 'critical' | 'needs-work' | 'stable' | 'strong',
      summary: `${dim.label}: ${dim.percentage}% - ${dim.interpretation}`,
      diagnosis: `Score indicates ${dim.interpretation} performance.`,
      rootCauses: ['See detailed response analysis'],
      keyFindings: [`${dim.percentage}% score`],
      risks: ['Review roadmap for mitigation'],
      opportunities: ['See recommendations'],
      immediateActions: ['Review responses'],
      weekByWeekPlan: [],
      quotedResponse: 'See responses',
      quotedAnalysis: 'See analysis',
      benchmarkComparison: 'See benchmarks',
      industryContext: 'See industry context',
    })),
    responseHighlights: [],
    financialImpact: {
      totalIdentifiedWaste: 'Requires AI analysis',
      revenueAtRisk: 'Requires AI analysis',
      opportunityCost: 'Requires AI analysis',
      aiInvestmentGap: 'Requires AI analysis',
      breakdownItems: [],
      roiProjection: { month3: 'TBD', month6: 'TBD', month12: 'TBD' },
      breakEvenTimeline: 'See detailed analysis',
    },
    riskAssessment: {
      overallRiskLevel: scores.percentage < 40 ? 'critical' : 'moderate',
      keyPersonRisk: { level: 'Review', impact: 'See Control', mitigation: 'Document processes' },
      operationalRisk: { level: 'Review', impact: 'See Friction', mitigation: 'Streamline workflows' },
      growthRisk: { level: 'Review', impact: 'See Leverage', mitigation: 'Improve efficiency' },
      technologyRisk: { level: 'Review', impact: 'See Change', mitigation: 'Update strategy' },
      competitiveRisk: { level: 'Review', impact: 'Overall score', mitigation: 'Address gaps' },
      aiReadinessRisk: { level: 'Review', impact: 'See AI Investment', mitigation: 'Establish budget' },
    },
    ahaInsight: {
      title: 'Pattern Analysis',
      observation: 'Full analysis reveals connected patterns.',
      connectedDots: [],
      rootCauseChain: [],
      implication: 'Book a strategy session for insights.',
      hiddenCost: 'See financial impact.',
      whatChangesEverything: 'See roadmap.',
    },
    toolRecommendations: [
      {
        name: 'Notion',
        category: 'Documentation & Knowledge Base',
        monthlyPrice: 'Free / $8/user for Plus',
        setupTime: '2 hours',
        whyThisTool: 'Central hub for processes, docs, and team knowledge',
        expectedImpact: 'Reduce information search time by 80%',
        alternative: 'Google Docs (Free)',
        getStartedStep: 'Go to notion.so, create workspace, start with "Team Wiki" template'
      },
      {
        name: 'Make.com',
        category: 'Automation',
        monthlyPrice: '$9/month for 10,000 operations',
        setupTime: '1-2 hours per workflow',
        whyThisTool: 'Best value automation platform for SMBs',
        expectedImpact: 'Automate 5-10 hours of manual work per week',
        alternative: 'Zapier Free tier (100 tasks/month)',
        getStartedStep: 'Sign up at make.com, connect your first two apps'
      }
    ],
    quickWins: [
      {
        title: 'Document Your #1 Process',
        timeToComplete: '1 hour',
        cost: '$0',
        expectedResult: 'First critical process documented and shareable',
        exactSteps: [
          'Open Loom (free) or phone camera',
          'Record yourself doing the task',
          'Share link with team',
          'Create simple checklist from video'
        ],
        toolNeeded: 'Loom (free) or phone'
      }
    ],
    implementationRoadmap: {
      totalDuration: '90 days',
      phases: [{
        name: 'Foundation',
        duration: '2 weeks',
        weeks: '1-2',
        focus: 'Quick wins',
        objective: 'Immediate improvements',
        deliverables: ['Process documentation', 'Quick wins completed'],
        weeklyBreakdown: [],
        resourcesNeeded: ['4-6 hours/week'],
        estimatedInvestment: 'Time only',
        expectedOutcome: 'Foundation established',
        risksToMitigate: ['Time constraints'],
      }],
      criticalPath: ['Documentation before delegation'],
      quickWins: ['Document one process this week'],
      longTermInitiatives: ['Quarterly reviews'],
    },
    benchmarks: [{
      metric: 'Overall Readiness',
      yourScore: `${scores.percentage}%`,
      industryAverage: '50%',
      topPerformers: '70%+',
      gap: scores.percentage < 70 ? `${70 - scores.percentage}% gap` : 'At target',
      assessment: scores.percentage >= 70 ? 'Ready' : 'Foundation needed'
    }],
    successMetrics: [{
      metric: 'Overall Score',
      currentState: `${scores.percentage}%`,
      targetState: '70%+',
      timeline: '90 days',
      measurementMethod: 'Re-assessment',
      owner: 'Leadership'
    }],
    epRecommendations: [{
      id: 'ep-1',
      title: '[EP TEAM WILL ADD]',
      description: 'Placeholder',
      whyThisMatters: '',
      expectedOutcome: '',
      priority: 'high',
      placeholder: true
    }],
    nextSteps: {
      immediate: ['Review this assessment', 'Pick your first quick win'],
      thisWeek: ['Complete one quick win', 'Share with team'],
      thisMonth: ['Complete Phase 1'],
      thisQuarter: ['Re-assess and measure progress'],
      bookingCTA: {
        headline: 'Three Paths Forward',
        description: 'Option A: Run with this report. Option B: EP implements for you. Option C: Ongoing partnership.',
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
