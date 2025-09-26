'use client';

import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useContract } from '@/hooks/useContract';
import { BattleHistoryItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MEME_TEMPLATES } from '@/constants';
import { CAPTION_PRESETS } from '@/constants/captions';
import { 
  Trophy, 
  Users, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Clock,
  Shield,
  Sparkles
} from 'lucide-react';
import { 
  BattleHistoryListShimmer, 
  EmptyStateShimmer,
  EmptyState,
  LatestBattleShimmer,
  BattleHistoryItemShimmer
} from '@/components/ui/Shimmer';

const BattleHistory = memo(() => {
  // State management with better organization
  const [battles, setBattles] = useState<BattleHistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBattles, setTotalBattles] = useState(0);
  const [loading, setLoading] = useState(false);
  const [latestBattle, setLatestBattle] = useState<BattleHistoryItem | null>(null);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  
  // Refs for cleanup management
  const loadLatestBattleRef = useRef<AbortController | null>(null);
  const loadBattleCountRef = useRef<AbortController | null>(null);
  const loadBattlesRef = useRef<AbortController | null>(null);
  
  const { 
    getBattleHistory, 
    getCompletedBattleCount,
    isConnected 
  } = useContract();

  const pageSize = 8; // Optimized page size for better UX

  /**
   * Component mount/unmount lifecycle management
   */
  useEffect(() => {
    console.log('🔄 BattleHistory: Component mounted');
    setIsInitialMount(true);
    setHasInitialLoad(false);
    
    return () => {
      console.log('🔄 BattleHistory: Component unmounting - cleaning up');
      
      // Abort any ongoing requests
      if (loadLatestBattleRef.current) {
        loadLatestBattleRef.current.abort();
        loadLatestBattleRef.current = null;
      }
      if (loadBattleCountRef.current) {
        loadBattleCountRef.current.abort();
        loadBattleCountRef.current = null;
      }
      if (loadBattlesRef.current) {
        loadBattlesRef.current.abort();
        loadBattlesRef.current = null;
      }
      
      // Reset state on unmount
      setBattles([]);
      setTotalBattles(0);
      setLatestBattle(null);
      setCurrentPage(1);
      setLoading(false);
    };
  }, []);

  /**
   * Professional latest battle loading with proper error handling
   * Loads most recent completed battle for highlighting
   */
  useEffect(() => {
    const loadLatestBattle = async () => {
      if (!isConnected || totalBattles === 0) return;
      
      if (loadLatestBattleRef.current) {
        loadLatestBattleRef.current.abort();
      }
      
      const abortController = new AbortController();
      loadLatestBattleRef.current = abortController;
      
      try {
        const latest = await getBattleHistory(totalBattles);
        
        if (abortController.signal.aborted) return;
        
        if (latest && latest.battleNumber > 0 && latest.endTimestamp > 0) {
          setLatestBattle(latest);
        } else {
          setLatestBattle(null);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.warn('Failed to load latest battle:', error);
          setLatestBattle(null);
        }
      } finally {
        if (loadLatestBattleRef.current === abortController) {
          loadLatestBattleRef.current = null;
        }
      }
    };

    if (isConnected && totalBattles > 0) {
      loadLatestBattle();
    }
  }, [isConnected, totalBattles, getBattleHistory]);

  /**
   * Professional battle count loading with proper state management
   */
  useEffect(() => {
    const loadBattleCount = async () => {
      if (!isConnected) return;
      
      if (loadBattleCountRef.current) {
        loadBattleCountRef.current.abort();
      }
      
      const abortController = new AbortController();
      loadBattleCountRef.current = abortController;
      
      try {
        const count = await getCompletedBattleCount();
        
        if (abortController.signal.aborted) return;
        
        setTotalBattles(count);
        
        if (isInitialMount) {
          setHasInitialLoad(true);
          setIsInitialMount(false);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.warn('Failed to load battle count:', error);
          setTotalBattles(0);
        }
      } finally {
        if (loadBattleCountRef.current === abortController) {
          loadBattleCountRef.current = null;
        }
      }
    };

    loadBattleCount();
  }, [isConnected, getCompletedBattleCount, isInitialMount]);

  /**
   * Professional battle loading with optimized pagination
   * Loads battles for current page with proper error handling
   */
  useEffect(() => {
    const loadBattles = async () => {
      if (!isConnected || totalBattles === 0) {
        setBattles([]);
        return;
      }
      
      if (loadBattlesRef.current) {
        loadBattlesRef.current.abort();
      }
      
      const abortController = new AbortController();
      loadBattlesRef.current = abortController;
      
      setLoading(true);
      try {
        // Calculate pagination (newest first)
        const startBattle = Math.max(1, totalBattles - (currentPage * pageSize) + 1);
        const endBattle = Math.min(totalBattles, startBattle + pageSize - 1);
        
        if (startBattle > endBattle) {
          setBattles([]);
          return;
        }

        // Generate battle numbers for this page
        const battleNumbers = [];
        for (let i = startBattle; i <= endBattle; i++) {
          battleNumbers.push(i);
        }
        
        if (abortController.signal.aborted) return;
        
        // Load battle data in parallel
        const battleData = await Promise.all(
          battleNumbers.map(async (num) => {
            try {
              return await getBattleHistory(num);
            } catch (error) {
              if (!abortController.signal.aborted) {
                console.warn(`Failed to load battle ${num}:`, error);
              }
              return null;
            }
          })
        );
        
        if (abortController.signal.aborted) return;
        
        // Sort by battle number descending (newest first)
        const sortedBattles = battleData
          .filter(battle => battle !== null)
          .sort((a, b) => b.battleNumber - a.battleNumber);
        
        setBattles(sortedBattles);
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.warn('Failed to load battles:', error);
          setBattles([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
        
        if (loadBattlesRef.current === abortController) {
          loadBattlesRef.current = null;
        }
      }
    };

    if (isConnected && hasInitialLoad) {
      loadBattles();
    }
  }, [isConnected, currentPage, totalBattles, hasInitialLoad, getBattleHistory]);

  // Computed values
  const totalPages = Math.ceil(totalBattles / pageSize);

  /**
   * Formats timestamp to readable date
   * Memoized for performance
   */
  const formatDate = useCallback((timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  /**
   * Gets template name by ID with fallback
   */
  const getTemplateName = useCallback((templateId: number) => {
    const template = MEME_TEMPLATES.find(t => t.id === templateId);
    return template ? template.name : `Template #${templateId}`;
  }, []);

  /**
   * Gets caption text by ID with fallback
   */
  const getCaptionText = useCallback((captionId: number) => {
    const caption = CAPTION_PRESETS.find(c => c.id === captionId);
    return caption ? `${caption.emoji} ${caption.text}` : `Caption #${captionId}`;
  }, []);

  return (
    <div className="space-y-4 w-full">
      {/* Connection guard with proper loading states */}
      {!isConnected ? (
        <BattleHistoryListShimmer />
      ) : (isInitialMount || !hasInitialLoad) ? (
        // Initial mount loading - show full shimmer
        <BattleHistoryListShimmer />
      ) : (
        <>
      {/* Empty State */}
      {totalBattles === 0 && hasInitialLoad && (
        <EmptyState />
      )}

      {/* Latest Battle Highlight with shimmer fallback */}
      {totalBattles > 0 && (
        latestBattle ? (
        <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base font-semibold text-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Latest Battle</span>
              </div>
              <Badge variant="default" className="bg-purple-100 text-purple-700 border-purple-200">
                Battle #{latestBattle.battleNumber}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {latestBattle.revealed && latestBattle.totalParticipants > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/60 rounded-lg border border-purple-100">
                  <p className="text-xs text-slate-600 mb-2 font-medium">🏆 Winner</p>
                  <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs font-semibold">
                    {getTemplateName(latestBattle.winnerTemplateId)}
                  </Badge>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-lg border border-purple-100">
                  <p className="text-xs text-slate-600 mb-2 font-medium">💬 Caption</p>
                  <div className="text-xs font-medium text-slate-800 truncate">
                    {getCaptionText(latestBattle.winnerCaptionId)}
                  </div>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-lg border border-purple-100">
                  <p className="text-xs text-slate-600 mb-2 font-medium">👥 Participants</p>
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4 text-indigo-600" />
                    <span className="font-semibold text-slate-800">{latestBattle.totalParticipants}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="flex flex-col items-center space-y-3">
                  <EyeOff className="h-10 w-10 text-slate-400" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800">Results Processing</p>
                    <p className="text-xs text-slate-600">
                      Battle #{latestBattle.battleNumber} results are being decrypted by FHEVM oracle
                    </p>
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                      <Users className="h-3 w-3" />
                      <span>{latestBattle.totalParticipants} participants</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        ) : (
          <LatestBattleShimmer />
        )
      )}

      {/* Battle History List */}
      {totalBattles > 0 && (
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
                <Clock className="h-5 w-5 text-slate-600" />
                <span>Battle History</span>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs">
                  {totalBattles} battles
                </Badge>
              </CardTitle>
              
              {/* Modern Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || loading}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-slate-600 min-w-[4rem] text-center">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || loading}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              // Enhanced loading skeleton with proper shimmer
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <BattleHistoryItemShimmer key={i} />
                ))}
              </div>
            ) : battles.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate-600">No battles on this page</p>
              </div>
            ) : (
              <div className="space-y-3">
                {battles.map((battle) => (
                  <div
                    key={battle.battleNumber}
                    className="group border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-all"
                  >
                    {/* Battle Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-semibold">
                          Battle #{battle.battleNumber}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(battle.endTimestamp)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Users className="h-3 w-3" />
                          <span>{battle.totalParticipants} participants</span>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        {battle.revealed ? (
                          <Badge variant="default" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 text-xs">
                            <Eye className="h-3 w-3" />
                            <span>Revealed</span>
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200 text-xs">
                            <EyeOff className="h-3 w-3" />
                            <span>Processing</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Battle Results - Enhanced with encrypted data checking */}
                    {battle.revealed && battle.totalParticipants > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-25 rounded-lg border border-slate-100">
                          <div className="space-y-1">
                            <p className="text-xs text-slate-600 font-medium">🏆 Winning Template</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                {getTemplateName(battle.winnerTemplateId)}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                ({battle.winnerVotes} votes)
                              </span>
                            </div>
                          </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-600 font-medium">💬 Winning Caption</p>
                          <div className="text-xs font-medium text-slate-700 truncate">
                            {getCaptionText(battle.winnerCaptionId)}
                          </div>
                          <span className="text-xs text-slate-500">
                            (randomly selected from winners)
                          </span>
                        </div>
                      </div>
                    ) : battle.totalParticipants > 0 ? (
                      // Battle has participants but not yet decrypted
                      <div className="p-4 border-2 border-dashed border-amber-200 rounded-lg bg-amber-50">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 text-amber-600 mb-2">
                            <div className="animate-pulse">
                              <EyeOff className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-medium">Processing Results</span>
                          </div>
                          <p className="text-xs text-amber-700 mb-2">
                            {battle.totalParticipants} participants • Results being processed
                          </p>
                          <div className="flex items-center justify-center gap-4 text-xs">
                            <div className="flex items-center gap-1 text-green-600">
                              <span className="animate-pulse">⚡</span>
                              <span>Encrypted data available</span>
                            </div>
                            <div className="flex items-center gap-1 text-amber-600">
                              <span className="animate-spin">⏳</span>
                              <span>Oracle decryption pending</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Battle with no participants  
                      <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                            <EyeOff className="h-4 w-4" />
                            <span className="text-xs font-medium">No Participants</span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Battle #{battle.battleNumber} ended with no votes
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
        </>
      )}
    </div>
  );
});

// Display name for debugging
BattleHistory.displayName = 'BattleHistory';

export { BattleHistory };
export default BattleHistory;