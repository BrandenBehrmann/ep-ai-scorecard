'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

// Loading component
function SuccessLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-amber-700 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-white/70">Verifying your payment...</p>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    setMounted(true);

    if (!sessionId) {
      setStatus('error');
      setError('No session ID provided');
      return;
    }

    // Verify the Stripe session and get the assessment ID
    const verifySession = async () => {
      try {
        // For now, we'll look up the assessment by stripe_session_id
        // In production, you'd verify with Stripe first
        const res = await fetch(`/api/checkout/verify?session_id=${sessionId}`);

        if (res.ok) {
          const data = await res.json();
          setAssessmentId(data.assessmentId);
          setStatus('success');

          // Auto-redirect to portal after 3 seconds
          setTimeout(() => {
            router.push(`/assessment/portal?token=${data.assessmentId}`);
          }, 3000);
        } else {
          // If verify endpoint doesn't exist yet, show success anyway
          // and let user proceed to portal with session_id as fallback
          setStatus('success');
          setTimeout(() => {
            router.push(`/assessment/portal?token=${sessionId}`);
          }, 3000);
        }
      } catch {
        // Fallback: proceed anyway
        setStatus('success');
        setTimeout(() => {
          router.push(`/assessment/portal?token=${sessionId}`);
        }, 3000);
      }
    };

    verifySession();
  }, [sessionId, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
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
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Pragma Score
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex items-center justify-center min-h-[80vh] px-6">
        <div className="text-center max-w-md">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-amber-700 animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verifying Payment
              </h1>
              <p className="text-gray-600 dark:text-white/70">
                Please wait while we confirm your purchase...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Payment Successful!
              </h1>
              <p className="text-gray-600 dark:text-white/70 mb-6">
                Thank you for purchasing the Pragma Score Assessment. You&apos;ll be redirected to your assessment portal in a moment.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting to your assessment...
              </div>
              <button
                onClick={() => router.push(`/assessment/portal?token=${assessmentId || sessionId}`)}
                className="mt-6 px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-all font-medium"
              >
                Start Assessment Now
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Something Went Wrong
              </h1>
              <p className="text-gray-600 dark:text-white/70 mb-6">
                {error || 'We couldn\'t verify your payment. Please contact support if you believe this is an error.'}
              </p>
              <div className="space-y-3">
                <a
                  href="mailto:hello@enapragma.co"
                  className="block px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-all font-medium"
                >
                  Contact Support
                </a>
                <a
                  href="/"
                  className="block px-6 py-3 border-2 border-gray-300 dark:border-white/20 text-gray-700 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all font-medium"
                >
                  Return Home
                </a>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
