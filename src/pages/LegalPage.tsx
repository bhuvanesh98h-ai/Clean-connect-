import React, { useState } from 'react';
import { ShieldCheck, FileText, Lock, Eye } from 'lucide-react';

interface LegalPageProps {
  initialTab?: 'privacy' | 'terms';
}

export const LegalPage: React.FC<LegalPageProps> = ({ initialTab = 'privacy' }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'privacy'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Civic Privacy Policy</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('terms')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'terms'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Terms of Community Service</span>
        </button>
      </div>

      {activeTab === 'privacy' ? (
        <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="font-mono text-[11px] text-emerald-600 uppercase tracking-wider font-semibold">
              Civic Data Minimization Standard
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              CleanConnect Resident Privacy Policy
            </h1>
            <p className="text-slate-400 text-[11px] mt-0.5">Last updated: October 2026</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">1. Data Minimization & Collection Scope</h2>
            <p>
              CleanConnect collects only the minimal technical data required to verify, triage, and
              dispatch municipal cleanup operations. When you submit a complaint, we store the title,
              waste category, location coordinates or address, and any optional photo you choose to
              upload.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">2. Public Aggregation & Anonymity</h2>
            <p>
              Under our Open Data Charter, waste metrics (counts, categories, resolution velocity, and
              general district names) are aggregated for public transparency. CleanConnect strictly
              prohibits exposing private resident names, email addresses, phone numbers, or exact
              apartment/residential house numbers on any public page.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">3. Geolocation & Device Permissions</h2>
            <p>
              Geolocation permissions are entirely optional. The browser will ask for your consent before
              querying device GPS coordinates. You may manually type any street name or landmark without
              enabling GPS. Coordinates are rounded to prevent tracking of individual households.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">4. Uploaded Verification Imagery</h2>
            <p>
              Photographs submitted to CleanConnect must capture public waste problems only. Please avoid
              including identifiable faces of private individuals or vehicle license plates. Imagery
              is stored securely and accessed exclusively by authorized municipal personnel for site
              verification.
            </p>
          </section>
        </article>
      ) : (
        <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="font-mono text-[11px] text-emerald-600 uppercase tracking-wider font-semibold">
              Civic Stewardship Guidelines
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              CleanConnect Terms of Service
            </h1>
            <p className="text-slate-400 text-[11px] mt-0.5">Last updated: October 2026</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">1. Community Good Faith Use</h2>
            <p>
              CleanConnect is provided for public community maintenance and civic transparency. Users
              agree to submit honest, accurate reports of waste problems on public spaces. Fictitious
              complaints, automated scraping, or harassment of civic workers is strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">2. Administrative Authority & Triage</h2>
            <p>
              Municipal administrators retain final authority over ticket prioritization, staff
              assignment, and resolution decisions. While AI modules provide triage suggestions,
              human officers review and authorize all dispatch actions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">3. Public Right-of-Way Scope</h2>
            <p>
              CleanConnect operates solely on public parks, sidewalks, roadside medians, and civic
              facilities. Sanitation teams cannot enter private residential yards to haul away
              private contractor debris without commercial permit arrangements.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">4. Open-Source Academic License</h2>
            <p>
              CleanConnect is distributed under the open-source MIT License as an engineering capstone.
              The software is provided without warranty, and municipal users should adhere to local
              statutory waste compliance standards.
            </p>
          </section>
        </article>
      )}
    </div>
  );
};
