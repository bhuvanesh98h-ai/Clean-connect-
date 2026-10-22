import React from 'react';
import { useCleanConnect } from '../context/CleanConnectContext';
import { HERO_IMAGE, WASTE_AUDIT_IMAGE } from '../data/initialData';
import {
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Recycle,
  Building2,
  Users,
} from 'lucide-react';

interface HomePageProps {
  onOpenReportModal: () => void;
  onNavigate: (view: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenReportModal, onNavigate }) => {
  const { complaints } = useCleanConnect();

  // Calculate live database metrics
  const totalReports = complaints.length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;
  const activeCases = complaints.filter(
    (c) => c.status === 'assigned' || c.status === 'in_progress'
  ).length;

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Call to Action */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <span>Civic Environmental Management</span>
                <span aria-hidden="true">·</span>
                <span>Community Action Platform</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white text-balance leading-tight">
                Keep Public Spaces Spotless. Report, Track, and Divert Waste Together.
              </h1>

              <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                CleanConnect connects residents with municipal sanitation teams. Report overflowing
                bins, illegal dumping, and hazardous debris with instant geotagging, AI triage, and
                public status tracking.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={onOpenReportModal}
                  className="px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-md transition-all whitespace-nowrap shrink-0 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>File a Public Waste Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('recycling_guide')}
                  className="px-5 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
                >
                  <Recycle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Recycling Directory</span>
                </button>
              </div>

              {/* Trust & Transparency Line */}
              <div className="pt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Geotagged Dispatch</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Resident Privacy Guarded</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Open Data Transparency</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-800 aspect-16/10">
                <img
                  src={HERO_IMAGE}
                  alt="Vibrant clean community with eco-friendly waste management stations"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <p className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-300">
                      Sector 4 Community Eco-Hub
                    </p>
                    <p className="text-sm font-medium text-slate-200">
                      Neighborhood waste divergence rate up 38% since civic tracking rollout.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Aggregated Metrics Strip */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 block">
                  Total Complaints Logged
                </span>
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {totalReports}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Audited database records</span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 block">
                  Resolution Success Rate
                </span>
                <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {resolutionRate}%
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Verified by sanitation crews</span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 block">
                  Active Field Operations
                </span>
                <span className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                  {activeCases}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Crews currently dispatched</span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 block">
                  Average Turnaround
                </span>
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  18.4 hrs
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">From submission to clearance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step How CleanConnect Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Lifecycle & Operation
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            How a Complaint Becomes a Cleared Street
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            A transparent four-stage pipeline connecting residents, central dispatchers, and field trucks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Spot & Report',
              desc: 'Resident snaps a photo and captures location with one-click GPS verification.',
              icon: <Camera className="w-5 h-5 text-emerald-600" />,
            },
            {
              step: '02',
              title: 'Smart AI Triage',
              desc: 'Automated analysis classifies waste urgency (chemicals, hazard, overflow) and prevents duplicate calls.',
              icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
            },
            {
              step: '03',
              title: 'Field Team Dispatch',
              desc: 'Assigned to the nearest municipal crew equipped with appropriate loaders or compactor trucks.',
              icon: <Clock className="w-5 h-5 text-emerald-600" />,
            },
            {
              step: '04',
              title: 'Verified Resolution',
              desc: 'Crew marks task complete with photo proof, notifying the citizen for satisfaction rating.',
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 relative shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="font-mono text-xs font-bold text-slate-400">{item.step}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Deep-Dive Civic Impact with High-Res Image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 p-8 lg:p-12 space-y-6">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
              Field Sanitation Operations
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold leading-tight">
              Community Waste Audits & Rapid Response Sweeps
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every resolved ticket is audited for divergence potential. Organics and clean plastics
              are redirected to licensed regional reprocessing plants rather than open landfills,
              lowering municipal disposal costs and greenhouse emissions.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-2">
              <div className="space-y-1">
                <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                  42.8 Metric Tons
                </span>
                <span className="text-xs text-slate-400 block">Diverted from Landfills</span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                  94.2%
                </span>
                <span className="text-xs text-slate-400 block">Resident Satisfaction Score</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('public_impact')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>View Full Public Analytics & Charts</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 h-full min-h-[320px]">
            <img
              src={WASTE_AUDIT_IMAGE}
              alt="Sanitation crew performing waste inspection"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Recent Public Ticker (Privacy Protected) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Community Dispatch Feed
              </h3>
              <p className="text-xs text-slate-500">
                Real-time civic tickets. Resident identities and private street numbers are sanitized.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('public_impact')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              All Aggregate Data →
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {complaints.slice(0, 4).map((c) => (
              <div key={c.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {c.ticket_code}
                    </span>
                    <span>·</span>
                    <span className="capitalize text-slate-600 dark:text-slate-400">
                      {c.category.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white line-clamp-1">
                    {c.title}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Location</span>
                    <span className="text-slate-600 dark:text-slate-300">
                      {c.location.split(',')[0]}
                    </span>
                  </div>
                  <span
                    className={`font-semibold uppercase tracking-wider text-[11px] ${
                      c.status === 'resolved'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : c.status === 'in_progress'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-700 text-white p-8 sm:p-12 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl font-bold">Notice Waste in Your Neighborhood?</h3>
            <p className="text-sm text-emerald-100 max-w-xl">
              File a report in under two minutes. No account sign-up is required to browse the
              recycling guide or review public impact reports.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenReportModal}
            className="px-6 py-3 text-sm font-semibold bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl shadow-md transition-colors whitespace-nowrap shrink-0"
          >
            Submit a Report Now
          </button>
        </div>
      </section>
    </div>
  );
};
