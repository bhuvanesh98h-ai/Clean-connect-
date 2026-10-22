import React from 'react';
import { Recycle, ShieldCheck, Github, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenSupabaseModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenSupabaseModal }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center text-white">
                <Recycle className="w-4 h-4" />
              </div>
              <span>CleanConnect</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Empowering residents, community groups, and civic municipal teams to maintain cleaner,
              healthier, zero-landfill public spaces.
            </p>
            <div className="pt-2 flex items-center gap-2 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Free & Open-Source Civic Initiative</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Community Platform</h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors"
                >
                  Overview & Vision
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('how_it_works')}
                  className="hover:text-white transition-colors"
                >
                  Reporting Workflow
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('recycling_guide')}
                  className="hover:text-white transition-colors"
                >
                  Recycling Directory
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('public_impact')}
                  className="hover:text-white transition-colors"
                >
                  Public Impact Metrics
                </button>
              </li>
            </ul>
          </div>

          {/* Governance & Portals */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Portals & Operations</h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('resident_dashboard')}
                  className="hover:text-white transition-colors"
                >
                  Resident Dashboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('staff_dashboard')}
                  className="hover:text-white transition-colors"
                >
                  Field Staff Queue
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('admin_dashboard')}
                  className="hover:text-white transition-colors"
                >
                  Admin & Dispatch Console
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenSupabaseModal}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1 text-slate-300"
                >
                  <span>Supabase & SQL Config</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Project & Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Student Project & Legal</h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors"
                >
                  Engineering Mission
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors"
                >
                  Civic Helpdesk & Inquiries
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy & PII Security
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('terms')}
                  className="hover:text-white transition-colors"
                >
                  Terms & Community Guidelines
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© 2026 CleanConnect Civic Project. Built with React, TypeScript, Tailwind CSS & Supabase.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-mono text-[11px]">MIT Open Source</span>
            <span>·</span>
            <span className="text-slate-400">Zero-Waste Community Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
