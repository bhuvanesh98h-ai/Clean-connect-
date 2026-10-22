import React, { useState } from 'react';
import { Complaint, ComplaintCategory, ComplaintStatus } from '../types';

interface ChartsProps {
  complaints: Complaint[];
}

export const CategoryBarChart: React.FC<ChartsProps> = ({ complaints }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const categoryLabels: Record<ComplaintCategory, string> = {
    overflowing_bins: 'Overflowing Bins',
    illegal_littering: 'Illegal Littering',
    plastic_waste: 'Plastic Waste',
    construction_debris: 'Construction Debris',
    e_waste_hazard: 'E-Waste Hazard',
    hazardous_chemicals: 'Hazardous Chemicals',
    blocked_drainage: 'Blocked Drainage',
    green_waste: 'Green Yard Waste',
  };

  const counts: Record<ComplaintCategory, number> = {
    overflowing_bins: 0,
    illegal_littering: 0,
    plastic_waste: 0,
    construction_debris: 0,
    e_waste_hazard: 0,
    hazardous_chemicals: 0,
    blocked_drainage: 0,
    green_waste: 0,
  };

  complaints.forEach((c) => {
    if (counts[c.category] !== undefined) {
      counts[c.category]++;
    }
  });

  const total = complaints.length || 1;
  const entries = (Object.keys(counts) as ComplaintCategory[]).map((cat) => ({
    category: cat,
    label: categoryLabels[cat],
    count: counts[cat],
    pct: Math.round((counts[cat] / total) * 100),
  })).sort((a, b) => b.count - a.count);

  const maxVal = Math.max(...entries.map((e) => e.count), 1);

  return (
    <div className="space-y-3">
      {entries.map((item, idx) => (
        <div
          key={item.category}
          className="group cursor-pointer"
          onMouseEnter={() => setHoveredIdx(idx)}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {item.label}
            </span>
            <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {item.count} reports ({item.pct}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                hoveredIdx === idx
                  ? 'bg-emerald-500'
                  : 'bg-emerald-600 dark:bg-emerald-500'
              }`}
              style={{ width: `${Math.max(4, (item.count / maxVal) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export const StatusDistributionDonut: React.FC<ChartsProps> = ({ complaints }) => {
  const statusColors: Record<ComplaintStatus, { label: string; color: string }> = {
    submitted: { label: 'Submitted', color: '#64748b' }, // slate-500
    under_review: { label: 'Under Review', color: '#3b82f6' }, // blue-500
    assigned: { label: 'Assigned', color: '#8b5cf6' }, // violet-500
    in_progress: { label: 'In Progress', color: '#f59e0b' }, // amber-500
    resolved: { label: 'Resolved', color: '#10b981' }, // emerald-500
    rejected: { label: 'Rejected / Withdrawn', color: '#ef4444' }, // red-500
  };

  const counts: Record<ComplaintStatus, number> = {
    submitted: 0,
    under_review: 0,
    assigned: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
  };

  complaints.forEach((c) => {
    if (counts[c.status] !== undefined) {
      counts[c.status]++;
    }
  });

  const total = complaints.length || 1;
  const radius = 64;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = 0;
  const segments = (Object.keys(counts) as ComplaintStatus[]).map((st) => {
    const count = counts[st];
    const pct = count / total;
    const strokeDasharray = `${pct * circumference} ${circumference}`;
    const strokeDashoffset = -currentAngle;
    currentAngle += pct * circumference;
    return {
      status: st,
      count,
      pct: Math.round(pct * 100),
      label: statusColors[st].label,
      color: statusColors[st].color,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
      <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {segments.map((s) => (
            <circle
              key={s.status}
              cx="80"
              cy="80"
              r={radius}
              stroke={s.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={s.strokeDasharray}
              strokeDashoffset={s.strokeDashoffset}
              className="transition-all duration-500"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {complaints.length}
          </span>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Tickets
          </span>
        </div>
      </div>

      <div className="space-y-2 flex-1 w-full text-xs">
        {segments.map((s) => (
          <div key={s.status} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">{s.label}</span>
            </div>
            <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {s.count} ({s.pct}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TrendAreaChart: React.FC<ChartsProps> = ({ complaints }) => {
  // Generate daily points for the last 7 days
  const days = 7;
  const now = new Date();
  const dayBuckets: { label: string; count: number; dateStr: string }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' });
    dayBuckets.push({ label, dateStr, count: 0 });
  }

  complaints.forEach((c) => {
    const cDate = c.created_at.split('T')[0];
    const bucket = dayBuckets.find((b) => b.dateStr === cDate);
    if (bucket) {
      bucket.count++;
    } else if (dayBuckets.length > 0) {
      // If older, accumulate on the first visible day for demonstration
      dayBuckets[0].count++;
    }
  });

  const maxVal = Math.max(...dayBuckets.map((d) => d.count), 4);
  const chartHeight = 120;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;

  const points = dayBuckets.map((b, idx) => {
    const x = paddingX + (idx / (dayBuckets.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (b.count / maxVal) * (chartHeight - paddingY * 2);
    return { x, y, count: b.count, label: b.label };
  });

  const pathD = points.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-36">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio) => {
            const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Line stroke */}
          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" />

          {/* Interactive dots */}
          {points.map((pt, idx) => (
            <g key={idx} className="group">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                className="fill-emerald-600 dark:fill-emerald-400 stroke-white dark:stroke-slate-900 transition-all hover:r-6"
                strokeWidth="2"
              />
              <text
                x={pt.x}
                y={pt.y - 10}
                textAnchor="middle"
                className="text-[10px] font-mono fill-slate-600 dark:fill-slate-300 font-bold"
              >
                {pt.count}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex justify-between px-6 text-[11px] text-slate-400 font-mono">
        {dayBuckets.map((b, idx) => (
          <span key={idx}>{b.label}</span>
        ))}
      </div>
    </div>
  );
};

export const LocationDistributionList: React.FC<ChartsProps> = ({ complaints }) => {
  // Extract general zones
  const zoneCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    let zone = 'General Urban';
    if (c.location.includes('Sector 4') || c.location.includes('Riverside')) zone = 'Sector 4 / Riverside';
    else if (c.location.includes('Oakwood')) zone = 'Oakwood Corridor';
    else if (c.location.includes('High Street')) zone = 'Downtown / High St';
    else if (c.location.includes('Maple')) zone = 'West Maple Residential';
    else if (c.location.includes('Northside')) zone = 'Northside Runoff Zone';
    else zone = 'Other Public Right-of-Way';

    zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
  });

  const list = Object.entries(zoneCounts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...list.map(([, count]) => count), 1);

  return (
    <div className="space-y-3">
      {list.map(([zone, count]) => (
        <div key={zone} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-300">{zone}</span>
            <span className="font-mono tabular-nums text-slate-500">{count} cases</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-teal-600 dark:bg-teal-500 h-full rounded-full"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
