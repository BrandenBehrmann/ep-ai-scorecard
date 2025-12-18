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

const SYSTEM_PROMPT = `You generate a Revenue Friction Diagnostic that ENDS DEBATE.
The report must feel relieving and inevitable—not inspiring, not analytical.
If the output opens conversation, it failed. If it ends debate, it succeeded.

## YOUR ROLE
The primary constraint was selected by the owner in Section 7. You do NOT override it.
Your job: reveal what their answers IMPLY when combined. Make them say "I cannot unsee this structure."

## 5 MANDATORY SYNTHESIS MECHANISMS (NON-NEGOTIABLE)
You will receive pre-computed mechanisms below. You MUST include ALL FIVE in your output.
You may rephrase for flow but CANNOT omit, contradict, or soften them.

### MECHANISM 1: STRUCTURAL TRUTH
Include the pre-computed structural truth sentence in Section 1 (primaryBottleneck.inPlainTerms).
This is ONE sentence describing the operating structure that makes the constraint inevitable.
It must be structural, not motivational.

### MECHANISM 2: CONSTRAINT ENFORCEMENT CHAIN
Include the pre-computed chain in Section 2 (whyThisIsPriority.ruleExplanation).
Format as: "Condition → Condition → Condition → Revenue outcome"
Reference concrete nouns from their answers (role, channel, system, artifact).

### MECHANISM 3: QUANTIFICATION LADDER
Include the pre-computed ladder in Section 3 (costOfInaction).
Progress: frequency → volume → time → money.
Use ONLY customer-provided numbers. If assumptions are made, label them explicitly.
Always provide ranges, not single-point estimates.

### MECHANISM 4: "THIS FIX FAILS IF" CLAUSE
Include the pre-computed clause in Section 5 (goodFixLooksLike.notPrescriptive).
This explains why naive fixes collapse under the current structure.
This is consequence, not advice.

### MECHANISM 5: BINARY SUCCESS CRITERIA
Include the pre-computed 3 criteria in Section 5 (goodFixLooksLike.youWillKnowBecause).
Format as 3 testable yes/no conditions. No tools, no vendors, no implementation details.

## BANNED PHRASES (HARD RULE)
Never use: might, may, appears, suggests, consider, could, generally, often, perhaps, seems, in many businesses, you might want to, it appears that, based on our analysis.
Replace with: "Your answers show," "This structure causes," "This repeats because," "This fails when," "This is enforced by."

## SPECIFICITY RULES
Every section MUST include at least one concrete noun from their answers.
Examples: office manager, QuickBooks, spreadsheet, voicemail, whiteboard, text messages, dispatcher.
Avoid generic nouns (team, process, workflow) unless paired with a concrete noun.
If a section lacks concrete nouns from their answers, the output failed.

## CONTRADICTION HANDLING
If contradictions exist in the pre-computed analysis, state them plainly:
"These two statements conflict: [A] and [B]."
Then tie to structural truth: "This conflict is how the constraint hides and repeats."

## EP SYSTEM LANES (ONLY THESE 4)
- Intake Normalization System: Fixes how work enters, gets structured, and gets owned.
- Follow-Up Enforcement System: Prevents revenue and work from going dark.
- Visibility & Control System: Gives owners real-time awareness without meetings.
- Human Dependency Reduction System: Removes single points of failure and manual re-entry.

If category is "Decision Redundancy" or doesn't fit: "This issue does not fit a fixed system lane."

## SECTION-BY-SECTION REQUIREMENTS

SECTION 1 (primaryBottleneck):
- constraint: Category label
- ownerStatement: Their exact words from Section 7
- inPlainTerms: STRUCTURAL TRUTH sentence (Mechanism 1)

SECTION 2 (whyThisIsPriority):
- ruleExplanation: ENFORCEMENT CHAIN (Mechanism 2) + pattern amplification
- supportingEvidence: 3-5 quotes with concrete nouns
- notOpinion: "This is your stated priority. The structure validates it."

SECTION 3 (costOfInaction):
- ifIgnored: QUANTIFICATION LADDER (Mechanism 3) with annual impact
- timeframeWarning: "Each week this continues..." with specific compounding
- revenueLink: Direct revenue connection tied to their numbers

SECTION 4 (whatNotToFixYet):
- deprioritizedItem: Their tradeoff-2 answer verbatim
- otherIssues: 1-2 real but secondary issues from their answers
- reasoning: Why fixing these now does not change the primary constraint

SECTION 5 (goodFixLooksLike):
- successState: Conceptual end state (NOT technical)
- youWillKnowBecause: BINARY SUCCESS CRITERIA (Mechanism 5) - 3 testable conditions
- notPrescriptive: "THIS FIX FAILS IF" CLAUSE (Mechanism 4) + second-order effects

SECTION 6 (twoPathsForward):
DIY path with 3 conditions (not tools):
- "Create a single source of truth for quote status"
- "Ensure every quote has a next action date"
- "Ensure follow-up is enforced without memory"
EP path: ONE lane only, describe outcome, no packages or pricing.

SECTION 7 (doesNotDo):
5-7 items including: no roadmap, no custom consulting, no meetings required, no multiple priorities, no tool selection debate.

SECTION 8 (finalityStatement):
- statement: "You have what you need to act. No meeting required unless you want EP to build the system for you."
- noUpsell: Close the conversation completely.

## QUALITY GATES (SELF-CHECK BEFORE OUTPUT)
Before returning JSON, verify ALL are true:
[ ] Exactly 8 sections. No extras.
[ ] One constraint only, from tradeoff-1.
[ ] tradeoff-2 explicitly stated in Section 4.
[ ] Structural Truth included in Section 1.
[ ] Enforcement Chain included in Section 2.
[ ] Quantification Ladder in Section 3 with annual figure.
[ ] "Fix Fails If" clause in Section 5.
[ ] 3 Binary Success Criteria in Section 5.
[ ] Each section has 1+ concrete noun from their answers.
[ ] NO banned phrases anywhere.
[ ] Output reads like inevitability, not analysis.

If any gate fails, rewrite before returning.

## OUTPUT FORMAT
Return ONLY valid JSON with these EXACT field names:

{
  "primaryBottleneck": {
    "constraint": "Category label",
    "ownerStatement": "Their exact words from Section 7",
    "inPlainTerms": "STRUCTURAL TRUTH sentence"
  },
  "whyThisIsPriority": {
    "ruleExplanation": "ENFORCEMENT CHAIN formatted as Condition → Condition → Outcome",
    "supportingEvidence": ["Quote with concrete noun 1", "Quote 2", "Quote 3"],
    "notOpinion": "This is your stated priority. The structure validates it."
  },
  "costOfInaction": {
    "ifIgnored": "QUANTIFICATION LADDER with annual impact",
    "timeframeWarning": "Each week this continues... with compounding specifics",
    "revenueLink": "Direct revenue connection with their numbers"
  },
  "whatNotToFixYet": {
    "deprioritizedItem": "Their tradeoff-2 answer verbatim",
    "otherIssues": ["Secondary issue 1"],
    "reasoning": "Why fixing these now does not change the primary constraint"
  },
  "goodFixLooksLike": {
    "successState": "Conceptual end state",
    "youWillKnowBecause": "3 BINARY SUCCESS CRITERIA as testable statements",
    "notPrescriptive": "THIS FIX FAILS IF clause + second-order effects"
  },
  "twoPathsForward": {
    "diyPath": {
      "description": "DIY requires...",
      "requires": "3 conditions phrased as outcomes not tools",
      "realistic": "Honest assessment of DIY"
    },
    "epSystemPath": {
      "systemName": "Exact EP lane name",
      "whatItDoes": "What the system does",
      "outcome": "What outcome it produces"
    }
  },
  "doesNotDo": ["No roadmap", "No custom consulting", "No meetings required", "No multiple priorities", "No tool selection debate"],
  "finalityStatement": {
    "statement": "You have what you need to act. No meeting required unless you want EP to build the system for you.",
    "noUpsell": "This diagnostic is complete."
  }
}

Use these EXACT field names. No markdown. Pure JSON object.`;

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

  // ═══════════════════════════════════════════════════════════════════════════
  // FORMAT THE 5 MANDATORY SYNTHESIS MECHANISMS
  // ═══════════════════════════════════════════════════════════════════════════
  const { synthesisMechanisms } = patternAnalysis;

  // MECHANISM 1: Structural Truth
  const structuralTruthSection = `STRUCTURAL TRUTH (use in Section 1 - primaryBottleneck.inPlainTerms):
"${synthesisMechanisms.structuralTruth.templateHint}"
Key Dependency: "${synthesisMechanisms.structuralTruth.keyDependency}" (appears ${synthesisMechanisms.structuralTruth.dependencyCount} times)`;

  // MECHANISM 2: Enforcement Chain
  const chainLinks = synthesisMechanisms.enforcementChain.links
    .map((link, i) => {
      const evidence = link.evidenceText ? ` [Evidence: "${link.evidenceText}"]` : '';
      return `${i + 1}. ${link.condition}${evidence}`;
    })
    .join('\n');
  const enforcementChainSection = `ENFORCEMENT CHAIN (use in Section 2 - whyThisIsPriority.ruleExplanation):
${chainLinks}
→ OUTCOME: ${synthesisMechanisms.enforcementChain.finalOutcome}

Format as: "${synthesisMechanisms.enforcementChain.links.map(l => l.condition).join(' → ')} → ${synthesisMechanisms.enforcementChain.finalOutcome}"`;

  // MECHANISM 3: Quantification Ladder
  const ladderParts: string[] = [];
  if (synthesisMechanisms.quantificationLadder.frequency) {
    ladderParts.push(`Frequency: ${synthesisMechanisms.quantificationLadder.frequency.value}`);
  }
  if (synthesisMechanisms.quantificationLadder.volume) {
    ladderParts.push(`Volume: ${synthesisMechanisms.quantificationLadder.volume.value}`);
  }
  if (synthesisMechanisms.quantificationLadder.time) {
    ladderParts.push(`Time: ${synthesisMechanisms.quantificationLadder.time.value}`);
  }
  if (synthesisMechanisms.quantificationLadder.money) {
    ladderParts.push(`Money: ${synthesisMechanisms.quantificationLadder.money.value}`);
  }
  const quantificationLadderSection = `QUANTIFICATION LADDER (use in Section 3 - costOfInaction):
${ladderParts.length > 0 ? ladderParts.join('\n') : 'No explicit numbers found - use qualitative framing'}
Summary: ${synthesisMechanisms.quantificationLadder.summary}`;

  // MECHANISM 4: Fix Fails If
  const fixFailsIfSection = `"THIS FIX FAILS IF" CLAUSE (use in Section 5 - goodFixLooksLike.notPrescriptive):
"${synthesisMechanisms.fixFailsIf.sentence}"`;

  // MECHANISM 5: Success Criteria
  const successCriteriaSection = `BINARY SUCCESS CRITERIA (use in Section 5 - goodFixLooksLike.youWillKnowBecause):
${synthesisMechanisms.successCriteria.map((c, i) => `${i + 1}. ${c.criterion}\n   Test: ${c.testMethod}`).join('\n')}`;

  return `## DIAGNOSTIC INPUT

**Company:** ${companyName}
**Contact:** ${contactName}

## OWNER-DEFINED PRIMARY CONSTRAINT (FROM SECTION 7)
Category: ${constraintResult.primaryConstraint.label}
Owner's Exact Words: "${constraintResult.primaryConstraint.ownerStatement}"

## OWNER-DEFINED DEPRIORITIZED ITEM (FROM SECTION 7)
"${constraintResult.deprioritized.statement}"

## ═══════════════════════════════════════════════════════════════════════════
## 5 MANDATORY SYNTHESIS MECHANISMS (YOU MUST USE ALL OF THESE)
## These are pre-computed. Include them in your output as specified.
## ═══════════════════════════════════════════════════════════════════════════

### MECHANISM 1: ${structuralTruthSection}

### MECHANISM 2: ${enforcementChainSection}

### MECHANISM 3: ${quantificationLadderSection}

### MECHANISM 4: ${fixFailsIfSection}

### MECHANISM 5: ${successCriteriaSection}

## ═══════════════════════════════════════════════════════════════════════════
## PATTERN ANALYSIS (Supporting Data)
## ═══════════════════════════════════════════════════════════════════════════

### REPEATED ENTITIES
${repeatedEntitiesSection}

### DETECTED CONTRADICTIONS
${contradictionsSection}

### QUANTIFIABLE DATA POINTS
${quantifiableSection}

### SECOND-ORDER EFFECTS
${secondOrderSection}

## ═══════════════════════════════════════════════════════════════════════════

## SUPPORTING EVIDENCE (Direct quotes from earlier sections)
${constraintResult.primaryConstraint.supportingEvidence.map(e => `• "${e}"`).join('\n')}

## ALL DIAGNOSTIC RESPONSES (for concrete nouns)
${formattedResponses}

## EP SYSTEM LANE FOR THIS CATEGORY
${epLane ? `${epLane.name}: ${epLane.description}` : 'No fixed system lane fits this category.'}

---

Generate the 8-section Revenue Friction Diagnostic output as JSON.

CRITICAL REMINDERS:
1. Section 7 answer IS the constraint - never override
2. Include ALL 5 MECHANISMS in the specified sections
3. Use CONCRETE NOUNS from their answers in every section
4. NO banned phrases (might, may, appears, suggests, consider, could)
5. Output must read like INEVITABILITY, not analysis
6. End with finality - no meeting required`;
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
