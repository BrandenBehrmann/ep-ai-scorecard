'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { assessmentSections } from '@/lib/assessment-questions';

// Portal status types
type PortalStatus = 'not_started' | 'in_progress' | 'pending_review' | 'submitted' | 'report_ready' | 'released';

// Assessment data from API
interface AssessmentData {
  id: string;
  name: string;
  email: string;
  company: string;
  status: PortalStatus;
  current_step: number;
  responses: Record<string, string | string[] | number> | null;
  report_url: string | null;
}

// Loading fallback component
function PortalLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-amber-700 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-white/70">Loading your assessment...</p>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function AssessmentPortalPage() {
  return (
    <Suspense fallback={<PortalLoading />}>
      <AssessmentPortal />
    </Suspense>
  );
}

function AssessmentPortal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);

  // Portal state
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | string[] | number>>({});
  const [saving, setSaving] = useState(false);

  // Fetch assessment data from API
  useEffect(() => {
    setMounted(true);

    if (!token) {
      setError('No assessment token provided');
      setLoading(false);
      return;
    }

    const fetchAssessment = async () => {
      try {
        const res = await fetch(`/api/assessments/${token}`);
        const data = await res.json();

        if (!res.ok) {
          // Fallback to localStorage if API fails
          const localData = localStorage.getItem('pragma-assessment');
          if (localData) {
            const parsed = JSON.parse(localData);
            setAssessmentData(parsed);
            setCurrentStep(parsed.current_step || 0);
            setResponses(parsed.responses || {});
            setLoading(false);
            return;
          }
          setError(data.error || 'Assessment not found');
          setLoading(false);
          return;
        }

        const assessment = data.assessment;
        setAssessmentData(assessment);
        setCurrentStep(assessment.current_step || 0);
        setResponses(assessment.responses || {});
        setLoading(false);
      } catch {
        // Fallback to localStorage if API fails
        const localData = localStorage.getItem('pragma-assessment');
        if (localData) {
          const parsed = JSON.parse(localData);
          setAssessmentData(parsed);
          setCurrentStep(parsed.current_step || 0);
          setResponses(parsed.responses || {});
          setLoading(false);
          return;
        }
        setError('Failed to load assessment');
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [token]);

  // Save responses to API
  const saveResponses = async (newResponses: Record<string, string | string[] | number>, newStep?: number) => {
    if (!token) return;

    setSaving(true);

    try {
      await fetch(`/api/assessments/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: newResponses,
          current_step: newStep !== undefined ? newStep : currentStep,
          status: 'in_progress'
        })
      });

      // Also update localStorage as backup
      const localData = {
        ...assessmentData,
        responses: newResponses,
        current_step: newStep !== undefined ? newStep : currentStep,
        status: 'in_progress'
      };
      localStorage.setItem('pragma-assessment', JSON.stringify(localData));
    } catch (err) {
      console.error('Failed to save responses:', err);
      // Save to localStorage as fallback
      const localData = {
        ...assessmentData,
        responses: newResponses,
        current_step: newStep !== undefined ? newStep : currentStep,
        status: 'in_progress'
      };
      localStorage.setItem('pragma-assessment', JSON.stringify(localData));
    }
    setSaving(false);
  };

  // Handle step navigation
  const handleNext = () => {
    const newStep = Math.min(currentStep + 1, assessmentSections.length);
    setCurrentStep(newStep);
    saveResponses(responses, newStep);
  };

  const handlePrev = () => {
    const newStep = Math.max(currentStep - 1, 0);
    setCurrentStep(newStep);
    saveResponses(responses, newStep);
  };

  // Handle assessment submission
  const handleSubmit = async () => {
    if (!token) return;

    setSaving(true);

    try {
      const res = await fetch(`/api/assessments/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          current_step: assessmentSections.length,
          status: 'pending_review' // Changed: Hold for EP team review before customer sees report
        })
      });

      if (res.ok) {
        // Update localStorage
        const localData = {
          ...assessmentData,
          responses,
          current_step: assessmentSections.length,
          status: 'pending_review'
        };
        localStorage.setItem('pragma-assessment', JSON.stringify(localData));
        // Redirect to thank you page instead of report
        router.push(`/assessment/submitted?token=${token}`);
        return;
      }
    } catch (err) {
      console.error('Failed to submit assessment:', err);
    }
    setSaving(false);
  };

  // Response handlers
  const handleResponse = (questionId: string, value: string | string[] | number) => {
    const newResponses = { ...responses, [questionId]: value };
    setResponses(newResponses);
  };

  const handleMultiSelect = (questionId: string, option: string) => {
    const current = (responses[questionId] as string[]) || [];
    const updated = current.includes(option)
      ? current.filter(o => o !== option)
      : [...current, option];
    handleResponse(questionId, updated);
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-amber-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-white/70">Loading your assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-600">!</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Assessment Not Found</h1>
          <p className="text-gray-600 dark:text-white/70 mb-6">{error}</p>
          <a href="/assessment/demo" className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-all inline-block">
            Start New Assessment
          </a>
        </div>
      </div>
    );
  }

  const memberName = assessmentData?.name || 'Guest';
  const section = assessmentSections[currentStep];
  const isLastStep = currentStep === assessmentSections.length - 1;
  const progressPercentage = (currentStep / assessmentSections.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {mounted && (
                <Image
                  src={resolvedTheme === 'dark' ? '/assets/logo-white.svg' : '/assets/logo-black.svg'}
                  alt="Ena Pragma"
                  width={100}
                  height={32}
                  className="h-8 w-auto"
                  priority
                />
              )}
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Ena Score
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-sm text-gray-600 dark:text-white/70">
                Welcome, {memberName}
              </span>
              {saving && (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-[280px,1fr] gap-8">

            {/* Sidebar - Progress */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-4">
                  Progress
                </h3>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-white/50 mb-2">
                    <span>{currentStep} of {assessmentSections.length} complete</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-700 dark:bg-amber-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Section List */}
                <div className="space-y-2">
                  {assessmentSections.map((s, index) => (
                    <div
                      key={s.id}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                        index === currentStep ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle2 className="w-5 h-5 text-amber-700 dark:text-amber-400 flex-shrink-0" />
                      ) : index === currentStep ? (
                        <div className="w-5 h-5 rounded-full border-2 border-amber-700 dark:border-amber-400 flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-amber-700 dark:bg-amber-400" />
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 dark:text-white/20 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${
                        index <= currentStep
                          ? 'text-gray-900 dark:text-white font-medium'
                          : 'text-gray-400 dark:text-white/40'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Assessment Form */}
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8">
              {/* Mobile Progress */}
              <div className="lg:hidden mb-6">
                <div className="flex justify-between text-xs text-gray-500 dark:text-white/50 mb-2">
                  <span>Section {currentStep + 1} of {assessmentSections.length}</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-700 dark:bg-amber-500 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Section Header */}
              <div className="mb-8">
                <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">
                  Section {currentStep + 1} of {assessmentSections.length}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {section?.label}
                </h2>
                <p className="text-gray-600 dark:text-white/70">
                  {section?.description}
                </p>
                {section?.intro && (
                  <p className="mt-4 text-sm text-amber-800/80 dark:text-amber-400/80 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                    {section.intro}
                  </p>
                )}
              </div>

              {/* Questions */}
              <div className="space-y-8 mb-8">
                {section?.questions.map((q, index) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="space-y-3"
                  >
                    <label className="block text-base font-medium text-gray-900 dark:text-white">
                      {index + 1}. {q.question}
                    </label>

                    {q.helpText && (
                      <p className="text-sm text-gray-500 dark:text-white/50 italic">
                        {q.helpText}
                      </p>
                    )}

                    {/* Scale Question */}
                    {q.type === 'scale' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400 dark:text-white/40">
                          <span>{q.scaleLabels?.low}</span>
                          <span>{q.scaleLabels?.high}</span>
                        </div>
                        <div className="flex gap-2 sm:gap-3">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <label key={value} className="flex-1">
                              <input
                                type="radio"
                                name={q.id}
                                value={value}
                                checked={responses[q.id] === value}
                                onChange={() => handleResponse(q.id, value)}
                                className="sr-only"
                              />
                              <div className={`
                                h-12 rounded-lg border-2 flex items-center justify-center text-lg font-semibold cursor-pointer transition-all
                                ${responses[q.id] === value
                                  ? 'bg-amber-700 border-amber-700 text-white'
                                  : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:border-amber-400'
                                }
                              `}>
                                {value}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Text Question */}
                    {q.type === 'text' && (
                      <textarea
                        value={(responses[q.id] as string) || ''}
                        onChange={(e) => handleResponse(q.id, e.target.value)}
                        placeholder={q.placeholder}
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none transition-colors resize-none"
                      />
                    )}

                    {/* Select Question */}
                    {q.type === 'select' && (
                      <div className="space-y-2">
                        {q.options?.map((option) => (
                          <label
                            key={option}
                            className={`
                              flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                              ${responses[q.id] === option
                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-700 dark:border-amber-600'
                                : 'border-gray-200 dark:border-white/10 hover:border-amber-400'
                              }
                            `}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={option}
                              checked={responses[q.id] === option}
                              onChange={() => handleResponse(q.id, option)}
                              className="sr-only"
                            />
                            <div className={`
                              w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                              ${responses[q.id] === option
                                ? 'border-amber-700 dark:border-amber-400'
                                : 'border-gray-300 dark:border-white/30'
                              }
                            `}>
                              {responses[q.id] === option && (
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-700 dark:bg-amber-400" />
                              )}
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Multi-select Question */}
                    {q.type === 'multiselect' && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 dark:text-white/50">Select all that apply</p>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {q.options?.map((option) => {
                            const selected = ((responses[q.id] as string[]) || []).includes(option);
                            return (
                              <label
                                key={option}
                                className={`
                                  flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                                  ${selected
                                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-700 dark:border-amber-600'
                                    : 'border-gray-200 dark:border-white/10 hover:border-amber-400'
                                  }
                                `}
                              >
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => handleMultiSelect(q.id, option)}
                                  className="sr-only"
                                />
                                <div className={`
                                  w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                                  ${selected
                                    ? 'bg-amber-700 border-amber-700'
                                    : 'border-gray-300 dark:border-white/30'
                                  }
                                `}>
                                  {selected && (
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <span className="text-sm text-gray-900 dark:text-white">{option}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-white/10">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    currentStep === 0
                      ? 'opacity-50 cursor-not-allowed text-gray-400'
                      : 'border-2 border-amber-700 text-amber-700 dark:border-amber-400 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                  }`}
                >
                  Previous
                </button>

                {isLastStep ? (
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-8 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-all font-semibold flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Report...
                      </>
                    ) : (
                      'Submit & View Report'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-all font-semibold flex items-center gap-2"
                  >
                    Next Section
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
