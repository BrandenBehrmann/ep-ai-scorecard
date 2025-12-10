// lib/scoring.ts
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

// Scale questions: some need inversion (higher number = worse situation)
const scaleQuestionConfig: Record<string, { invert: boolean }> = {
  // Control
  'control-2': { invert: false },
  'control-4': { invert: true },
  'control-6': { invert: true },
  // Clarity
  'clarity-3': { invert: true },
  'clarity-6': { invert: true },
  // Leverage
  'leverage-2': { invert: true },
  'leverage-6': { invert: false },
  // Friction
  'friction-2': { invert: true },
  'friction-6': { invert: true },
  // Change Readiness
  'change-3': { invert: false },
  // AI Investment (NEW)
  'ai-invest-4': { invert: false },
};

// Select questions mapped to scores (1-5)
const selectScoreMap: Record<string, Record<string, number>> = {
  'control-3': {
    'Less than 1 week': 5,
    '1-4 weeks': 4,
    '1-3 months': 3,
    '3-6 months': 2,
    'More than 6 months': 1,
    'We might not recover': 0,
  },
  'clarity-1': {
    'Yes, within 5%': 5,
    'Roughly, within 20%': 4,
    "I'd need to check": 3,
    "I'm not sure where to look": 2,
    "We don't track this in real-time": 1,
  },
  'leverage-1': {
    'Over $500K/employee': 5,
    '$200K-$500K/employee': 4,
    '$100K-$200K/employee': 3,
    '$50K-$100K/employee': 2,
    'Under $50K/employee': 1,
    "I don't know": 2,
  },
  'leverage-4': {
    'Mostly strategic work': 5,
    '30% operations, 70% strategic': 4,
    '50/50 split': 3,
    '70% operations, 30% strategic': 2,
    '90%+ in daily operations': 1,
  },
  'friction-3': {
    'Less than 1 week': 5,
    '1-2 weeks': 4,
    '1 month': 3,
    '2-3 months': 2,
    'More than 3 months': 1,
    "We don't have a clear onboarding process": 1,
  },
  'friction-5': {
    'Less than 1 hour': 5,
    '1-3 hours': 4,
    '3-5 hours': 3,
    '5-10 hours': 2,
    'More than 10 hours': 1,
    'I have no idea': 2,
  },
  'change-1': {
    'Within the last 3 months': 5,
    '3-6 months ago': 4,
    '6-12 months ago': 3,
    '1-2 years ago': 2,
    'More than 2 years ago': 1,
    "We've never successfully implemented a major change": 0,
  },
  'change-4': {
    'Yes - dedicated person/role': 5,
    'Partially - someone does it part-time': 4,
    'It falls on me (the owner)': 3,
    'We outsource this entirely': 3,
    'No - no clear owner': 1,
  },
  'change-6': {
    "Immediately - we're ready": 5,
    'Within a month': 4,
    'Within a quarter': 3,
    '6+ months - need to plan/budget': 2,
    'Not sure - depends on many factors': 2,
  },
  // AI Investment (NEW)
  'ai-invest-1': {
    'Yes, we have detailed tracking': 5,
    'Partially - we know roughly what we spend': 3,
    "No, it's bundled with other software costs": 2,
    "We don't use any AI/automation tools yet": 1,
  },
  'ai-invest-2': {
    "$0 - We don't use AI tools yet": 2,
    'Under $500/month': 3,
    '$500-$2,000/month': 4,
    '$2,000-$10,000/month': 5,
    'Over $10,000/month': 5,
    "I don't know": 1,
  },
  'ai-invest-3': {
    'Yes, with approved budget for this year': 5,
    "We're planning to allocate budget next quarter": 4,
    'It comes from general IT/operations budget': 3,
    'We evaluate AI spending case-by-case': 2,
    'No dedicated budget': 1,
  },
  'ai-invest-5': {
    'Yes, we have detailed cost projections': 5,
    'We have rough estimates': 3,
    "We've researched but haven't estimated our specific costs": 2,
    "Not yet - we don't know where to start": 1,
  },
};

// Multiselect scoring
function scoreMultiselect(questionId: string, answers: string[]): number {
  if (questionId === 'clarity-5') {
    let score = 3;
    if (answers.includes('One centralized system')) score += 2;
    if (answers.includes('CRM system') || answers.includes('ERP/business software')) score += 1;
    if (answers.includes('Spreadsheets')) score -= 0.5;
    if (answers.includes('Email threads')) score -= 1;
    if (answers.includes('Paper/physical files')) score -= 1;
    if (answers.includes('Employee knowledge (not written)')) score -= 1;
    if (answers.includes('Multiple disconnected tools')) score -= 1;
    return Math.max(1, Math.min(5, Math.round(score)));
  }
  return 3;
}

function getDimension(questionId: string): string {
  if (questionId.startsWith('control')) return 'control';
  if (questionId.startsWith('clarity')) return 'clarity';
  if (questionId.startsWith('leverage')) return 'leverage';
  if (questionId.startsWith('friction')) return 'friction';
  if (questionId.startsWith('change')) return 'change-readiness';
  if (questionId.startsWith('ai-invest')) return 'ai-investment';
  return 'unknown';
}

export function calculateScores(
  responses: Record<string, string | string[] | number>
): ScorecardResult {
  const dimensionScores: Record<string, { total: number; count: number }> = {
    'control': { total: 0, count: 0 },
    'clarity': { total: 0, count: 0 },
    'leverage': { total: 0, count: 0 },
    'friction': { total: 0, count: 0 },
    'change-readiness': { total: 0, count: 0 },
    'ai-investment': { total: 0, count: 0 },
  };

  for (const [questionId, value] of Object.entries(responses)) {
    const dimension = getDimension(questionId);
    if (dimension === 'unknown') continue;

    let score: number | null = null;

    if (typeof value === 'number' && scaleQuestionConfig[questionId]) {
      const config = scaleQuestionConfig[questionId];
      score = config.invert ? (6 - value) : value;
    } else if (typeof value === 'string' && selectScoreMap[questionId]) {
      score = selectScoreMap[questionId][value] ?? null;
    } else if (Array.isArray(value)) {
      score = scoreMultiselect(questionId, value);
    }

    if (score !== null) {
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
    'ai-investment': 'AI Investment',
  };

  const dimensions: DimensionScore[] = Object.entries(dimensionScores).map(
    ([key, { total, count }]) => {
      const maxScore = count * 5;
      const normalizedMax = 17; // 100 / 6 dimensions ≈ 16.67, round to 17
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

  const totalScore = dimensions.reduce((sum, d) => sum + d.score, 0);
  const maxTotal = 100;
  const percentage = Math.round((totalScore / maxTotal) * 100);

  let band: ScorecardResult['band'];
  let bandLabel: string;
  if (percentage >= 80) {
    band = 'optimized';
    bandLabel = 'Optimized - Ready for advanced AI';
  } else if (percentage >= 60) {
    band = 'stable';
    bandLabel = 'Stable - Good foundation, targeted improvements needed';
  } else if (percentage >= 40) {
    band = 'at-risk';
    bandLabel = 'At Risk - Significant gaps to address';
  } else {
    band = 'critical';
    bandLabel = 'Critical - Foundational work needed first';
  }

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
