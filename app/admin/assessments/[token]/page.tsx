'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import {
  Loader2,
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Target,
  MessageSquare,
  Building2,
  BarChart3,
  Send,
  Clock,
  RefreshCw,
  Copy,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { PremiumReportInsights } from '@/lib/premium-insights';

interface ManualInsight {
  id: string;
  title: string;
  observation: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'strategic' | 'operational' | 'financial' | 'technology' | 'people';
}

interface Assessment {
  id: string;
  token: string;
  name: string;
  email: string;
  company: string;
  status: string;
  scores?: {
    percentage: number;
    bandLabel: string;
    dimensions: { dimension: string; label: string; percentage: number }[];
  };
  insights?: PremiumReportInsights;
  manual_insights?: ManualInsight[];
}

export default function AdminAssessmentEditPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [manualInsights, setManualInsights] = useState<ManualInsight[]>([]);
  const [executiveOverride, setExecutiveOverride] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [releasing, setReleasing] = useState(false);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAssessment();
  }, [token]);

  const fetchAssessment = async () => {
    try {
      const res = await fetch(`/api/assessments/${token}`);
      const data = await res.json();
      if (res.ok && data.assessment) {
        setAssessment(data.assessment);
        // Load existing manual insights if any
        if (data.assessment.manual_insights) {
          setManualInsights(data.assessment.manual_insights);
        }
        // Load executive override if exists
        if (data.assessment.insights?.executiveOverride) {
          setExecutiveOverride(data.assessment.insights.executiveOverride);
        }
      } else {
        setError('Assessment not found');
      }
    } catch (err) {
      console.error('Failed to fetch assessment:', err);
      setError('Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const addNewInsight = () => {
    const newInsight: ManualInsight = {
      id: `manual-${Date.now()}`,
      title: '',
      observation: '',
      recommendation: '',
      priority: 'high',
      category: 'strategic',
    };
    setManualInsights([...manualInsights, newInsight]);
  };

  const updateInsight = (id: string, field: keyof ManualInsight, value: string) => {
    setManualInsights(
      manualInsights.map((insight) =>
        insight.id === id ? { ...insight, [field]: value } : insight
      )
    );
  };

  const removeInsight = (id: string) => {
    setManualInsights(manualInsights.filter((insight) => insight.id !== id));
  };

  const saveChanges = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/admin/assessments/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manual_insights: manualInsights.filter(i => i.title && i.observation),
          executive_override: executiveOverride || null,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      console.error('Failed to save:', err);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Generate AI insights if not already generated
  const generateInsights = async () => {
    setGeneratingInsights(true);
    try {
      const res = await fetch(`/api/insights/${token}`);
      const data = await res.json();
      if (res.ok && data.insights) {
        // Refresh assessment data
        await fetchAssessment();
      } else {
        setError('Failed to generate insights');
      }
    } catch (err) {
      console.error('Failed to generate insights:', err);
      setError('Failed to generate insights');
    } finally {
      setGeneratingInsights(false);
    }
  };

  // Release report to customer
  const releaseReport = async () => {
    if (!confirm('Are you sure you want to release this report? The customer will be able to view it immediately.')) {
      return;
    }

    setReleasing(true);
    try {
      // First save any pending changes
      await saveChanges();

      // Then release the report
      const res = await fetch(`/api/admin/assessments/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'released',
          released_at: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        // Refresh assessment data
        await fetchAssessment();
        alert('Report released successfully! The customer can now view their report.');
      } else {
        throw new Error('Failed to release');
      }
    } catch (err) {
      console.error('Failed to release report:', err);
      setError('Failed to release report');
    } finally {
      setReleasing(false);
    }
  };

  // Copy report link to clipboard
  const copyReportLink = () => {
    const link = `${window.location.origin}/assessment/report?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const priorityColors: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  const categoryIcons: Record<string, typeof Target> = {
    strategic: Target,
    operational: BarChart3,
    financial: Building2,
    technology: Lightbulb,
    people: MessageSquare,
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-700 animate-spin" />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h1>
          <p className="text-gray-600 dark:text-white/70 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/assessments')}
            className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/assessments')}
                className="p-2 text-gray-600 dark:text-white/60 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Image
                src={resolvedTheme === 'dark' ? '/assets/logo-white.svg' : '/assets/logo-black.svg'}
                alt="Pragma Score Admin"
                width={100}
                height={32}
                className="h-8 w-auto"
                priority
              />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded">
                Edit Assessment
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`/assessment/report?token=${token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                View Report
              </a>
              <button
                onClick={saveChanges}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-all text-sm font-medium disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saveSuccess ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saveSuccess ? 'Saved!' : 'Save Changes'}
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Assessment Info & Status */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{assessment.company}</h1>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  assessment.status === 'released' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  assessment.status === 'pending_review' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  assessment.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {assessment.status === 'released' ? 'Released' :
                   assessment.status === 'pending_review' ? 'Pending Review' :
                   assessment.status === 'in_progress' ? 'In Progress' :
                   assessment.status}
                </span>
              </div>
              <p className="text-gray-600 dark:text-white/70 mb-4">{assessment.name} • {assessment.email}</p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {/* Generate AI Insights Button - show if no insights yet */}
                {!assessment.insights && assessment.status !== 'in_progress' && (
                  <button
                    onClick={generateInsights}
                    disabled={generatingInsights}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium disabled:opacity-50"
                  >
                    {generatingInsights ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Generate AI Insights
                      </>
                    )}
                  </button>
                )}

                {/* Release Report Button - show only if pending_review and has insights */}
                {assessment.status === 'pending_review' && assessment.insights && (
                  <button
                    onClick={releaseReport}
                    disabled={releasing}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium disabled:opacity-50"
                  >
                    {releasing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Releasing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Release Report to Customer
                      </>
                    )}
                  </button>
                )}

                {/* Copy Link Button */}
                <button
                  onClick={copyReportLink}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white/80 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition-all text-sm"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Report Link
                    </>
                  )}
                </button>
              </div>

              {/* Status Messages */}
              {assessment.status === 'released' && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Report has been released. Customer can view it at the report link.
                  </p>
                </div>
              )}
              {assessment.status === 'pending_review' && !assessment.insights && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    AI insights need to be generated before releasing the report.
                  </p>
                </div>
              )}
              {assessment.status === 'in_progress' && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Customer is still completing the assessment.
                  </p>
                </div>
              )}
            </div>

            {/* Score Display */}
            {assessment.scores && (
              <div className="text-center md:text-right">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">{assessment.scores.percentage}%</div>
                <div className="text-sm text-gray-500 dark:text-white/50">{assessment.scores.bandLabel}</div>
              </div>
            )}
          </div>
        </div>

        {/* AI-Generated Summary Preview */}
        {assessment.insights?.executiveSummary && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-6 mb-8">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-3">
              AI-Generated Executive Summary
            </h3>
            <p className="text-gray-700 dark:text-white/80 mb-4">
              {assessment.insights.executiveSummary.verdict}
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-amber-700 dark:text-amber-400">
                <strong>If Nothing Changes:</strong> {assessment.insights.executiveSummary.inOneYear}
              </span>
              <span className="text-green-700 dark:text-green-400">
                <strong>If You Act:</strong> {assessment.insights.executiveSummary.ifYouAct}
              </span>
            </div>
          </div>
        )}

        {/* Executive Override */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-700" />
            Executive Commentary (Optional)
          </h2>
          <p className="text-sm text-gray-600 dark:text-white/70 mb-4">
            Add a personalized note that will appear at the top of the report. This is your opportunity to add context the AI may have missed.
          </p>
          <textarea
            value={executiveOverride}
            onChange={(e) => setExecutiveOverride(e.target.value)}
            placeholder="Enter your personalized executive commentary here. This will appear prominently in the report."
            className="w-full h-32 px-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none resize-none"
          />
        </div>

        {/* Manual Key Insights */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-700" />
                Manual Key Insights
              </h2>
              <p className="text-sm text-gray-600 dark:text-white/70 mt-1">
                Add specific insights, recommendations, or observations from your expert review.
              </p>
            </div>
            <button
              onClick={addNewInsight}
              className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Insight
            </button>
          </div>

          {manualInsights.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-lg border-2 border-dashed border-gray-200 dark:border-white/10">
              <Lightbulb className="w-12 h-12 text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-white/50 mb-4">No manual insights added yet.</p>
              <button
                onClick={addNewInsight}
                className="text-amber-700 dark:text-amber-400 hover:underline text-sm font-medium"
              >
                Click to add your first insight
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {manualInsights.map((insight, index) => {
                const CategoryIcon = categoryIcons[insight.category] || Lightbulb;
                return (
                  <div
                    key={insight.id}
                    className="bg-gray-50 dark:bg-white/5 rounded-lg p-5 border border-gray-200 dark:border-white/10"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <CategoryIcon className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-white/50">
                          Insight #{index + 1}
                        </span>
                      </div>
                      <button
                        onClick={() => removeInsight(insight.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={insight.title}
                          onChange={(e) => updateInsight(insight.id, 'title', e.target.value)}
                          placeholder="e.g., Revenue Concentration Risk"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1">
                            Priority
                          </label>
                          <select
                            value={insight.priority}
                            onChange={(e) => updateInsight(insight.id, 'priority', e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none text-sm ${priorityColors[insight.priority]}`}
                          >
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1">
                            Category
                          </label>
                          <select
                            value={insight.category}
                            onChange={(e) => updateInsight(insight.id, 'category', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none text-sm"
                          >
                            <option value="strategic">Strategic</option>
                            <option value="operational">Operational</option>
                            <option value="financial">Financial</option>
                            <option value="technology">Technology</option>
                            <option value="people">People</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1">
                        Observation *
                      </label>
                      <textarea
                        value={insight.observation}
                        onChange={(e) => updateInsight(insight.id, 'observation', e.target.value)}
                        placeholder="What you observed or noticed from their responses..."
                        className="w-full h-24 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none text-sm resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1">
                        Recommendation
                      </label>
                      <textarea
                        value={insight.recommendation}
                        onChange={(e) => updateInsight(insight.id, 'recommendation', e.target.value)}
                        placeholder="Your specific recommendation for addressing this..."
                        className="w-full h-24 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none text-sm resize-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* View Evidence Chain */}
        {assessment.insights?.coreDiagnosis?.evidenceChain && assessment.insights.coreDiagnosis.evidenceChain.length > 0 && (
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Evidence Chain (Key Quotes)
            </h2>
            <div className="space-y-4">
              {assessment.insights.coreDiagnosis.evidenceChain.map((evidence, i) => (
                <div key={i} className="bg-gray-50 dark:bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-amber-700 dark:text-amber-400 mb-2 italic">
                    &quot;{evidence.quote}&quot;
                  </p>
                  <p className="text-xs text-gray-600 dark:text-white/70">
                    {evidence.interpretation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
