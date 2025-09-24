/**
 * Hook for managing connection error states and modal display
 * Provides advanced error handling with user-friendly UX
 */

import { useState, useEffect, useCallback } from 'react';

interface ConnectionErrorState {
  isOpen: boolean;
  error: string | null;
  isRetrying: boolean;
  retryCount: number;
  lastAttempt: number | null;
}

interface UseConnectionErrorOptions {
  maxRetries?: number;
  retryDelay?: number;
  showModal?: boolean;
  autoRetry?: boolean;
}

export function useConnectionError(options: UseConnectionErrorOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 2000,
    showModal = true,
    autoRetry = false
  } = options;

  const [state, setState] = useState<ConnectionErrorState>({
    isOpen: false,
    error: null,
    isRetrying: false,
    retryCount: 0,
    lastAttempt: null
  });

  /**
   * Set an error and optionally show modal
   */
  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
      isOpen: showModal && !!error,
      lastAttempt: error ? Date.now() : null
    }));
  }, [showModal]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      isOpen: false,
      isRetrying: false,
      retryCount: 0,
      lastAttempt: null
    }));
  }, []);

  /**
   * Manual retry function
   */
  const retry = useCallback(async (retryFn?: () => Promise<void>) => {
    if (state.retryCount >= maxRetries) {
      console.warn('Max retry attempts reached');
      return false;
    }

    setState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1
    }));

    try {
      if (retryFn) {
        await retryFn();
        clearError();
        return true;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isRetrying: false
      }));
      return false;
    }

    setState(prev => ({
      ...prev,
      isRetrying: false
    }));
    
    return false;
  }, [state.retryCount, maxRetries, clearError]);

  /**
   * Auto-retry mechanism
   */
  useEffect(() => {
    if (!autoRetry || !state.error || state.isRetrying) return;

    if (state.retryCount < maxRetries) {
      const timeoutId = setTimeout(() => {
        retry();
      }, retryDelay * Math.pow(2, state.retryCount)); // Exponential backoff

      return () => clearTimeout(timeoutId);
    }
  }, [state.error, state.isRetrying, state.retryCount, autoRetry, maxRetries, retryDelay, retry]);

  /**
   * Close modal handler
   */
  const closeModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  /**
   * Open modal handler
   */
  const openModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: true
    }));
  }, []);

  /**
   * Check if should show retry button
   */
  const canRetry = state.retryCount < maxRetries && !state.isRetrying;

  /**
   * Get user-friendly error message
   */
  const getErrorMessage = useCallback((rawError: string): string => {
    if (rawError.toLowerCase().includes('network') || rawError.toLowerCase().includes('fetch')) {
      return 'Network connection failed. Please check your internet connection.';
    }
    
    if (rawError.toLowerCase().includes('contract call failed')) {
      return 'Unable to communicate with the smart contract. The network may be congested.';
    }
    
    if (rawError.toLowerCase().includes('timeout')) {
      return 'Connection timed out. The network may be experiencing high traffic.';
    }
    
    if (rawError.toLowerCase().includes('rejected')) {
      return 'Transaction was rejected. Please try again.';
    }
    
    return rawError;
  }, []);

  return {
    // State
    isOpen: state.isOpen,
    error: state.error,
    isRetrying: state.isRetrying,
    retryCount: state.retryCount,
    canRetry,
    
    // Actions
    setError,
    clearError,
    retry,
    closeModal,
    openModal,
    
    // Utilities
    getErrorMessage
  };
}
