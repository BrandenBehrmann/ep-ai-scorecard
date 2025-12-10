'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Clock, CheckCircle2 } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 pb-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 via-white to-white dark:from-amber-950/20 dark:via-black dark:to-black" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-200/30 dark:bg-amber-800/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-300/20 dark:bg-amber-700/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-800 dark:text-amber-400 text-sm font-medium mb-8">
            <Clock className="w-4 h-4" />
            30-Minute Diagnostic
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            How Much of Your Business{' '}
            <span className="text-amber-700 dark:text-amber-500">
              Runs Without You?
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
            Most businesses between 5-50 employees are bleeding time, money, and momentum
            through invisible operational gaps. This diagnostic reveals exactly where—and
            what to do about it.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-sm text-gray-500 dark:text-white/50">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              36 strategic questions
            </span>
            <span className="w-1 h-1 bg-gray-400 rounded-full hidden sm:block" />
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              6 dimensions measured
            </span>
            <span className="w-1 h-1 bg-gray-400 rounded-full hidden sm:block" />
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              AI-powered insights + budget planning
            </span>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/assessment/start"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              Start Your Assessment
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-4 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              Learn how it works
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
