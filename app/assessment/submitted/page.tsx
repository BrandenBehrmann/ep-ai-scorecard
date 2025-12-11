'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import {
  CheckCircle2,
  Clock,
  Mail,
  Calendar,
  Loader2,
  Sparkles,
  FileText,
  Users
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

function SubmittedLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-amber-700 animate-spin" />
    </div>
  );
}

export default function SubmittedPage() {
  return (
    <Suspense fallback={<SubmittedLoading />}>
      <SubmittedContent />
    </Suspense>
  );
}

function SubmittedContent() {
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [assessmentData, setAssessmentData] = useState<{
    name: string;
    company: string;
    email: string;
    status: string;
    short_code?: string;
  } | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    setMounted(true);

    if (token) {
      // Fetch assessment data to get name
      fetch(`/api/assessments/${token}`)
        .then(res => res.json())
        .then(data => {
          if (data.assessment) {
            setAssessmentData({
              name: data.assessment.name,
              company: data.assessment.company,
              email: data.assessment.email,
              status: data.assessment.status,
              short_code: data.assessment.short_code,
            });
          }
        })
        .catch(console.error);
    }
  }, [token]);

  if (!mounted) return null;

  // If report has been released, redirect to report page
  if (assessmentData?.status === 'released' || assessmentData?.status === 'report_ready') {
    if (typeof window !== 'undefined') {
      window.location.href = `/assessment/report?token=${token}`;
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={resolvedTheme === 'dark' ? '/assets/logo-white.svg' : '/assets/logo-black.svg'}
                alt="Ena Pragma"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        {/* Success Animation */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Assessment Submitted!
          </h1>
          <p className="text-lg text-gray-600 dark:text-white/70">
            Thank you{assessmentData?.name ? `, ${assessmentData.name.split(' ')[0]}` : ''}. Your responses have been received.
          </p>
        </div>

        {/* What Happens Next */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-600" />
            What Happens Next
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  1. AI Analysis In Progress
                </h3>
                <p className="text-gray-600 dark:text-white/70 text-sm">
                  Our AI is analyzing your responses across all 6 dimensions to generate deep insights about your business operations.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  2. Expert Review
                </h3>
                <p className="text-gray-600 dark:text-white/70 text-sm">
                  Our operations experts will review your AI-generated report and add personalized recommendations based on their experience.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  3. Report Delivery
                </h3>
                <p className="text-gray-600 dark:text-white/70 text-sm">
                  You'll receive an email notification when your personalized Ena Score report is ready to view.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Expected Timeline</h3>
          </div>
          <p className="text-gray-700 dark:text-white/80">
            Your report will typically be ready within <strong>24-48 hours</strong>. We'll send a notification to <strong>{assessmentData?.email || 'your email'}</strong> as soon as it's available.
          </p>
        </div>

        {/* Bookmark Reminder */}
        <div className="bg-gray-100 dark:bg-white/5 rounded-xl p-6 text-center">
          <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Your Report Link</h3>
          <p className="text-sm text-gray-600 dark:text-white/60 mb-4">
            Bookmark this link to check the status of your report anytime.
          </p>
          {(assessmentData?.short_code || token) && (
            <div className="bg-white dark:bg-black/30 rounded-lg p-3 text-sm text-gray-700 dark:text-white/70 font-mono">
              {typeof window !== 'undefined'
                ? `${window.location.origin}/r/${assessmentData?.short_code || token}`
                : `/r/${assessmentData?.short_code || token}`}
            </div>
          )}
        </div>

        {/* Questions CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-white/60 mb-2">Have questions?</p>
          <a
            href="mailto:hello@enapragma.co"
            className="text-amber-700 dark:text-amber-400 hover:underline font-medium"
          >
            Contact us at hello@enapragma.co
          </a>
        </div>
      </main>
    </div>
  );
}
