export type UserRole = 'resident' | 'staff' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  avatar_url?: string;
  created_at: string;
}

export type ComplaintCategory =
  | 'overflowing_bins'
  | 'illegal_littering'
  | 'plastic_waste'
  | 'construction_debris'
  | 'e_waste_hazard'
  | 'hazardous_chemicals'
  | 'blocked_drainage'
  | 'green_waste';

export type ComplaintStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ComplaintStatusHistory {
  id: string;
  complaint_id: string;
  previous_status: ComplaintStatus | null;
  new_status: ComplaintStatus;
  changed_by: string; // user id or system
  changed_by_name: string;
  note?: string;
  created_at: string;
}

export interface ComplaintAssignment {
  id: string;
  complaint_id: string;
  assigned_to: string; // staff profile id
  assigned_to_name: string;
  assigned_by: string; // admin profile id
  assigned_at: string;
  notes?: string;
}

export interface Complaint {
  id: string;
  ticket_code: string; // e.g. CC-2026-084
  user_id: string;
  resident_name: string;
  resident_email: string;
  title: string;
  category: ComplaintCategory;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  photo_url?: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  assigned_staff_id?: string;
  assigned_staff_name?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  resolution_photo_url?: string;
  status_history: ComplaintStatusHistory[];
}

export interface ComplaintFeedback {
  id: string;
  complaint_id: string;
  ticket_code: string;
  user_id: string;
  resident_name: string;
  rating: number; // 1 to 5
  comments: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string; // recipient
  title: string;
  message: string;
  complaint_id?: string;
  ticket_code?: string;
  is_read: boolean;
  type: 'status_update' | 'assignment' | 'feedback_request' | 'announcement';
  created_at: string;
}

export interface RecyclingArticle {
  id: string;
  title: string;
  category: 'paper' | 'plastic' | 'glass' | 'metal' | 'e_waste' | 'organic';
  summary: string;
  dos: string[];
  donts: string[];
  disposal_instructions: string;
  common_items: string[];
  contamination_risk: 'low' | 'medium' | 'high';
  dropoff_location: string;
  image_url?: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  user_role: UserRole;
  action: string;
  target_resource: string;
  target_id: string;
  details: string;
  timestamp: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  status: 'pending' | 'responded';
}
