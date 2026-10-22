# CleanConnect — Community Waste Management Platform

**CleanConnect** is a modern, responsive, full-stack civic waste reporting, complaint tracking, recycling directory, and community sanitation platform. It bridges the gap between urban residents, central municipal dispatchers, and field sanitation crews.

Built as an engineering capstone project designed to run with free and open-source tools.

---

## 🚀 Key Features

### 1. Citizen & Resident Experience
- **Geotagged Incident Reporting:** File waste complaints with titles, categories, detailed descriptions, priority, optional photo proof, and one-click GPS coordinate verification.
- **8 Distinct Waste Categories:** Overflowing Public Bins, Illegal Littering, Plastic Accumulation, Construction Debris, E-Waste & Batteries, Hazardous Chemicals, Blocked Drainage, and Green Yard Waste.
- **Automated AI Triage:** Server-side Gemini AI analyzes citizen descriptions to recommend categories and urgency.
- **Duplicate Detection Warning:** Alerts citizens if an existing open report already exists in the same neighborhood.
- **Real-Time Ticket Tracking:** View chronological status history (Submitted → Under Review → Assigned → In Progress → Resolved / Rejected).
- **Resident Actions:** Edit (if submitted), Withdraw, Reopen (if resolved within window), and submit 1–5 star satisfaction ratings with feedback comments.
- **In-App Notification Center:** Receive alerts when cases are assigned to field staff and resolved.

### 2. Field Staff Operations
- **Assigned Work Queue:** View tickets assigned specifically to the logged-in staff member.
- **Status Lifecycle Control:** Transition cases to "In Progress" upon site arrival and "Resolved" upon site clearance.
- **Field Notes:** Attach work logs (e.g. "Loader #4 deployed, 500kg rubble cleared").
- **Strict Role Boundaries:** Staff cannot alter administrative permissions or view system audit logs.

### 3. Municipal Administration & Dispatch Console
- **Central Triage Dashboard:** Real-time KPI cards for Total Intake, Pending Triage, Active Ops, and Resolution Rate.
- **Interactive Analytics Charts:** Complaints by Category, Status Pipeline Donut, and 7-Day Reporting Velocity.
- **Management Data Grid:** Filter by status, category, priority, and search with tabular pagination.
- **Staff Dispatching:** Assign complaints to any available municipal officer.
- **AI Trend Summarizer:** Executive briefing highlighting urban hotspots, recurring bottlenecks, and recommended actions.
- **Recycling CMS:** Add, edit, or remove recycling protocols directly from the UI.
- **Resident Feedback Inspector:** Review star ratings and citizen comments.
- **Security Audit Log:** Immutable chronological log of administrative and staff events.
- **One-Click CSV Export:** Export complete complaint records for municipal reporting.

### 4. Public Pages & Educational Resources
- **Recycling Guide Directory:** Comprehensive guides for Plastic, Paper, Glass, Metal, E-Waste, and Compost with Dos, Don'ts, and contamination risk ratings.
- **AI Recycling Assistant:** Real-time advice on complex packaging disposal.
- **Public Impact:** Aggregated statistics, environmental equivalency numbers (CO₂e prevented, plastic containers recycled), with zero personal identifying information (PII) exposed.
- **Contact & Helpdesk:** Validated inquiry form, dispatch emergency hotlines, and FAQs.
- **Privacy Policy & Terms of Service:** Clear civic data minimization and privacy guidelines.

---

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Icons & Motion:** Lucide React, Motion
- **Backend Server:** Node.js, Express, tsx
- **Database Engine:** Supabase PostgreSQL with Row Level Security (RLS) + Local Offline Sandbox
- **AI Module:** Google Gemini (`@google/genai` with `gemini-3.8-flash`) + Rule-Based Civic Triage Fallback
- **Build Tool:** Vite

---

## 💻 Local Development Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   - `GEMINI_API_KEY`: *(Optional)* Injected automatically in AI Studio; enables live Gemini AI features. If omitted, CleanConnect automatically runs in intelligent Rule-Based Demo Mode.
   - `VITE_SUPABASE_URL`: *(Optional)* Your Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY`: *(Optional)* Your Supabase anon public API key.

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄 Supabase Database Setup (Free Tier)

CleanConnect includes complete SQL DDL migrations with Row Level Security (RLS) in `supabase/schema.sql`:

1. Create a free account at [Supabase.com](https://supabase.com).
2. Click **New Project** and select your preferred region.
3. In the left navigation, open the **SQL Editor**.
4. Open `/supabase/schema.sql` (or click **Database Setup** in the CleanConnect app navbar) and paste the SQL content into the SQL Editor.
5. Click **Run**. All tables (`profiles`, `complaints`, `complaint_status_history`, `notifications`, `recycling_articles`, `feedback`, `audit_logs`) and RLS policies are created automatically.
6. Under **Project Settings → API**, copy your **Project URL** and **anon public key**.
7. In the CleanConnect app, click **Database: Local Sandbox** in the top bar, paste your credentials, and click **Save & Connect**.

---

## 👥 Demo User Accounts (One-Click Testing)

CleanConnect includes built-in role switching in the top bar for testing and demonstration:

| Role | Name | Email | Permissions |
| :--- | :--- | :--- | :--- |
| **Resident** | Elena Rostova | `resident@cleanconnect.org` | Submit reports, track complaints, reopen tickets, submit feedback |
| **Staff Member** | Marcus Vance | `marcus.staff@cleanconnect.org` | View assigned tasks, mark in progress, resolve cases with notes |
| **Administrator** | Director Sarah Al-Mansoor | `admin@cleanconnect.org` | Full dispatch console, assign staff, AI trends, recycling CMS, CSV export, audit logs |

---

## 🔒 Security & Privacy Practices

- **Row Level Security:** Database policies ensure residents can only update their own submitted complaints while staff can update assigned tickets.
- **Zero API Key Leaks:** All Gemini AI calls are made through server-side proxy routes (`/api/ai/*`). No API keys or service role secrets are bundled into client code.
- **Privacy Shield:** Public Impact metrics are calculated anonymously. Resident street numbers, phone numbers, and full names are masked from public views.

---

## 📄 License

MIT Open Source License — CleanConnect Civic Technology Initiative.
