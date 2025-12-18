'use client';

// Revenue Friction Diagnostic - Report Page
// December 2025 - v2 pivot
// LOCKED 8-SECTION OUTPUT - No additional sections, no soft language

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  AlertTriangle,
  Target,
  Quote,
  ChevronRight,
  XCircle,
  CheckCircle2,
  ArrowRight,
  Ban,
  FileCheck,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { RevenueFrictionDiagnostic } from '@/lib/premium-insights';
import { CONSTRAINT_CATEGORY_LABELS, type ConstraintCategory } from '@/lib/database.types';

// ============================================================================
// TYPES
// ============================================================================

interface AssessmentData {
  id: string;
  token: string;
  name: string;
  email: string;
  company: string;
  status: string;
  version?: 'v1_legacy' | 'v2_revenue_friction';
  constraint_result?: {
    primaryConstraint: {
      category: ConstraintCategory;
      label: string;
      ownerStatement: string;
      supportingEvidence: string[];
    };
    deprioritized: {
      statement: string;
    };
  };
  insights?: RevenueFrictionDiagnostic | null;
  responses?: Record<string, string | string[] | number>;
}

// ============================================================================
// LOADING COMPONENT
// ============================================================================

function ReportLoading({ message }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-amber-700 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-white/70">{message || 'Loading your diagnostic...'}</p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export default function ReportPage() {
  return (
    <Suspense fallback={<ReportLoading />}>
      <ReportContent />
    </Suspense>
  );
}

// ============================================================================
// REPORT CONTENT
// ============================================================================

function ReportContent() {
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();
  const token = searchParams.get('token');

  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [diagnostic, setDiagnostic] = useState<RevenueFrictionDiagnostic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingDiagnostic, setGeneratingDiagnostic] = useState(false);

  // Fetch assessment data
  useEffect(() => {
    async function fetchAssessment() {
      if (!token) {
        setError('No assessment token provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/assessments/${token}`);
        if (!response.ok) {
          throw new Error('Assessment not found');
        }
        const data = await response.json();
        setAssessment(data.assessment);

        // Check if we have insights already
        if (data.assessment.insights) {
          setDiagnostic(data.assessment.insights as RevenueFrictionDiagnostic);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    }

    fetchAssessment();
  }, [token]);

  // Generate diagnostic if not present
  useEffect(() => {
    async function generateDiagnostic() {
      if (!assessment || diagnostic || generatingDiagnostic) return;

      // Only generate for v2 assessments with valid status
      const validStatuses = ['submitted', 'pending_review', 'report_ready', 'released'];
      if (!validStatuses.includes(assessment.status)) return;
      if (assessment.version === 'v1_legacy') return;

      setGeneratingDiagnostic(true);
      try {
        const response = await fetch(`/api/insights/${token}`);
        if (response.ok) {
          const data = await response.json();
          setDiagnostic(data.insights as RevenueFrictionDiagnostic);
        }
      } catch (err) {
        console.error('Failed to generate diagnostic:', err);
      } finally {
        setGeneratingDiagnostic(false);
      }
    }

    generateDiagnostic();
  }, [assessment, diagnostic, token, generatingDiagnostic]);

  // Loading state
  if (loading) {
    return <ReportLoading />;
  }

  // Error state
  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Unable to Load Diagnostic
          </h1>
          <p className="text-gray-600 dark:text-white/70">
            {error || 'The diagnostic could not be found.'}
          </p>
        </div>
      </div>
    );
  }

  // Legacy v1 assessment
  if (assessment.version === 'v1_legacy') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <FileCheck className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Legacy Assessment
          </h1>
          <p className="text-gray-600 dark:text-white/70">
            This is a legacy v1 assessment. The new Revenue Friction Diagnostic format is not available for legacy assessments.
          </p>
        </div>
      </div>
    );
  }

  // Not ready state
  if (assessment.status === 'pending_review' || assessment.status === 'in_progress') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <Loader2 className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Diagnostic Being Prepared
          </h1>
          <p className="text-gray-600 dark:text-white/70">
            Your diagnostic is being finalized. Check back shortly.
          </p>
        </div>
      </div>
    );
  }

  // Generating state
  if (generatingDiagnostic) {
    return <ReportLoading message="Generating your diagnostic..." />;
  }

  // No diagnostic yet
  if (!diagnostic) {
    return <ReportLoading message="Loading diagnostic data..." />;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN REPORT - LOCKED 8 SECTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image
              src={resolvedTheme === 'dark' ? '/images/ena-logo-dark.png' : '/images/ena-logo.png'}
              alt="Ena Pragma"
              width={32}
              height={32}
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Revenue Friction Diagnostic
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        {/* Company Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {assessment.company}
          </h1>
          <p className="text-gray-600 dark:text-white/60">
            Prepared for {assessment.name}
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1: PRIMARY BOTTLENECK
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
              Primary Bottleneck
            </h2>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {diagnostic.primaryBottleneck.constraint}
          </h3>

          <blockquote className="border-l-4 border-red-400 pl-4 my-6">
            <Quote className="w-5 h-5 text-red-400 mb-2" />
            <p className="text-lg text-gray-800 dark:text-white/90 italic">
              &ldquo;{diagnostic.primaryBottleneck.ownerStatement}&rdquo;
            </p>
            <cite className="text-sm text-gray-600 dark:text-white/60 mt-2 block">
              — Your stated constraint
            </cite>
          </blockquote>

          <p className="text-gray-700 dark:text-white/80">
            {diagnostic.primaryBottleneck.inPlainTerms}
          </p>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2: WHY THIS IS THE PRIORITY
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-8"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Why This Is the Priority
          </h2>

          <p className="text-gray-700 dark:text-white/80 mb-6">
            {diagnostic.whyThisIsPriority.ruleExplanation}
          </p>

          {diagnostic.whyThisIsPriority.supportingEvidence.length > 0 && (
            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium text-gray-600 dark:text-white/60 uppercase tracking-wide">
                Supporting Evidence (Your Words)
              </p>
              {diagnostic.whyThisIsPriority.supportingEvidence.map((evidence, i) => (
                <div key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-white/5 rounded-lg p-3">
                  <Quote className="w-4 h-4 text-amber-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700 dark:text-white/80 italic text-sm">
                    &ldquo;{evidence}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
            <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
              {diagnostic.whyThisIsPriority.notOpinion}
            </p>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 3: COST OF INACTION
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Cost of Inaction
            </h2>
          </div>

          <div className="space-y-4">
            <p className="text-gray-700 dark:text-white/80">
              {diagnostic.costOfInaction.ifIgnored}
            </p>

            <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-4">
              <p className="text-orange-800 dark:text-orange-200 font-medium">
                {diagnostic.costOfInaction.timeframeWarning}
              </p>
            </div>

            <p className="text-gray-700 dark:text-white/80 font-medium">
              {diagnostic.costOfInaction.revenueLink}
            </p>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 4: WHAT NOT TO FIX YET
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Ban className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              What Not to Fix Yet
            </h2>
          </div>

          <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 dark:text-white/60 mb-2">You chose to deprioritize:</p>
            <p className="text-gray-800 dark:text-white/90 font-medium">
              &ldquo;{diagnostic.whatNotToFixYet.deprioritizedItem}&rdquo;
            </p>
          </div>

          {diagnostic.whatNotToFixYet.otherIssues.length > 0 && (
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600 dark:text-white/60">Other secondary issues:</p>
              <ul className="space-y-2">
                {diagnostic.whatNotToFixYet.otherIssues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-white/80">
                    <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-gray-600 dark:text-white/70 text-sm">
            {diagnostic.whatNotToFixYet.reasoning}
          </p>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 5: WHAT A GOOD FIX LOOKS LIKE
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              What a Good Fix Looks Like
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-white/60 mb-2">Success state:</p>
              <p className="text-gray-800 dark:text-white/90 font-medium">
                {diagnostic.goodFixLooksLike.successState}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-white/60 mb-2">You will know because:</p>
              <p className="text-gray-800 dark:text-white/90">
                {diagnostic.goodFixLooksLike.youWillKnowBecause}
              </p>
            </div>

            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200 text-sm">
                {diagnostic.goodFixLooksLike.notPrescriptive}
              </p>
            </div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 6: TWO PATHS FORWARD
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">
            Two Paths Forward
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* DIY Path */}
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Do It Yourself
              </h3>
              <p className="text-gray-700 dark:text-white/80 mb-4">
                {diagnostic.twoPathsForward.diyPath.description}
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-white/60">Requires: </span>
                  <span className="text-gray-800 dark:text-white/90">
                    {diagnostic.twoPathsForward.diyPath.requires}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-white/60">Realistic if: </span>
                  <span className="text-gray-800 dark:text-white/90">
                    {diagnostic.twoPathsForward.diyPath.realistic}
                  </span>
                </div>
              </div>
            </div>

            {/* EP System Path */}
            {diagnostic.twoPathsForward.epSystemPath ? (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {diagnostic.twoPathsForward.epSystemPath.systemName}
                </h3>
                <p className="text-gray-700 dark:text-white/80 mb-4">
                  {diagnostic.twoPathsForward.epSystemPath.whatItDoes}
                </p>
                <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3">
                  <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                    Outcome: {diagnostic.twoPathsForward.epSystemPath.outcome}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  No Fixed System Lane
                </h3>
                <p className="text-gray-600 dark:text-white/70">
                  {diagnostic.twoPathsForward.noLaneFits}
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 7: WHAT THIS DIAGNOSTIC DOES NOT DO
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-100 dark:bg-white/5 rounded-2xl p-8"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            What This Diagnostic Does Not Do
          </h2>

          <ul className="space-y-2">
            {diagnostic.doesNotDo.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-white/70">
                <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                {item}
              </li>
            ))}
          </ul>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 8: FINALITY STATEMENT
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-900 dark:bg-white/10 rounded-2xl p-8 text-center"
        >
          <p className="text-xl font-bold text-white mb-4">
            {diagnostic.finalityStatement.statement}
          </p>
          <p className="text-white/70">
            {diagnostic.finalityStatement.noUpsell}
          </p>
        </motion.section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image
              src={resolvedTheme === 'dark' ? '/images/ena-logo-dark.png' : '/images/ena-logo.png'}
              alt="Ena Pragma"
              width={24}
              height={24}
            />
            <span className="text-sm text-gray-600 dark:text-white/60">
              Revenue Friction Diagnostic by Ena Pragma
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-white/40">
            Generated {new Date(diagnostic.generatedAt).toLocaleDateString()}
          </p>
        </footer>
      </main>
    </div>
  );
}
