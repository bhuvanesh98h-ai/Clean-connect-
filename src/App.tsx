import React, { useState } from 'react';
import { CleanConnectProvider, useCleanConnect } from './context/CleanConnectContext';
import { RoleSwitcher } from './components/RoleSwitcher';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SubmitComplaintModal } from './components/SubmitComplaintModal';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { FeedbackModal } from './components/FeedbackModal';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';
import { AuthModal } from './components/AuthModal';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { RecyclingGuidePage } from './pages/RecyclingGuidePage';
import { PublicImpactPage } from './pages/PublicImpactPage';
import { ContactPage } from './pages/ContactPage';
import { ResidentDashboard } from './pages/ResidentDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { LegalPage } from './pages/LegalPage';
import { AccountSettingsPage } from './pages/AccountSettingsPage';
import { Complaint } from './types';

const MainApp: React.FC = () => {
  const { currentUser } = useCleanConnect();

  // Navigation view state
  const [currentView, setCurrentView] = useState<string>('home');

  // Modal triggers
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState<{
    isOpen: boolean;
    mode: 'login' | 'signup';
  }>({
    isOpen: false,
    mode: 'login',
  });

  const [detailComplaint, setDetailComplaint] = useState<Complaint | null>(null);
  const [feedbackComplaint, setFeedbackComplaint] = useState<Complaint | null>(null);

  const handleOpenDetailModal = (complaint: Complaint) => {
    setDetailComplaint(complaint);
  };

  const handleOpenFeedbackModal = (complaint: Complaint) => {
    setFeedbackComplaint(complaint);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Demo Role Switcher & Database Status Bar */}
      <RoleSwitcher onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)} />

      {/* Main Top Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAuthModal={(mode) => setAuthModalConfig({ isOpen: true, mode })}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'about' && <AboutPage />}

        {currentView === 'how_it_works' && (
          <HowItWorksPage onOpenReportModal={() => setIsReportModalOpen(true)} />
        )}

        {currentView === 'recycling_guide' && <RecyclingGuidePage />}

        {currentView === 'public_impact' && <PublicImpactPage />}

        {currentView === 'contact' && <ContactPage />}

        {currentView === 'resident_dashboard' && (
          <ResidentDashboard
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenDetailModal={handleOpenDetailModal}
            onOpenFeedbackModal={handleOpenFeedbackModal}
          />
        )}

        {currentView === 'staff_dashboard' && (
          <StaffDashboard onOpenDetailModal={handleOpenDetailModal} />
        )}

        {currentView === 'admin_dashboard' && (
          <AdminDashboard
            onOpenDetailModal={handleOpenDetailModal}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          />
        )}

        {currentView === 'privacy' && <LegalPage initialTab="privacy" />}

        {currentView === 'terms' && <LegalPage initialTab="terms" />}

        {currentView === 'account_settings' && <AccountSettingsPage />}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Modals */}
      <SubmitComplaintModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={() => {
          if (currentUser.role === 'resident') {
            setCurrentView('resident_dashboard');
          }
        }}
      />

      <ComplaintDetailModal
        complaint={detailComplaint}
        isOpen={Boolean(detailComplaint)}
        onClose={() => setDetailComplaint(null)}
        onOpenFeedback={(c) => {
          setDetailComplaint(null);
          setFeedbackComplaint(c);
        }}
      />

      <FeedbackModal
        complaint={feedbackComplaint}
        isOpen={Boolean(feedbackComplaint)}
        onClose={() => setFeedbackComplaint(null)}
      />

      <SupabaseSetupModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      <AuthModal
        isOpen={authModalConfig.isOpen}
        initialMode={authModalConfig.mode}
        onClose={() => setAuthModalConfig({ isOpen: false, mode: 'login' })}
      />
    </div>
  );
};

export default function App() {
  return (
    <CleanConnectProvider>
      <MainApp />
    </CleanConnectProvider>
  );
}
