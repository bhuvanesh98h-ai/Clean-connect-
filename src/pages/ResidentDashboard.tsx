import React, { useState } from 'react';
import { useCleanConnect } from '../context/CleanConnectContext';
import { Complaint, ComplaintCategory, ComplaintStatus } from '../types';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Star,
  RotateCcw,
  Trash2,
  Bell,
  MapPin,
  Calendar,
} from 'lucide-react';

interface ResidentDashboardProps {
  onOpenReportModal: () => void;
  onOpenDetailModal: (complaint: Complaint) => void;
  onOpenFeedbackModal: (complaint: Complaint) => void;
}

export const ResidentDashboard: React.FC<ResidentDashboardProps> = ({
  onOpenReportModal,
  onOpenDetailModal,
  onOpenFeedbackModal,
}) => {
  const { currentUser, complaints, notifications, withdrawComplaint } = useCleanConnect();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'priority'>('date_desc');

  // Filter complaints to current resident
  const userComplaints = complaints.filter(
    (c) => c.user_id === currentUser.id || c.resident_email === currentUser.email
  );

  const activeCount = userComplaints.filter(
    (c) => c.status === 'in_progress' || c.status === 'assigned'
  ).length;
  const pendingCount = userComplaints.filter(
    (c) => c.status === 'submitted' || c.status === 'under_review'
  ).length;
  const resolvedCount = userComplaints.filter((c) => c.status === 'resolved').length;

  const filteredComplaints = userComplaints.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCat = categoryFilter === 'all' || c.category === categoryFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.ticket_code.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q);
    return matchesStatus && matchesCat && matchesSearch;
  });

  filteredComplaints.sort((a, b) => {
    if (sortBy === 'date_desc') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === 'date_asc') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    const priorityWeight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
    return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
  });

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'submitted':
        return <span className="text-slate-600 dark:text-slate-400 font-semibold text-[11px] uppercase">Submitted</span>;
      case 'under_review':
        return <span className="text-blue-600 dark:text-blue-400 font-semibold text-[11px] uppercase">Under Review</span>;
      case 'assigned':
        return <span className="text-purple-600 dark:text-purple-400 font-semibold text-[11px] uppercase">Assigned</span>;
      case 'in_progress':
        return <span className="text-amber-600 dark:text-amber-400 font-semibold text-[11px] uppercase">In Progress</span>;
      case 'resolved':
        return <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] uppercase">Resolved</span>;
      case 'rejected':
        return <span className="text-red-600 dark:text-red-400 font-semibold text-[11px] uppercase">Rejected</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span>Resident Dashboard</span>
            <span aria-hidden="true">·</span>
            <span>Community Member</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Welcome back, {currentUser.full_name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your submitted waste reports, monitor cleanup progress, and share feedback.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenReportModal}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report Waste Problem</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            My Submitted Cases
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {userComplaints.length}
          </p>
          <span className="text-[11px] text-slate-400">Total reports filed</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pending Dispatch Review
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
            {pendingCount}
          </p>
          <span className="text-[11px] text-slate-400">Awaiting officer review</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Field Sweeps
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
            {activeCount}
          </p>
          <span className="text-[11px] text-slate-400">Crews en route or cleaning</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Successfully Resolved
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {resolvedCount}
          </p>
          <span className="text-[11px] text-slate-400">Cleaned & verified</span>
        </div>
      </div>

      {/* Complaints List Section with Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket code (e.g. CC-2026-104), headline, or street..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="priority">Priority First</option>
            </select>
          </div>
        </div>

        {/* Complaints Table or Cards */}
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No matching complaints found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't filed any reports matching this filter criteria.
            </p>
            <button
              type="button"
              onClick={onOpenReportModal}
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Report a Problem
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredComplaints.map((c) => (
              <div
                key={c.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 p-3 rounded-xl transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {c.ticket_code}
                    </span>
                    <span>·</span>
                    <span className="capitalize">{c.category.replace('_', ' ')}</span>
                    <span>·</span>
                    <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">
                      {c.priority} Priority
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {c.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{c.location}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(c.created_at).toLocaleDateString()}</span>
                    </span>
                    {c.assigned_staff_name && (
                      <>
                        <span>·</span>
                        <span>Assigned to {c.assigned_staff_name}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right side: Status and Actions */}
                <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                  <div className="text-right sm:mr-2">{getStatusBadge(c.status)}</div>

                  <button
                    type="button"
                    onClick={() => onOpenDetailModal(c)}
                    className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="View Full Case History"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {c.status === 'resolved' && (
                    <button
                      type="button"
                      onClick={() => onOpenFeedbackModal(c)}
                      className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 rounded-lg flex items-center gap-1 transition-colors"
                      title="Rate Resolution Quality"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>Rate</span>
                    </button>
                  )}

                  {(c.status === 'submitted' || c.status === 'under_review') && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Withdraw complaint ${c.ticket_code}?`)) {
                          withdrawComplaint(c.id, 'Withdrawn by resident');
                        }
                      }}
                      className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Withdraw Complaint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
