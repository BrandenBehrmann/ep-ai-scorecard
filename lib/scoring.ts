// lib/scoring.ts
// Revenue Friction Diagnostic - Constraint Detection Logic
// December 2025 - v2 pivot
//
// CRITICAL RULES:
// ─────────────────────────────────────────────────────────────────────────────
// Section 7 selects the constraint.
// Keyword analysis explains it.
// AI never chooses.
// ─────────────────────────────────────────────────────────────────────────────
//
// The answer to tradeoff-1 IS the primary constraint.
// This is owner-defined and deterministic.
// Keyword matching is used ONLY to:
//   1. Map the stated constraint to one of the 5 categories
//   2. Find supporting evidence from earlier answers
//   3. Validate consistency (but NEVER override Section 7)

import {
  ConstraintCategory,
  ConstraintResult,
  PatternAnalysis,
  CONSTRAINT_CATEGORY_LABELS,
} from './database.types';
import { QUESTION_LABELS } from './assessment-questions';

// ============================================================================
// KEYWORD PATTERNS
// Used to map text answers to constraint categories
// ============================================================================

const CATEGORY_KEYWORDS: Record<ConstraintCategory, string[]> = {
  intake_friction: [
    'enters', 'intake', 'new work', 'inbox', 'arrives', 'sits',
    'email', 'phone', 'voicemail', 'text', 'message',
    'channel', 'request', 'lead', 'inquiry', 'comes in',
    'pile up', 'waiting', 'sits in', 'after hours',
    'multiple ways', 'different places', 'scattered',
  ],
  followup_leakage: [
    'follow', 'forget', 'reminder', 'quiet', 'dark', 'lost',
    'slip', 'fall through', 'memory', 'remember',
    'chase', 'circle back', 'no system', 'nothing enforces',
    'disappear', 'resolution', 'drops', 'dropped',
    'goes quiet', 'went dark', 'never closed',
  ],
  visibility_gaps: [
    'see', 'stuck', 'ask', 'interrupt', 'check', 'tools',
    'visibility', 'status', 'where', 'what\'s happening',
    'don\'t know', 'can\'t tell', 'have to ask',
    'multiple systems', 'dig', 'hunt', 'find out',
    'no way to know', 'ask around', 'spreadsheet',
  ],
  human_dependency: [
    'person', 'breaks', 'unavailable', 're-enter', 'only one',
    'key person', 'depends on', 'only I', 'only he', 'only she',
    'if I\'m gone', 'if they\'re out', 'manual', 'copy',
    'retype', 're-type', 'move information', 'transfer data',
    'single point', 'without me', 'falls apart',
  ],
  decision_redundancy: [
    'pause', 'unsure', 'decision', 'approval', 'rules',
    'wait for', 'ask permission', 'don\'t know what to do',
    'same question', 'every time', 'repeatedly',
    'predictable', 'could be automated', 'follows same',
    'unclear', 'uncertain', 'hesitate',
  ],
};

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

/**
 * Calculate which category best matches a text response
 * Returns the category with the highest keyword match count
 */
function matchCategory(text: string): { category: ConstraintCategory; confidence: number } {
  const normalizedText = text.toLowerCase();
  const scores: Record<ConstraintCategory, number> = {
    intake_friction: 0,
    followup_leakage: 0,
    visibility_gaps: 0,
    human_dependency: 0,
    decision_redundancy: 0,
  };

  // Count keyword matches for each category
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        scores[category as ConstraintCategory]++;
      }
    }
  }

  // Find the category with the highest score
  let maxScore = 0;
  let matchedCategory: ConstraintCategory = 'intake_friction'; // Default fallback

  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      matchedCategory = category as ConstraintCategory;
    }
  }

  // Confidence is the proportion of keywords matched vs other categories
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 ? maxScore / totalScore : 0;

  return { category: matchedCategory, confidence };
}

/**
 * Extract relevant quotes from a response that match category keywords
 */
function extractEvidence(text: string, category: ConstraintCategory): string[] {
  const keywords = CATEGORY_KEYWORDS[category];
  const evidence: string[] = [];

  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  for (const sentence of sentences) {
    const normalizedSentence = sentence.toLowerCase();
    for (const keyword of keywords) {
      if (normalizedSentence.includes(keyword.toLowerCase())) {
        const trimmed = sentence.trim();
        if (trimmed.length > 10 && !evidence.includes(trimmed)) {
          evidence.push(trimmed);
        }
        break; // Only add sentence once even if multiple keywords match
      }
    }
  }

  return evidence.slice(0, 5); // Max 5 evidence quotes
}

/**
 * Scan all responses and collect evidence by category
 */
function collectCategorySignals(
  responses: Record<string, string | string[] | number>
): Record<ConstraintCategory, string[]> {
  const signals: Record<ConstraintCategory, string[]> = {
    intake_friction: [],
    followup_leakage: [],
    visibility_gaps: [],
    human_dependency: [],
    decision_redundancy: [],
  };

  // Skip profile and tradeoff questions - only analyze diagnostic sections
  const diagnosticPrefixes = ['intake-', 'ownership-', 'followup-', 'visibility-', 'manual-', 'decision-'];

  for (const [questionId, response] of Object.entries(responses)) {
    // Skip non-diagnostic questions
    if (!diagnosticPrefixes.some(prefix => questionId.startsWith(prefix))) {
      continue;
    }

    // Only process string responses (text answers)
    if (typeof response !== 'string' || response.trim().length === 0) {
      continue;
    }

    // Find which category this response matches
    const { category } = matchCategory(response);

    // Extract evidence quotes for that category
    const evidence = extractEvidence(response, category);
    signals[category].push(...evidence);
  }

  // Deduplicate and limit each category
  for (const category of Object.keys(signals) as ConstraintCategory[]) {
    signals[category] = [...new Set(signals[category])].slice(0, 10);
  }

  return signals;
}

// ============================================================================
// PATTERN ANALYSIS FUNCTIONS
// These functions detect patterns across answers for AI synthesis
// This is analysis (connecting dots), NOT judgment (recommending)
// ============================================================================

/**
 * Entities to detect across answers
 * These represent structural dependencies when repeated
 */
const TRACKABLE_ENTITIES: Record<string, { keywords: string[]; significance: string }> = {
  email: {
    keywords: ['email', 'inbox', 'gmail', 'outlook', 'e-mail'],
    significance: 'Email as central workflow indicates fragmentation and lack of structured system',
  },
  spreadsheet: {
    keywords: ['spreadsheet', 'excel', 'google sheets', 'sheet'],
    significance: 'Spreadsheet dependency indicates manual tracking replacing proper systems',
  },
  owner: {
    keywords: ['i ', 'me ', 'my ', 'myself', 'i\'m', 'only i', 'just me'],
    significance: 'Owner-centricity indicates single point of failure and scalability constraint',
  },
  phone: {
    keywords: ['phone', 'call', 'voicemail', 'text', 'sms'],
    significance: 'Phone as primary channel indicates real-time dependency and documentation gaps',
  },
  memory: {
    keywords: ['memory', 'remember', 'forget', 'head', 'mental'],
    significance: 'Memory-based systems guarantee eventual failure under load',
  },
  whiteboard: {
    keywords: ['whiteboard', 'sticky note', 'post-it', 'written down', 'notepad'],
    significance: 'Physical tracking indicates no digital system of record',
  },
  quickbooks: {
    keywords: ['quickbooks', 'qb', 'accounting software'],
    significance: 'QuickBooks as workflow tool indicates misuse of accounting system for operations',
  },
  crm: {
    keywords: ['crm', 'salesforce', 'hubspot', 'customer database'],
    significance: 'CRM mention may indicate either proper system or underutilized tool',
  },
};

/**
 * Contradiction pairs - statements that conflict logically
 */
const CONTRADICTION_PAIRS: Array<{
  pattern1: { keywords: string[]; meaning: string };
  pattern2: { keywords: string[]; meaning: string };
  tension: string;
}> = [
  {
    pattern1: { keywords: ['rarely', 'seldom', 'almost never', 'don\'t usually'], meaning: 'low frequency' },
    pattern2: { keywords: ['no system', 'nothing enforces', 'rely on memory', 'no process'], meaning: 'no enforcement' },
    tension: 'Claims of rare occurrence without enforcement suggest undetected leakage',
  },
  {
    pattern1: { keywords: ['track everything', 'documented', 'all tracked', 'full visibility'], meaning: 'comprehensive tracking' },
    pattern2: { keywords: ['rely on memory', 'mental', 'remember', 'in my head'], meaning: 'memory-based' },
    tension: 'Claims of full tracking alongside memory reliance indicate incomplete system',
  },
  {
    pattern1: { keywords: ['clear process', 'defined workflow', 'everyone knows'], meaning: 'clear process' },
    pattern2: { keywords: ['assumed', 'unclear', 'depends', 'varies'], meaning: 'assumed ownership' },
    tension: 'Claims of clear process alongside assumption-based handoffs indicate process gaps',
  },
  {
    pattern1: { keywords: ['nothing falls through', 'don\'t miss', 'catch everything'], meaning: 'complete capture' },
    pattern2: { keywords: ['goes quiet', 'disappear', 'lose track', 'slip'], meaning: 'things slip' },
    tension: 'Claims of complete capture alongside admissions of slippage reveal blind spots',
  },
];

/**
 * Extract entities that appear across multiple answers
 */
function extractEntities(
  responses: Record<string, string | string[] | number>
): PatternAnalysis['repeatedEntities'] {
  const entityOccurrences: Map<string, Array<{ questionId: string; context: string }>> = new Map();

  // Only analyze diagnostic questions (not profile, not tradeoffs)
  const diagnosticPrefixes = ['intake-', 'ownership-', 'followup-', 'visibility-', 'manual-', 'decision-'];

  for (const [questionId, response] of Object.entries(responses)) {
    if (!diagnosticPrefixes.some(prefix => questionId.startsWith(prefix))) continue;
    if (typeof response !== 'string' || response.trim().length === 0) continue;

    const normalizedResponse = response.toLowerCase();

    for (const [entityName, { keywords }] of Object.entries(TRACKABLE_ENTITIES)) {
      for (const keyword of keywords) {
        if (normalizedResponse.includes(keyword)) {
          if (!entityOccurrences.has(entityName)) {
            entityOccurrences.set(entityName, []);
          }
          // Extract the sentence containing the keyword as context
          const sentences = response.split(/[.!?]+/);
          const matchingSentence = sentences.find(s => s.toLowerCase().includes(keyword))?.trim() || response.slice(0, 100);

          entityOccurrences.get(entityName)!.push({
            questionId,
            context: matchingSentence,
          });
          break; // Only count each entity once per answer
        }
      }
    }
  }

  // Only return entities that appear in 2+ different answers
  const repeatedEntities: PatternAnalysis['repeatedEntities'] = [];

  for (const [entityName, occurrences] of entityOccurrences.entries()) {
    // Deduplicate by questionId
    const uniqueOccurrences = occurrences.filter(
      (occ, idx, arr) => arr.findIndex(o => o.questionId === occ.questionId) === idx
    );

    if (uniqueOccurrences.length >= 2) {
      repeatedEntities.push({
        entity: entityName,
        occurrences: uniqueOccurrences,
        significance: TRACKABLE_ENTITIES[entityName].significance,
      });
    }
  }

  // Sort by number of occurrences (most frequent first)
  return repeatedEntities.sort((a, b) => b.occurrences.length - a.occurrences.length);
}

/**
 * Detect contradictions between answers
 */
function detectContradictions(
  responses: Record<string, string | string[] | number>
): PatternAnalysis['contradictions'] {
  const contradictions: PatternAnalysis['contradictions'] = [];
  const answersWithPatterns: Array<{
    questionId: string;
    text: string;
    matchedPatterns: Array<{ pairIndex: number; patternSide: 1 | 2 }>;
  }> = [];

  // First pass: identify which patterns each answer matches
  for (const [questionId, response] of Object.entries(responses)) {
    if (typeof response !== 'string' || response.trim().length === 0) continue;

    const normalizedResponse = response.toLowerCase();
    const matchedPatterns: Array<{ pairIndex: number; patternSide: 1 | 2 }> = [];

    CONTRADICTION_PAIRS.forEach((pair, pairIndex) => {
      const matchesPattern1 = pair.pattern1.keywords.some(kw => normalizedResponse.includes(kw));
      const matchesPattern2 = pair.pattern2.keywords.some(kw => normalizedResponse.includes(kw));

      if (matchesPattern1) matchedPatterns.push({ pairIndex, patternSide: 1 });
      if (matchesPattern2) matchedPatterns.push({ pairIndex, patternSide: 2 });
    });

    if (matchedPatterns.length > 0) {
      answersWithPatterns.push({ questionId, text: response, matchedPatterns });
    }
  }

  // Second pass: find pairs of answers that contradict each other
  for (let i = 0; i < answersWithPatterns.length; i++) {
    for (let j = i + 1; j < answersWithPatterns.length; j++) {
      const answer1 = answersWithPatterns[i];
      const answer2 = answersWithPatterns[j];

      for (const pattern1 of answer1.matchedPatterns) {
        for (const pattern2 of answer2.matchedPatterns) {
          // They contradict if they match opposite sides of the same pair
          if (pattern1.pairIndex === pattern2.pairIndex && pattern1.patternSide !== pattern2.patternSide) {
            const pair = CONTRADICTION_PAIRS[pattern1.pairIndex];
            contradictions.push({
              statement1: { questionId: answer1.questionId, text: answer1.text.slice(0, 150) },
              statement2: { questionId: answer2.questionId, text: answer2.text.slice(0, 150) },
              tension: pair.tension,
            });
          }
        }
      }
    }
  }

  // Limit to top 3 most significant contradictions
  return contradictions.slice(0, 3);
}

/**
 * Extract quantifiable data from answers
 */
function extractNumbers(
  responses: Record<string, string | string[] | number>
): PatternAnalysis['quantifiableData'] {
  const quantifiableData: PatternAnalysis['quantifiableData'] = [];

  // Patterns for number extraction
  const patterns = [
    // "5-10 hours a week", "3 hours per week"
    { regex: /(\d+[-–]?\d*)\s*(hours?|hrs?)\s*(a|per)?\s*(week|wk)/gi, unit: 'hours/week', multiplier: 52 },
    // "2-3 hours a day"
    { regex: /(\d+[-–]?\d*)\s*(hours?|hrs?)\s*(a|per)?\s*(day)/gi, unit: 'hours/day', multiplier: 260 },
    // "multiple times a week", "several times a month"
    { regex: /(multiple|several|few|couple)\s*times?\s*(a|per)\s*(week)/gi, unit: 'times/week', multiplier: 52, estimate: '3-4' },
    { regex: /(multiple|several|few|couple)\s*times?\s*(a|per)\s*(month)/gi, unit: 'times/month', multiplier: 12, estimate: '3-4' },
    // "2-3 people"
    { regex: /(\d+[-–]?\d*)\s*(people|person|employees?|team members?)/gi, unit: 'people', multiplier: null },
  ];

  for (const [questionId, response] of Object.entries(responses)) {
    if (typeof response !== 'string' || response.trim().length === 0) continue;

    for (const { regex, unit, multiplier, estimate } of patterns) {
      const matches = response.matchAll(new RegExp(regex.source, 'gi'));

      for (const match of matches) {
        const rawText = match[0];
        let number = estimate || match[1];

        // Handle ranges like "5-10"
        if (typeof number === 'string' && number.includes('-')) {
          const [low, high] = number.split(/[-–]/).map(n => parseInt(n));
          if (!isNaN(low) && !isNaN(high)) {
            // Calculate annualized with range
            if (multiplier) {
              const annualLow = low * multiplier;
              const annualHigh = high * multiplier;
              quantifiableData.push({
                questionId,
                rawText,
                number,
                unit,
                annualized: `${annualLow}-${annualHigh} ${unit.split('/')[0]}/year`,
              });
            }
          }
        } else if (typeof number === 'string') {
          const parsed = parseInt(number);
          if (!isNaN(parsed) && multiplier) {
            quantifiableData.push({
              questionId,
              rawText,
              number,
              unit,
              annualized: `${parsed * multiplier} ${unit.split('/')[0]}/year`,
            });
          }
        }
      }
    }
  }

  // Deduplicate and limit
  return quantifiableData
    .filter((item, idx, arr) => arr.findIndex(i => i.rawText === item.rawText) === idx)
    .slice(0, 5);
}

/**
 * Infer second-order effects based on constraint category
 */
function inferSecondOrderEffects(
  category: ConstraintCategory,
  responses: Record<string, string | string[] | number>
): PatternAnalysis['secondOrderEffects'] {
  const effects: PatternAnalysis['secondOrderEffects'] = [];

  // Base second-order effects by constraint category
  const categoryEffects: Record<ConstraintCategory, Array<{ ifFixed: string; thenExposed: string }>> = {
    followup_leakage: [
      {
        ifFixed: 'follow-up is enforced systematically',
        thenExposed: 'recovered leads will need handling capacity—do you have bandwidth for increased deal flow?',
      },
      {
        ifFixed: 'nothing goes quiet without resolution',
        thenExposed: 'closure rate becomes visible—you will see exactly how many deals die vs. convert',
      },
    ],
    intake_friction: [
      {
        ifFixed: 'intake is normalized into one system',
        thenExposed: 'volume becomes visible—you will see exactly how much work enters and where it stalls',
      },
      {
        ifFixed: 'work no longer sits in scattered locations',
        thenExposed: 'response time becomes measurable—and accountability becomes possible',
      },
    ],
    visibility_gaps: [
      {
        ifFixed: 'you can see what is stuck without asking',
        thenExposed: 'bottlenecks become undeniable—you will know exactly who/what is slowing work',
      },
      {
        ifFixed: 'visibility exists in one place',
        thenExposed: 'the number of stuck items will be higher than expected—awareness precedes action',
      },
    ],
    human_dependency: [
      {
        ifFixed: 'key person dependency is removed',
        thenExposed: 'process gaps become visible—what they held in their head must be documented',
      },
      {
        ifFixed: 'manual re-entry is eliminated',
        thenExposed: 'data quality issues surface—errors that were being manually corrected become visible',
      },
    ],
    decision_redundancy: [
      {
        ifFixed: 'predictable decisions are automated',
        thenExposed: 'exception handling becomes the focus—you will see which decisions truly need judgment',
      },
    ],
  };

  // Add the base effects for this category
  effects.push(...(categoryEffects[category] || []));

  // Check for specific patterns in responses that suggest additional effects
  const allText = Object.values(responses)
    .filter((r): r is string => typeof r === 'string')
    .join(' ')
    .toLowerCase();

  // If they mention capacity issues, add capacity-related effect
  if (allText.includes('busy') || allText.includes('overwhelm') || allText.includes('capacity')) {
    effects.push({
      ifFixed: 'the primary constraint is resolved',
      thenExposed: 'throughput increases but capacity may not—prepare for the volume increase',
    });
  }

  return effects.slice(0, 3);
}

/**
 * MAIN PATTERN ANALYSIS FUNCTION
 *
 * Combines all analysis functions to produce a complete PatternAnalysis
 * This is called during constraint calculation to pre-process data for AI
 */
export function analyzePatterns(
  responses: Record<string, string | string[] | number>,
  category: ConstraintCategory
): PatternAnalysis {
  return {
    repeatedEntities: extractEntities(responses),
    contradictions: detectContradictions(responses),
    quantifiableData: extractNumbers(responses),
    secondOrderEffects: inferSecondOrderEffects(category, responses),
  };
}

/**
 * MAIN SCORING FUNCTION
 *
 * This function determines the primary constraint based on Section 7 responses.
 *
 * CRITICAL: The tradeoff-1 answer IS the primary constraint.
 * Keyword matching only determines WHICH CATEGORY it maps to.
 * AI never overrides this.
 */
export function calculateConstraint(
  responses: Record<string, string | string[] | number>
): ConstraintResult {
  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1: Get the owner's stated constraint (tradeoff-1)
  // This is DETERMINISTIC - the owner chose this
  // ─────────────────────────────────────────────────────────────────────────
  const ownerStatement = (responses['tradeoff-1'] as string) || '';
  const deprioritizedStatement = (responses['tradeoff-2'] as string) || '';

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2: Map the owner's statement to a category
  // Keyword matching determines the category, NOT the constraint itself
  // ─────────────────────────────────────────────────────────────────────────
  const { category: primaryCategory } = matchCategory(ownerStatement);

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3: Collect supporting evidence from earlier sections
  // This validates and explains, but NEVER overrides
  // ─────────────────────────────────────────────────────────────────────────
  const categorySignals = collectCategorySignals(responses);

  // Get evidence that supports the primary constraint category
  const supportingEvidence = categorySignals[primaryCategory];

  // If we don't have much evidence from scanning, extract from the owner's statement
  if (supportingEvidence.length < 2) {
    const directEvidence = extractEvidence(ownerStatement, primaryCategory);
    supportingEvidence.push(...directEvidence);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 4: Run pattern analysis for AI synthesis
  // This detects patterns, contradictions, numbers, and second-order effects
  // ─────────────────────────────────────────────────────────────────────────
  const patternAnalysis = analyzePatterns(responses, primaryCategory);

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 5: Build the result
  // ─────────────────────────────────────────────────────────────────────────
  const result: ConstraintResult = {
    primaryConstraint: {
      category: primaryCategory,
      label: CONSTRAINT_CATEGORY_LABELS[primaryCategory],
      ownerStatement: ownerStatement.trim(),
      supportingEvidence: [...new Set(supportingEvidence)].slice(0, 5),
    },
    deprioritized: {
      statement: deprioritizedStatement.trim(),
    },
    categorySignals,
    patternAnalysis,
  };

  return result;
}

// ============================================================================
// LEGACY COMPATIBILITY
// Keep old scoring types for v1_legacy assessments
// ============================================================================

export interface DimensionScore {
  dimension: string;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  interpretation: 'critical' | 'needs-work' | 'stable' | 'strong';
}

export interface ScorecardResult {
  totalScore: number;
  maxTotal: number;
  percentage: number;
  band: 'critical' | 'at-risk' | 'stable' | 'optimized';
  bandLabel: string;
  dimensions: DimensionScore[];
  topPriorities: string[];
  strengths: string[];
}

/**
 * Legacy scoring function for v1 assessments
 * DO NOT USE FOR NEW ASSESSMENTS
 */
export function calculateScores(
  responses: Record<string, string | string[] | number>
): ScorecardResult {
  // Return a minimal legacy result
  // This maintains backwards compatibility but should not be used for new assessments
  console.warn('calculateScores() called - this is legacy v1 scoring. New assessments should use calculateConstraint()');

  return {
    totalScore: 0,
    maxTotal: 100,
    percentage: 0,
    band: 'at-risk',
    bandLabel: 'Legacy Assessment',
    dimensions: [],
    topPriorities: [],
    strengths: [],
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if an assessment is v2 (Revenue Friction Diagnostic)
 */
export function isV2Assessment(version?: string): boolean {
  return version === 'v2_revenue_friction';
}

/**
 * Get the appropriate EP system lane for a constraint category
 * Returns null if no lane fits (decision_redundancy has no fixed lane)
 */
export function getEPSystemLane(category: ConstraintCategory): { name: string; description: string } | null {
  const lanes: Record<ConstraintCategory, { name: string; description: string } | null> = {
    intake_friction: {
      name: 'Intake Normalization System',
      description: 'Fixes how work enters, gets structured, and gets owned.',
    },
    followup_leakage: {
      name: 'Follow-Up Enforcement System',
      description: 'Prevents revenue and work from going dark.',
    },
    visibility_gaps: {
      name: 'Visibility & Control System',
      description: 'Gives owners real-time awareness without meetings.',
    },
    human_dependency: {
      name: 'Human Dependency Reduction System',
      description: 'Removes single points of failure and manual re-entry.',
    },
    decision_redundancy: null, // No fixed lane for this category
  };

  return lanes[category];
}

/**
 * Format constraint result for display
 */
export function formatConstraintForDisplay(result: ConstraintResult): string {
  return `Primary Constraint: ${result.primaryConstraint.label}

Owner's Statement: "${result.primaryConstraint.ownerStatement}"

Supporting Evidence:
${result.primaryConstraint.supportingEvidence.map(e => `• "${e}"`).join('\n')}

Deprioritized: "${result.deprioritized.statement}"`;
}
