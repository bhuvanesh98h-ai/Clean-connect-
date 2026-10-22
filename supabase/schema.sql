-- ==============================================================================
-- CleanConnect Community Waste Management Platform
-- Full PostgreSQL & Supabase Database Schema + Row-Level Security (RLS)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('resident', 'staff', 'admin')) DEFAULT 'resident',
    phone TEXT,
    address TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. Complaints Table
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_code TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    title VARCHAR(150) NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'overflowing_bins',
        'illegal_littering',
        'plastic_waste',
        'construction_debris',
        'e_waste_hazard',
        'hazardous_chemicals',
        'blocked_drainage',
        'green_waste'
    )),
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    photo_url TEXT,
    status TEXT NOT NULL CHECK (status IN (
        'submitted',
        'under_review',
        'assigned',
        'in_progress',
        'resolved',
        'rejected'
    )) DEFAULT 'submitted',
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    assigned_staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolution_photo_url TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for complaints
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_staff ON public.complaints(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);

-- 4. Complaint Status History Table
CREATE TABLE IF NOT EXISTS public.complaint_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    previous_status TEXT CHECK (previous_status IN ('submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected')),
    new_status TEXT NOT NULL CHECK (new_status IN ('submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected')),
    changed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_history_complaint_id ON public.complaint_status_history(complaint_id);

-- 5. Complaint Assignments Table
CREATE TABLE IF NOT EXISTS public.complaint_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    notes TEXT,
    assigned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignments_complaint_id ON public.complaint_assignments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_assignments_staff_id ON public.complaint_assignments(assigned_to);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    ticket_code TEXT,
    type TEXT NOT NULL CHECK (type IN ('status_update', 'assignment', 'feedback_request', 'announcement')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- 7. Recycling Articles Table
CREATE TABLE IF NOT EXISTS public.recycling_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('paper', 'plastic', 'glass', 'metal', 'e_waste', 'organic')),
    summary TEXT NOT NULL,
    dos JSONB NOT NULL DEFAULT '[]'::jsonb,
    donts JSONB NOT NULL DEFAULT '[]'::jsonb,
    disposal_instructions TEXT NOT NULL,
    common_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    contamination_risk TEXT NOT NULL CHECK (contamination_risk IN ('low', 'medium', 'high')),
    dropoff_location TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recycling_category ON public.recycling_articles(category);

-- 8. Resident Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_complaint_id ON public.feedback(complaint_id);

-- 9. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_resource TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycling_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('staff', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: Profiles
CREATE POLICY "Users can read own profile or staff/admin can read all"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_staff());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- RLS: Complaints
CREATE POLICY "Residents can view their own complaints"
ON public.complaints FOR SELECT
USING (auth.uid() = user_id OR public.is_staff());

CREATE POLICY "Residents can insert their own complaints"
ON public.complaints FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Residents can update their own complaint if still submitted"
ON public.complaints FOR UPDATE
USING (auth.uid() = user_id AND status = 'submitted')
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff and admin can update complaint status and details"
ON public.complaints FOR UPDATE
USING (public.is_staff());

-- RLS: Recycling Articles (Public read, admin write)
CREATE POLICY "Anyone can view recycling articles"
ON public.recycling_articles FOR SELECT
USING (true);

CREATE POLICY "Admins can manage recycling articles"
ON public.recycling_articles FOR ALL
USING (public.is_admin());

-- RLS: Notifications
CREATE POLICY "Users can view and manage their own notifications"
ON public.notifications FOR ALL
USING (auth.uid() = user_id);

-- RLS: Feedback
CREATE POLICY "Residents can view feedback on their complaints, admins view all"
ON public.feedback FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Residents can insert feedback on resolved complaints"
ON public.feedback FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS: Audit Logs
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.is_admin());

CREATE POLICY "Staff and admins can create audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (public.is_staff());
