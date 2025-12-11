// lib/scoring.ts
// Pragma Score - Scoring Logic
// December 2025 - Updated for new question structure

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

// ============================================================================
// CONFIGURATION
// ============================================================================

// Scale questions: some need inversion (higher number = worse situation)
// ONLY for scored dimensions (control, clarity, leverage, friction, change-readiness)
const scaleQuestionConfig: Record<string, { invert: boolean }> = {
  // Control
  'control-2': { invert: false }, // More documented = better
  'control-4': { invert: true },  // More approval needed = worse
  // Clarity
  'clarity-3': { invert: true },  // Longer to answer = worse
  'clarity-5': { invert: true },  // Blindsided often = worse
  // Leverage
  'leverage-1': { invert: true },  // More time on cheap tasks = worse
  'leverage-3': { invert: true },  // More reactive = worse
  // Friction
  'friction-2': { invert: true },  // More double entry = worse
  // Change Readiness
  'change-3': { invert: false },   // More eager = better
  // Tech Stack
  'tech-4': { invert: false },     // More integrated = better (but not scored)
};

// Select questions mapped to scores (1-5)
const selectScoreMap: Record<string, Record<string, number>> = {
  // Control
  'control-3': {
    'Less than 1 week': 5,
    '1-4 weeks': 4,
    '1-3 months': 3,
    '3-6 months': 2,
    'More than 6 months': 1,
    'We might not recover': 0,
  },
  // Clarity
  'clarity-1': {
    'Yes, within 5%': 5,
    'Roughly, within 20%': 4,
    "I'd need to check": 3,
    "I'm not sure where to look": 1,
  },
  // Friction
  'friction-3': {
    'Less than 1 week': 5,
    '1-2 weeks': 4,
    '1 month': 3,
    '2-3 months': 2,
    'More than 3 months': 1,
    'No clear onboarding process': 1,
  },
  'friction-5': {
    'Less than 1 hour': 5,
    '1-3 hours': 4,
    '3-5 hours': 3,
    '5-10 hours': 2,
    'More than 10 hours': 1,
    'No idea': 2,
  },
  // Change Readiness
  'change-1': {
    'Within 3 months': 5,
    '3-6 months ago': 4,
    '6-12 months ago': 3,
    '1-2 years ago': 2,
    'More than 2 years': 1,
    'Never successfully': 0,
  },
  'change-4': {
    'Me (the owner) - it always falls on me': 2,
    'A dedicated ops/admin person': 5,
    "We'd need to hire someone": 2,
    "We'd want help implementing": 4,
    "No one - that's why things don't change": 1,
  },
  'change-6': {
    'Immediately - ready to go': 5,
    'Within a month': 4,
    'Within a quarter': 3,
    '6+ months - need to plan/budget': 2,
    'Honestly? Probably never': 1,
  },
};

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

// Multiselect scoring for clarity-4 (where data lives)
function scoreMultiselect(questionId: string, answers: string[]): number {
  if (questionId === 'clarity-4') {
    let score = 3;
    if (answers.includes('CRM/Business software')) score += 1.5;
    if (answers.includes('Spreadsheets')) score -= 0.5;
    if (answers.includes('Email threads')) score -= 1;
    if (answers.includes('Paper/physical files')) score -= 1;
    if (answers.includes('Employee knowledge (not written)')) score -= 1.5;
    if (answers.includes('Multiple disconnected tools')) score -= 0.5;
    return Math.max(1, Math.min(5, Math.round(score)));
  }
  // Other multiselects (sales-1, tech-1) are not scored - they're context
  return 0;
}

// Determine which dimension a question belongs to
// Returns null for non-scored sections (profile, sales, tech-stack, vision)
function getDimension(questionId: string): string | null {
  if (questionId.startsWith('control')) return 'control';
  if (questionId.startsWith('clarity')) return 'clarity';
  if (questionId.startsWith('leverage')) return 'leverage';
  if (questionId.startsWith('friction')) return 'friction';
  if (questionId.startsWith('change')) return 'change-readiness';
  // profile, sales, tech, vision are NOT scored dimensions
  return null;
}

// ============================================================================
// MAIN SCORING FUNCTION
// ============================================================================

export function calculateScores(
  responses: Record<string, string | string[] | number>
): ScorecardResult {
  // Only 5 scored dimensions now (removed ai-investment, added better coverage)
  const dimensionScores: Record<string, { total: number; count: number }> = {
    'control': { total: 0, count: 0 },
    'clarity': { total: 0, count: 0 },
    'leverage': { total: 0, count: 0 },
    'friction': { total: 0, count: 0 },
    'change-readiness': { total: 0, count: 0 },
  };

  for (const [questionId, value] of Object.entries(responses)) {
    const dimension = getDimension(questionId);
    if (dimension === null) continue; // Skip non-scored sections

    let score: number | null = null;

    // Scale questions (1-5 sliders)
    if (typeof value === 'number' && scaleQuestionConfig[questionId]) {
      const config = scaleQuestionConfig[questionId];
      score = config.invert ? (6 - value) : value;
    }
    // Select questions with defined mappings
    else if (typeof value === 'string' && selectScoreMap[questionId]) {
      score = selectScoreMap[questionId][value] ?? null;
    }
    // Multiselect questions
    else if (Array.isArray(value)) {
      const multiselectScore = scoreMultiselect(questionId, value);
      if (multiselectScore > 0) {
        score = multiselectScore;
      }
    }

    if (score !== null && dimensionScores[dimension]) {
      dimensionScores[dimension].total += score;
      dimensionScores[dimension].count += 1;
    }
  }

  const dimensionLabels: Record<string, string> = {
    'control': 'Control',
    'clarity': 'Clarity',
    'leverage': 'Leverage',
    'friction': 'Friction',
    'change-readiness': 'Change Readiness',
  };

  // Calculate dimension scores
  const dimensions: DimensionScore[] = Object.entries(dimensionScores).map(
    ([key, { total, count }]) => {
      const maxScore = count * 5;
      // 5 dimensions now, so each is worth 20 points max
      const normalizedMax = 20;
      const normalizedScore = maxScore > 0
        ? Math.round((total / maxScore) * normalizedMax)
        : 0;
      const percentage = maxScore > 0 ? Math.round((total / maxScore) * 100) : 0;

      let interpretation: DimensionScore['interpretation'];
      if (percentage >= 80) interpretation = 'strong';
      else if (percentage >= 60) interpretation = 'stable';
      else if (percentage >= 40) interpretation = 'needs-work';
      else interpretation = 'critical';

      return {
        dimension: key,
        label: dimensionLabels[key],
        score: normalizedScore,
        maxScore: normalizedMax,
        percentage,
        interpretation,
      };
    }
  );

  // Calculate total score
  const totalScore = dimensions.reduce((sum, d) => sum + d.score, 0);
  const maxTotal = 100;
  const percentage = Math.round((totalScore / maxTotal) * 100);

  // Determine band
  let band: ScorecardResult['band'];
  let bandLabel: string;
  if (percentage >= 80) {
    band = 'optimized';
    bandLabel = 'Optimized - Systems are strong, ready for scale';
  } else if (percentage >= 60) {
    band = 'stable';
    bandLabel = 'Stable - Good foundation with room to improve';
  } else if (percentage >= 40) {
    band = 'at-risk';
    bandLabel = 'At Risk - Significant gaps limiting growth';
  } else {
    band = 'critical';
    bandLabel = 'Critical - Foundation work needed before scaling';
  }

  // Identify priorities and strengths
  const sortedByScore = [...dimensions].sort((a, b) => a.percentage - b.percentage);
  const topPriorities = sortedByScore
    .slice(0, 2)
    .filter(d => d.interpretation !== 'strong')
    .map(d => d.label);

  const strengths = sortedByScore
    .reverse()
    .slice(0, 2)
    .filter(d => d.interpretation === 'strong' || d.interpretation === 'stable')
    .map(d => d.label);

  return {
    totalScore,
    maxTotal,
    percentage,
    band,
    bandLabel,
    dimensions,
    topPriorities,
    strengths,
  };
}

// ============================================================================
// HELPER: Extract business profile data for financial calculations
// ============================================================================

export interface BusinessProfile {
  annualRevenue: string;
  employeeCount: string;
  industry: string;
  revenueGoal: string;
  ownerHoursPerWeek: string;
  ownerHourlyRate: string;
  avgDealSize: string;
  closeRate: string;
  revenueConstraint: string;
  currentTools: string[];
  workPreference: string;
}

export function extractBusinessProfile(
  responses: Record<string, string | string[] | number>
): BusinessProfile {
  return {
    annualRevenue: String(responses['profile-1'] || 'Not provided'),
    employeeCount: String(responses['profile-2'] || 'Not provided'),
    industry: String(responses['profile-3'] || 'Not provided'),
    revenueGoal: String(responses['profile-4'] || 'Not provided'),
    ownerHoursPerWeek: String(responses['profile-5'] || 'Not provided'),
    ownerHourlyRate: String(responses['profile-6'] || 'Not provided'),
    avgDealSize: String(responses['sales-2'] || 'Not provided'),
    closeRate: String(responses['sales-3'] || 'Not provided'),
    revenueConstraint: String(responses['sales-6'] || 'Not provided'),
    currentTools: Array.isArray(responses['tech-1']) ? responses['tech-1'] : [],
    workPreference: String(responses['vision-5'] || 'Not provided'),
  };
}

// ============================================================================
// HELPER: Parse hourly rate from selection for calculations
// ============================================================================

export function parseHourlyRate(rateSelection: string): number {
  const rates: Record<string, number> = {
    '$50/hour': 50,
    '$75/hour': 75,
    '$100/hour': 100,
    '$150/hour': 150,
    '$200/hour': 200,
    '$250/hour': 250,
    '$300+/hour': 300,
  };
  return rates[rateSelection] || 100; // Default to $100/hr
}

// ============================================================================
// HELPER: Parse employee count for calculations
// ============================================================================

export function parseEmployeeCount(countSelection: string): number {
  const counts: Record<string, number> = {
    'Just me (solopreneur)': 1,
    '2-5 people': 3,
    '6-10 people': 8,
    '11-25 people': 18,
    '26-50 people': 38,
    '51-100 people': 75,
    '100+ people': 100,
  };
  return counts[countSelection] || 5; // Default to 5
}

// ============================================================================
// HELPER: Parse annual revenue for calculations
// ============================================================================

export function parseAnnualRevenue(revenueSelection: string): number {
  const revenues: Record<string, number> = {
    'Under $250K': 200000,
    '$250K - $500K': 375000,
    '$500K - $1M': 750000,
    '$1M - $2.5M': 1750000,
    '$2.5M - $5M': 3750000,
    '$5M - $10M': 7500000,
    '$10M - $25M': 17500000,
    '$25M+': 30000000,
    'Prefer not to say': 0,
  };
  return revenues[revenueSelection] || 0;
}
