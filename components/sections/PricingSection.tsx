'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, FileText, Target, Calendar, Zap } from 'lucide-react';

const deliverables = [
  {
    icon: FileText,
    title: 'Personalized Scorecard Report',
    description: 'Detailed breakdown of your scores across all 5 dimensions with AI-generated insights specific to your responses.',
  },
  {
    icon: Target,
    title: 'Priority Recommendations',
    description: 'Ranked list of high-impact opportunities based on your unique situation and biggest gaps.',
  },
  {
    icon: Calendar,
    title: '30-Minute Strategy Session',
    description: 'One-on-one call with our team to review results and discuss actionable next steps.',
  },
  {
    icon: Zap,
    title: 'Action Roadmap',
    description: 'Phased implementation plan with quick wins, foundation building, and AI readiness steps.',
  },
];

const included = [
  'Full 30-question diagnostic assessment',
  'AI-powered personalized analysis',
  'Score across 5 operational dimensions',
  'Custom recommendations for your business',
  '30-minute strategy session included',
  'Lifetime access to your results',
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-amber-50/50 via-white to-white dark:from-amber-950/20 dark:via-black dark:to-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What You Get
          </h2>
          <p className="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
            A comprehensive diagnostic that reveals your operational blind spots
            and provides a clear path forward.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Deliverables */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-6">
              {deliverables.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 dark:text-white/70 text-sm">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Pricing Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-amber-800 to-amber-900 dark:from-amber-700 dark:to-amber-800 rounded-3xl p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-amber-200 text-sm font-medium mb-1">Investment</p>
                  <p className="text-4xl font-bold">$1,500</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-200 text-sm">One-time payment</p>
                  <p className="text-amber-100 text-sm">No subscription</p>
                </div>
              </div>

              <div className="border-t border-amber-700/50 pt-6 mb-6">
                <p className="text-amber-100 text-sm font-medium mb-4">Everything included:</p>
                <ul className="space-y-3">
                  {included.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-amber-50">
                      <CheckCircle2 className="w-5 h-5 text-amber-300 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/assessment/start"
                className="group w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-white text-amber-900 font-semibold rounded-xl hover:bg-amber-50 transition-colors"
              >
                Start Your Assessment
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <p className="text-amber-200/70 text-xs text-center mt-4">
                Secure payment via Stripe. Instant access after purchase.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Who it's for */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600 dark:text-white/60 max-w-3xl mx-auto">
            <span className="font-semibold text-gray-900 dark:text-white">Best for:</span>{' '}
            Business owners and operators at companies doing $1M-$50M in revenue who want
            to understand their AI readiness before making technology investments.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
