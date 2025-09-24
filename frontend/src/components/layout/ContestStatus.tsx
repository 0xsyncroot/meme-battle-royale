'use client';

import { ConnectionStatusIndicator } from '@/components/ui/ConnectionErrorMask';

interface ContestStatusProps {
  error?: string | null;
  isLoading?: boolean;
  isConnected?: boolean;
  onRetry?: () => void;
}

export function ContestStatus({ error, isLoading, isConnected, onRetry }: ContestStatusProps) {
  // Use the new professional connection error indicator
  if (error) {
    return (
      <ConnectionStatusIndicator
        error={error}
        isConnected={isConnected}
        isRetrying={isLoading}
        onRetry={onRetry}
      />
    );
  }

  if (isLoading && !isConnected) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600"></div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-800">Connecting to Network</h3>
            <p className="text-xs text-blue-600">Establishing FHEVM contract connection...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected && !error) {
    return (
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded-full">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Initializing</h3>
            <p className="text-xs text-slate-600">Setting up privacy-preserving connection...</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
