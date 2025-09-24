/**
 * Modern Shimmer Loading Component
 * Provides various shimmer patterns for different content types
 */

import { memo } from 'react';
import { Calendar } from 'lucide-react';

interface ShimmerProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Base shimmer component with animated gradient
 */
const Shimmer = memo<ShimmerProps>(({ className = '', children }) => {
  return (
    <div 
      className={`shimmer bg-gradient-to-r from-slate-200 via-slate-50 to-slate-200 ${className}`}
    >
      {children}
    </div>
  );
});

/**
 * Battle History Item Shimmer
 * Matches the layout of battle history cards
 */
const BattleHistoryItemShimmer = memo(() => {
  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Shimmer className="h-6 w-20 rounded" />
          <Shimmer className="h-4 w-32 rounded" />
          <Shimmer className="h-4 w-24 rounded" />
        </div>
        <Shimmer className="h-6 w-28 rounded-full" />
      </div>
      
      {/* Content Area */}
      <div className="p-3 bg-slate-25 rounded-lg border border-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Shimmer className="h-3 w-24 rounded" />
            <Shimmer className="h-5 w-32 rounded" />
            <Shimmer className="h-3 w-20 rounded" />
          </div>
          <div className="space-y-1">
            <Shimmer className="h-3 w-20 rounded" />
            <Shimmer className="h-4 w-40 rounded" />
            <Shimmer className="h-3 w-36 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Latest Battle Card Shimmer
 * For the highlighted latest battle section
 */
const LatestBattleShimmer = memo(() => {
  return (
    <div className="border border-purple-200 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 shadow-lg rounded-lg">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shimmer className="h-5 w-5 rounded" />
            <Shimmer className="h-5 w-24 rounded" />
          </div>
          <Shimmer className="h-6 w-20 rounded-full" />
        </div>
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center p-3 bg-white/60 rounded-lg border border-purple-100">
              <Shimmer className="h-3 w-16 rounded mx-auto mb-2" />
              <Shimmer className="h-5 w-20 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

/**
 * Battle History List Shimmer
 * Complete shimmer for the entire battle history section
 */
const BattleHistoryListShimmer = memo(() => {
  return (
    <div className="space-y-4">
      {/* Latest Battle Shimmer */}
      <LatestBattleShimmer />
      
      {/* Battle History Card */}
      <div className="border border-slate-200 shadow-sm rounded-lg">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shimmer className="h-5 w-5 rounded" />
              <Shimmer className="h-5 w-32 rounded" />
              <Shimmer className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Shimmer className="h-8 w-8 rounded" />
              <Shimmer className="h-4 w-12 rounded" />
              <Shimmer className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <BattleHistoryItemShimmer key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Empty State Shimmer
 * For when there's no data but still loading
 */
const EmptyStateShimmer = memo(() => {
  return (
    <div className="border border-slate-200 shadow-sm rounded-lg">
      <div className="p-10 text-center">
        <Shimmer className="h-14 w-14 rounded-full mx-auto mb-4" />
        <Shimmer className="h-6 w-48 rounded mx-auto mb-2" />
        <Shimmer className="h-4 w-80 rounded mx-auto mb-4" />
        <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200 max-w-sm mx-auto">
          <Shimmer className="h-3 w-64 rounded mx-auto" />
        </div>
      </div>
    </div>
  );
});

/**
 * Real Empty State (no shimmer - actual empty state)
 */
const EmptyState = memo(() => {
  return (
    <div className="border border-slate-200 shadow-sm rounded-lg">
      <div className="p-10 text-center">
        <div className="flex flex-col items-center space-y-4">
          <Calendar className="h-14 w-14 text-slate-300" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-800">No Battle History</h3>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              The first battle hasn't been completed yet. Join active battles to see results here!
            </p>
          </div>
          <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-700 font-medium">
              🚀 Be part of the first privacy-preserving meme battle!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Submission Form Shimmer Components
 */
const SubmissionFormShimmer = memo(() => {
  return (
    <div className="space-y-4">
      {/* Template Selection Card */}
      <div className="border border-slate-200 shadow-sm rounded-lg">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shimmer className="h-6 w-6 rounded-full" />
              <Shimmer className="h-5 w-32 rounded" />
            </div>
            <Shimmer className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="p-4">
          {/* Template Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square border border-slate-200 rounded-lg p-2">
                <Shimmer className="w-full h-3/4 rounded mb-2" />
                <Shimmer className="h-3 w-full rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Caption Selection Card */}
      <div className="border border-slate-200 shadow-sm rounded-lg">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shimmer className="h-6 w-6 rounded-full" />
              <Shimmer className="h-5 w-28 rounded" />
            </div>
            <div className="flex gap-2">
              <Shimmer className="h-6 w-16 rounded-full" />
              <Shimmer className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {/* Category Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
            {[...Array(3)].map((_, i) => (
              <Shimmer key={i} className="h-8 w-20 rounded-md" />
            ))}
          </div>
          {/* Caption Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-hidden">
            {[...Array(18)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <Shimmer className="h-5 w-5 rounded" />
                  <Shimmer className="h-4 flex-1 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Card */}
      <div className="border border-purple-200 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 shadow-sm rounded-lg">
        <div className="p-4 border-b border-purple-100">
          <div className="flex items-center gap-2">
            <Shimmer className="h-6 w-6 rounded-full" />
            <Shimmer className="h-5 w-36 rounded" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
            <Shimmer className="h-32 w-full rounded" />
          </div>
          <Shimmer className="h-11 w-full rounded" />
        </div>
      </div>
    </div>
  );
});

/**
 * Lobby Content Shimmer
 */
const LobbyContentShimmer = memo(() => {
  return (
    <div className="border border-slate-200 shadow-sm rounded-lg">
      <div className="p-5">
        <Shimmer className="h-6 w-32 rounded mb-4" />
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <Shimmer className="h-5 w-28 rounded mb-2" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Shimmer key={i} className="h-4 w-full rounded" />
              ))}
            </div>
          </div>
          <div>
            <Shimmer className="h-5 w-32 rounded mb-2" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Shimmer key={i} className="h-4 w-full rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Set display names for debugging
Shimmer.displayName = 'Shimmer';
BattleHistoryItemShimmer.displayName = 'BattleHistoryItemShimmer';
LatestBattleShimmer.displayName = 'LatestBattleShimmer';
BattleHistoryListShimmer.displayName = 'BattleHistoryListShimmer';
EmptyStateShimmer.displayName = 'EmptyStateShimmer';
EmptyState.displayName = 'EmptyState';
SubmissionFormShimmer.displayName = 'SubmissionFormShimmer';
LobbyContentShimmer.displayName = 'LobbyContentShimmer';

export { 
  Shimmer, 
  BattleHistoryItemShimmer, 
  LatestBattleShimmer, 
  BattleHistoryListShimmer, 
  EmptyStateShimmer,
  EmptyState,
  SubmissionFormShimmer,
  LobbyContentShimmer
};
