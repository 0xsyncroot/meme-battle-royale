'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useContract } from '@/hooks/useContract';
import { usePrivy } from '@privy-io/react-auth';
import { MEME_TEMPLATES } from '@/constants';
import { getCaptionById } from '@/constants/captions';
import { CaptionSubmission } from '@/types';
import { Trophy, Eye, EyeOff, Crown, Medal, Award, Shield, Sparkles, Lock } from 'lucide-react';
import { Shimmer, EmptyState } from '@/components/ui/Shimmer';

/** Results component props */
interface ResultsProps {
  contestInfo: any;
  /** Optional battle number to view specific historical results */
  battleNumber?: number;
}

/** Battle selection dropdown option */
interface BattleSelectOption {
  value: number;
  label: string;
  status: 'completed' | 'current' | 'future';
}

/**
 * Results component displays battle outcomes with oracle-decrypted vote counts.
 * Supports both current and historical battle viewing with privacy-preserving UI.
 * 
 * Features:
 * - Historical battle selector with completion status
 * - Oracle decryption progress indicators
 * - Privacy-first result visualization
 * - Caption reveal functionality (mock implementation)
 */

export function Results({ contestInfo, battleNumber }: ResultsProps) {
  const [winners, setWinners] = useState<{ templateId: number, captionId: number } | null>(null);
  const [templateWinner, setTemplateWinner] = useState<{ templateId: number, voteCount: number } | null>(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [hasDataLoaded, setHasDataLoaded] = useState(false);
  
  // Battle selection state
  const [selectedBattleNumber, setSelectedBattleNumber] = useState<number | null>(null);
  const [availableBattles, setAvailableBattles] = useState<BattleSelectOption[]>([]);
  const [totalCompletedBattles, setTotalCompletedBattles] = useState(0);
  
  const { 
    isLoading,
    getBattleHistory,
    getCompletedBattleCount,
    isConnected 
  } = useContract();
  
  const { user } = usePrivy();

  /** Load available battles and configure battle selector options */
  useEffect(() => {
    const loadAvailableBattles = async () => {
      if (!isConnected) return;
      
      try {
        const completedCount = await getCompletedBattleCount();
        setTotalCompletedBattles(completedCount);
        
        const currentBattle = contestInfo?.currentBattleNumber || contestInfo?.battleNumber || 1;
        const battles: BattleSelectOption[] = [];
        
        // Add completed battles
        for (let i = 1; i <= completedCount; i++) {
          battles.push({
            value: i,
            label: `Battle #${i}`,
            status: 'completed'
          });
        }
        
        // Add current active battle if exists
        if (currentBattle > completedCount) {
          battles.push({
            value: currentBattle,
            label: `Battle #${currentBattle} (Current)`,
            status: 'current'
          });
        }
        
        setAvailableBattles(battles);
        
        // Auto-select most recent completed battle
        if (completedCount > 0 && !selectedBattleNumber && !battleNumber) {
          setSelectedBattleNumber(completedCount);
        }
        
        setHasDataLoaded(true);
      } catch (error) {
        setHasDataLoaded(true); // Prevent infinite loading on error
      }
    };

    loadAvailableBattles();
  }, [isConnected, contestInfo, getCompletedBattleCount, selectedBattleNumber, battleNumber]);

  /**
   * Fetch and process battle results with oracle decryption status handling.
   * Prioritizes showing completed battle results over current/pending battles.
   */
  useEffect(() => {
    const fetchBattleResults = async () => {
      if (!isConnected) return;
      
      const targetBattleNumber = battleNumber || selectedBattleNumber;
      
      // Handle empty state
      if (!targetBattleNumber) {
        if (totalCompletedBattles === 0) {
          setTemplateWinner(null);
          setWinners(null);
          return;
        }
        return; // Wait for auto-selection
      }
      
      setIsLoadingResults(true);
      try {
        const historicalBattle = await getBattleHistory(targetBattleNumber);
        
        if (historicalBattle?.revealed) {
          // Battle with decrypted results - show winner
          setTemplateWinner({ 
            templateId: historicalBattle.winnerTemplateId, 
            voteCount: historicalBattle.winnerVotes 
          });
          setWinners({ 
            templateId: historicalBattle.winnerTemplateId, 
            captionId: historicalBattle.winnerCaptionId 
          });
        } else if (historicalBattle && !historicalBattle.revealed) {
          // Battle exists but not revealed yet
          if (historicalBattle.totalParticipants === 0) {
            // No participants - show "no participation" state (not loading)
            setTemplateWinner({ templateId: -1, voteCount: 0 }); // Special marker for no participants
            setWinners(null);
          } else {
            // Has participants but oracle hasn't decrypted yet - show loading
            setTemplateWinner(null);
            setWinners(null);
          }
        } else {
          // Battle not found
          setTemplateWinner(null);
          setWinners(null);
        }
      } catch (error) {
        // Reset state on error
        setTemplateWinner(null);
        setWinners(null);
      } finally {
        setIsLoadingResults(false);
      }
    };

    fetchBattleResults();
  }, [isConnected, battleNumber, selectedBattleNumber, totalCompletedBattles, getBattleHistory, hasDataLoaded]);


  // Use winner data from battle history (exclude special marker for no participants)
  const displayWinner = templateWinner && templateWinner.templateId >= 0 ? MEME_TEMPLATES[templateWinner.templateId] : null;
  const displayMaxVotes = templateWinner ? templateWinner.voteCount : 0;

  // Display shimmer loading for uninitialized or loading states
  if (!hasDataLoaded || !isConnected || isLoadingResults || (isLoading && !contestInfo.active)) {
    return (
      <div className="space-y-4">
        {/* Battle Selector Shimmer */}
        <Card className="border border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50">
          <CardContent className="p-4 mt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Shimmer className="h-5 w-5 rounded" />
                <div>
                  <Shimmer className="h-4 w-24 rounded mb-1" />
                  <Shimmer className="h-3 w-32 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shimmer className="h-4 w-20 rounded" />
                <Shimmer className="h-9 w-44 rounded border" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Winner Card Shimmer */}
        <Card className="border border-yellow-300 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 shadow-lg">
          <CardContent className="p-6 text-center mt-4">
            <Shimmer className="h-12 w-12 rounded mx-auto mb-2" />
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shimmer className="h-4 w-4 rounded" />
              <Shimmer className="h-6 w-32 rounded" />
              <Shimmer className="h-4 w-4 rounded" />
            </div>
            <Shimmer className="h-5 w-40 rounded mx-auto mb-3" />
            <Shimmer className="h-8 w-20 rounded-full mx-auto mb-4" />
            <Shimmer className="h-4 w-64 rounded mx-auto" />
          </CardContent>
        </Card>

        {/* Results Leaderboard Shimmer */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shimmer className="h-5 w-5 rounded" />
                <Shimmer className="h-5 w-24 rounded" />
              </div>
              <Shimmer className="h-6 w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 rounded-lg border bg-slate-50 border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Shimmer className="h-4 w-6 rounded" />
                        <Shimmer className="h-5 w-5 rounded" />
                      </div>
                      <div>
                        <Shimmer className="h-4 w-32 rounded mb-1" />
                        <Shimmer className="h-3 w-40 rounded" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Shimmer className="h-6 w-8 rounded mb-1" />
                      <Shimmer className="h-3 w-10 rounded" />
                    </div>
                  </div>
                  <Shimmer className="w-full h-2 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Privacy Features Card */}
        <Card className="border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shimmer className="h-5 w-5 rounded mt-0.5" />
              <div className="flex-1">
                <Shimmer className="h-4 w-48 rounded mb-3" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Shimmer className="h-3 w-3 rounded mt-0.5" />
                      <Shimmer className="h-3 w-full rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine viewing context for UI state
  const targetBattleNumber = battleNumber || selectedBattleNumber;
  const currentBattleNumber = contestInfo?.currentBattleNumber || contestInfo?.battleNumber || 1;
  const isHistoricalView = targetBattleNumber && targetBattleNumber !== currentBattleNumber;
  const displayBattleNumber = targetBattleNumber || currentBattleNumber;

  return (
    <div className="space-y-4">
      {/* Battle Selector */}
      <Card className="border border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50">
        <CardContent className="p-4 mt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-slate-600" />
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Battle Results</h3>
                <p className="text-xs text-slate-600 mt-1">
                  View results from completed battles
                </p>
              </div>
            </div>
            
            {/* Battle Selector Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-700 font-medium whitespace-nowrap">Select Battle:</span>
              <Select 
                value={targetBattleNumber?.toString() || ''} 
                onValueChange={(value: string) => setSelectedBattleNumber(parseInt(value))}
                size="sm"
              >
                <SelectTrigger className="w-44 h-9 text-sm">
                  <SelectValue placeholder="Choose battle..." />
                </SelectTrigger>
                <SelectContent maxHeight={280}>
                  {availableBattles.map((battle) => (
                    <SelectItem 
                      key={battle.value} 
                      value={battle.value.toString()}
                      description={
                        battle.status === 'completed' 
                          ? 'Results available for viewing' 
                          : 'Currently active battle'
                      }
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium text-slate-900 text-sm">{battle.label}</span>
                        <div className="ml-4 flex-shrink-0">
                          {battle.status === 'completed' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Done
                            </span>
                          )}
                          {battle.status === 'current' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              ● Live
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Battle Status Info */}
      {isHistoricalView && (
        <Card className="border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
          <CardContent className="p-4 mt-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="font-semibold text-indigo-800 text-sm">Historical Battle #{displayBattleNumber}</h3>
                <p className="text-xs text-indigo-700 mt-1">
                  Viewing results from a completed battle. Current battle is #{currentBattleNumber}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Battles Available */}
      {totalCompletedBattles === 0 && (
        <div className="border border-slate-200 shadow-sm rounded-lg">
          <div className="p-10 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Trophy className="h-14 w-14 text-slate-300" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-800">No Results Available</h3>
                <p className="text-sm text-slate-600 max-w-md leading-relaxed">
                  No battles have been completed yet. Results will appear here after battles end and oracle decryption is complete.
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                <p className="text-xs text-purple-700 font-medium">
                  🏆 Join active battles to see the first results!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {targetBattleNumber && totalCompletedBattles > 0 && (
        <>
        {/* No Results State - Different cases */}
        {!templateWinner && (
          <Card className="border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm">
            <CardContent className="p-8 text-center mt-4">
              {/* Pulsing Oracle Animation */}
              <div className="relative mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                <div className="absolute inset-0 rounded-full animate-pulse bg-amber-200/30 mx-auto"></div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2 text-amber-800">
                Oracle Decryption In Progress
              </h3>
              
              <p className="text-sm max-w-md mx-auto leading-relaxed mb-4 text-amber-700">
                Battle #{displayBattleNumber} has ended successfully! The FHEVM oracle is currently decrypting encrypted votes to reveal results.
              </p>
              
              {/* Enhanced shimmer effect for decryption progress */}
              <div className="p-3 bg-white/70 rounded-lg border border-amber-200 max-w-sm mx-auto mb-4">
                <div className="flex items-center gap-2 justify-center text-xs text-amber-700 mb-2">
                  <Lock className="h-4 w-4" />
                  <span>Privacy-preserving result calculation in progress...</span>
                </div>
                <div className="space-y-2">
                  <Shimmer className="h-2 w-full rounded-full bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200" />
                  <Shimmer className="h-2 w-3/4 rounded-full bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 mx-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Battle with Zero Votes State */}
        {displayMaxVotes === 0 && (
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-8 text-center mt-4">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Votes Recorded</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Battle #{displayBattleNumber} ended with no votes cast. This could indicate a contract issue or no user participation.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Winner Announcement - Hero Card */}
        {displayWinner && displayMaxVotes > 0 && (
        <Card className="border border-yellow-300 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-yellow-600" />
                <h2 className="text-2xl font-bold text-yellow-800">Battle Champion</h2>
                <Sparkles className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-yellow-700 mb-3">{displayWinner.name}</h3>
            
            <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300 px-4 py-2 text-base font-semibold">
              {displayMaxVotes} votes
            </Badge>
            
            <p className="text-sm text-yellow-600 mt-4">
              🎉 Congratulations to all participants in this privacy-preserving meme battle!
            </p>
            
            {/* Caption Status Indicator */}
            {templateWinner && !winners && (
              <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-center gap-2 text-xs text-yellow-700 mb-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-yellow-600"></div>
                  <span>Caption selection in progress...</span>
                </div>
                <Shimmer className="h-1.5 w-20 rounded-full bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 mx-auto" />
              </div>
            )}
          </CardContent>
        </Card>
      )}


      {/* Caption Reveals Section */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base font-semibold text-slate-800">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-600" />
              <span>Caption Reveals</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {!winners?.captionId ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <EyeOff className="h-10 w-10 mx-auto text-slate-300" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">No Caption Available</h3>
              <p className="text-sm text-slate-600">
                {templateWinner ? 'Caption will be revealed after oracle decryption completes.' : 'Caption will appear here after the battle concludes.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(() => {
                const winnerCaption = getCaptionById(winners.captionId);
                const winnerTemplate = displayWinner;
                
                if (!winnerCaption || !winnerTemplate) return null;
                
                return (
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Crown className="h-4 w-4 text-yellow-600" />
                        <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs font-semibold">
                          {winnerTemplate.name}
                        </Badge>
                        <Badge variant="default" className="bg-green-50 text-green-700 border-green-200 text-xs">
                          <Trophy className="h-3 w-3 mr-1" />
                          Winner
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-yellow-700 font-medium">
                          {displayMaxVotes} votes
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/80 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{winnerCaption.emoji}</span>
                        <span className="text-xs text-yellow-700 font-medium uppercase tracking-wide">
                          {winnerCaption.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-800 font-medium">
                        "{winnerCaption.text}"
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Features Summary */}
      <Card className="border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
        <CardContent className="p-4 mt-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-indigo-800 mb-3 text-sm">🔐 Privacy-Preserving Results</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-indigo-700">
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">✓</span>
                  <span>All votes encrypted during battle using FHEVM</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">✓</span>
                  <span>Vote aggregation on encrypted data without revealing individual choices</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">✓</span>
                  <span>Only final totals decrypted after battle ended</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">✓</span>
                  <span>Captions revealed only with explicit user consent</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </>
      )}
    </div>
  );
}

export default Results;