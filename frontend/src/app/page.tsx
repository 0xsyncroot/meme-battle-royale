'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import dynamic from 'next/dynamic';

// Layout components
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LandingPage } from '@/components/layout/LandingPage';
import { NavigationTabs } from '@/components/layout/NavigationTabs';
import { ContestStatus } from '@/components/layout/ContestStatus';
import { LobbyContent } from '@/components/layout/LobbyContent';

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

export default function HomePage() {
  const { ready, authenticated } = usePrivy();
  const [contestInfo, setContestInfo] = useState<ContestInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'lobby' | 'submit' | 'battle' | 'results' | 'history'>('lobby');
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

  // Handle manual tab switching - prevent future auto-switches
  const handleTabSwitch = (tab: 'lobby' | 'submit' | 'battle' | 'results' | 'history') => {
    setActiveTab(tab);
    setIsInitialLoad(false); // Disable auto-switching once user manually switches
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
          
          // Only auto-switch tabs on initial load, not during polling
          if (isInitialLoad) {
            if (!info.active) {
              setActiveTab('results');
            } else if (info.totalSubmissions > 0) {
              setActiveTab('battle');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading Meme Battle Royale...</p>
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