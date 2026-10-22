import React, { useState } from 'react';
import { useCleanConnect } from '../context/CleanConnectContext';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Download,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_SQL_SNIPPET = `-- CleanConnect Core Tables & RLS Policies
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    title VARCHAR(150) NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted',
    priority TEXT NOT NULL DEFAULT 'medium',
    assigned_staff_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Residents view own complaints or staff view all"
ON public.complaints FOR SELECT
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin')
));`;

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const { supabaseConfig, updateSupabaseConfig, resetToSampleData, complaints } = useCleanConnect();

  const [url, setUrl] = useState(supabaseConfig.url || '');
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setFeedbackMsg(null);
    const success = await updateSupabaseConfig(url.trim(), anonKey.trim());
    setIsTesting(false);
    if (success) {
      setFeedbackMsg('Connected successfully to Supabase!');
    } else {
      setFeedbackMsg('Could not verify endpoint. Reverted to local sandbox storage.');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SAMPLE_SQL_SNIPPET);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyEnv = () => {
    const text = `VITE_SUPABASE_URL="${url || 'https://your-project.supabase.co'}"\nVITE_SUPABASE_ANON_KEY="${anonKey || 'your-anon-public-key'}"`;
    navigator.clipboard.writeText(text);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(complaints, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cleanconnect_complaints_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Supabase & Database Architecture
              </h2>
              <p className="text-xs text-slate-500">
                Configure your free PostgreSQL backend or run in zero-setup Local Demo Sandbox.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Box */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              supabaseConfig.isConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}
          >
            {supabaseConfig.isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <p className="font-bold text-sm">
                Current Engine:{' '}
                {supabaseConfig.isConnected
                  ? 'Connected to Live Supabase'
                  : 'Active Local Sandbox (Offline-First)'}
              </p>
              <p>
                {supabaseConfig.isConnected
                  ? 'All records and authentications are synchronized with your PostgreSQL instance.'
                  : 'Currently storing all complaints, feedback, and audit logs locally in browser storage. Perfect for offline presentation, grading, and testing without requiring paid API keys or cloud setup.'}
              </p>
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleTestConnection} className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Supabase Project Credentials
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Project URL (e.g. https://xyzcompany.supabase.co)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project-ref.supabase.co"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Anon Public Key (Safe for client browsers)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {feedbackMsg && (
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {feedbackMsg}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isTesting}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isTesting ? 'Verifying...' : 'Save & Connect'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUrl('');
                    setAnonKey('');
                    updateSupabaseConfig('', '');
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Disconnect / Use Sandbox
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyEnv}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy .env snippet</span>
              </button>
            </div>
          </form>

          {/* Student Setup Steps */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Student Setup Guide (5 Minutes, 100% Free)
            </h3>
            <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Sign in to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">Supabase.com</a> and click <strong>New Project</strong> on the Free tier.
              </li>
              <li>
                In the Supabase sidebar, open <strong>SQL Editor</strong>, paste our schema from <code>supabase/schema.sql</code>, and click <strong>Run</strong>.
              </li>
              <li>
                Navigate to <strong>Project Settings → API</strong>. Copy the <strong>Project URL</strong> and <strong>anon / public key</strong> into the inputs above.
              </li>
              <li>
                Click <strong>Save & Connect</strong>. Your complaints will now persist to cloud PostgreSQL with active Row Level Security!
              </li>
            </ol>
          </div>

          {/* SQL Preview & Copy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                PostgreSQL DDL & RLS Schema (<code>/supabase/schema.sql</code>)
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-300 rounded-lg text-[11px] font-mono overflow-x-auto max-h-36">
              {SAMPLE_SQL_SNIPPET}
            </pre>
          </div>

          {/* Data Tools: Export / Reset */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Sandbox JSON</span>
            </button>

            <button
              type="button"
              onClick={resetToSampleData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 rounded-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Clean Sample Records</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
