'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import {
  Loader2,
  Eye,
  Edit3,
  ExternalLink,
  Search,
  Calendar,
  User,
  Building2,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Assessment {
  id: string;
  token: string;
  name: string;
  email: string;
  company: string;
  status: string;
  created_at: string;
  updated_at: string;
  scores?: {
    percentage: number;
    bandLabel: string;
  };
  insights?: Record<string, unknown>;
}

export default function AdminAssessmentsPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth');
      if (res.ok) {
        setAuthenticated(true);
        fetchAssessments();
      } else {
        router.push('/admin/login');
      }
    } catch {
      router.push('/admin/login');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  const fetchAssessments = async () => {
    try {
      const res = await fetch('/api/admin/assessments');
      const data = await res.json();
      if (res.ok && data.assessments) {
        setAssessments(data.assessments);
      }
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssessments = assessments.filter(a => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      in_progress: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'In Progress' },
      pending_review: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'Pending Review' },
      submitted: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Submitted' },
      report_ready: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-400', label: 'Report Ready' },
      released: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Released' },
    };
    const config = statusConfig[status] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400', label: status };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status === 'released' ? <CheckCircle2 className="w-3 h-3" /> :
         status === 'pending_review' ? <AlertCircle className="w-3 h-3" /> :
         status === 'in_progress' ? <Clock className="w-3 h-3" /> :
         <BarChart3 className="w-3 h-3" />}
        {config.label}
      </span>
    );
  };

  // Count pending reviews
  const pendingReviewCount = assessments.filter(a => a.status === 'pending_review').length;

  if (!mounted || !authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={resolvedTheme === 'dark' ? '/assets/logo-white.svg' : '/assets/logo-black.svg'}
                alt="Ena Score Admin"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-white/70 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Assessment Management</h1>
          <p className="text-gray-600 dark:text-white/70">View, edit, and add manual insights to completed assessments.</p>
        </div>

        {/* Pending Review Alert */}
        {pendingReviewCount > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-200 dark:bg-amber-800/40 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {pendingReviewCount} Assessment{pendingReviewCount > 1 ? 's' : ''} Pending Review
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-white/70">
                    These assessments are waiting for your review before customers can see their reports.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStatusFilter('pending_review')}
                className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-all text-sm font-medium"
              >
                View Pending
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="in_progress">In Progress</option>
              <option value="released">Released</option>
              <option value="submitted">Submitted</option>
              <option value="report_ready">Report Ready</option>
            </select>
          </div>
        </div>

        {/* Assessments Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-700 animate-spin" />
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No assessments found</h3>
            <p className="text-gray-600 dark:text-white/70">
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Assessments will appear here once created.'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-white/60">Company</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-white/60">Contact</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-white/60">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-white/60">Score</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-white/60">Created</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-white/60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssessments.map((assessment) => (
                    <tr key={assessment.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{assessment.company}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <User className="w-4 h-4 text-gray-400" />
                            {assessment.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-white/50">{assessment.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(assessment.status)}</td>
                      <td className="px-6 py-4">
                        {assessment.scores ? (
                          <div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{assessment.scores.percentage}%</span>
                            <div className="text-xs text-gray-500 dark:text-white/50">{assessment.scores.bandLabel}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/50">
                          <Calendar className="w-4 h-4" />
                          {formatDate(assessment.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/assessment/report?token=${assessment.token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 dark:text-white/60 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                            title="View Report"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => router.push(`/admin/assessments/${assessment.token}`)}
                            className="p-2 text-gray-600 dark:text-white/60 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                            title="Edit Insights"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/assessment/report?token=${assessment.token}`);
                            }}
                            className="p-2 text-gray-600 dark:text-white/60 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                            title="Copy Report Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
