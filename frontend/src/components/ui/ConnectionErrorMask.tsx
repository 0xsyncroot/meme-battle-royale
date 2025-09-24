/**
 * Professional Connection Error Mask
 * Modern overlay design for connection failures with proper UX
 */

import { memo } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  Zap,
  Shield
} from 'lucide-react';

interface ConnectionErrorMaskProps {
  error?: string | null;
  isRetrying?: boolean;
  onRetry?: () => void;
  onClose?: () => void;
}

const ConnectionErrorMask = memo<ConnectionErrorMaskProps>(({ 
  error, 
  isRetrying = false, 
  onRetry, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative max-w-md mx-4 w-full">
        {/* Main Error Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-red-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                <WifiOff className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800 text-base">Connection Lost</h3>
                <p className="text-xs text-red-600">Unable to connect to the blockchain</p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 py-6">
            <div className="space-y-4">
              {/* Error Message */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 font-medium mb-1">Network Issue Detected</p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {error || 'Failed to establish connection with the smart contract. This could be due to network congestion or RPC issues.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* FHEVM Info */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Shield className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-700 font-medium">FHEVM Network Status</p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      Privacy-preserving computation requires stable connection
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={onRetry}
                  disabled={isRetrying}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      <span>Reconnecting...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      <span>Retry Connection</span>
                    </>
                  )}
                </Button>
                
                {onClose && (
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="px-4 border-slate-300 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {/* Tips */}
              <div className="pt-2">
                <details className="group">
                  <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 transition-colors">
                    <span className="select-none">Troubleshooting Tips</span>
                  </summary>
                  <div className="mt-2 space-y-1 text-xs text-slate-600 pl-2 border-l-2 border-slate-200">
                    <p>• Check your internet connection</p>
                    <p>• Verify your wallet is connected</p>
                    <p>• Try refreshing the page</p>
                    <p>• Switch to a different RPC endpoint if available</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-red-100 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-orange-100 rounded-full opacity-40 animate-pulse animation-delay-1000"></div>
      </div>
    </div>
  );
});

/**
 * Lightweight Connection Status Indicator
 * For inline status display (non-modal)
 */
const ConnectionStatusIndicator = memo<{
  error?: string | null;
  isConnected?: boolean;
  isRetrying?: boolean;
  onRetry?: () => void;
}>(({ error, isConnected, isRetrying, onRetry }) => {
  if (!error && isConnected) return null;

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
            <WifiOff className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-800">Connection Issue</h3>
            <p className="text-xs text-red-600">
              {error ? 'Contract call failed' : 'Connecting to network...'}
            </p>
          </div>
        </div>
        
        {onRetry && (
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            size="sm"
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            {isRetrying ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-1" />
                <span className="text-xs">Retry</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
});

// Display names for debugging
ConnectionErrorMask.displayName = 'ConnectionErrorMask';
ConnectionStatusIndicator.displayName = 'ConnectionStatusIndicator';

export { ConnectionErrorMask, ConnectionStatusIndicator };
