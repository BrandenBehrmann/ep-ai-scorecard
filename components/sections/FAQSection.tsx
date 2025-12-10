'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Why $1,500?',
    answer: "This isn't a quiz—it's a diagnostic. Our AI analyzes your responses and generates custom insights specific to your business. The price ensures we're both serious about improving your operations.",
  },
  {
    question: 'What if I already know my problems?',
    answer: "You probably know symptoms. This reveals root causes and prioritization. Most operators are surprised by what surfaces—and more importantly, by the order of priority for addressing issues.",
  },
  {
    question: 'Do I need to prepare anything?',
    answer: "No. Answer from your current knowledge. If you need to look things up, that itself is a signal about your operational clarity.",
  },
  {
    question: 'How long does the assessment take?',
    answer: "About 30 minutes. It's 36 questions across 6 dimensions, including AI Investment. Take your time—the more honest and detailed your responses, the more valuable your insights.",
  },
  {
    question: 'What happens after I get my report?',
    answer: "You'll have the option to book a complimentary 30-minute strategy session to discuss findings and next steps. No obligation, no pressure.",
  },
  {
    question: 'Why does the assessment include AI budgeting questions?',
    answer: "Most businesses underestimate AI implementation costs. Our AI Investment dimension helps you understand your current spend, budget readiness, and identifies potential hidden costs before you invest. It's what sets this assessment apart.",
  },
  {
    question: 'Can my team take this assessment?',
    answer: "The assessment is designed for business owners and operators who have visibility across the organization. For the most accurate results, the person with the broadest operational view should complete it.",
  },
  {
    question: 'What if I want to retake it later?',
    answer: "Past customers can request a discounted re-assessment after 6 months to measure progress. Contact us to arrange this.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-6 bg-gray-50 dark:bg-black/50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 dark:text-white/70">
            Everything you need to know before starting your assessment.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left bg-white dark:bg-white/5 rounded-xl p-5 border border-gray-200 dark:border-white/10 hover:border-amber-300 dark:hover:border-amber-700/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 dark:text-white/50 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-gray-600 dark:text-white/70 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
