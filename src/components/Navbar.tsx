import React, { useState } from 'react';
import { useCleanConnect } from '../context/CleanConnectContext';
import { Bell, Moon, Sun, Menu, X, Recycle, LogOut, UserCheck } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenReportModal: () => void;
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenReportModal,
  onOpenAuthModal,
}) => {
  const {
    currentUser,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    logoutUser,
    isDark,
    toggleDarkMode,
  } = useCleanConnect();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(
    (n) => n.user_id === currentUser.id && !n.is_read
  ).length;

  const userNotifications = notifications.filter((n) => n.user_id === currentUser.id);

  // Dynamic dashboard label depending on role
  const dashboardLabel =
    currentUser.role === 'admin'
      ? 'Admin Portal'
      : currentUser.role === 'staff'
      ? 'Staff Tasks'
      : 'My Complaints';

  const dashboardTargetView =
    currentUser.role === 'admin'
      ? 'admin_dashboard'
      : currentUser.role === 'staff'
      ? 'staff_dashboard'
      : 'resident_dashboard';

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Recycle className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Clean<span className="text-emerald-600 dark:text-emerald-400">Connect</span>
            </span>
          </button>

          {/* Zone 2: 4-5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'home' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => onNavigate('how_it_works')}
              className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'how_it_works' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
              }`}
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => onNavigate('recycling_guide')}
              className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'recycling_guide' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
              }`}
            >
              Recycling Guide
            </button>
            <button
              type="button"
              onClick={() => onNavigate('public_impact')}
              className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'public_impact' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
              }`}
            >
              Public Impact
            </button>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'about' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
              }`}
            >
              About
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'contact' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Zone 3: 1 primary action + notification and profile tools */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 z-50">
                  <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Notifications ({unreadCount} new)
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {userNotifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      userNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            if (currentUser.role === 'resident') onNavigate('resident_dashboard');
                            setIsNotifOpen(false);
                          }}
                          className={`p-3 text-xs cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                            !n.is_read ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {n.title}
                            </span>
                            <span>{new Date(n.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dashboard Shortcut */}
            <button
              type="button"
              onClick={() => onNavigate(dashboardTargetView)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentView === dashboardTargetView
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{dashboardLabel}</span>
            </button>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={onOpenReportModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              Report Waste
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-2 md:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {[
              { id: 'home', label: 'Home' },
              { id: 'how_it_works', label: 'How It Works' },
              { id: 'recycling_guide', label: 'Recycling Guide' },
              { id: 'public_impact', label: 'Public Impact' },
              { id: 'about', label: 'About CleanConnect' },
              { id: 'contact', label: 'Contact & Help' },
              { id: dashboardTargetView, label: dashboardLabel },
              { id: 'account_settings', label: 'Account Settings' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                  currentView === item.id
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-3 text-xs text-slate-500">
              <span>{currentUser.email}</span>
              <button
                type="button"
                onClick={() => {
                  logoutUser();
                  setIsMobileMenuOpen(false);
                }}
                className="text-red-500 hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
