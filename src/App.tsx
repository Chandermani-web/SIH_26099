import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { DataUpload } from './pages/DataUpload';
import { MaterialExplorer } from './pages/MaterialExplorer';
import { AIMatching } from './pages/AIMatching';
import { ReviewApproval } from './pages/ReviewApproval';
import { NationalMaster } from './pages/NationalMaster';
import { LegacyMapping } from './pages/LegacyMapping';
import { Analytics } from './pages/Analytics';
import { AuditLogs } from './pages/AuditLogs';
import { Material } from './types';
import { api } from './services/api';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [matchingSourceCode, setMatchingSourceCode] = useState<string>('CPCL-BLT-001');
  const [pendingReviewCount, setPendingReviewCount] = useState<number>(0);

  const fetchPendingCount = async () => {
    try {
      const stats = await api.getDashboardStats();
      setPendingReviewCount(stats.pendingReviews);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingCount();
    }
  }, [isAuthenticated, currentTab]);

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setCurrentTab('dashboard')} />;
  }

  const handleSelectMaterialForMatching = (material: Material) => {
    setMatchingSourceCode(material.materialCode);
    setCurrentTab('matching');
  };

  const handleNavigateToMatchingFromDashboard = (sourceCode?: string) => {
    if (sourceCode) {
      setMatchingSourceCode(sourceCode);
    }
    setCurrentTab('matching');
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-800 antialiased">
      {/* Enterprise Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingCount={pendingReviewCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Government Header */}
        <Header
          onResetSuccess={() => {
            fetchPendingCount();
          }}
        />

        {/* Dynamic Page View */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <Dashboard
                onNavigateToMatching={handleNavigateToMatchingFromDashboard}
                onNavigateToTab={setCurrentTab}
              />
            )}

            {currentTab === 'upload' && (
              <DataUpload onNavigateToExplorer={() => setCurrentTab('explorer')} />
            )}

            {currentTab === 'explorer' && (
              <MaterialExplorer onSelectForMatching={handleSelectMaterialForMatching} />
            )}

            {currentTab === 'matching' && (
              <AIMatching
                initialSourceCode={matchingSourceCode}
                onHarmonizationComplete={fetchPendingCount}
              />
            )}

            {currentTab === 'review' && <ReviewApproval />}

            {currentTab === 'national-master' && <NationalMaster />}

            {currentTab === 'legacy-mapping' && <LegacyMapping />}

            {currentTab === 'analytics' && <Analytics />}

            {currentTab === 'audit-logs' && <AuditLogs />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
