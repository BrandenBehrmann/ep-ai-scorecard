'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  Gauge,
  Eye,
  Zap,
  Target,
  RefreshCw,
  Calculator,
  TrendingUp,
  TrendingDown,
  FileText,
  Lightbulb,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Clock,
  Brain,
  Quote,
  ChevronRight,
  Wrench,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { PremiumReportInsights } from '@/lib/premium-insights';

// Dimension config with icons
const dimensionConfig: Record<string, { icon: typeof Gauge; color: string; label: string }> = {
  control: { icon: Gauge, color: 'from-red-500 to-orange-500', label: 'Control' },
  clarity: { icon: Eye, color: 'from-orange-500 to-amber-500', label: 'Clarity' },
  leverage: { icon: Zap, color: 'from-amber-500 to-yellow-500', label: 'Leverage' },
  friction: { icon: Target, color: 'from-yellow-500 to-lime-500', label: 'Friction' },
  'change-readiness': { icon: RefreshCw, color: 'from-lime-500 to-green-500', label: 'Change Readiness' },
  'ai-investment': { icon: Calculator, color: 'from-teal-500 to-cyan-500', label: 'AI Investment' },
};

// Types
interface DimensionScore {
  dimension: string;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  interpretation: 'critical' | 'needs-work' | 'stable' | 'strong';
}

interface ScoresData {
  total: number;
  percentage: number;
  band: 'critical' | 'at-risk' | 'stable' | 'optimized';
  bandLabel: string;
  dimensions: DimensionScore[];
  topPriorities: string[];
  strengths: string[];
}

interface AssessmentData {
  id: string;
  token: string;
  name: string;
  email: string;
  company: string;
  status: string;
  scores: ScoresData | null;
  insights?: PremiumReportInsights | null;
  responses?: Record<string, string | string[] | number>;
}

// Loading component
function ReportLoading({ message }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-amber-700 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-white/70">{message || 'Loading your report...'}</p>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function ReportPage() {
  return (
    <Suspense fallback={<ReportLoading />}>
      <ReportContent />
    </Suspense>
  );
}

function ReportContent() {
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [insights, setInsights] = useState<PremiumReportInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    setMounted(true);

    if (!token) {
      setError('No assessment token provided');
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/assessments/${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load report');
          setLoading(false);
          return;
        }

        const assessmentData = data.assessment;
        setAssessment(assessmentData);

        if (assessmentData.insights && typeof assessmentData.insights === 'object') {
          setInsights(assessmentData.insights as PremiumReportInsights);
          setLoading(false);
          return;
        }

        setLoading(false);

        if (['submitted', 'report_ready', 'released'].includes(assessmentData.status) && !assessmentData.insights) {
          setInsightsLoading(true);
          try {
            const insightsRes = await fetch(`/api/insights/${token}`, { method: 'POST' });
            const insightsData = await insightsRes.json();

            if (insightsRes.ok && insightsData.insights) {
              setInsights(insightsData.insights as PremiumReportInsights);
              setAssessment(prev => prev ? { ...prev, insights: insightsData.insights } : null);
            } else {
              setInsightsError(insightsData.error || 'Failed to generate insights');
            }
          } catch (err) {
            console.error('Insights fetch error:', err);
            setInsightsError('Failed to generate insights');
          } finally {
            setInsightsLoading(false);
          }
        }
      } catch (err) {
        console.error('Report fetch error:', err);
        setError('Failed to load report');
        setLoading(false);
      }
    };

    fetchReport();
  }, [token]);

  if (!mounted || loading) {
    return <ReportLoading />;
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Report Not Available</h1>
          <p className="text-gray-600 dark:text-white/70 mb-6">{error || 'Assessment not found'}</p>
          <a href="/" className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-all inline-block">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  // Gate: If report hasn't been released yet
  if (assessment.status === 'pending_review' || assessment.status === 'in_progress') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-6">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Your Report is Being Prepared</h1>
          <p className="text-gray-600 dark:text-white/70 mb-6">
            Our team is reviewing your assessment and adding personalized insights.
          </p>
        </div>
      </div>
    );
  }

  const scores = assessment.scores;
  const bandColors = {
    critical: 'bg-red-500',
    'at-risk': 'bg-orange-500',
    stable: 'bg-amber-500',
    optimized: 'bg-green-500',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Image
              src={resolvedTheme === 'dark' ? '/assets/logo-white.svg' : '/assets/logo-black.svg'}
              alt="Ena Pragma"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Loading/Error States */}
        {insightsLoading && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <Brain className="w-8 h-8 text-amber-600 animate-pulse" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Generating Your Diagnostic...</h3>
                <p className="text-sm text-gray-600 dark:text-white/70">Analyzing your responses to find the root cause.</p>
              </div>
            </div>
          </div>
        )}

        {insightsError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Generation Failed</h3>
                <p className="text-sm text-gray-600 dark:text-white/70">{insightsError}</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SECTION 1: THE VERDICT */}
        {/* ============================================================ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8"
        >
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Score Circle */}
            {scores && (
              <div className="relative flex-shrink-0">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle cx="72" cy="72" r="64" fill="none" stroke="currentColor" strokeWidth="10" className="text-gray-200 dark:text-white/10" />
                  <motion.circle
                    cx="72" cy="72" r="64" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round"
                    className={`${bandColors[scores.band].replace('bg-', 'text-')}`}
                    strokeDasharray={`${(scores.percentage / 100) * 402} 402`}
                    initial={{ strokeDasharray: '0 402' }}
                    animate={{ strokeDasharray: `${(scores.percentage / 100) * 402} 402` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{scores.percentage}</span>
                  <span className="text-xs text-gray-500 dark:text-white/50">/ 100</span>
                </div>
              </div>
            )}

            {/* Verdict Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className={`inline-block px-4 py-1.5 rounded-full text-white font-semibold text-sm mb-3 ${scores ? bandColors[scores.band] : 'bg-gray-500'}`}>
                {insights?.executiveSummary?.readinessLevel || scores?.bandLabel || 'Calculating...'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {assessment.company}
              </h1>
              <p className="text-lg text-gray-700 dark:text-white/80 mb-4">
                {insights?.executiveSummary?.verdict || 'Your business diagnostic is ready.'}
              </p>

              {/* If Nothing Changes / If You Act */}
              {insights?.executiveSummary && (
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border-l-4 border-red-500">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium text-sm mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      If Nothing Changes
                    </div>
                    <p className="text-sm text-gray-700 dark:text-white/70">{insights.executiveSummary.inOneYear}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-500">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium text-sm mb-1">
                      <TrendingUp className="w-4 h-4" />
                      If You Act
                    </div>
                    <p className="text-sm text-gray-700 dark:text-white/70">{insights.executiveSummary.ifYouAct}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* ============================================================ */}
        {/* SECTION 2: THE DIAGNOSIS (The $1,500 Value) */}
        {/* ============================================================ */}
        {insights?.coreDiagnosis && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-200 dark:bg-amber-800/40 rounded-xl">
                <Lightbulb className="w-6 h-6 text-amber-700 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">The Core Diagnosis</h2>
                <p className="text-sm text-amber-700 dark:text-amber-400">The insight that explains everything</p>
              </div>
            </div>

            {/* Governing Thought */}
            <div className="bg-white/60 dark:bg-black/20 rounded-lg p-5 mb-6 border border-amber-200/50 dark:border-amber-700/30">
              <p className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                {insights.coreDiagnosis.governingThought}
              </p>
            </div>

            {/* Thesis */}
            <p className="text-gray-700 dark:text-white/80 mb-6 leading-relaxed">
              {insights.coreDiagnosis.thesis}
            </p>

            {/* Evidence Chain */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wide">Evidence From Your Responses</h3>
              {insights.coreDiagnosis.evidenceChain.map((evidence, i) => (
                <div key={i} className="flex gap-4">
                  <Quote className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium italic">"{evidence.quote}"</p>
                    <p className="text-sm text-gray-600 dark:text-white/60 mt-1">{evidence.interpretation}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ============================================================ */}
        {/* SECTION 3: ROOT CAUSE ANALYSIS */}
        {/* ============================================================ */}
        {insights?.rootCauseAnalysis && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Root Cause Chain</h2>

            {/* Visual Chain */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-6">
              <div className="flex-1 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">SURFACE SYMPTOM</div>
                <p className="text-sm text-gray-900 dark:text-white">{insights.rootCauseAnalysis.surfaceSymptom}</p>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400 self-center hidden sm:block" />
              <ArrowRight className="w-6 h-6 text-gray-400 self-center rotate-90 sm:hidden mx-auto" />
              <div className="flex-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                <div className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">INTERMEDIATE ISSUE</div>
                <p className="text-sm text-gray-900 dark:text-white">{insights.rootCauseAnalysis.intermediateIssue}</p>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400 self-center hidden sm:block" />
              <ArrowRight className="w-6 h-6 text-gray-400 self-center rotate-90 sm:hidden mx-auto" />
              <div className="flex-1 bg-amber-100 dark:bg-amber-900/30 rounded-lg p-4 text-center border-2 border-amber-400">
                <div className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">ROOT CAUSE</div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{insights.rootCauseAnalysis.rootCause}</p>
              </div>
            </div>

            <p className="text-gray-700 dark:text-white/80 leading-relaxed mb-4">{insights.rootCauseAnalysis.explanation}</p>

            {/* Supporting Evidence */}
            <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-white/70 mb-2">Supporting Evidence:</h4>
              <ul className="space-y-1">
                {insights.rootCauseAnalysis.supportingEvidence.map((evidence, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-white/60 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    {evidence}
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>
        )}

        {/* ============================================================ */}
        {/* SECTION 4: DIMENSION SCORES */}
        {/* ============================================================ */}
        {scores && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Dimension Breakdown</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scores.dimensions.map((dim, index) => {
                const config = dimensionConfig[dim.dimension];
                const Icon = config?.icon || Gauge;
                const dimInsight = insights?.dimensionInsights?.find(d => d.dimension === dim.dimension);

                return (
                  <motion.div
                    key={dim.dimension}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${config?.color || 'from-gray-500 to-gray-600'} text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{dim.label}</h3>
                        <span className={`text-xs font-medium ${
                          dim.interpretation === 'critical' ? 'text-red-600' :
                          dim.interpretation === 'needs-work' ? 'text-orange-600' :
                          dim.interpretation === 'stable' ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          {dim.interpretation.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{dim.percentage}</span>
                        <span className="text-gray-500 dark:text-white/50 text-sm">%</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mb-3">
                      <motion.div
                        className={`h-full rounded-full ${
                          dim.percentage >= 80 ? 'bg-green-500' :
                          dim.percentage >= 60 ? 'bg-amber-500' :
                          dim.percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${dim.percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + index * 0.05 }}
                      />
                    </div>

                    {/* Insight */}
                    {dimInsight && (
                      <p className="text-sm text-gray-600 dark:text-white/70">{dimInsight.diagnosis}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ============================================================ */}
        {/* SECTION 5: FINANCIAL IMPACT */}
        {/* ============================================================ */}
        {insights?.financialImpact && insights.financialImpact.totalOpportunityCost > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Financial Impact</h2>
                <p className="text-sm text-gray-500 dark:text-white/50">Quantified costs with calculations</p>
              </div>
            </div>

            {/* Total */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 mb-6 text-center">
              <div className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Estimated Annual Impact</div>
              <div className="text-4xl font-bold text-red-700 dark:text-red-400">
                ${insights.financialImpact.totalOpportunityCost.toLocaleString()}
              </div>
            </div>

            {/* Calculations */}
            <div className="space-y-4 mb-6">
              {insights.financialImpact.calculations.map((calc, i) => (
                <div key={i} className="bg-gray-50 dark:bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{calc.item}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      calc.basis === 'from-your-answers' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      calc.basis === 'industry-average' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {calc.basis === 'from-your-answers' ? 'Your Data' :
                       calc.basis === 'industry-average' ? 'Industry Avg' : 'Conservative'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-white/70 mb-1">{calc.yourData}</div>
                  <div className="text-sm text-gray-600 dark:text-white/60 font-mono bg-gray-100 dark:bg-white/10 px-2 py-1 rounded">{calc.calculation}</div>
                  <div className="text-lg font-semibold text-red-600 dark:text-red-400 mt-2">
                    ${calc.annualImpact.toLocaleString()}/year
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Line */}
            <div className="text-sm text-gray-600 dark:text-white/60 border-t border-gray-200 dark:border-white/10 pt-4">
              <p className="italic">{insights.financialImpact.bottomLine}</p>
            </div>
          </motion.section>
        )}

        {/* ============================================================ */}
        {/* SECTION 6: ACTION PLAN */}
        {/* ============================================================ */}
        {insights?.actionPlan && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Action Plan</h2>
                <p className="text-sm text-gray-500 dark:text-white/50">What to do and in what order</p>
              </div>
            </div>

            {/* This Week */}
            {insights.actionPlan.thisWeek.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> This Week
                </h3>
                <div className="space-y-4">
                  {insights.actionPlan.thisWeek.map((action, i) => (
                    <div key={i} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-500">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{action.action}</h4>
                        {action.canEPDoThis && (
                          <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-full">EP Can Build</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-white/70 mb-3">{action.why}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-white/50 mb-3">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {action.timeRequired}</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {action.cost}</span>
                      </div>
                      <div className="bg-white/60 dark:bg-black/20 rounded p-3">
                        <div className="text-xs font-medium text-gray-700 dark:text-white/70 mb-2">Steps:</div>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-white/60">
                          {action.steps.map((step, j) => <li key={j}>{step}</li>)}
                        </ol>
                      </div>
                      <div className="mt-3 text-sm">
                        <span className="text-gray-500 dark:text-white/50">Result: </span>
                        <span className="text-gray-900 dark:text-white">{action.result}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* This Month */}
            {insights.actionPlan.thisMonth.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> This Month
                </h3>
                <div className="space-y-3">
                  {insights.actionPlan.thisMonth.map((action, i) => (
                    <div key={i} className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border-l-4 border-amber-500">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{action.action}</h4>
                        {action.canEPDoThis && (
                          <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-full">EP Can Build</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-white/70">{action.why}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-white/50 mt-2">
                        <span><Clock className="w-3 h-3 inline mr-1" />{action.timeRequired}</span>
                        <span><DollarSign className="w-3 h-3 inline mr-1" />{action.cost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.section>
        )}

        {/* ============================================================ */}
        {/* SECTION 7: WHAT EP CAN BUILD FOR YOU */}
        {/* ============================================================ */}
        {insights?.epImplementations && insights.epImplementations.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Wrench className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">What EP Can Build For You</h2>
                <p className="text-sm text-gray-500 dark:text-white/50">We implement, you focus on your business</p>
              </div>
            </div>

            <div className="space-y-4">
              {insights.epImplementations.map((impl, i) => (
                <div key={i} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border-l-4 border-purple-500">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{impl.title}</h4>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-1">What We Build:</div>
                      <p className="text-gray-700 dark:text-white/80">{impl.whatEPBuilds}</p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-1">Your Problem:</div>
                      <p className="text-gray-700 dark:text-white/80 italic">&ldquo;{impl.yourProblem}&rdquo;</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                    <div className="flex flex-wrap justify-between gap-2 text-sm">
                      <span className="text-gray-600 dark:text-white/70"><strong>Outcome:</strong> {impl.outcome}</span>
                      <span className="text-gray-500 dark:text-white/50">{impl.timeframe} • {impl.investmentRange}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ============================================================ */}
        {/* SECTION 8: NEXT STEPS / CTA */}
        {/* ============================================================ */}
        {insights?.nextSteps && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-white/10 dark:to-white/5 rounded-xl p-6 sm:p-8 text-white"
          >
            <h2 className="text-2xl font-bold mb-2">Three Paths Forward</h2>
            <p className="text-white/70 mb-6">Choose what fits your situation.</p>

            <div className="grid md:grid-cols-3 gap-4">
              {/* DIY */}
              <div className="bg-white/10 rounded-lg p-5">
                <div className="text-amber-400 font-bold text-lg mb-2">{insights.nextSteps.diy.title}</div>
                <p className="text-white/80 text-sm mb-3">{insights.nextSteps.diy.description}</p>
                <p className="text-white/50 text-xs mb-2">For you if: {insights.nextSteps.diy.forYouIf}</p>
                <p className="text-white/40 text-xs">{insights.nextSteps.diy.epRole}</p>
              </div>

              {/* Jumpstart - highlighted */}
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-5">
                <div className="text-purple-400 font-bold text-lg mb-2">{insights.nextSteps.jumpstart.title}</div>
                <p className="text-white/80 text-sm mb-3">{insights.nextSteps.jumpstart.description}</p>
                <p className="text-white/50 text-xs mb-2">For you if: {insights.nextSteps.jumpstart.forYouIf}</p>
                <p className="text-purple-400 text-sm font-medium">{insights.nextSteps.jumpstart.investment}</p>
              </div>

              {/* Partnership */}
              <div className="bg-white/10 rounded-lg p-5">
                <div className="text-amber-400 font-bold text-lg mb-2">{insights.nextSteps.partnership.title}</div>
                <p className="text-white/80 text-sm mb-3">{insights.nextSteps.partnership.description}</p>
                <p className="text-white/50 text-xs mb-2">For you if: {insights.nextSteps.partnership.forYouIf}</p>
                <p className="text-amber-400 text-sm font-medium">{insights.nextSteps.partnership.investment}</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <a
                href="mailto:hello@enapragma.com?subject=Pragma%20Score%20Follow-up"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-all"
              >
                Schedule a Call
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-white/50 text-sm mt-3">No pressure. Just clarity on which option fits.</p>
            </div>
          </motion.section>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-white/40 pt-8 border-t border-gray-200 dark:border-white/10">
          <p>Generated by Ena Score • Ena Pragma Consulting</p>
          <p className="mt-1">Report Date: {new Date().toLocaleDateString()}</p>
        </div>
      </main>
    </div>
  );
}
