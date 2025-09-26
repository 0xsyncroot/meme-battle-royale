'use client';

import { useEffect, useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useContract } from '@/hooks/useContract';
import { MEME_TEMPLATES } from '@/constants';
import { ContestInfo } from '@/types';
import { Users, Eye, EyeOff, Info, Activity, Shield, Zap } from 'lucide-react';

interface LiveBattleProps {
  contestInfo: ContestInfo;
}

const LiveBattle = memo<LiveBattleProps>(({ contestInfo }) => {
  const [battleInfo, setBattleInfo] = useState<any>(null);
  const [currentParticipants, setCurrentParticipants] = useState<number>(0);
  const { getBattleInfo, getBattleParticipants, isLoading, isConnected } = useContract();

  /**
   * Professional battle data fetching with proper error handling
   * Updates battle information including participant count
   */
  useEffect(() => {
    const fetchBattleData = async () => {
      if (!isConnected) return;
      
      try {
        const info = await getBattleInfo();
        if (info && info.battleNumber) {
          setBattleInfo(info);
          
          // Fetch current battle participants count
          const participants = await getBattleParticipants(info.battleNumber);
          setCurrentParticipants(participants);
        }
      } catch (error) {
        console.warn('Failed to fetch battle info:', error);
        setBattleInfo(null);
        setCurrentParticipants(0);
      }
    };

    // Initial fetch
    fetchBattleData();
    
    // Polling for live updates
    const interval = setInterval(fetchBattleData, 15000);
    
    return () => {
      clearInterval(interval);
    };
  }, [getBattleInfo, getBattleParticipants, isConnected]);

  return (
    <div className="space-y-4">
      {/* Live Battle Status - Hero Card */}
      <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 shadow-lg">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 mt-4">
              <div className="relative">
                <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 h-3 w-3 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <h2 className="font-bold text-lg text-slate-800">Live Battle in Progress</h2>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="default" className="flex items-center gap-1 bg-emerald-100 text-emerald-700 border-emerald-200">
                <Activity className="h-3 w-3" />
                <span className="font-semibold">{currentParticipants}</span>
                <span className="text-xs">participants</span>
              </Badge>
            </div>
          </div>
          
          {/* Privacy Info Banner */}
          <div className="p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-indigo-200">
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-indigo-800">FHEVM Privacy Protection</h3>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  All votes are fully encrypted during the battle using homomorphic encryption. 
                  Results will only be revealed after the battle concludes.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Recent Activity - Enhanced Design */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base font-semibold text-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" />
              <span>Live Activity</span>
            </div>
            <Badge variant="default" className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
              <Users className="h-3 w-3" />
              <span className="font-semibold">{currentParticipants}</span>
              <span className="text-xs">{currentParticipants === 1 ? 'participant' : 'participants'}</span>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            // Enhanced loading skeleton
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-slate-200 rounded-full animate-pulse"></div>
                    <div className="space-y-1.5">
                      <div className="h-3 bg-slate-200 rounded w-28 animate-pulse"></div>
                      <div className="h-2 bg-slate-200 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div>
                    <div className="h-3 bg-slate-200 rounded w-8 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : !battleInfo || currentParticipants === 0 ? (
            // Empty state with modern design
            <div className="text-center py-10">
              <div className="relative inline-block mb-6">
                <Users className="h-14 w-14 text-slate-300" />
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-xs font-bold text-emerald-600">0</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Waiting for First Participant</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-4 leading-relaxed">
                This battle is ready for its first encrypted vote. 
                Join the privacy revolution with FHEVM technology!
              </p>
              <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-lg border border-purple-200 max-w-sm mx-auto">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-700">Fully Encrypted</span>
                </div>
                <p className="text-xs text-purple-700">
                  🚀 Be the first to cast a privacy-preserving vote!
                </p>
              </div>
            </div>
          ) : (
            // Active battle state with metrics
            <div className="space-y-4">
              {/* Encrypted Activity Notice */}
              <div className="flex items-center justify-center p-5 border-2 border-dashed border-slate-200 rounded-lg bg-slate-25">
                <div className="text-center">
                  <EyeOff className="h-7 w-7 mx-auto mb-3 text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">Activity Details Encrypted</h3>
                  <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
                    Individual voting patterns are protected by homomorphic encryption during the live battle. 
                    Full details revealed after completion.
                  </p>
                </div>
              </div>
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-emerald-800">Active Participants</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold text-emerald-900">{currentParticipants}</p>
                    <span className="text-xs text-emerald-700">participants</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-3 w-3 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-800">Encryption Level</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">FHEVM Protected</p>
                </div>
              </div>
              
              {/* Privacy Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-800">Privacy Protection Active</h4>
                    <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                      FHEVM technology ensures all vote data remains encrypted to prevent manipulation and preserve voter privacy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

LiveBattle.displayName = 'LiveBattle';

export { LiveBattle };
export default LiveBattle;