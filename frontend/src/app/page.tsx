'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import dynamic from 'next/dynamic';

// Layout components
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LandingPage } from '@/components/layout/LandingPage';
import { NavigationTabs } from '@/components/layout/NavigationTabs';
import { ContestStatus } from '@/components/layout/ContestStatus';
import { LobbyContent } from '@/components/layout/LobbyContent';
import { TabRouter, useTabRouter } from '@/components/layout/TabRouter';

// Feature components

// Dynamic imports for FHEVM-dependent components
const SubmissionForm = dynamic(() => import('@/components/features/SubmissionForm'), {
  ssr: false,
  loading: () => {
    const { SubmissionFormShimmer } = require('@/components/ui/Shimmer');
    return <SubmissionFormShimmer />;
  }
});

const LiveBattle = dynamic(() => import('@/components/features/LiveBattle'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
});

const Results = dynamic(() => import('@/components/features/Results'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
});

const BattleHistory = dynamic(() => import('@/components/features/BattleHistory'), {
  ssr: false,
  loading: () => {
    const { BattleHistoryListShimmer } = require('@/components/ui/Shimmer');
    return <BattleHistoryListShimmer />;
  }
});

// Hooks and types
import { useContract } from '@/hooks/useContract';
import { useConnectionError } from '@/hooks/useConnectionError';
import { useIntroModal } from '@/hooks/useIntroModal';
import { ContestInfo } from '@/types';
import { ConnectionErrorMask } from '@/components/ui/ConnectionErrorMask';
import { IntroModal } from '@/components/ui/IntroModal';

function HomePageContent() {
  const { ready, authenticated } = usePrivy();
  const [contestInfo, setContestInfo] = useState<ContestInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'lobby' | 'submit' | 'battle' | 'results' | 'history'>('lobby');
  const [tabInitialized, setTabInitialized] = useState(false);
  const { updateTabInUrl } = useTabRouter();
  const { 
    getBattleInfo, 
    isLoading, 
    isConnected, 
    error, 
    retryConnection 
  } = useContract();

  // Connection error management
  const connectionError = useConnectionError({
    maxRetries: 5,
    retryDelay: 3000,
    showModal: true,
    autoRetry: false
  });

  // Intro modal for first-time users
  const introModal = useIntroModal();

  // Track if this is the first load to prevent auto-switching after user interaction
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Handle manual tab switching - prevent future auto-switches and update URL
  const handleTabSwitch = (tab: 'lobby' | 'submit' | 'battle' | 'results' | 'history') => {
    setActiveTab(tab);
    setIsInitialLoad(false); // Disable auto-switching once user manually switches
    updateTabInUrl(tab);
  };

  const handleTabChangeFromUrl = (tab: 'lobby' | 'submit' | 'battle' | 'results' | 'history') => {
    setActiveTab(tab);
    setTabInitialized(true);
    setIsInitialLoad(false);
  };

  // Monitor contract errors and show modal when needed
  useEffect(() => {
    if (error && !connectionError.isOpen) {
      connectionError.setError(connectionError.getErrorMessage(error));
    } else if (!error && connectionError.error) {
      connectionError.clearError();
    }
  }, [error, connectionError]);

  useEffect(() => {
    const fetchBattleInfo = async () => {
      if (!isConnected) return;
      
      try {
        const info = await getBattleInfo();
        if (info) {
          setContestInfo(info);
          
          // Clear any previous errors on successful fetch
          if (connectionError.error) {
            connectionError.clearError();
          }
          
          if (isInitialLoad && tabInitialized) {
            if (activeTab === 'lobby') {
              let newTab: 'lobby' | 'submit' | 'battle' | 'results' | 'history' = activeTab;
              if (!info.active) {
                newTab = 'results';
              } else if (info.totalSubmissions > 0) {
                newTab = 'battle';
              }
              
              if (newTab !== activeTab) {
                setActiveTab(newTab);
                updateTabInUrl(newTab);
              }
            }
            setIsInitialLoad(false);
          }
        }
      } catch (fetchError) {
        // Let the error state be handled by the useEffect above
        console.warn('Failed to fetch battle info:', fetchError);
      }
    };

    if (ready && authenticated && isConnected) {
      fetchBattleInfo();
      const interval = setInterval(fetchBattleInfo, 10000);
      return () => clearInterval(interval);
    }
  }, [ready, authenticated, isConnected, getBattleInfo, isInitialLoad]);

  const isExpired = contestInfo ? Date.now() > contestInfo.endsAt * 1000 : false;

  // Handle retry connection
  const handleRetryConnection = async () => {
    await connectionError.retry(async () => {
      await retryConnection();
    });
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <div className="text-center space-y-6">
          {/* Logo/Brand shimmer */}
          <div className="space-y-4">
            <div className="shimmer h-12 w-64 rounded-xl mx-auto"></div>
            <div className="shimmer h-4 w-48 rounded-lg mx-auto"></div>
          </div>
          
          {/* Feature cards shimmer */}
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="shimmer h-32 w-64 rounded-2xl mx-auto"></div>
            ))}
          </div>
          
          {/* Connect button shimmer */}
          <div className="space-y-3">
            <div className="shimmer h-12 w-48 rounded-xl mx-auto"></div>
            <div className="shimmer h-4 w-72 rounded-lg mx-auto"></div>
          </div>
          
          {/* Loading indicator */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {!authenticated ? (
          <LandingPage />
        ) : (
          <div className="space-y-4">
            <ContestStatus 
              error={error}
              isLoading={isLoading}
              isConnected={isConnected}
              onRetry={handleRetryConnection}
            />

            {contestInfo && isConnected && (
              <>
                <TabRouter onTabChange={handleTabChangeFromUrl} initialTab="lobby" />
                <NavigationTabs
                  activeTab={activeTab}
                  onTabSwitch={handleTabSwitch}
                  contestInfo={contestInfo}
                  isExpired={isExpired}
                />

                <div>
                  {activeTab === 'lobby' && <LobbyContent />}
                  {activeTab === 'submit' && (
                    <SubmissionForm 
                      key="submission-form" 
                      onSuccess={() => handleTabSwitch('battle')} 
                    />
                  )}
                  {activeTab === 'battle' && <LiveBattle key="live-battle" contestInfo={contestInfo} />}
                  {activeTab === 'results' && <Results key="results" contestInfo={contestInfo} />}
                  {activeTab === 'history' && <BattleHistory key="battle-history" />}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
      
      {/* Intro Modal for First-Time Users */}
      {introModal.isLoaded && (
        <IntroModal
          isOpen={introModal.isOpen}
          onClose={introModal.closeModal}
        />
      )}
      
      {/* Connection Error Modal */}
      {connectionError.isOpen && (
        <ConnectionErrorMask
          error={connectionError.error}
          isRetrying={connectionError.isRetrying}
          onRetry={handleRetryConnection}
          onClose={connectionError.closeModal}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <div className="shimmer h-12 w-64 rounded-xl mx-auto"></div>
            <div className="shimmer h-4 w-48 rounded-lg mx-auto"></div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-8">
            <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}