'use client';

import { memo } from 'react';
import { History, Clock, Trophy } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { ContestInfo } from '@/types';

interface NavigationTabsProps {
  activeTab: 'lobby' | 'submit' | 'battle' | 'results' | 'history';
  onTabSwitch: (tab: 'lobby' | 'submit' | 'battle' | 'results' | 'history') => void;
  contestInfo: ContestInfo;
  isExpired: boolean;
}

const NavigationTabs = memo<NavigationTabsProps>(({ activeTab, onTabSwitch, contestInfo, isExpired }) => {
  const { days, hours, minutes, seconds } = useCountdown(contestInfo.endsAt);
  const tabs = [
    {
      id: 'lobby' as const,
      label: 'Lobby',
      disabled: false,
    },
    {
      id: 'submit' as const,
      label: 'Submit Vote',
      disabled: !contestInfo.active || isExpired,
    },
    {
      id: 'battle' as const,
      label: 'Live Battle',
      disabled: false,
    },
    {
      id: 'results' as const,
      label: 'Results',
      disabled: false,
    },
    {
      id: 'history' as const,
      label: 'History',
      disabled: false,
      icon: History,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Countdown Timer Bar */}
      {contestInfo.active && !isExpired && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-800">
                  Battle #{contestInfo.battleNumber || 1}
                </span>
              </div>
              <span className="text-sm text-slate-600">•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Ends in</span>
              </div>
            </div>
            <div className="flex items-end space-x-2">
              {days > 0 && (
                <>
                  <div className="flex flex-col items-center">
                    <div className="text-lg font-bold text-gray-900 leading-none">{days.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-gray-500 mt-0.5">d</div>
                  </div>
                  <span className="text-gray-400 text-sm pb-2">:</span>
                </>
              )}
              <div className="flex flex-col items-center">
                <div className="text-lg font-bold text-gray-900 leading-none">{hours.toString().padStart(2, '0')}</div>
                <div className="text-xs text-gray-500 mt-0.5">h</div>
              </div>
              <span className="text-gray-400 text-sm pb-2">:</span>
              <div className="flex flex-col items-center">
                <div className="text-lg font-bold text-gray-900 leading-none">{minutes.toString().padStart(2, '0')}</div>
                <div className="text-xs text-gray-500 mt-0.5">m</div>
              </div>
              <span className="text-gray-400 text-sm pb-2">:</span>
              <div className="flex flex-col items-center">
                <div className="text-lg font-bold text-gray-900 leading-none">{seconds.toString().padStart(2, '0')}</div>
                <div className="text-xs text-gray-500 mt-0.5">s</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Battle Status */}
      {isExpired && contestInfo.active && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-700">
              <Trophy className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">
                Battle #{contestInfo.battleNumber || 1}
              </span>
              <span className="text-sm text-amber-600">•</span>
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Processing Results...</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-amber-600"></div>
              <span className="text-xs text-amber-600">Oracle decrypting</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabSwitch(tab.id)}
              disabled={tab.disabled}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center justify-center space-x-1">
                {Icon && <Icon className="h-3 w-3" />}
                <span>{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

NavigationTabs.displayName = 'NavigationTabs';

export { NavigationTabs };
