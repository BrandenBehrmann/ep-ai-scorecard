// lib/premium-insights.ts
// Revenue Friction Diagnostic - AI Explanation Generator
// December 2025 - v2 pivot
//
// ─────────────────────────────────────────────────────────────────────────────
// CRITICAL RULES FOR THIS FILE:
//
// 1. Claude EXPLAINS rule-based results. Claude does NOT prioritize or judge.
// 2. The primary constraint was already determined by Section 7.
// 3. Claude's job is to explain WHY this makes sense based on their answers.
// 4. Every conclusion must be framed as: "This is the constraint preventing
//    effort from converting into revenue"
// 5. Two paths only: DIY or EP System Lane
// 6. If the output opens conversation, it failed.
//    If it ends debate, it succeeded.
// ─────────────────────────────────────────────────────────────────────────────

import OpenAI from 'openai';
import { ConstraintResult, ConstraintCategory } from './database.types';
import { getEPSystemLane } from './scoring';
import { QUESTION_LABELS } from './assessment-questions';

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
// TYPES - LOCKED 8-SECTION OUTPUT
// ============================================================================

export interface RevenueFrictionDiagnostic {
  version: 'v2_revenue_friction';
  generatedAt: string;
  companyName: string;
  contactName: string;

  // SECTION 1: Primary Bottleneck
  primaryBottleneck: {
    constraint: string;           // Category label
    ownerStatement: string;       // Their exact words
    inPlainTerms: string;         // One sentence explanation
  };

  // SECTION 2: Why This Is the Priority
  whyThisIsPriority: {
    ruleExplanation: string;      // "You identified this as primary because..."
    supportingEvidence: string[]; // 3-5 quotes from earlier answers
    notOpinion: string;           // "This is your stated priority, not our assessment"
  };

  // SECTION 3: Cost of Inaction
  costOfInaction: {
    ifIgnored: string;            // What continues/worsens
    timeframeWarning: string;     // "Every week/month this continues..."
    revenueLink: string;          // How this blocks effort → revenue
  };

  // SECTION 4: What Not to Fix Yet
  whatNotToFixYet: {
    deprioritizedItem: string;    // Their tradeoff-2 answer
    otherIssues: string[];        // Real but secondary issues from their answers
    reasoning: string;            // "Addressing these before X would..."
  };

  // SECTION 5: What a Good Fix Looks Like
  goodFixLooksLike: {
    successState: string;         // Conceptual end state (NOT technical)
    youWillKnowBecause: string;   // Observable change
    notPrescriptive: string;      // "This describes fixed, not how to fix"
  };

  // SECTION 6: Two Paths Forward
  twoPathsForward: {
    diyPath: {
      description: string;
      requires: string;
      realistic: string;
    };
    epSystemPath: {
      systemName: string;         // One of the 4 allowed lanes
      whatItDoes: string;
      outcome: string;
    } | null;                     // null if no lane fits
    noLaneFits?: string;          // "This issue does not fit a fixed system lane"
  };

  // SECTION 7: What This Diagnostic Does Not Do
  doesNotDo: string[];            // 4-5 explicit disclaimers

  // SECTION 8: Finality Statement
  finalityStatement: {
    statement: string;            // "You have what you need. No meeting required."
    noUpsell: string;
  };
}

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const SYSTEM_PROMPT = `You ANALYZE what the owner's answers IMPLY when combined.
You do not prioritize or override their Section 7 choice. You reveal patterns they cannot see.

## YOUR ROLE
The primary constraint was selected by the owner. Your job is to ANALYZE what their answers mean together—not just quote them back.

If your output reads like a mirror of their words, you FAILED.
If your output reveals patterns they couldn't see, you SUCCEEDED.

## YOUR ANALYSIS TOOLKIT (USE ALL FOUR)

1. PATTERN AMPLIFICATION
   When the same entity (email, spreadsheet, owner, etc.) appears in multiple answers:
   - Name it explicitly: "X appears in N of your answers"
   - Explain significance: "This is not incidental—it is structural"
   - Connect to constraint: "Every friction point runs through X"

2. CONTRADICTION EXPOSURE
   When two statements logically conflict:
   - Name both: "You stated A but also B"
   - State the tension: "These cannot both be true"
   - Do NOT resolve it for them. Surface it.

3. QUANTIFICATION
   Use their stated numbers to make abstract concrete:
   - "At N hours/week, this is Y hours/year"
   - "At Z incidents/month, that's W/year"
   - Make the invisible cost visible

4. SECOND-ORDER EFFECTS
   After fixing the primary constraint, what gets exposed?
   - "If X is fixed, Y will surface"
   - "Solving this creates a new question: Z"
   - Help them see the next constraint before it arrives

## CRITICAL RULES (NON-NEGOTIABLE)

1. OWNER'S SECTION 7 ANSWER IS THE CONSTRAINT
   They chose this. You analyze it, never override it.

2. SYNTHESIS, NOT PARAPHRASE
   Wrong: "You said follow-up is an issue" (just quoting)
   Right: "Follow-up appears in 4 answers as where work dies. Email is the graveyard." (synthesis)

3. QUOTE THEN SYNTHESIZE
   Use quotation marks for their words. Then explain what the PATTERN means.

4. NO SOFT LANGUAGE
   Wrong: "You might want to consider..."
   Wrong: "It appears that..."
   Wrong: "Based on our analysis..."
   Right: "This is blocking revenue conversion."
   Right: "Your answers reveal..."
   Right: "This pattern shows..."

5. TWO PATHS ONLY
   - DIY (what it takes to fix yourself)
   - EP System Lane (ONE of the 4 below)
   - If no lane fits: "This issue does not fit a fixed system lane."
   - NEVER combine lanes or invent new ones.

6. FINALITY
   End with: "You have what you need to act. No meeting required unless you want EP to build the system for you."

## EP SYSTEM LANES (ONLY THESE 4)
- Intake Normalization System: Fixes how work enters, gets structured, and gets owned.
- Follow-Up Enforcement System: Prevents revenue and work from going dark.
- Visibility & Control System: Gives owners real-time awareness without meetings.
- Human Dependency Reduction System: Removes single points of failure and manual re-entry.

If the constraint maps to "Decision Redundancy" or doesn't clearly fit, state: "This issue does not fit a fixed system lane."

## OUTPUT REQUIREMENTS BY SECTION

Section 2 (Why This Is the Priority):
- MUST include at least one pattern amplification
- MUST surface contradictions if detected in the analysis
- Frame as "your answers reveal" not "you said"

Section 3 (Cost of Inaction):
- MUST include quantified costs (use the numbers provided)
- MUST show annual impact where possible
- Frame as compounding: "every week this continues..."

Section 5 (What a Good Fix Looks Like):
- MUST include second-order effects
- Frame as "once fixed, you will face..."
- Be specific to their situation

## OUTPUT FORMAT
Return ONLY valid JSON with these EXACT field names:

{
  "primaryBottleneck": {
    "constraint": "Category label",
    "ownerStatement": "Their exact words from Section 7",
    "inPlainTerms": "One synthesized sentence about what this means"
  },
  "whyThisIsPriority": {
    "ruleExplanation": "Pattern analysis showing WHY this is structural",
    "supportingEvidence": ["Quote 1", "Quote 2", "Quote 3"],
    "notOpinion": "This is your stated priority validated by pattern analysis"
  },
  "costOfInaction": {
    "ifIgnored": "What continues to happen with QUANTIFIED annual impact",
    "timeframeWarning": "Every week this continues... with specific numbers",
    "revenueLink": "Direct revenue connection with calculations"
  },
  "whatNotToFixYet": {
    "deprioritizedItem": "Their tradeoff-2 answer",
    "otherIssues": ["Other issues from their answers"],
    "reasoning": "Why fixing these first would be premature"
  },
  "goodFixLooksLike": {
    "successState": "What fixed looks like conceptually",
    "youWillKnowBecause": "Observable change",
    "notPrescriptive": "Includes second-order effects that will surface"
  },
  "twoPathsForward": {
    "diyPath": {
      "description": "What DIY requires",
      "requires": "Time/resources needed",
      "realistic": "Honest assessment"
    },
    "epSystemPath": {
      "systemName": "Exact EP lane name",
      "whatItDoes": "What the system does",
      "outcome": "What outcome it produces"
    }
  },
  "doesNotDo": ["List of 4-5 disclaimers"],
  "finalityStatement": {
    "statement": "Finality message",
    "noUpsell": "No meeting required message"
  }
}

Use these EXACT field names. Do not rename them.
No markdown formatting - pure JSON object.`;

// ============================================================================
// USER PROMPT BUILDER
// ============================================================================

function buildUserPrompt(
  companyName: string,
  contactName: string,
  constraintResult: ConstraintResult,
  responses: Record<string, string | string[] | number>
): string {
  // Get the EP system lane for this category
  const epLane = getEPSystemLane(constraintResult.primaryConstraint.category);
  const { patternAnalysis } = constraintResult;

  // Format all responses for context
  const formattedResponses = Object.entries(responses)
    .filter(([key]) => !key.startsWith('profile-')) // Exclude hidden profile
    .map(([key, value]) => {
      const label = QUESTION_LABELS[key] || key;
      const answer = typeof value === 'string' ? value : JSON.stringify(value);
      return `${label}: "${answer}"`;
    })
    .join('\n');

  // Format pattern analysis for the AI
  const repeatedEntitiesSection = patternAnalysis.repeatedEntities.length > 0
    ? patternAnalysis.repeatedEntities.map(e =>
        `- "${e.entity}" appears ${e.occurrences.length} times in: ${e.occurrences.map(o => QUESTION_LABELS[o.questionId] || o.questionId).join(', ')}\n  Significance: ${e.significance}`
      ).join('\n')
    : 'None detected with 2+ occurrences';

  const contradictionsSection = patternAnalysis.contradictions.length > 0
    ? patternAnalysis.contradictions.map(c =>
        `- TENSION: "${c.statement1.text.slice(0, 80)}..." (${QUESTION_LABELS[c.statement1.questionId] || c.statement1.questionId}) vs "${c.statement2.text.slice(0, 80)}..." (${QUESTION_LABELS[c.statement2.questionId] || c.statement2.questionId})\n  Conflict: ${c.tension}`
      ).join('\n')
    : 'None detected';

  const quantifiableSection = patternAnalysis.quantifiableData.length > 0
    ? patternAnalysis.quantifiableData.map(q =>
        `- "${q.rawText}" (${QUESTION_LABELS[q.questionId] || q.questionId}) → ${q.annualized || 'calculate impact'}`
      ).join('\n')
    : 'No explicit numbers found - use qualitative framing';

  const secondOrderSection = patternAnalysis.secondOrderEffects.map(e =>
    `- If "${e.ifFixed}" → then "${e.thenExposed}"`
  ).join('\n');

  return `## DIAGNOSTIC INPUT

**Company:** ${companyName}
**Contact:** ${contactName}

## OWNER-DEFINED PRIMARY CONSTRAINT (FROM SECTION 7)
Category: ${constraintResult.primaryConstraint.label}
Owner's Exact Words: "${constraintResult.primaryConstraint.ownerStatement}"

## OWNER-DEFINED DEPRIORITIZED ITEM (FROM SECTION 7)
"${constraintResult.deprioritized.statement}"

## ═══════════════════════════════════════════════════════════════════════════
## PRE-PROCESSED PATTERN ANALYSIS
## USE THIS DATA TO SYNTHESIZE INSIGHTS - DO NOT JUST PARAPHRASE ANSWERS
## ═══════════════════════════════════════════════════════════════════════════

### REPEATED ENTITIES (Structural Dependencies)
These entities appear across multiple answers - this is structural, not incidental.
${repeatedEntitiesSection}

### DETECTED CONTRADICTIONS
Statements that logically conflict - surface these, do not resolve them.
${contradictionsSection}

### QUANTIFIABLE DATA POINTS
Use these numbers for annual impact calculations.
${quantifiableSection}

### SECOND-ORDER EFFECTS TO SURFACE
What fixing the constraint will expose next.
${secondOrderSection}

## ═══════════════════════════════════════════════════════════════════════════

## SUPPORTING EVIDENCE (Direct quotes from earlier sections)
${constraintResult.primaryConstraint.supportingEvidence.map(e => `• "${e}"`).join('\n')}

## ALL DIAGNOSTIC RESPONSES
${formattedResponses}

## EP SYSTEM LANE FOR THIS CATEGORY
${epLane ? `${epLane.name}: ${epLane.description}` : 'No fixed system lane fits this category.'}

---

Generate the 8-section Revenue Friction Diagnostic output as JSON.

CRITICAL INSTRUCTIONS:
1. The owner's Section 7 answer IS the primary constraint - analyze it, don't override it
2. USE THE PATTERN ANALYSIS ABOVE - this is your synthesis material
3. Section 2 MUST include pattern amplification and any contradictions
4. Section 3 MUST include quantified annual costs where numbers exist
5. Section 5 MUST include second-order effects
6. If the output just quotes their words back, you have FAILED
7. No soft language - be direct
8. End with finality`;
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

export async function generateRevenueFrictionDiagnostic(
  companyName: string,
  contactName: string,
  constraintResult: ConstraintResult,
  responses: Record<string, string | string[] | number>
): Promise<RevenueFrictionDiagnostic> {
  const userPrompt = buildUserPrompt(companyName, contactName, constraintResult, responses);
  const openai = getOpenAIClient();

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.3, // Lower temperature for consistency
      max_tokens: 4000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);

    // Ensure the result has the correct structure
    return {
      version: 'v2_revenue_friction',
      generatedAt: new Date().toISOString(),
      companyName,
      contactName,
      primaryBottleneck: parsed.primaryBottleneck || {
        constraint: constraintResult.primaryConstraint.label,
        ownerStatement: constraintResult.primaryConstraint.ownerStatement,
        inPlainTerms: 'This is the constraint preventing effort from converting into revenue.',
      },
      whyThisIsPriority: parsed.whyThisIsPriority || {
        ruleExplanation: 'You identified this as your primary constraint in Section 7.',
        supportingEvidence: constraintResult.primaryConstraint.supportingEvidence,
        notOpinion: 'This is your stated priority, not our assessment.',
      },
      costOfInaction: parsed.costOfInaction || {
        ifIgnored: 'This constraint will continue to block revenue conversion.',
        timeframeWarning: 'Every week this continues, effort fails to convert to revenue.',
        revenueLink: 'This is the constraint preventing effort from converting into revenue.',
      },
      whatNotToFixYet: parsed.whatNotToFixYet || {
        deprioritizedItem: constraintResult.deprioritized.statement,
        otherIssues: [],
        reasoning: 'Addressing these before fixing the primary constraint would be premature.',
      },
      goodFixLooksLike: parsed.goodFixLooksLike || {
        successState: 'The constraint no longer blocks revenue conversion.',
        youWillKnowBecause: 'Effort converts to revenue without this friction.',
        notPrescriptive: 'This describes what "fixed" looks like, not how to fix it.',
      },
      twoPathsForward: parsed.twoPathsForward || buildDefaultTwoPaths(constraintResult.primaryConstraint.category),
      doesNotDo: parsed.doesNotDo || [
        'This diagnostic does not provide a custom roadmap.',
        'This diagnostic does not require a meeting to understand.',
        'This diagnostic does not offer multiple options to choose from.',
        'This diagnostic does not predict timelines.',
        'This diagnostic does not guarantee outcomes.',
      ],
      finalityStatement: parsed.finalityStatement || {
        statement: 'You have what you need to act. No meeting required unless you want EP to build the system for you.',
        noUpsell: 'This diagnostic is complete. There is nothing more to discuss unless you want EP to implement the fix.',
      },
    };
  } catch (error) {
    console.error('Error generating diagnostic:', error);
    return generateFallbackDiagnostic(companyName, contactName, constraintResult);
  }
}

// ============================================================================
// FALLBACK GENERATOR
// ============================================================================

function buildDefaultTwoPaths(category: ConstraintCategory): RevenueFrictionDiagnostic['twoPathsForward'] {
  const epLane = getEPSystemLane(category);

  if (epLane) {
    return {
      diyPath: {
        description: 'Fix this yourself by building or configuring systems to address the constraint.',
        requires: 'Time, technical knowledge, and ongoing maintenance.',
        realistic: 'Possible if you have capacity and expertise.',
      },
      epSystemPath: {
        systemName: epLane.name,
        whatItDoes: epLane.description,
        outcome: 'The constraint is eliminated through a purpose-built system.',
      },
    };
  } else {
    return {
      diyPath: {
        description: 'Fix this yourself by building or configuring systems to address the constraint.',
        requires: 'Time, technical knowledge, and ongoing maintenance.',
        realistic: 'Possible if you have capacity and expertise.',
      },
      epSystemPath: null,
      noLaneFits: 'This issue does not fit a fixed system lane. EP does not offer a pre-built solution for this specific constraint.',
    };
  }
}

function generateFallbackDiagnostic(
  companyName: string,
  contactName: string,
  constraintResult: ConstraintResult
): RevenueFrictionDiagnostic {
  return {
    version: 'v2_revenue_friction',
    generatedAt: new Date().toISOString(),
    companyName,
    contactName,

    primaryBottleneck: {
      constraint: constraintResult.primaryConstraint.label,
      ownerStatement: constraintResult.primaryConstraint.ownerStatement,
      inPlainTerms: `${constraintResult.primaryConstraint.label} is preventing effort from converting into revenue.`,
    },

    whyThisIsPriority: {
      ruleExplanation: `You identified "${constraintResult.primaryConstraint.ownerStatement}" as the single issue that would most reduce daily friction or lost revenue if fixed in the next 30 days.`,
      supportingEvidence: constraintResult.primaryConstraint.supportingEvidence,
      notOpinion: 'This is your stated priority, not our assessment. You chose this.',
    },

    costOfInaction: {
      ifIgnored: `If this constraint remains unaddressed, the friction and revenue leakage will continue. You described this as your primary blocker.`,
      timeframeWarning: 'Every week this continues, the same friction repeats and the same revenue opportunities slip.',
      revenueLink: 'This is the constraint preventing effort from converting into revenue.',
    },

    whatNotToFixYet: {
      deprioritizedItem: constraintResult.deprioritized.statement,
      otherIssues: [],
      reasoning: `You explicitly chose to deprioritize "${constraintResult.deprioritized.statement}" for six months. This is correct. Addressing it before fixing the primary constraint would dilute focus.`,
    },

    goodFixLooksLike: {
      successState: `${constraintResult.primaryConstraint.label} no longer blocks operations. Work flows without this friction.`,
      youWillKnowBecause: 'The specific issue you described no longer occurs. Effort converts to revenue without this bottleneck.',
      notPrescriptive: 'This describes what "fixed" looks like, not how to fix it. The method is your choice.',
    },

    twoPathsForward: buildDefaultTwoPaths(constraintResult.primaryConstraint.category),

    doesNotDo: [
      'This diagnostic does not provide a custom roadmap.',
      'This diagnostic does not require a meeting to understand.',
      'This diagnostic does not offer multiple options to choose from.',
      'This diagnostic does not predict timelines.',
      'This diagnostic does not guarantee outcomes.',
    ],

    finalityStatement: {
      statement: 'You have what you need to act. No meeting required unless you want EP to build the system for you.',
      noUpsell: 'This diagnostic is complete. There is nothing more to discuss unless you want EP to implement the fix.',
    },
  };
}

// ============================================================================
// WRAPPER WITH ERROR HANDLING
// ============================================================================

export async function generateDiagnosticWithFallback(
  companyName: string,
  contactName: string,
  constraintResult: ConstraintResult,
  responses: Record<string, string | string[] | number>
): Promise<RevenueFrictionDiagnostic> {
  try {
    return await generateRevenueFrictionDiagnostic(
      companyName,
      contactName,
      constraintResult,
      responses
    );
  } catch (error) {
    console.error('Error in generateDiagnosticWithFallback:', error);
    return generateFallbackDiagnostic(companyName, contactName, constraintResult);
  }
}

// ============================================================================
// LEGACY TYPES (for backwards compatibility with v1 assessments)
// ============================================================================

export interface PremiumReportInsights {
  // Legacy v1 structure - do not use for new assessments
  generatedAt: string;
  assessmentId: string;
  companyName: string;
  contactName: string;
  executiveSummary: unknown;
  rootCause: unknown;
  dimensionInsights: unknown[];
  financialImpact: unknown;
  epImplementations: unknown[];
  actionPlan: unknown;
  nextSteps: unknown;
}

// Stub for legacy compatibility
export async function generatePremiumInsights(): Promise<PremiumReportInsights | null> {
  console.warn('generatePremiumInsights() is deprecated. Use generateRevenueFrictionDiagnostic() for v2 assessments.');
  return null;
}

export async function generateInsightsWithFallback(): Promise<PremiumReportInsights | null> {
  console.warn('generateInsightsWithFallback() is deprecated. Use generateDiagnosticWithFallback() for v2 assessments.');
  return null;
}
