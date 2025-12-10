'use client';

import { motion } from 'framer-motion';
import { Gauge, Eye, Zap, Target, RefreshCw, Calculator } from 'lucide-react';

const dimensions = [
  {
    icon: Gauge,
    title: 'Control',
    description: 'How much of your business runs without specific individuals',
    detail: 'Measures key-person dependency, documentation levels, and decision bottlenecks.',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: Eye,
    title: 'Clarity',
    description: "Visibility into what's happening across your operations",
    detail: 'Assesses real-time awareness of revenue, projects, performance, and data accessibility.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: Zap,
    title: 'Leverage',
    description: 'Output generated per unit of effort, time, or person',
    detail: 'Evaluates revenue efficiency, automation potential, and strategic vs operational time.',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    icon: Target,
    title: 'Friction',
    description: 'Where work slows down, errors repeat, or effort is wasted',
    detail: 'Identifies bottlenecks, double-entry, onboarding gaps, and information silos.',
    color: 'from-yellow-500 to-lime-500',
  },
  {
    icon: RefreshCw,
    title: 'Change Readiness',
    description: "Your organization's capacity to adopt new tools and processes",
    detail: 'Gauges implementation history, team attitude, and ability to act on improvements.',
    color: 'from-lime-500 to-green-500',
  },
  {
    icon: Calculator,
    title: 'AI Investment',
    description: 'Your readiness to budget and track AI implementation costs',
    detail: 'Assesses spend awareness, budget allocation, cost forecasting, and ROI tracking.',
    color: 'from-teal-500 to-cyan-500',
  },
];

export function DimensionsSection() {
  return (
    <section id="dimensions" className="py-24 px-6 bg-gray-50 dark:bg-black/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What We Measure
          </h2>
          <p className="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
            Your operational health is scored across six critical dimensions,
            including AI Investment readiness—giving you the complete picture.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dimensions.map((dim, index) => {
            const Icon = dim.icon;
            return (
              <motion.div
                key={dim.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10 hover:border-amber-300 dark:hover:border-amber-700/50 transition-all group"
              >
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${dim.color} text-white shadow-lg mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {dim.title}
                </h3>
                <p className="text-gray-600 dark:text-white/70 mb-3">
                  {dim.description}
                </p>
                <p className="text-sm text-gray-500 dark:text-white/50">
                  {dim.detail}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
