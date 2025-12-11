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
  Calendar,
  Download,
  Sparkles,
  FileText,
  Lightbulb,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertTriangle,
  Shield,
  Users,
  BarChart3,
  Brain,
  Quote,
  ChevronRight,
  ExternalLink
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

    // Fetch assessment data from API
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

        // Check if we have cached insights - set them BEFORE turning off loading
        if (assessmentData.insights && typeof assessmentData.insights === 'object') {
          setInsights(assessmentData.insights as PremiumReportInsights);
          setLoading(false);
          return; // We have insights, no need to generate
        }

        setLoading(false);

        // If assessment is submitted but no insights, generate them
        if ((assessmentData.status === 'submitted' || assessmentData.status === 'report_ready') && !assessmentData.insights) {
          setInsightsLoading(true);
          try {
            const insightsRes = await fetch(`/api/insights/${token}`);
            const insightsData = await insightsRes.json();

            if (insightsRes.ok && insightsData.insights) {
              setInsights(insightsData.insights as PremiumReportInsights);
              // Also update the assessment object with insights
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

  // Gate: If report hasn't been released yet, show pending message
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
            You'll receive an email notification when your report is ready.
          </p>
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-gray-500 dark:text-white/50">Status</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">In Review</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-white/50">Expected</span>
              <span className="text-gray-900 dark:text-white font-medium">24-48 hours</span>
            </div>
          </div>
          <a
            href={`/assessment/submitted?token=${token}`}
            className="text-amber-700 dark:text-amber-400 hover:underline text-sm"
          >
            Return to status page
          </a>
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

  const riskColors = {
    critical: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    high: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
    moderate: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
    low: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={resolvedTheme === 'dark' ? '/assets/logo-white.svg' : '/assets/logo-black.svg'}
                alt="Pragma Score"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-all text-sm font-medium">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Report Header with Overall Score */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {insights?.executiveSummary?.headline || 'Pragma Score Report'}
              </h1>
              <p className="text-gray-600 dark:text-white/70">
                {assessment.company} • {assessment.name}
              </p>
            </div>
            {insights?.executiveSummary?.businessRiskLevel && (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${riskColors[insights.executiveSummary.businessRiskLevel]}`}>
                <AlertTriangle className="w-3 h-3" />
                {insights.executiveSummary.businessRiskLevel.toUpperCase()} RISK
              </div>
            )}
          </div>

          {/* Overall Score */}
          {scores && (
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="relative">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-gray-200 dark:text-white/10"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeLinecap="round"
                    className={`${bandColors[scores.band].replace('bg-', 'text-')}`}
                    strokeDasharray={`${(scores.percentage / 100) * 440} 440`}
                    initial={{ strokeDasharray: '0 440' }}
                    animate={{ strokeDasharray: `${(scores.percentage / 100) * 440} 440` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    {scores.percentage}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-white/50">out of 100</span>
                </div>
              </div>

              <div className="flex-1 text-center lg:text-left">
                <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold text-sm mb-3 ${bandColors[scores.band]}`}>
                  {insights?.executiveSummary?.readinessLevel || scores.bandLabel}
                </div>
                <p className="text-gray-700 dark:text-white/80 max-w-xl leading-relaxed">
                  {insights?.executiveSummary?.bottomLine || (
                    scores.band === 'critical' && 'Your operations have significant vulnerabilities that need immediate attention. Focus on the critical areas below to stabilize your business.'
                  ) || (
                    scores.band === 'at-risk' && 'Your business shows signs of operational stress. Addressing the priorities below will reduce risk and improve efficiency.'
                  ) || (
                    scores.band === 'stable' && 'Your operations are functioning well with room for optimization. The insights below can help you move to the next level.'
                  ) || (
                    'Excellent operational health! Your business is well-positioned for growth. Continue investing in your strengths.'
                  )}
                </p>
                {insights?.executiveSummary?.estimatedAnnualImpact && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <DollarSign className="w-5 h-5 text-red-600" />
                    <span className="text-red-700 dark:text-red-400 font-semibold">
                      {insights.executiveSummary.estimatedAnnualImpact}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Executive Commentary (Manual Override) */}
        {insights?.executiveOverride && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-6 sm:p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-200 dark:bg-amber-800/40 rounded-lg">
                <MessageSquare className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Expert Commentary</h3>
            </div>
            <p className="text-gray-700 dark:text-white/80 leading-relaxed whitespace-pre-wrap">
              {insights.executiveOverride}
            </p>
          </motion.div>
        )}

        {/* Manual Key Insights from EP Team */}
        {insights?.manualInsights && Array.isArray(insights.manualInsights) && insights.manualInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Lightbulb className="w-6 h-6 text-purple-700 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Expert Insights</h2>
                <p className="text-sm text-gray-500 dark:text-white/50">Personalized recommendations from our team</p>
              </div>
            </div>

            <div className="space-y-4">
              {(insights.manualInsights as Array<{id: string; title: string; observation: string; recommendation: string; priority: string; category: string}>).map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  className="bg-gray-50 dark:bg-white/5 rounded-lg p-5 border-l-4 border-purple-500"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      insight.priority === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      insight.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      insight.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {insight.priority}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-white/80 text-sm mb-3">{insight.observation}</p>
                  {insight.recommendation && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <p className="text-sm text-purple-800 dark:text-purple-300">
                        <strong>Recommendation:</strong> {insight.recommendation}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading insights indicator */}
        {insightsLoading && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="animate-spin">
                <Brain className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Generating AI-Powered Insights...</h3>
                <p className="text-sm text-gray-600 dark:text-white/70">Our AI is analyzing your responses to create your personalized $1,500 diagnostic report.</p>
              </div>
            </div>
          </div>
        )}

        {/* Insights error */}
        {insightsError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Insights Generation Failed</h3>
                <p className="text-sm text-gray-600 dark:text-white/70">{insightsError}. Showing basic report.</p>
              </div>
            </div>
          </div>
        )}

        {/* Dimension Breakdown */}
        {scores && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {scores.dimensions.map((dim, index) => {
              const config = dimensionConfig[dim.dimension];
              const Icon = config?.icon || Gauge;
              return (
                <motion.div
                  key={dim.dimension}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${config?.color || 'from-gray-500 to-gray-600'} text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {dim.label}
                      </h3>
                      <span className={`text-xs font-medium ${
                        dim.interpretation === 'critical' ? 'text-red-600' :
                        dim.interpretation === 'needs-work' ? 'text-orange-600' :
                        dim.interpretation === 'stable' ? 'text-amber-600' :
                        'text-green-600'
                      }`}>
                        {dim.interpretation.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {dim.score}
                      </span>
                      <span className="text-gray-500 dark:text-white/50">/{dim.maxScore}</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-white/50">
                      {dim.percentage}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        dim.percentage >= 80 ? 'bg-green-500' :
                        dim.percentage >= 60 ? 'bg-amber-500' :
                        dim.percentage >= 40 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${dim.percentage}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Priorities & Strengths */}
        {scores && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Top Priorities */}
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Top Priorities</h3>
              </div>
              <ul className="space-y-2">
                {scores.topPriorities.length > 0 ? (
                  scores.topPriorities.map((priority, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-xs font-medium text-red-600 dark:text-red-400 flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-gray-700 dark:text-white/80 text-sm">{priority}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 dark:text-white/50 text-sm">
                    No critical priorities identified
                  </li>
                )}
              </ul>
            </div>

            {/* Strengths */}
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Key Strengths</h3>
              </div>
              <ul className="space-y-2">
                {scores.strengths.length > 0 ? (
                  scores.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xs font-medium text-green-600 dark:text-green-400 flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-gray-700 dark:text-white/80 text-sm">{strength}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 dark:text-white/50 text-sm">
                    Complete the assessment to see your strengths
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Executive Summary - Premium */}
        {insights?.executiveSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <FileText className="w-6 h-6 text-amber-700 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Executive Summary</h2>
                <p className="text-sm text-gray-500 dark:text-white/50">Your operational health overview</p>
              </div>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
              <p className="text-gray-700 dark:text-white/80 leading-relaxed">
                {insights.executiveSummary.overallAssessment}
              </p>
            </div>

            {/* Quoted Insight */}
            {insights.executiveSummary.quotedInsight && (
              <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6">
                <div className="flex items-start gap-3">
                  <Quote className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700 dark:text-white/80 italic">
                    {insights.executiveSummary.quotedInsight}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Top Strength</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-white/80">{insights.executiveSummary.topStrength}</p>
              </div>
              <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Critical Gap</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-white/80">{insights.executiveSummary.criticalGap}</p>
              </div>
              <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Brain className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">AI Readiness</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-white/80">{insights.executiveSummary.aiReadinessScore}/100</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Business Context */}
        {insights?.businessContext && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <BarChart3 className="w-6 h-6 text-blue-700 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Business Context</h2>
                <p className="text-sm text-gray-500 dark:text-white/50">Understanding your current position</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Operational Maturity</h4>
                <p className="text-sm text-gray-600 dark:text-white/70">{insights.businessContext.operationalMaturity}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Growth Stage</h4>
                <p className="text-sm text-gray-600 dark:text-white/70">{insights.businessContext.growthStage}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Primary Challenge</h4>
                <p className="text-sm text-gray-600 dark:text-white/70">{insights.businessContext.primaryChallenge}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Biggest Opportunity</h4>
                <p className="text-sm text-gray-600 dark:text-white/70">{insights.businessContext.biggestOpportunity}</p>
              </div>
              <div className="md:col-span-2">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">AI Readiness Assessment</h4>
                <p className="text-sm text-gray-600 dark:text-white/70">{insights.businessContext.aiReadinessAssessment}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* The "Aha" Insight */}
        {insights?.ahaInsight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800/30 rounded-xl p-6 sm:p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Lightbulb className="w-6 h-6 text-purple-700 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{insights.ahaInsight.title}</h2>
                <p className="text-sm text-gray-500 dark:text-white/50">The pattern you might have missed</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 dark:text-white/80 leading-relaxed">
                {insights.ahaInsight.observation}
              </p>

              {insights.ahaInsight.connectedDots.length > 0 && (
                <div className="bg-white/60 dark:bg-black/20 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Connected Patterns:</h4>
                  <ul className="space-y-2">
                    {insights.ahaInsight.connectedDots.map((dot, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-white/70">
                        <ChevronRight className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        {dot}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insights.ahaInsight.rootCauseChain.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {insights.ahaInsight.rootCauseChain.map((cause, i) => (
                    <span key={i} className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-white/60 dark:bg-black/20 rounded-full text-gray-700 dark:text-white/80">
                        {cause}
                      </span>
                      {i < insights.ahaInsight.rootCauseChain.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-purple-500" />
                      )}
                    </span>
                  ))}
                </div>
              )}

              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4 mt-4">
                <p className="text-purple-800 dark:text-purple-300 font-medium">
                  <strong>What Changes Everything:</strong> {insights.ahaInsight.whatChangesEverything}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Financial Impact */}
        {insights?.financialImpact && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-700 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Financial Impact Analysis</h2>
                <p className="text-sm text-gray-500 dark:text-white/50">Quantified business impact</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium uppercase mb-1">Identified Waste</p>
                <p className="text-xl font-bold text-red-700 dark:text-red-300">{insights.financialImpact.totalIdentifiedWaste}</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium uppercase mb-1">Revenue at Risk</p>
                <p className="text-xl font-bold text-orange-700 dark:text-orange-300">{insights.financialImpact.revenueAtRisk}</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase mb-1">Opportunity Cost</p>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{insights.financialImpact.opportunityCost}</p>
              </div>
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                <p className="text-xs text-teal-600 dark:text-teal-400 font-medium uppercase mb-1">AI Investment Gap</p>
                <p className="text-xl font-bold text-teal-700 dark:text-teal-300">{insights.financialImpact.aiInvestmentGap}</p>
              </div>
            </div>

            {insights.financialImpact.breakdownItems.length > 0 && (
              <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Cost Breakdown</h4>
                <div className="space-y-3">
                  {insights.financialImpact.breakdownItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gray-700 dark:text-white/80">{item.item}</span>
                        <span className="text-gray-500 dark:text-white/50 text-xs ml-2">({item.calculation})</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{item.annualCost}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase mb-1">3 Month ROI</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">{insights.financialImpact.roiProjection.month3}</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase mb-1">6 Month ROI</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">{insights.financialImpact.roiProjection.month6}</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase mb-1">12 Month ROI</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">{insights.financialImpact.roiProjection.month12}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Risk Assessment */}
        {insights?.riskAssessment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <Shield className="w-6 h-6 text-red-700 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Risk Assessment Matrix</h2>
                <p className="text-sm text-gray-500 dark:text-white/50">Key business risks identified</p>
              </div>
              <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${riskColors[insights.riskAssessment.overallRiskLevel]}`}>
                {insights.riskAssessment.overallRiskLevel.toUpperCase()} OVERALL RISK
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { key: 'keyPersonRisk', label: 'Key Person Risk', icon: Users },
                { key: 'operationalRisk', label: 'Operational Risk', icon: Gauge },
                { key: 'growthRisk', label: 'Growth Risk', icon: TrendingUp },
                { key: 'technologyRisk', label: 'Technology Risk', icon: Calculator },
                { key: 'competitiveRisk', label: 'Competitive Risk', icon: Target },
                { key: 'aiReadinessRisk', label: 'AI Readiness Risk', icon: Brain },
              ].map(({ key, label, icon: Icon }) => {
                const risk = insights.riskAssessment[key as keyof typeof insights.riskAssessment] as { level: string; impact: string; mitigation: string };
                return (
                  <div key={key} className="bg-gray-50 dark:bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-gray-600 dark:text-white/60" />
                      <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                        risk.level.toLowerCase().includes('critical') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        risk.level.toLowerCase().includes('high') ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        risk.level.toLowerCase().includes('moderate') ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {risk.level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-white/70 mb-2">{risk.impact}</p>
                    <div className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-500 dark:text-white/50">{risk.mitigation}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Dimension Deep Dives */}
        {insights?.dimensionInsights && insights.dimensionInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Lightbulb className="w-6 h-6 text-blue-700 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dimension Deep Dive</h2>
                <p className="text-sm text-gray-500 dark:text-white/50">Detailed analysis and recommendations</p>
              </div>
            </div>

            <div className="space-y-8">
              {insights.dimensionInsights.map((dim, index) => {
                const config = dimensionConfig[dim.dimension];
                const Icon = config?.icon || Gauge;
                return (
                  <motion.div
                    key={dim.dimension}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    className="border-l-4 border-amber-500 pl-6 py-2"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${config?.color || 'from-gray-500 to-gray-600'} text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{dim.label}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          dim.percentage >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          dim.percentage >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {dim.percentage}%
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-white/80 mb-4">{dim.diagnosis}</p>

                    {/* Quoted Response */}
                    {dim.quotedResponse && dim.quotedResponse !== 'Review your submitted responses' && (
                      <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400 p-3 rounded-r-lg mb-4">
                        <p className="text-sm text-gray-700 dark:text-white/80 italic">"{dim.quotedResponse}"</p>
                        <p className="text-xs text-gray-500 dark:text-white/50 mt-1">{dim.quotedAnalysis}</p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {/* Key Findings */}
                      {dim.keyFindings.length > 0 && dim.keyFindings[0] !== `${dim.label} score: ${dim.percentage}%` && (
                        <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-3">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Key Findings</h5>
                          <ul className="space-y-1">
                            {dim.keyFindings.map((finding, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-white/70">
                                <CheckCircle2 className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                {finding}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Immediate Actions */}
                      {dim.immediateActions.length > 0 && dim.immediateActions[0] !== 'Review your responses for this dimension' && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Immediate Actions</h5>
                          <ul className="space-y-1">
                            {dim.immediateActions.map((action, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-white/70">
                                <ArrowRight className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Benchmark */}
                    {dim.benchmarkComparison && dim.benchmarkComparison !== 'See benchmarks section' && (
                      <p className="text-xs text-gray-500 dark:text-white/50 bg-gray-100 dark:bg-white/5 rounded px-3 py-2">
                        📊 {dim.benchmarkComparison}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Implementation Roadmap */}
        {insights?.implementationRoadmap && insights.implementationRoadmap.phases.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Clock className="w-6 h-6 text-purple-700 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Implementation Roadmap</h2>
                <p className="text-sm text-gray-500 dark:text-white/50">{insights.implementationRoadmap.totalDuration}</p>
              </div>
            </div>

            {/* Quick Wins */}
            {insights.implementationRoadmap.quickWins.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Quick Wins (Start Today)
                </h4>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {insights.implementationRoadmap.quickWins.map((win, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-green-700 dark:text-green-400">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {win}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Phases */}
            <div className="relative">
              <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gradient-to-b from-purple-500 via-amber-500 to-green-500 hidden md:block" />
              <div className="space-y-6">
                {insights.implementationRoadmap.phases.map((phase, index) => (
                  <motion.div
                    key={phase.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                    className="relative md:pl-12"
                  >
                    <div className={`hidden md:flex absolute left-0 w-8 h-8 rounded-full items-center justify-center text-white text-sm font-bold ${
                      index === 0 ? 'bg-purple-500' : index === 1 ? 'bg-amber-500' : 'bg-green-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-5">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{phase.name}</h4>
                        <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-white/10 rounded-full text-gray-600 dark:text-white/60">
                          {phase.duration} • {phase.weeks}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-white/70 mb-3">{phase.objective}</p>

                      {phase.deliverables.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-xs font-medium text-gray-500 dark:text-white/50 uppercase mb-2">Deliverables</h5>
                          <div className="flex flex-wrap gap-2">
                            {phase.deliverables.map((del, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-white dark:bg-black/20 rounded text-gray-700 dark:text-white/70">
                                {del}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-white/50">
                        <span>📦 {phase.resourcesNeeded.join(', ')}</span>
                        <span>💰 {phase.estimatedInvestment}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Benchmarks */}
        {insights?.benchmarks && insights.benchmarks.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <BarChart3 className="w-6 h-6 text-indigo-700 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Industry Benchmarks</h2>
                <p className="text-sm text-gray-500 dark:text-white/50">How you compare</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-white/60">Metric</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-white/60">Your Score</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-white/60">Industry Avg</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-white/60">Top Performers</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-white/60">Assessment</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.benchmarks.map((benchmark, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-white/5">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{benchmark.metric}</td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-900 dark:text-white">{benchmark.yourScore}</td>
                      <td className="py-3 px-4 text-center text-gray-600 dark:text-white/70">{benchmark.industryAverage}</td>
                      <td className="py-3 px-4 text-center text-green-600 dark:text-green-400">{benchmark.topPerformers}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-white/70">{benchmark.assessment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Next Steps */}
        {insights?.nextSteps && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-6 sm:p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-200 dark:bg-amber-800/40 rounded-lg">
                <Sparkles className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Next Steps</h3>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/60 dark:bg-black/20 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Immediate</h4>
                <ul className="space-y-1">
                  {insights.nextSteps.immediate.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-white/70">
                      <ArrowRight className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/60 dark:bg-black/20 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">This Week</h4>
                <ul className="space-y-1">
                  {insights.nextSteps.thisWeek.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-white/70">
                      <ArrowRight className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/60 dark:bg-black/20 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">This Month</h4>
                <ul className="space-y-1">
                  {insights.nextSteps.thisMonth.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-white/70">
                      <ArrowRight className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/60 dark:bg-black/20 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">This Quarter</h4>
                <ul className="space-y-1">
                  {insights.nextSteps.thisQuarter.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-white/70">
                      <ArrowRight className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl p-8 text-center text-white"
        >
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h3 className="text-2xl font-bold mb-2">
            {insights?.nextSteps?.bookingCTA?.headline || 'Ready to Take Action?'}
          </h3>
          <p className="text-amber-100 mb-6 max-w-lg mx-auto">
            {insights?.nextSteps?.bookingCTA?.description || 'Book your complimentary 30-minute strategy session to discuss your results and create a personalized action plan with our operations experts.'}
          </p>
          <a
            href="mailto:hello@enapragma.co?subject=Strategy%20Session%20Request%20-%20Pragma%20Score"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-700 rounded-xl hover:bg-amber-50 transition-all font-semibold shadow-lg"
          >
            <Calendar className="w-5 h-5" />
            Book Your Strategy Session
          </a>
          <p className="text-amber-200 text-sm mt-4">
            No obligation • 100% focused on your results
          </p>
        </motion.div>
      </main>
    </div>
  );
}
