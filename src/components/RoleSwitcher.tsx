import React from 'react';
import { useCleanConnect } from '../context/CleanConnectContext';
import { UserRole } from '../types';
import { Shield, HardHat, User, Database, CheckCircle2, AlertCircle } from 'lucide-react';

interface RoleSwitcherProps {
  onOpenSupabaseModal: () => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ onOpenSupabaseModal }) => {
  const { currentUser, switchUserRole, supabaseConfig } = useCleanConnect();

  const roles: { role: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      role: 'resident',
      label: 'Resident',
      icon: <User className="w-3.5 h-3.5" />,
      desc: 'Submit & track local complaints',
    },
    {
      role: 'staff',
      label: 'Staff Member',
      icon: <HardHat className="w-3.5 h-3.5" />,
      desc: 'Field tasks & resolution notes',
    },
    {
      role: 'admin',
      label: 'Admin',
      icon: <Shield className="w-3.5 h-3.5" />,
      desc: 'Dispatch, triage & analytics',
    },
  ];

  return (
    <div className="bg-slate-900 text-slate-200 px-4 py-2 border-b border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">
            Demo Environment:
          </span>
          <span className="text-slate-400 hidden sm:inline">Active Role:</span>
          <div className="inline-flex rounded-md p-0.5 bg-slate-800 border border-slate-700">
            {roles.map((r) => {
              const active = currentUser.role === r.role;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => switchUserRole(r.role)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                  title={r.desc}
                >
                  {r.icon}
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
          <span className="text-slate-400 hidden lg:inline">
            Logged in as <strong className="text-slate-200">{currentUser.full_name}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Database:{' '}
              <strong className={supabaseConfig.isConnected ? 'text-emerald-400' : 'text-amber-400'}>
                {supabaseConfig.isConnected ? 'Supabase Live' : 'Local Sandbox'}
              </strong>
            </span>
            {supabaseConfig.isConnected ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3 h-3 text-amber-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
