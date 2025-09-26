'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface TabRouterProps {
  onTabChange: (tab: 'lobby' | 'submit' | 'battle' | 'results' | 'history') => void;
  initialTab?: 'lobby' | 'submit' | 'battle' | 'results' | 'history';
}

/**
 * Tab Router Component
 * Handles URL synchronization for tab navigation
 */
export function TabRouter({ onTabChange, initialTab = 'lobby' }: TabRouterProps) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as 'lobby' | 'submit' | 'battle' | 'results' | 'history';
    const validTabs = ['lobby', 'submit', 'battle', 'results', 'history'];
    
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      onTabChange(tabFromUrl);
    } else {
      onTabChange(initialTab);
    }
  }, [searchParams, onTabChange, initialTab]);

  return null;
}

/**
 * Hook for tab navigation with URL sync
 */
export function useTabRouter() {
  const router = useRouter();
  
  const updateTabInUrl = (tab: 'lobby' | 'submit' | 'battle' | 'results' | 'history') => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', tab);
    router.replace(newUrl.pathname + newUrl.search, { scroll: false });
  };

  return { updateTabInUrl };
}
