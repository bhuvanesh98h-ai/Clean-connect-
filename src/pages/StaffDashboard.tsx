import React, { useState } from 'react';
import { useCleanConnect } from '../context/CleanConnectContext';
import { Complaint, ComplaintStatus } from '../types';
import {
  HardHat,
  CheckCircle2,
  Clock,
  Eye,
  MapPin,
  FileText,
  AlertTriangle,
  Upload,
  Send,
} from 'lucide-react';

interface StaffDashboardProps {
  onOpenDetailModal: (complaint: Complaint) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ onOpenDetailModal }) => {
  const { currentUser, complaints, updateComplaintStatus } = useCleanConnect();

  const [activeTab, setActiveTab] = useState<'assigned' | 'in_progress' | 'completed'>('assigned');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [workNote, setWorkNote] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');

  // Filter complaints assigned to this staff member (or all active if admin is viewing staff tab)
  const myComplaints = complaints.filter(
    (c) =>
      c.assigned_staff_id === currentUser.id ||
      c.assigned_staff_name === currentUser.full_name ||
      currentUser.role === 'admin'
  );

  const pendingAssigned = myComplaints.filter((c) => c.status === 'assigned');
  const inProgressList = myComplaints.filter((c) => c.status === 'in_progress');
  const completedList = myComplaints.filter((c) => c.status === 'resolved');

  const displayedList =
    activeTab === 'assigned'
      ? pendingAssigned
      : activeTab === 'in_progress'
      ? inProgressList
      : completedList;

  const handleStartWork = (c: Complaint) => {
    updateComplaintStatus(c.id, 'in_progress', 'Field staff arrived on scene; cleanup initiated.');
  };

  const handleCompleteWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    updateComplaintStatus(
      selectedComplaint.id,
      'resolved',
      workNote || 'Field sweep complete. Area restored.',
      resolutionSummary || 'Public right-of-way cleared and verified by sanitation team.'
    );
    setSelectedComplaint(null);
    setWorkNote('');
    setResolutionSummary('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <HardHat className="w-4 h-4" />
            <span>Field Sanitation Roster</span>
            <span aria-hidden="true">·</span>
            <span>Staff Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Staff Work Queue: {currentUser.full_name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Assigned complaints, route navigation, and field resolution logs.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-mono">
          <span>Active Role: Staff Member</span>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Assigned / Awaiting Pickup
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-purple-600 dark:text-purple-400">
            {pendingAssigned.length}
          </p>
          <span className="text-[11px] text-slate-400">Ready for dispatch sweep</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Currently In Progress
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
            {inProgressList.length}
          </p>
          <span className="text-[11px] text-slate-400">Crew on scene cleaning</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Completed Sweeps
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {completedList.length}
          </p>
          <span className="text-[11px] text-slate-400">Resolved & verified</span>
        </div>
      </div>

      {/* Segmented Queue Filter */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('assigned')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'assigned'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          New Assignments ({pendingAssigned.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('in_progress')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'in_progress'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          In Progress ({inProgressList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'completed'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Cleared Cases ({completedList.length})
        </button>
      </div>

      {/* Main List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
        {displayedList.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Queue is completely clear!
            </h3>
            <p className="text-xs text-slate-500">
              No cases currently pending in this category. Check other tabs or await new dispatches.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {displayedList.map((c) => (
              <div
                key={c.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/40 p-3 rounded-xl transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-slate-500">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {c.ticket_code}
                    </span>
                    <span>·</span>
                    <span className="capitalize">{c.category.replace('_', ' ')}</span>
                    <span>·</span>
                    <span className="font-mono uppercase font-bold text-slate-700 dark:text-slate-300">
                      {c.priority} Priority
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {c.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{c.location}</span>
                    </span>
                    <span>·</span>
                    <span>Reported by {c.resident_name}</span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 line-clamp-2 pt-0.5">
                    {c.description}
                  </p>
                </div>

                {/* Staff Actions */}
                <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                  <button
                    type="button"
                    onClick={() => onOpenDetailModal(c)}
                    className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="View Full Ticket Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {c.status === 'assigned' && (
                    <button
                      type="button"
                      onClick={() => handleStartWork(c)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                    >
                      Begin Field Work
                    </button>
                  )}

                  {c.status === 'in_progress' && (
                    <button
                      type="button"
                      onClick={() => setSelectedComplaint(c)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                      Complete & Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Work Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div>
              <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                {selectedComplaint.ticket_code}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Log Case Completion
              </h3>
              <p className="text-xs text-slate-500">
                Record the final resolution details before marking this location clear.
              </p>
            </div>

            <form onSubmit={handleCompleteWork} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Resolution Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  placeholder="e.g. 500kg of concrete debris hauled away to Sector 4 aggregate recycler. Curbside swept clean."
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Internal Crew Work Note
                </label>
                <input
                  type="text"
                  value={workNote}
                  onChange={(e) => setWorkNote(e.target.value)}
                  placeholder="e.g. Loader unit #4 and 2 crew members"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-3 py-1.5 text-slate-600 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Verify & Mark Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
