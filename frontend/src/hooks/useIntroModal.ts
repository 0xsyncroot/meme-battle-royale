'use client';

import { useState, useEffect } from 'react';

const INTRO_MODAL_KEY = 'meme-battle-intro-dismissed';

/**
 * Custom hook for managing intro modal state with localStorage persistence.
 * Automatically shows modal for first-time users and remembers dismissal state.
 * 
 * @returns Object containing modal state and control functions
 */
export function useIntroModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize modal state from localStorage
  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem(INTRO_MODAL_KEY);
      
      // Show modal for first-time users (when localStorage item doesn't exist)
      if (!isDismissed) {
        setIsOpen(true);
      }
      
      setIsLoaded(true);
    } catch (error) {
      // Handle localStorage errors (e.g., disabled, private browsing)
      console.warn('Failed to read intro modal state from localStorage:', error);
      setIsOpen(true); // Default to showing modal on error
      setIsLoaded(true);
    }
  }, []);

  /**
   * Close modal and save dismissal state to localStorage
   */
  const closeModal = () => {
    setIsOpen(false);
    
    try {
      localStorage.setItem(INTRO_MODAL_KEY, 'true');
    } catch (error) {
      console.warn('Failed to save intro modal dismissal to localStorage:', error);
    }
  };

  /**
   * Reset modal state (for testing purposes)
   */
  const resetModal = () => {
    try {
      localStorage.removeItem(INTRO_MODAL_KEY);
      setIsOpen(true);
    } catch (error) {
      console.warn('Failed to reset intro modal state:', error);
    }
  };

  /**
   * Check if intro has been dismissed before
   */
  const isDismissed = () => {
    try {
      return Boolean(localStorage.getItem(INTRO_MODAL_KEY));
    } catch (error) {
      return false;
    }
  };

  return {
    isOpen,
    isLoaded,
    closeModal,
    resetModal,
    isDismissed
  };
}

export default useIntroModal;
