'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  User,
  Mail,
  Building2,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Calendar,
  Loader2,
  Shield,
  Calculator
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';


export default function StartAssessment() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create checkout session
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create checkout session');
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
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
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Form */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-white/50 hover:text-amber-600 dark:hover:text-amber-400 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to overview
            </Link>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Start Your Assessment
            </h1>
            <p className="text-gray-600 dark:text-white/60 mb-8">
              Enter your details to begin the Pragma Score diagnostic
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg text-red-800 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">
                  Full Name *
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
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">
                  Work Email *
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
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none transition-colors"
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
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">
                  Phone Number <span className="text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !name || !email || !company}
                className="w-full py-4 bg-amber-800 dark:bg-amber-700 text-white font-semibold rounded-lg hover:bg-amber-900 dark:hover:bg-amber-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Security note */}
              <p className="text-center text-xs text-gray-500 dark:text-white/40 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Secure checkout powered by Stripe
              </p>
            </form>
          </div>

          {/* Right: Summary */}
          <div className="lg:pt-16">
            <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>

              <div className="border-b border-gray-200 dark:border-white/10 pb-4 mb-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-gray-900 dark:text-white font-medium">
                    Pragma Score Assessment
                  </span>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    $1,500
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-white/50">
                  One-time payment
                </p>
              </div>

              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                What&apos;s included:
              </h3>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 dark:text-white/70">
                    Comprehensive diagnostic across 5 dimensions
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Calculator className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 dark:text-white/70">
                    Financial impact analysis using YOUR actual numbers
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <FileText className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 dark:text-white/70">
                    Root cause diagnosis with actionable insights
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 dark:text-white/70">
                    30-minute strategy session with our team
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Clock className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 dark:text-white/70">
                    Implementation roadmap (DIY or EP builds it for you)
                  </span>
                </li>
              </ul>

              <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 dark:text-white font-semibold">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    $1,500
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
