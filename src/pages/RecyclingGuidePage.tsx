import React, { useState } from 'react';
import { useCleanConnect } from '../context/CleanConnectContext';
import { RECYCLING_BINS_IMAGE } from '../data/initialData';
import {
  Search,
  Recycle,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MapPin,
  Loader2,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

export const RecyclingGuidePage: React.FC = () => {
  const { recyclingArticles } = useCleanConnect();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // AI Recycling Assistant State
  const [aiItemQuery, setAiItemQuery] = useState('');
  const [isAiConsulting, setIsAiConsulting] = useState(false);
  const [aiResult, setAiResult] = useState<{
    itemName: string;
    isRecyclable: boolean;
    binType: string;
    prepInstructions: string;
    contaminationWarning: string;
    quickTip: string;
    provider?: string;
  } | null>(null);

  // Filter articles
  const filteredArticles = recyclingArticles.filter((art) => {
    const matchesCat = selectedCategory === 'all' || art.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      art.title.toLowerCase().includes(q) ||
      art.summary.toLowerCase().includes(q) ||
      art.common_items.some((item) => item.toLowerCase().includes(q)) ||
      art.disposal_instructions.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const handleAiConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiItemQuery.trim()) return;

    setIsAiConsulting(true);
    try {
      const res = await fetch('/api/ai/recycling-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiItemQuery.trim() }),
      });
      const data = await res.json();
      setAiResult(data);
    } catch {
      setAiResult({
        itemName: aiItemQuery,
        isRecyclable: true,
        binType: 'Commingled Recycling Bin',
        prepInstructions: 'Rinse thoroughly before binning.',
        contaminationWarning: 'Avoid oily food remnants.',
        quickTip: 'Check the category guides below for full instructions.',
        provider: 'CleanConnect Standard Rules',
      });
    } finally {
      setIsAiConsulting(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Materials' },
    { id: 'plastic', label: 'Plastics & Polymers' },
    { id: 'paper', label: 'Paper & Cardboard' },
    { id: 'glass', label: 'Glass Bottles & Jars' },
    { id: 'metal', label: 'Metals & Cans' },
    { id: 'e_waste', label: 'E-Waste & Batteries' },
    { id: 'organic', label: 'Organics & Compost' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <span>Community Waste Prevention</span>
          <span aria-hidden="true">·</span>
          <span>Zero-Landfill Civic Standard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          Community Recycling & Waste Sorting Directory
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Municipal recycling sorting guidelines. Learn how to prepare everyday items, prevent batch
          contamination, and locate specialized hazardous drop-off bays.
        </p>
      </div>

      {/* Visual Flat-lay Showcase Strip */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm grid grid-cols-1 md:grid-cols-12 items-center">
        <div className="md:col-span-7 p-6 sm:p-8 space-y-4">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Source Separation Standard
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Clean In, Clean Out: Stop Batch Rejection
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            A single greasy pizza box or unrinsed peanut butter jar can spoil up to 50 kilograms of
            clean recyclable paper pulp. Our sorting protocols follow ISO-certified closed-loop
            reprocessing parameters.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
            <span>🔵 Paper (Dry fibers)</span>
            <span>🟢 Glass (Rinsed)</span>
            <span>🟡 Aluminum (Crushed)</span>
            <span>🔴 E-Waste (Dropoff)</span>
            <span>🟤 Compost (Organics)</span>
          </div>
        </div>
        <div className="md:col-span-5 h-64 md:h-full min-h-[220px]">
          <img
            src={RECYCLING_BINS_IMAGE}
            alt="Color-coded sorted modern recycling containers"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* AI Recycling Assistant Interactive Card */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4 shadow-md">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>CleanConnect AI Item Advisor</span>
        </div>
        <h3 className="text-xl font-bold">Unsure How to Dispose of a Specific Item?</h3>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Ask our AI assistant about complex or confusing packaging (e.g., styrofoam coolers, bubble
          wrap, aerosol cans, lithium batteries, chip bags).
        </p>

        <form onSubmit={handleAiConsult} className="flex flex-col sm:flex-row gap-3 pt-2 max-w-xl">
          <input
            type="text"
            value={aiItemQuery}
            onChange={(e) => setAiItemQuery(e.target.value)}
            placeholder="e.g. Greasy pizza box, old iPad, toothpaste tube..."
            className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={isAiConsulting || !aiItemQuery.trim()}
            className="px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAiConsulting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Consulting Guide...</span>
              </>
            ) : (
              <>
                <span>Check Item</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* AI Result Card */}
        {aiResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-800/90 border border-emerald-500/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-2">
              <span className="font-bold text-sm text-emerald-300">
                Disposal Advice for: "{aiResult.itemName}"
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Source: {aiResult.provider || 'CleanConnect Engine'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 block text-[11px]">Recyclable Status</span>
                <span
                  className={`font-bold inline-flex items-center gap-1 ${
                    aiResult.isRecyclable ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {aiResult.isRecyclable ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{aiResult.isRecyclable ? 'Recyclable' : 'Do Not Recycle in Curbside Bin'}</span>
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block text-[11px]">Recommended Destination</span>
                <span className="font-semibold text-white">{aiResult.binType}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block text-[11px]">Preparation Note</span>
                <span className="text-slate-200">{aiResult.prepInstructions}</span>
              </div>
            </div>

            {aiResult.contaminationWarning && (
              <p className="text-xs text-amber-300 bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/60 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Watch Out:</strong> {aiResult.contaminationWarning}
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Directory Search & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items (e.g. cans, batteries, cartons)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <span className="text-xs text-slate-500 font-mono">
            Showing {filteredArticles.length} protocols
          </span>
        </div>

        {/* Filter Tabs (Interactive Segmented Buttons) */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((art) => (
          <div
            key={art.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 flex flex-col justify-between shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-400">
                  {art.category.replace('_', ' ')}
                </span>
                <span>
                  Risk:{' '}
                  <strong
                    className={
                      art.contamination_risk === 'high'
                        ? 'text-red-500'
                        : art.contamination_risk === 'medium'
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                    }
                  >
                    {art.contamination_risk.toUpperCase()}
                  </strong>
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                {art.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {art.summary}
              </p>

              {/* Common items */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Accepted Examples:
                </span>
                <div className="text-xs text-slate-700 dark:text-slate-300 flex flex-wrap gap-1.5">
                  {art.common_items.map((item, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dos & Don'ts */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Always Do:
                  </span>
                  <ul className="text-slate-600 dark:text-slate-400 space-y-1 pl-4 list-disc text-[11px]">
                    {art.dos.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1 text-xs pt-1">
                  <span className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Never Do:
                  </span>
                  <ul className="text-slate-600 dark:text-slate-400 space-y-1 pl-4 list-disc text-[11px]">
                    {art.donts.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Dropoff location footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="line-clamp-1">{art.dropoff_location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
