import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
  RecyclingArticle,
  AppNotification,
  ComplaintFeedback,
  AuditLog,
  ContactInquiry,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_COMPLAINTS,
  INITIAL_RECYCLING_ARTICLES,
  INITIAL_NOTIFICATIONS,
  INITIAL_FEEDBACK,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  statusMessage?: string;
}

interface CleanConnectContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  switchUserRole: (role: UserRole) => void;
  setCurrentUser: (user: UserProfile) => void;
  loginUser: (email: string) => boolean;
  registerUser: (name: string, email: string, role?: UserRole) => UserProfile;
  logoutUser: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;

  complaints: Complaint[];
  createComplaint: (data: {
    title: string;
    category: Complaint['category'];
    description: string;
    location: string;
    latitude?: number;
    longitude?: number;
    photo_url?: string;
    priority?: ComplaintPriority;
  }) => Complaint;
  updateComplaint: (
    id: string,
    updates: Partial<Omit<Complaint, 'id' | 'ticket_code' | 'user_id' | 'status_history'>>
  ) => boolean;
  withdrawComplaint: (id: string, reason?: string) => boolean;
  reopenComplaint: (id: string, reason: string) => boolean;
  updateComplaintStatus: (
    id: string,
    newStatus: ComplaintStatus,
    note?: string,
    resolutionNotes?: string,
    resolutionPhotoUrl?: string
  ) => boolean;
  assignStaffToComplaint: (id: string, staffId: string, notes?: string) => boolean;

  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  recyclingArticles: RecyclingArticle[];
  createRecyclingArticle: (article: Omit<RecyclingArticle, 'id' | 'updated_at'>) => void;
  updateRecyclingArticle: (id: string, updates: Partial<RecyclingArticle>) => void;
  deleteRecyclingArticle: (id: string) => void;

  feedbackList: ComplaintFeedback[];
  submitFeedback: (complaintId: string, rating: number, comments: string) => boolean;

  auditLogs: AuditLog[];
  contactInquiries: ContactInquiry[];
  submitContactInquiry: (name: string, email: string, subject: string, message: string) => void;

  supabaseConfig: SupabaseConfig;
  updateSupabaseConfig: (url: string, anonKey: string) => Promise<boolean>;
  resetToSampleData: () => void;

  isDark: boolean;
  toggleDarkMode: () => void;
}

const CleanConnectContext = createContext<CleanConnectContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'cleanconnect_user_v1',
  COMPLAINTS: 'cleanconnect_complaints_v1',
  NOTIFICATIONS: 'cleanconnect_notifications_v1',
  RECYCLING: 'cleanconnect_recycling_v1',
  FEEDBACK: 'cleanconnect_feedback_v1',
  AUDIT_LOGS: 'cleanconnect_audit_logs_v1',
  INQUIRIES: 'cleanconnect_inquiries_v1',
  SUPABASE: 'cleanconnect_supabase_cfg_v1',
  DARK_MODE: 'cleanconnect_dark_v1',
};

export const CleanConnectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Current user & demo role switcher
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_USERS[0]; // Resident Elena by default
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_USERS);

  // 2. Complaints
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_COMPLAINTS;
  });

  // 3. Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // 4. Recycling articles
  const [recyclingArticles, setRecyclingArticles] = useState<RecyclingArticle[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECYCLING);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_RECYCLING_ARTICLES;
  });

  // 5. Feedback
  const [feedbackList, setFeedbackList] = useState<ComplaintFeedback[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_FEEDBACK;
  });

  // 6. Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_AUDIT_LOGS;
  });

  // 7. Contact inquiries
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  // 8. Supabase configuration state
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPABASE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      url: (import.meta as any).env?.VITE_SUPABASE_URL || '',
      anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
      isConnected: false,
    };
  });

  // 9. Dark mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    return saved === 'true';
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECYCLING, JSON.stringify(recyclingArticles));
  }, [recyclingArticles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedbackList));
  }, [feedbackList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(contactInquiries));
  }, [contactInquiries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPABASE, JSON.stringify(supabaseConfig));
  }, [supabaseConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark((prev) => !prev);

  // Log audit helper
  const addAuditLog = (action: string, targetResource: string, targetId: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      user_id: currentUser.id,
      user_email: currentUser.email,
      user_role: currentUser.role,
      action,
      target_resource: targetResource,
      target_id: targetId,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Role switching
  const switchUserRole = (role: UserRole) => {
    const target = INITIAL_USERS.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
    } else {
      setCurrentUser((prev) => ({ ...prev, role }));
    }
  };

  const loginUser = (email: string): boolean => {
    const found = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      return true;
    }
    // Auto-create resident profile for new email
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      full_name: email.split('@')[0].replace(/[._]/g, ' '),
      role: 'resident',
      created_at: new Date().toISOString(),
    };
    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const registerUser = (name: string, email: string, role: UserRole = 'resident'): UserProfile => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      full_name: name,
      role,
      created_at: new Date().toISOString(),
    };
    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  const logoutUser = () => {
    // Revert to demo resident
    setCurrentUser(INITIAL_USERS[0]);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
    setAllUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...updates } : u))
    );
  };

  // Complaint operations
  const createComplaint = (data: {
    title: string;
    category: Complaint['category'];
    description: string;
    location: string;
    latitude?: number;
    longitude?: number;
    photo_url?: string;
    priority?: ComplaintPriority;
  }): Complaint => {
    const nextTicketNum = 100 + complaints.length + 1;
    const ticketCode = `CC-2026-${nextTicketNum}`;
    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      ticket_code: ticketCode,
      user_id: currentUser.id,
      resident_name: currentUser.full_name,
      resident_email: currentUser.email,
      title: data.title,
      category: data.category,
      description: data.description,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      photo_url: data.photo_url,
      status: 'submitted',
      priority: data.priority || 'medium',
      created_at: now,
      updated_at: now,
      status_history: [
        {
          id: `hist-${Date.now()}-1`,
          complaint_id: `cmp-${Date.now()}`,
          previous_status: null,
          new_status: 'submitted',
          changed_by: currentUser.id,
          changed_by_name: currentUser.full_name,
          note: 'Complaint submitted by resident.',
          created_at: now,
        },
      ],
    };

    setComplaints((prev) => [newComplaint, ...prev]);

    // Send confirmation notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      user_id: currentUser.id,
      title: 'Report Submitted Successfully',
      message: `Your report "${data.title}" has been received with ticket ID ${ticketCode}. Our dispatch team will review it shortly.`,
      complaint_id: newComplaint.id,
      ticket_code: ticketCode,
      is_read: false,
      type: 'status_update',
      created_at: now,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    addAuditLog('CREATE_COMPLAINT', 'complaints', newComplaint.id, `Created complaint ${ticketCode}: ${data.title}`);

    return newComplaint;
  };

  const updateComplaint = (
    id: string,
    updates: Partial<Omit<Complaint, 'id' | 'ticket_code' | 'user_id' | 'status_history'>>
  ): boolean => {
    const comp = complaints.find((c) => c.id === id);
    if (!comp) return false;

    // Residents can only edit their own complaints if still submitted
    if (currentUser.role === 'resident' && (comp.user_id !== currentUser.id || comp.status !== 'submitted')) {
      return false;
    }

    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              ...updates,
              updated_at: now,
            }
          : c
      )
    );

    addAuditLog('UPDATE_COMPLAINT', 'complaints', id, `Updated complaint details for ${comp.ticket_code}`);
    return true;
  };

  const withdrawComplaint = (id: string, reason?: string): boolean => {
    const comp = complaints.find((c) => c.id === id);
    if (!comp) return false;
    if (currentUser.role === 'resident' && comp.user_id !== currentUser.id) return false;
    if (comp.status !== 'submitted' && comp.status !== 'under_review') return false;

    const now = new Date().toISOString();
    const historyItem = {
      id: `hist-${Date.now()}`,
      complaint_id: id,
      previous_status: comp.status,
      new_status: 'rejected' as ComplaintStatus,
      changed_by: currentUser.id,
      changed_by_name: currentUser.full_name,
      note: reason ? `Withdrawn by resident: ${reason}` : 'Withdrawn by resident.',
      created_at: now,
    };

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'rejected',
              resolution_notes: reason ? `Withdrawn: ${reason}` : 'Withdrawn by user',
              updated_at: now,
              status_history: [...c.status_history, historyItem],
            }
          : c
      )
    );

    addAuditLog('WITHDRAW_COMPLAINT', 'complaints', id, `Resident withdrew ticket ${comp.ticket_code}`);
    return true;
  };

  const reopenComplaint = (id: string, reason: string): boolean => {
    const comp = complaints.find((c) => c.id === id);
    if (!comp) return false;
    if (currentUser.role === 'resident' && comp.user_id !== currentUser.id) return false;
    if (comp.status !== 'resolved' && comp.status !== 'rejected') return false;

    const now = new Date().toISOString();
    const historyItem = {
      id: `hist-${Date.now()}`,
      complaint_id: id,
      previous_status: comp.status,
      new_status: 'under_review' as ComplaintStatus,
      changed_by: currentUser.id,
      changed_by_name: currentUser.full_name,
      note: `Reopened by resident: ${reason}`,
      created_at: now,
    };

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'under_review',
              resolved_at: undefined,
              updated_at: now,
              status_history: [...c.status_history, historyItem],
            }
          : c
      )
    );

    // Notify resident
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      user_id: comp.user_id,
      title: 'Ticket Reopened',
      message: `Your ticket ${comp.ticket_code} has been reopened for additional review.`,
      complaint_id: id,
      ticket_code: comp.ticket_code,
      is_read: false,
      type: 'status_update',
      created_at: now,
    };
    setNotifications((prev) => [notif, ...prev]);

    addAuditLog('REOPEN_COMPLAINT', 'complaints', id, `Reopened ticket ${comp.ticket_code}: ${reason}`);
    return true;
  };

  const updateComplaintStatus = (
    id: string,
    newStatus: ComplaintStatus,
    note?: string,
    resolutionNotes?: string,
    resolutionPhotoUrl?: string
  ): boolean => {
    const comp = complaints.find((c) => c.id === id);
    if (!comp) return false;

    // Staff can only update complaints assigned to them (or any if admin)
    if (currentUser.role === 'staff' && comp.assigned_staff_id !== currentUser.id) {
      return false;
    }
    if (currentUser.role === 'resident') {
      return false; // Residents cannot arbitrarily set status
    }

    const now = new Date().toISOString();
    const historyItem = {
      id: `hist-${Date.now()}`,
      complaint_id: id,
      previous_status: comp.status,
      new_status: newStatus,
      changed_by: currentUser.id,
      changed_by_name: currentUser.full_name,
      note: note || `Status transitioned to ${newStatus.replace('_', ' ')}.`,
      created_at: now,
    };

    const isNowResolved = newStatus === 'resolved';

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              resolved_at: isNowResolved ? now : c.resolved_at,
              resolution_notes: resolutionNotes || c.resolution_notes,
              resolution_photo_url: resolutionPhotoUrl || c.resolution_photo_url,
              updated_at: now,
              status_history: [...c.status_history, historyItem],
            }
          : c
      )
    );

    // Send notification to complaint creator
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      user_id: comp.user_id,
      title: `Complaint Status: ${newStatus.replace('_', ' ').toUpperCase()}`,
      message: isNowResolved
        ? `Your complaint ${comp.ticket_code} has been resolved! Please share your feedback.`
        : `Your complaint ${comp.ticket_code} is now ${newStatus.replace('_', ' ')}. Note: ${note || 'Status updated by municipal staff.'}`,
      complaint_id: id,
      ticket_code: comp.ticket_code,
      is_read: false,
      type: isNowResolved ? 'feedback_request' : 'status_update',
      created_at: now,
    };
    setNotifications((prev) => [notif, ...prev]);

    addAuditLog(
      'STATUS_TRANSITION',
      'complaints',
      id,
      `Changed status of ${comp.ticket_code} from ${comp.status} to ${newStatus}`
    );
    return true;
  };

  const assignStaffToComplaint = (id: string, staffId: string, notes?: string): boolean => {
    if (currentUser.role !== 'admin') return false;
    const comp = complaints.find((c) => c.id === id);
    const staff = allUsers.find((u) => u.id === staffId) || INITIAL_USERS.find((u) => u.id === staffId);
    if (!comp || !staff) return false;

    const now = new Date().toISOString();
    const newStatus: ComplaintStatus = 'assigned';

    const historyItem = {
      id: `hist-${Date.now()}`,
      complaint_id: id,
      previous_status: comp.status,
      new_status: newStatus,
      changed_by: currentUser.id,
      changed_by_name: currentUser.full_name,
      note: `Assigned to ${staff.full_name}. ${notes ? `Note: ${notes}` : ''}`,
      created_at: now,
    };

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              assigned_staff_id: staff.id,
              assigned_staff_name: staff.full_name,
              updated_at: now,
              status_history: [...c.status_history, historyItem],
            }
          : c
      )
    );

    // Notify staff
    const staffNotif: AppNotification = {
      id: `notif-stf-${Date.now()}`,
      user_id: staff.id,
      title: 'New Case Assigned to You',
      message: `You have been assigned ticket ${comp.ticket_code} (${comp.title}) at ${comp.location}.`,
      complaint_id: id,
      ticket_code: comp.ticket_code,
      is_read: false,
      type: 'assignment',
      created_at: now,
    };

    // Notify resident
    const residentNotif: AppNotification = {
      id: `notif-res-${Date.now()}`,
      user_id: comp.user_id,
      title: 'Field Team Assigned',
      message: `Your complaint ${comp.ticket_code} has been assigned to civic officer ${staff.full_name}.`,
      complaint_id: id,
      ticket_code: comp.ticket_code,
      is_read: false,
      type: 'assignment',
      created_at: now,
    };

    setNotifications((prev) => [staffNotif, residentNotif, ...prev]);
    addAuditLog('ASSIGN_STAFF', 'complaints', id, `Assigned ${comp.ticket_code} to ${staff.full_name}`);
    return true;
  };

  // Notification actions
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.user_id === currentUser.id ? { ...n, is_read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications((prev) => prev.filter((n) => n.user_id !== currentUser.id));
  };

  // Recycling Articles actions
  const createRecyclingArticle = (data: Omit<RecyclingArticle, 'id' | 'updated_at'>) => {
    const newArt: RecyclingArticle = {
      ...data,
      id: `art-${Date.now()}`,
      updated_at: new Date().toISOString(),
    };
    setRecyclingArticles((prev) => [newArt, ...prev]);
    addAuditLog('CREATE_ARTICLE', 'recycling_articles', newArt.id, `Created article "${data.title}"`);
  };

  const updateRecyclingArticle = (id: string, updates: Partial<RecyclingArticle>) => {
    setRecyclingArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a))
    );
    addAuditLog('UPDATE_ARTICLE', 'recycling_articles', id, `Updated article ID ${id}`);
  };

  const deleteRecyclingArticle = (id: string) => {
    setRecyclingArticles((prev) => prev.filter((a) => a.id !== id));
    addAuditLog('DELETE_ARTICLE', 'recycling_articles', id, `Deleted recycling article ID ${id}`);
  };

  // Feedback
  const submitFeedback = (complaintId: string, rating: number, comments: string): boolean => {
    const comp = complaints.find((c) => c.id === complaintId);
    if (!comp) return false;

    const newFb: ComplaintFeedback = {
      id: `fdbk-${Date.now()}`,
      complaint_id: complaintId,
      ticket_code: comp.ticket_code,
      user_id: currentUser.id,
      resident_name: currentUser.full_name,
      rating,
      comments,
      created_at: new Date().toISOString(),
    };

    setFeedbackList((prev) => [newFb, ...prev]);
    addAuditLog('SUBMIT_FEEDBACK', 'feedback', newFb.id, `Feedback submitted for ${comp.ticket_code}: ${rating} stars`);
    return true;
  };

  // Contact inquiry
  const submitContactInquiry = (name: string, email: string, subject: string, message: string) => {
    const newInquiry: ContactInquiry = {
      id: `inq-${Date.now()}`,
      name,
      email,
      subject,
      message,
      created_at: new Date().toISOString(),
      status: 'pending',
    };
    setContactInquiries((prev) => [newInquiry, ...prev]);
  };

  // Supabase test / update
  const updateSupabaseConfig = async (url: string, anonKey: string): Promise<boolean> => {
    try {
      if (!url || !anonKey) {
        setSupabaseConfig({
          url: '',
          anonKey: '',
          isConnected: false,
          statusMessage: 'Disconnected. Using local sandbox database.',
        });
        return true;
      }
      // Simple ping verification check
      const res = await fetch(`${url}/rest/v1/`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      });
      const isConnected = res.status < 500;
      setSupabaseConfig({
        url,
        anonKey,
        isConnected,
        statusMessage: isConnected ? 'Connected to live Supabase instance.' : 'Could not reach Supabase endpoint.',
      });
      return isConnected;
    } catch {
      setSupabaseConfig({
        url,
        anonKey,
        isConnected: false,
        statusMessage: 'Connection failed. Please check CORS and endpoint URL.',
      });
      return false;
    }
  };

  const resetToSampleData = () => {
    setComplaints(INITIAL_COMPLAINTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setRecyclingArticles(INITIAL_RECYCLING_ARTICLES);
    setFeedbackList(INITIAL_FEEDBACK);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUser(INITIAL_USERS[0]);
    localStorage.clear();
  };

  return (
    <CleanConnectContext.Provider
      value={{
        currentUser,
        allUsers,
        switchUserRole,
        setCurrentUser,
        loginUser,
        registerUser,
        logoutUser,
        updateProfile,
        complaints,
        createComplaint,
        updateComplaint,
        withdrawComplaint,
        reopenComplaint,
        updateComplaintStatus,
        assignStaffToComplaint,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        recyclingArticles,
        createRecyclingArticle,
        updateRecyclingArticle,
        deleteRecyclingArticle,
        feedbackList,
        submitFeedback,
        auditLogs,
        contactInquiries,
        submitContactInquiry,
        supabaseConfig,
        updateSupabaseConfig,
        resetToSampleData,
        isDark,
        toggleDarkMode,
      }}
    >
      {children}
    </CleanConnectContext.Provider>
  );
};

export const useCleanConnect = () => {
  const context = useContext(CleanConnectContext);
  if (!context) {
    throw new Error('useCleanConnect must be used within a CleanConnectProvider');
  }
  return context;
};
