import React, { useState } from 'react';
import { useCleanConnect } from '../context/CleanConnectContext';
import { Complaint, ComplaintStatus, ComplaintPriority, RecyclingArticle } from '../types';
import {
  CategoryBarChart,
  StatusDistributionDonut,
  TrendAreaChart,
} from '../components/Charts';
import {
  Shield,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Plus,
  RefreshCw,
  Eye,
  Check,
  Star,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Database,
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenDetailModal: (complaint: Complaint) => void;
  onOpenSupabaseModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenDetailModal,
  onOpenSupabaseModal,
}) => {
  const {
    currentUser,
    complaints,
    allUsers,
    assignStaffToComplaint,
    updateComplaintStatus,
    recyclingArticles,
    createRecyclingArticle,
    updateRecyclingArticle,
    deleteRecyclingArticle,
    feedbackList,
    auditLogs,
  } = useCleanConnect();

  // Admin tabs
  const [activeTab, setActiveTab] = useState<'complaints' | 'ai_insights' | 'recycling_cms' | 'feedback' | 'audit_log'>('complaints');

  // Filters & Pagination for complaints table
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // AI Insights State
  const [isGeneratingAiSummary, setIsGeneratingAiSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<{
    executiveSummary: string;
    identifiedHotspots: string[];
    recurringBottlenecks: string[];
    recommendedCivicActions: string[];
    provider?: string;
  } | null>(null);

  // New Article Form state
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState<RecyclingArticle['category']>('plastic');
  const [artSummary, setArtSummary] = useState('');
  const [artDos, setArtDos] = useState('');
  const [artDonts, setArtDonts] = useState('');
  const [artInstructions, setArtInstructions] = useState('');
  const [artDropoff, setArtDropoff] = useState('');

  // Confirmation modal state for destructive actions
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Guard: if non-admin somehow loads this page
  if (currentUser.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Access Restricted: Administrative Role Required
        </h2>
        <p className="text-xs text-slate-500">
          You are currently signed in as a {currentUser.role}. Administrative oversight and dispatch
          controls are restricted to authorized municipal personnel. Use the top demo switcher to switch
          roles if you are evaluating the platform.
        </p>
      </div>
    );
  }

  // Analytics counts
  const total = complaints.length;
  const pendingTriage = complaints.filter((c) => c.status === 'submitted' || c.status === 'under_review').length;
  const activeOps = complaints.filter((c) => c.status === 'assigned' || c.status === 'in_progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;
  const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCat = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesPri = priorityFilter === 'all' || c.priority === priorityFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.ticket_code.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.resident_name.toLowerCase().includes(q);
    return matchesStatus && matchesCat && matchesPri && matchesSearch;
  });

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage) || 1;
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const staffMembers = allUsers.filter((u) => u.role === 'staff' || u.role === 'admin');

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = [
      'Ticket Code',
      'Title',
      'Category',
      'Status',
      'Priority',
      'Location',
      'Resident Name',
      'Assigned Staff',
      'Created At',
      'Resolved At',
    ];
    const rows = complaints.map((c) => [
      c.ticket_code,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.status,
      c.priority,
      `"${c.location.replace(/"/g, '""')}"`,
      `"${c.resident_name}"`,
      `"${c.assigned_staff_name || 'Unassigned'}"`,
      c.created_at,
      c.resolved_at || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cleanconnect_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // AI Trend Summarizer handler
  const handleGenerateAiTrendSummary = async () => {
    setIsGeneratingAiSummary(true);
    try {
      const res = await fetch('/api/ai/summarize-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaints }),
      });
      const data = await res.json();
      setAiSummary(data);
    } catch {
      setAiSummary({
        executiveSummary: 'Civic records indicate sustained reports of overflowing bins and plastic litter around Sector 4 recreational trails.',
        identifiedHotspots: ['Riverside Community Park', 'High Street Central Median'],
        recurringBottlenecks: ['Weekend pedestrian surges', 'Loader availability for concrete masonry'],
        recommendedCivicActions: [
          'Deploy double-capacity solar compacting receptacles to Sector 4.',
          'Schedule bi-weekly rapid response sweeps along High Street.',
        ],
        provider: 'CleanConnect Operational Engine',
      });
    } finally {
      setIsGeneratingAiSummary(false);
    }
  };

  const handleCreateArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRecyclingArticle({
      title: artTitle,
      category: artCategory,
      summary: artSummary,
      dos: artDos.split('\n').filter((l) => l.trim().length > 0),
      donts: artDonts.split('\n').filter((l) => l.trim().length > 0),
      disposal_instructions: artInstructions,
      common_items: ['Custom Community Item'],
      contamination_risk: 'medium',
      dropoff_location: artDropoff || 'Civic Recycling Depot #2',
    });
    setIsAddingArticle(false);
    setArtTitle('');
    setArtSummary('');
    setArtDos('');
    setArtDonts('');
    setArtInstructions('');
    setArtDropoff('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <Shield className="w-4 h-4" />
            <span>Administrative Command</span>
            <span aria-hidden="true">·</span>
            <span>Civic Sanitation Authority</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Municipal Oversight & Dispatch Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit complaints, dispatch sanitation units, analyze urban trends, and manage community articles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenSupabaseModal}
            className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-xs"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database Setup</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Intake
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {total}
          </p>
          <span className="text-[11px] text-slate-400">All registered complaints</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pending Dispatch Triage
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
            {pendingTriage}
          </p>
          <span className="text-[11px] text-slate-400">Awaiting officer assignment</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Field Sweeps
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
            {activeOps}
          </p>
          <span className="text-[11px] text-slate-400">Assigned or in progress</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Resolution Success
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {resolutionRate}%
          </p>
          <span className="text-[11px] text-slate-400">{resolvedCount} cleared tickets</span>
        </div>
      </div>

      {/* Analytics Visualizers Accordion */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Civic Sanitation Trends & Pipeline Distribution
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Volume by Category
            </span>
            <CategoryBarChart complaints={complaints} />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Lifecycle Breakdown
            </span>
            <StatusDistributionDonut complaints={complaints} />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Reporting Velocity (7 Days)
            </span>
            <TrendAreaChart complaints={complaints} />
          </div>
        </div>
      </div>

      {/* Main Admin Tabbed Panels */}
      <div className="space-y-4">
        {/* Navigation Tabs (Interactive Segmented Controls) */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {[
            { id: 'complaints', label: `Complaints Queue (${complaints.length})` },
            { id: 'ai_insights', label: 'AI Trend & Duplicate Advisor' },
            { id: 'recycling_cms', label: `Recycling Directory CMS (${recyclingArticles.length})` },
            { id: 'feedback', label: `Resident Feedback (${feedbackList.length})` },
            { id: 'audit_log', label: `Audit Log (${auditLogs.length})` },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === t.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Complaints Table */}
        {activeTab === 'complaints' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search code, resident, or street..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="overflowing_bins">Overflowing Bins</option>
                  <option value="illegal_littering">Illegal Littering</option>
                  <option value="plastic_waste">Plastic Waste</option>
                  <option value="construction_debris">Construction Debris</option>
                  <option value="e_waste_hazard">E-Waste Hazard</option>
                  <option value="hazardous_chemicals">Hazardous Chemicals</option>
                  <option value="blocked_drainage">Blocked Drainage</option>
                  <option value="green_waste">Green Yard Waste</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* High-Density Data Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Ticket Code</th>
                    <th className="py-3 px-3">Title & Location</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Assigned Staff</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No records match the current filter parameters.
                      </td>
                    </tr>
                  ) : (
                    paginatedComplaints.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {c.ticket_code}
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {c.title}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{c.location}</p>
                        </td>
                        <td className="py-3 px-3 capitalize text-slate-600 dark:text-slate-300">
                          {c.category.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] font-semibold uppercase">
                          <span
                            className={
                              c.priority === 'urgent'
                                ? 'text-red-600'
                                : c.priority === 'high'
                                ? 'text-amber-600'
                                : 'text-slate-600'
                            }
                          >
                            {c.priority}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={c.status}
                            onChange={(e) =>
                              updateComplaintStatus(c.id, e.target.value as ComplaintStatus)
                            }
                            className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          >
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={c.assigned_staff_id || ''}
                            onChange={(e) => assignStaffToComplaint(c.id, e.target.value)}
                            className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 max-w-[140px]"
                          >
                            <option value="">Unassigned</option>
                            {staffMembers.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.full_name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => onOpenDetailModal(c)}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Inspect Complaint History & Notes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <span className="font-mono">
                Showing {paginatedComplaints.length} of {filteredComplaints.length} items (Page {currentPage} of {totalPages})
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-1.5 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-1.5 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Insights & Duplicate Detector */}
        {activeTab === 'ai_insights' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>CleanConnect AI Dispatch & Urban Trend Summarizer</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Analyzes current complaints database records via server-side Gemini AI to identify
                  hotspots and generate recommendations for public works leaders.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiTrendSummary}
                disabled={isGeneratingAiSummary}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                {isGeneratingAiSummary ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Trends...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Generate AI Executive Briefing</span>
                  </>
                )}
              </button>
            </div>

            {aiSummary ? (
              <div className="space-y-5 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Executive Briefing (via {aiSummary.provider || 'Gemini 3.8 Flash'})
                  </span>
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    {aiSummary.executiveSummary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      📍 Identified Civic Hotspots
                    </span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
                      {aiSummary.identifiedHotspots.map((spot, i) => (
                        <li key={i}>{spot}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      ⚠️ Bottlenecks & Hazards
                    </span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
                      {aiSummary.recurringBottlenecks.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <span className="font-semibold text-emerald-900 dark:text-emerald-200 block">
                    Recommended Public Works Action Items
                  </span>
                  <ul className="space-y-1.5 text-emerald-800 dark:text-emerald-300">
                    {aiSummary.recommendedCivicActions.map((act, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-2">
                <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-xs text-slate-500">
                  Click "Generate AI Executive Briefing" to parse all active reports and generate an
                  urban triage summary.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Recycling Directory CMS */}
        {activeTab === 'recycling_cms' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Manage Community Recycling Guides
                </h3>
                <p className="text-xs text-slate-500">
                  Add, update, or remove official material protocols displayed to residents.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingArticle((prev) => !prev)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingArticle ? 'Close Form' : 'Add New Protocol'}</span>
              </button>
            </div>

            {/* Add Protocol Form */}
            {isAddingArticle && (
              <form onSubmit={handleCreateArticleSubmit} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-3 text-xs border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block">
                  New Recycling Guide Protocol
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={artTitle}
                      onChange={(e) => setArtTitle(e.target.value)}
                      placeholder="e.g. Household Textiles & Clothing"
                      required
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Category</label>
                    <select
                      value={artCategory}
                      onChange={(e) => setArtCategory(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <option value="paper">Paper & Cardboard</option>
                      <option value="plastic">Plastics</option>
                      <option value="glass">Glass</option>
                      <option value="metal">Metals</option>
                      <option value="e_waste">E-Waste</option>
                      <option value="organic">Organic Compost</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Summary</label>
                  <input
                    type="text"
                    value={artSummary}
                    onChange={(e) => setArtSummary(e.target.value)}
                    placeholder="Brief description of the material and recycling benefit..."
                    required
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">
                      Dos (one per line)
                    </label>
                    <textarea
                      rows={2}
                      value={artDos}
                      onChange={(e) => setArtDos(e.target.value)}
                      placeholder="Wash and fold&#10;Remove metal buttons"
                      required
                      className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">
                      Don'ts (one per line)
                    </label>
                    <textarea
                      rows={2}
                      value={artDonts}
                      onChange={(e) => setArtDonts(e.target.value)}
                      placeholder="Do not include wet rags&#10;No chemical-soaked fabrics"
                      required
                      className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingArticle(false)}
                    className="px-3 py-1.5 text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700"
                  >
                    Publish Protocol
                  </button>
                </div>
              </form>
            )}

            {/* Existing Articles Table */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recyclingArticles.map((art) => (
                <div key={art.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {art.title}
                      </span>
                      <span className="font-mono text-slate-400">({art.category})</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 line-clamp-1">{art.summary}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete protocol "${art.title}"?`)) {
                        deleteRecyclingArticle(art.id);
                      }
                    }}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="Delete Article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Resident Feedback */}
        {activeTab === 'feedback' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Resident Satisfaction & Quality Ratings
              </h3>
              <p className="text-xs text-slate-500">
                Verified citizen reviews submitted upon complaint resolution.
              </p>
            </div>

            {feedbackList.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No resident feedback submitted yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {feedbackList.map((f) => (
                  <div key={f.id} className="py-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {f.ticket_code}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {new Date(f.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= f.rating ? 'fill-current' : 'text-slate-300'
                          }`}
                        />
                      ))}
                      <span className="text-slate-700 dark:text-slate-300 font-semibold ml-1">
                        {f.rating} / 5
                      </span>
                      <span className="text-slate-400 ml-2">by {f.resident_name}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 italic pt-1">
                      "{f.comments}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Audit Log */}
        {activeTab === 'audit_log' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Municipal Security Audit Log
              </h3>
              <p className="text-xs text-slate-500">
                Immutable chronological log of all administrative actions, staff dispatches, and
                status transitions.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase">
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3">User & Role</th>
                    <th className="py-2 px-3">Action</th>
                    <th className="py-2 px-3">Resource</th>
                    <th className="py-2 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-slate-800 dark:text-slate-200">
                        {log.user_email} ({log.user_role})
                      </td>
                      <td className="py-2 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                        {log.action}
                      </td>
                      <td className="py-2 px-3 text-slate-500">{log.target_resource}</td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-300 font-sans text-xs">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
