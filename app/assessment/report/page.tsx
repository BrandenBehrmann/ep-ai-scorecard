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
  Download
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

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
  name: string;
  email: string;
  company: string;
  status: string;
  scores: ScoresData | null;
}

// Loading component
function ReportLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-amber-700 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-white/70">Loading your report...</p>
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

        setAssessment(data.assessment);
        setLoading(false);
      } catch {
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
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={resolvedTheme === 'dark' ? '/assets/logo-white.svg' : '/assets/logo-black.svg'}
                alt="Pragma Score"
                width={100}
                height={32}
                className="h-8 w-auto"
                priority
              />
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Pragma Score
              </span>
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

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Report Header */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Pragma Score Report
              </h1>
              <p className="text-gray-600 dark:text-white/70">
                {assessment.company} • {assessment.name}
              </p>
            </div>
            <div className="text-left sm:text-right text-sm text-gray-500 dark:text-white/50">
              Assessment completed
            </div>
          </div>

          {/* Overall Score */}
          {scores && (
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-gray-200 dark:text-white/10"
                  />
                  <motion.circle
                    cx="72"
                    cy="72"
                    r="64"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeLinecap="round"
                    className={`${bandColors[scores.band].replace('bg-', 'text-')}`}
                    strokeDasharray={`${(scores.percentage / 100) * 402} 402`}
                    initial={{ strokeDasharray: '0 402' }}
                    animate={{ strokeDasharray: `${(scores.percentage / 100) * 402} 402` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {scores.percentage}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-white/50">out of 100</span>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold text-sm mb-3 ${bandColors[scores.band]}`}>
                  {scores.bandLabel}
                </div>
                <p className="text-gray-600 dark:text-white/70 max-w-lg">
                  {scores.band === 'critical' && 'Your operations have significant vulnerabilities that need immediate attention. Focus on the critical areas below to stabilize your business.'}
                  {scores.band === 'at-risk' && 'Your business shows signs of operational stress. Addressing the priorities below will reduce risk and improve efficiency.'}
                  {scores.band === 'stable' && 'Your operations are functioning well with room for optimization. The insights below can help you move to the next level.'}
                  {scores.band === 'optimized' && 'Excellent operational health! Your business is well-positioned for growth. Continue investing in your strengths.'}
                </p>
              </div>
            </div>
          )}
        </div>

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

        {/* CTA */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-6 text-center">
          <Calendar className="w-10 h-10 text-amber-700 dark:text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Ready to take action?
          </h3>
          <p className="text-gray-600 dark:text-white/70 mb-4 max-w-lg mx-auto">
            Book your complimentary 30-minute strategy session to discuss your results and create an action plan.
          </p>
          <a
            href="mailto:hello@enapragma.co?subject=Strategy%20Session%20Request"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-all font-medium"
          >
            <Calendar className="w-5 h-5" />
            Book Strategy Session
          </a>
        </div>
      </main>
    </div>
  );
}
