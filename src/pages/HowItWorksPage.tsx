import React from 'react';
import {
  Camera,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  RotateCcw,
  Star,
  HardHat,
  ArrowRight,
} from 'lucide-react';

interface HowItWorksPageProps {
  onOpenReportModal: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onOpenReportModal }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <span>End-to-End Workflow</span>
          <span aria-hidden="true">·</span>
          <span>Civic Operations Blueprint</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          How CleanConnect Resolves Community Waste
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          From the moment a resident spots litter on a sidewalk to the final municipal sweep and
          satisfaction rating, every step is transparent, tracked, and verifiable.
        </p>
      </div>

      {/* 5-Phase Detailed Stepper */}
      <div className="space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            The 5-Stage Complaint Lifecycle
          </h2>
        </div>

        <div className="space-y-6">
          {[
            {
              num: 'Phase 1',
              title: 'Citizen Reporting & Geotagging',
              status: 'Submitted',
              badgeColor: 'text-slate-600 dark:text-slate-400',
              desc: 'Residents open the web application on their phone or computer, take an optional photo of the waste issue, and either type the street address or tap "Use My GPS Location" with browser permissions. Required fields ensure adequate detail.',
              icon: <Camera className="w-5 h-5 text-emerald-600" />,
              details: [
                'Manual location entry or instant browser GPS coordinates',
                'Optional verification photo upload with 5MB file-size limits',
                'Automatic duplicate report detection to prevent redundant municipal dispatch',
              ],
            },
            {
              num: 'Phase 2',
              title: 'AI Auto-Triage & Administrative Review',
              status: 'Under Review',
              badgeColor: 'text-blue-600 dark:text-blue-400',
              desc: 'Our server-side Gemini AI module reads the resident’s report description to recommend the appropriate category (e.g. e-waste hazard vs. standard overflowing bin) and priority level. Municipal coordinators review and verify the case.',
              icon: <Sparkles className="w-5 h-5 text-blue-600" />,
              details: [
                'AI categorization suggests next action without replacing human judgment',
                'Urgent hazards (toxic liquids, blocked storm culverts) automatically escalated',
                'Out-of-scope issues (private renovations) explained with courteous rejection notes',
              ],
            },
            {
              num: 'Phase 3',
              title: 'Field Team Assignment & Route Dispatch',
              status: 'Assigned',
              badgeColor: 'text-purple-600 dark:text-purple-400',
              desc: 'Administrators assign the ticket to an available field sanitation officer based on geographic zone and vehicle capabilities (compacting trucks, hazardous reclamation units, or street sweepers).',
              icon: <HardHat className="w-5 h-5 text-purple-600" />,
              details: [
                'Instant in-app notification sent to the assigned staff officer',
                'Resident notified of their assigned officer’s name and team unit',
                'Audit log generated recording administrator ID and timestamp',
              ],
            },
            {
              num: 'Phase 4',
              title: 'Active Clearance & On-Site Work',
              status: 'In Progress',
              badgeColor: 'text-amber-600 dark:text-amber-400',
              desc: 'The field crew arrives on site, transitions status to "In Progress", and executes cleanup. Crews can record field notes such as equipment used or estimated volume collected.',
              icon: <Clock className="w-5 h-5 text-amber-600" />,
              details: [
                'Field officers add timestamped progress notes visible on ticket timeline',
                'Recyclable materials separated for secondary reprocessing where possible',
                'Heavy vehicle logistics coordinated if obstruction requires aggregate loaders',
              ],
            },
            {
              num: 'Phase 5',
              title: 'Resolution, Verification & Citizen Feedback',
              status: 'Resolved',
              badgeColor: 'text-emerald-600 dark:text-emerald-400',
              desc: 'Once the public space is clean, staff mark the complaint "Resolved" with clearance details. The resident receives an in-app notice to view resolution notes and rate satisfaction from 1 to 5 stars.',
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
              details: [
                'Resident can submit 1-5 star rating and comment on cleanup speed',
                'If the problem returns or was incomplete, residents can reopen the ticket',
                'Resolved data feeds public impact charts without exposing personal identities',
              ],
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 shadow-xs"
            >
              <div className="lg:col-span-4 space-y-2">
                <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  {item.num}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {item.icon}
                  <span>{item.title}</span>
                </h3>
                <div className="pt-1">
                  <span className="text-xs text-slate-400">Database Status: </span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${item.badgeColor}`}>
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-3">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
                <ul className="space-y-1.5 pt-2 text-xs text-slate-600 dark:text-slate-400">
                  {item.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Waste Categories & Handling Guide */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Supported Complaint Categories & Dispatch Criteria
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Standard taxonomy utilized across database tables and dispatch boards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {[
            {
              cat: 'Overflowing Bins',
              desc: 'Public receptacles exceeding capacity with litter spilling on sidewalks.',
              action: 'Route scheduled collection truck',
            },
            {
              cat: 'Illegal Littering',
              desc: 'Discarded household garbage, furniture, or mattresses dumped in public areas.',
              action: 'Citation audit & bulk haulage',
            },
            {
              cat: 'Plastic Accumulation',
              desc: 'High concentration of plastic packaging or beverage cups in parks/medians.',
              action: 'Hand crew sweep & recycling sort',
            },
            {
              cat: 'Construction Debris',
              desc: 'Drywall, concrete chunks, tile rubble obstructing public rights-of-way.',
              action: 'Heavy aggregate loader dispatch',
            },
            {
              cat: 'E-Waste Hazard',
              desc: 'Screens, broken electronics, or loose lithium batteries exposed to elements.',
              action: 'HazMat e-Stewards reclamation',
            },
            {
              cat: 'Hazardous Chemicals',
              desc: 'Spilled motor oils, toxic solvents, or unmarked drums.',
              action: 'Immediate HazMat containment',
            },
            {
              cat: 'Blocked Drainage',
              desc: 'Debris plugging roadside culverts or storm gutters with flood risk.',
              action: 'Stormwater culvert crew clearance',
            },
            {
              cat: 'Green Yard Debris',
              desc: 'Downed tree branches or bagged lawn trimmings on pedestrian paths.',
              action: 'Composting chipper collection',
            },
          ].map((c, i) => (
            <div
              key={i}
              className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2"
            >
              <h4 className="font-bold text-slate-900 dark:text-white">{c.cat}</h4>
              <p className="text-slate-600 dark:text-slate-400">{c.desc}</p>
              <div className="pt-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                Action: {c.action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center pt-6">
        <button
          type="button"
          onClick={onOpenReportModal}
          className="px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors inline-flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          <span>Report a Problem Now</span>
        </button>
      </div>
    </div>
  );
};
