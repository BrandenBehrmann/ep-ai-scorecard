'use client';

import { motion } from 'framer-motion';
import { CreditCard, ClipboardList, FileText, Calendar } from 'lucide-react';

const steps = [
  {
    icon: CreditCard,
    step: '01',
    title: 'Purchase & Access',
    description: 'Complete your purchase, then immediately access the assessment. No scheduling, no calls, no waiting.',
  },
  {
    icon: ClipboardList,
    step: '02',
    title: 'Complete the Diagnostic',
    description: 'Answer 36 questions across 6 operational dimensions, including AI Investment readiness. Be honest—the value is in the accuracy.',
  },
  {
    icon: FileText,
    step: '03',
    title: 'Receive Your Scorecard',
    description: 'Our AI analyzes your responses, scores your business, and generates a personalized report with specific recommendations.',
  },
  {
    icon: Calendar,
    step: '04',
    title: 'Strategy Session',
    description: 'Book your complimentary 30-minute call to discuss your results and explore next steps.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
            From purchase to actionable insights in under 30 minutes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-amber-300 to-amber-100 dark:from-amber-700 dark:to-amber-900" />
                )}

                <div className="text-center">
                  <div className="relative inline-flex mb-4">
                    <div className="w-24 h-24 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                      <Icon className="w-10 h-10 text-amber-700 dark:text-amber-500" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-amber-700 text-white text-sm font-bold rounded-full flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
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
      </div>
    </section>
  );
}
