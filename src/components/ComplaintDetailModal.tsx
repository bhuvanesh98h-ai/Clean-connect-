import React, { useState } from 'react';
import { useCleanConnect } from '../context/CleanConnectContext';
import { Complaint, ComplaintStatus, UserRole } from '../types';
import {
  X,
  MapPin,
  Clock,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  Star,
  HardHat,
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedback?: (complaint: Complaint) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onOpenFeedback,
}) => {
  const {
    currentUser,
    allUsers,
    updateComplaintStatus,
    assignStaffToComplaint,
    withdrawComplaint,
    reopenComplaint,
    feedbackList,
  } = useCleanConnect();

  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>('in_progress');
  const [statusNote, setStatusNote] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');

  const [isReopening, setIsReopening] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');

  if (!isOpen || !complaint) return null;

  const existingFeedback = feedbackList.find((f) => f.complaint_id === complaint.id);

  // Status badge styling (clean text with indicator dot, not a candy pill)
  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'submitted':
        return 'text-slate-600 dark:text-slate-400';
      case 'under_review':
        return 'text-blue-600 dark:text-blue-400';
      case 'assigned':
        return 'text-purple-600 dark:text-purple-400';
      case 'in_progress':
        return 'text-amber-600 dark:text-amber-400';
      case 'resolved':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'rejected':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-slate-600';
    }
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateComplaintStatus(
      complaint.id,
      selectedStatus,
      statusNote,
      selectedStatus === 'resolved' ? resolutionNotes : undefined
    );
    setIsEditingStatus(false);
    setStatusNote('');
    setResolutionNotes('');
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    assignStaffToComplaint(complaint.id, selectedStaffId, assignmentNote);
    setIsAssigning(false);
    setAssignmentNote('');
  };

  const handleReopenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;
    reopenComplaint(complaint.id, reopenReason);
    setIsReopening(false);
    setReopenReason('');
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    withdrawComplaint(complaint.id, withdrawReason);
    setIsWithdrawing(false);
    setWithdrawReason('');
  };

  const staffMembers = allUsers.filter((u) => u.role === 'staff' || u.role === 'admin');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl transition-all">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {complaint.ticket_code}
              </span>
              <span>·</span>
              <span className="capitalize">{complaint.category.replace('_', ' ')}</span>
              <span>·</span>
              <span className="font-semibold uppercase tracking-wider text-[11px] font-mono">
                {complaint.priority} Priority
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {complaint.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status summary banner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <div>
                <span className="text-xs text-slate-400 block">Current Status</span>
                <span className={`text-sm font-bold uppercase tracking-wider ${getStatusColor(complaint.status)}`}>
                  {complaint.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {complaint.assigned_staff_name && (
              <div className="text-xs">
                <span className="text-slate-400 block">Assigned Staff</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {complaint.assigned_staff_name}
                </span>
              </div>
            )}

            <div className="text-xs text-right">
              <span className="text-slate-400 block">Created</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {new Date(complaint.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Description & Photo */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Description & Evidence
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              {complaint.description}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{complaint.location}</span>
            </div>

            {complaint.photo_url && (
              <div className="mt-2">
                <p className="text-xs text-slate-400 mb-1">Attached Photo Verification:</p>
                <img
                  src={complaint.photo_url}
                  alt="Incident photo"
                  className="rounded-lg max-h-60 w-auto object-cover border border-slate-200 dark:border-slate-700"
                />
              </div>
            )}
          </div>

          {/* Resolution Notes if Resolved */}
          {complaint.status === 'resolved' && complaint.resolution_notes && (
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Resolution Dispatch Report</span>
              </div>
              <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                {complaint.resolution_notes}
              </p>
              {complaint.resolved_at && (
                <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 pt-1">
                  Resolved on: {new Date(complaint.resolved_at).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Resident Feedback Section */}
          {complaint.status === 'resolved' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Resident Satisfaction Feedback
                </span>
                {!existingFeedback && onOpenFeedback && (
                  <button
                    type="button"
                    onClick={() => onOpenFeedback(complaint)}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Submit Feedback</span>
                  </button>
                )}
              </div>
              {existingFeedback ? (
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= existingFeedback.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    ))}
                    <span className="text-slate-700 dark:text-slate-300 ml-1 font-semibold">
                      {existingFeedback.rating} / 5
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 italic">
                    "{existingFeedback.comments}"
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  No feedback recorded yet. Let the sanitation team know how they did.
                </p>
              )}
            </div>
          )}

          {/* Timeline & Status History */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Audit Trail & Status History
            </h3>
            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {complaint.status_history.map((hist, idx) => (
                <div key={hist.id || idx} className="flex items-start gap-4 text-xs relative pl-6">
                  <span className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white dark:border-slate-900" />
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {hist.changed_by_name} ({hist.new_status.replace('_', ' ')})
                      </span>
                      <span className="font-mono">
                        {new Date(hist.created_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {hist.note && <p className="text-slate-600 dark:text-slate-300">{hist.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Actions Section */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            {/* Admin or Staff status update action */}
            {(currentUser.role === 'admin' ||
              (currentUser.role === 'staff' && complaint.assigned_staff_id === currentUser.id)) && (
              <div className="space-y-2">
                {!isEditingStatus ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingStatus(true)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    Update Case Status
                  </button>
                ) : (
                  <form onSubmit={handleStatusSubmit} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
                      <span>Transition Status</span>
                      <button
                        type="button"
                        onClick={() => setIsEditingStatus(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <option value="under_review">Under Review</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>

                    <input
                      type="text"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="Optional internal dispatch note..."
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />

                    {selectedStatus === 'resolved' && (
                      <textarea
                        rows={2}
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Resolution summary (e.g. 2 metric tons cleared, curbside swept)..."
                        className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    )}

                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700"
                    >
                      Save Status
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Admin Staff Assignment */}
            {currentUser.role === 'admin' && (
              <div className="space-y-2">
                {!isAssigning ? (
                  <button
                    type="button"
                    onClick={() => setIsAssigning(true)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                  >
                    Assign Staff Officer
                  </button>
                ) : (
                  <form onSubmit={handleAssignSubmit} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
                      <span>Dispatch to Staff</span>
                      <button
                        type="button"
                        onClick={() => setIsAssigning(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                    <select
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <option value="">Select Staff Officer...</option>
                      {staffMembers.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.full_name} ({st.role})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={assignmentNote}
                      onChange={(e) => setAssignmentNote(e.target.value)}
                      placeholder="Dispatch instructions or priority note..."
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <button
                      type="submit"
                      disabled={!selectedStaffId}
                      className="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded hover:bg-slate-800 disabled:opacity-50"
                    >
                      Confirm Assignment
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Resident Reopen Control */}
            {currentUser.role === 'resident' &&
              (complaint.status === 'resolved' || complaint.status === 'rejected') && (
                <div>
                  {!isReopening ? (
                    <button
                      type="button"
                      onClick={() => setIsReopening(true)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-amber-300 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reopen Complaint</span>
                    </button>
                  ) : (
                    <form onSubmit={handleReopenSubmit} className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg space-y-2 text-xs">
                      <p className="font-semibold text-amber-900 dark:text-amber-200">
                        Reason for reopening ticket:
                      </p>
                      <textarea
                        rows={2}
                        value={reopenReason}
                        onChange={(e) => setReopenReason(e.target.value)}
                        placeholder="Explain why the problem was not adequately resolved..."
                        required
                        className="w-full p-2 border rounded bg-white dark:bg-slate-900"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-3 py-1 bg-amber-600 text-white rounded font-medium"
                        >
                          Submit Reopen Request
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsReopening(false)}
                          className="px-3 py-1 text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

            {/* Resident Withdraw Control */}
            {currentUser.role === 'resident' &&
              (complaint.status === 'submitted' || complaint.status === 'under_review') && (
                <div>
                  {!isWithdrawing ? (
                    <button
                      type="button"
                      onClick={() => setIsWithdrawing(true)}
                      className="px-3.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
                    >
                      Withdraw Complaint
                    </button>
                  ) : (
                    <form onSubmit={handleWithdrawSubmit} className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg space-y-2 text-xs">
                      <p className="font-semibold text-red-900 dark:text-red-200">
                        Reason for withdrawing this report:
                      </p>
                      <input
                        type="text"
                        value={withdrawReason}
                        onChange={(e) => setWithdrawReason(e.target.value)}
                        placeholder="e.g. Cleared by neighbors or reported by error"
                        className="w-full p-2 border rounded bg-white dark:bg-slate-900"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-3 py-1 bg-red-600 text-white rounded font-medium"
                        >
                          Confirm Withdrawal
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsWithdrawing(false)}
                          className="px-3 py-1 text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
