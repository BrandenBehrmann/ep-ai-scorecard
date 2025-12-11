'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import {
  User,
  Mail,
  Building2,
  ArrowRight,
  Loader2,
  Clock,
  BarChart3,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AssessmentStart() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company,
          is_demo: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create assessment');
      }

      const data = await response.json();
      const token = data.token || data.id;

      // Store in localStorage as backup
      localStorage.setItem('pragma-assessment', JSON.stringify({
        id: token,
        name,
        email,
        company,
        status: 'in_progress',
        current_step: 0,
        responses: {},
        created_at: new Date().toISOString()
      }));

      router.push(`/assessment/portal?token=${token}`);
    } catch (error) {
      console.error('Error creating assessment:', error);
      // Fallback to localStorage-only if API fails
      const token = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('pragma-assessment', JSON.stringify({
        id: token,
        name,
        email,
        company,
        status: 'in_progress',
        current_step: 0,
        responses: {},
        created_at: new Date().toISOString()
      }));
      router.push(`/assessment/portal?token=${token}`);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
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
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Value Proposition */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Discover What's Really Holding Your Business Back
            </h1>
            <p className="text-lg text-gray-600 dark:text-white/70 mb-8">
              The Pragma Score is a comprehensive business diagnostic that reveals hidden patterns,
              quantifies operational risk, and provides a clear roadmap for growth.
            </p>

            {/* What You'll Get */}
            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                What You'll Receive
              </h3>
              <div className="space-y-3">
                {[
                  { icon: BarChart3, text: 'Complete 6-dimension operational analysis' },
                  { icon: Lightbulb, text: 'AI-powered insights that reveal hidden patterns' },
                  { icon: CheckCircle2, text: 'Quantified financial impact assessment' },
                  { icon: Clock, text: 'Personalized 90-day implementation roadmap' },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    </div>
                    <span className="text-gray-700 dark:text-white/80">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Estimate */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/50">
              <Clock className="w-4 h-4" />
              <span>Takes approximately 15-20 minutes to complete</span>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Start Your Assessment
            </h2>
            <p className="text-gray-600 dark:text-white/70 mb-6">
              Enter your details below to begin. Your results will be saved and available immediately upon completion.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">
                  Your Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Smith"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">
                  Company Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !name || !email || !company}
                className="w-full py-4 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-700/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Your Assessment...
                  </>
                ) : (
                  <>
                    Begin Assessment
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-500 dark:text-white/40">
              Your information is secure and will only be used to personalize your report.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
