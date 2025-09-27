import { useState, useEffect, useCallback, useRef } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { getContract, getContractWithSigner } from '@/lib/contract';
import { CONTRACT_ADDRESS, SEPOLIA_RPC_URL } from '@/constants';
import { ContestInfo, CaptionSubmission, BattleHistoryItem } from '@/types';

/**
 * @fileoverview Smart Contract Integration Hook
 * 
 * Provides a unified interface for interacting with the Privacy Meme Battle contract.
 * Implements dual-provider architecture for optimal performance and user experience:
 * - Read operations: Public RPC provider (fast, no wallet needed)
 * - Write operations: Wallet provider (authenticated transactions)
 * 
 * Features:
 * - Automatic connection management with retry logic
 * - Comprehensive error handling and classification
 * - Transaction timeout protection
 * - Concurrency control for wallet operations
 * - Memory leak prevention with cleanup
 * 
 * @author 0xSyncroot
 * @version 2.0.0
 */

/** Contract connection state interface */
interface ContractState {
  /** Current signer wallet address */
  signerAddress: string | null;
  /** Read-only contract instance using public RPC */
  readOnlyContract: ethers.Contract | null;
  /** Wallet-connected contract instance for transactions */
  contractWithSigner: ethers.Contract | null;
  /** True when read-only contract is connected and functional */
  isConnected: boolean;
  /** True during wallet operations (prevents concurrent transactions) */
  isLoading: boolean;
  /** Current error message, null if no error */
  error: string | null;
}

/** Classified error types for better user messaging */
interface ContractError {
  type: 'NETWORK' | 'CONTRACT_NOT_FOUND' | 'CONTRACT_INVALID' | 'WALLET' | 'UNKNOWN';
  message: string;
  details?: string;
}

/**
 * Enhanced error classification for blockchain operations
 * 
 * Analyzes error messages and provides user-friendly error information
 * with appropriate categorization for different handling strategies.
 * 
 * @param error - Raw error from blockchain operation
 * @returns Classified error with user-friendly messaging
 */
const classifyError = (error: unknown): ContractError => {
  const message = error instanceof Error ? error.message : 'Unknown error';

  // Transaction nonce and timing conflicts
  if (message.includes('nonce too high') || message.includes('nonce too low') || 
      message.includes('replacement transaction underpriced')) {
    return {
      type: 'WALLET',
      message: 'Transaction Nonce Conflict',
      details: 'Multiple transactions detected. Please wait a few seconds and try again.'
    };
  }

  // Insufficient balance for transaction
  if (message.includes('insufficient funds') || message.includes('insufficient balance')) {
    return {
      type: 'WALLET',
      message: 'Insufficient Funds',
      details: 'Not enough ETH to complete the transaction. Please check your wallet balance.'
    };
  }

  // User-initiated transaction cancellation
  if (message.includes('user rejected') || message.includes('User denied transaction')) {
    return {
      type: 'WALLET',
      message: 'Transaction Cancelled',
      details: 'Transaction was cancelled by user.'
    };
  }

  // Network or transaction timeouts
  if (message.includes('timeout') || message.includes('timed out')) {
    return {
      type: 'NETWORK',
      message: 'Transaction Timeout',
      details: 'Transaction took too long to complete. It may still be processing.'
    };
  }

  // Gas estimation and execution errors
  if (message.includes('gas required exceeds allowance') || message.includes('out of gas')) {
    return {
      type: 'WALLET',
      message: 'Transaction Gas Error',
      details: 'Transaction requires more gas than available. Please try with higher gas limit.'
    };
  }

  // Contract deployment validation errors
  if (message.includes('Contract not deployed')) {
    return {
      type: 'CONTRACT_NOT_FOUND',
      message: 'Contract Not Found',
      details: 'The Privacy Meme Battle contract is not deployed on this network.'
    };
  }

  // Business logic constraint violations
  if (message.includes('already voted') || message.includes('AlreadyVoted')) {
    return {
      type: 'CONTRACT_INVALID',
      message: 'Already Voted',
      details: 'You have already submitted a vote for this battle.'
    };
  }

  if (message.includes('battle not active') || message.includes('BattleNotActive')) {
    return {
      type: 'CONTRACT_INVALID',
      message: 'Battle Not Active',
      details: 'The current battle has ended. Please wait for the next battle to start.'
    };
  }

  // Network connectivity issues
  if (message.includes('network') || message.includes('provider') || message.includes('connection')) {
    return {
      type: 'NETWORK',
      message: 'Network Connection Failed',
      details: 'Unable to connect to the blockchain network. Please check your connection.'
    };
  }

  // Contract interface or compatibility issues
  if (message.includes('getBattleInfo') || message.includes('call revert') || 
      message.includes('execution reverted')) {
    return {
      type: 'CONTRACT_INVALID',
      message: 'Contract Communication Failed',
      details: 'The contract exists but is not responding correctly. It may be incompatible.'
    };
  }

  // Wallet connection and signer issues
  if (message.includes('wallet') || message.includes('signer') || message.includes('connect')) {
    return {
      type: 'WALLET',
      message: 'Wallet Connection Failed',
      details: 'Unable to connect to your wallet. Please check your wallet connection.'
    };
  }

  // Fallback for unclassified errors
  return {
    type: 'UNKNOWN',
    message: 'Transaction Failed',
    details: message
  };
};

/**
 * Notification service using react-hot-toast
 * 
 * Provides consistent user-friendly notifications across the application.
 * Uses the same toast library as other components to prevent conflicts.
 * 
 * @description Handles contract operation feedback with appropriate styling and timing
 */
const notifications = {
  /**
   * Display error notification with user-friendly messaging
   * @param title - Main error title
   * @param description - Detailed error description for user guidance
   */
  error: (title: string, description?: string) => {
    const message = description ? `${title}: ${description}` : title;
    toast.error(message, {
      duration: 6000,
      style: {
        background: '#fee2e2',
        color: '#dc2626',
        border: '1px solid #fecaca',
      },
    });
  },

  /**
   * Display success notification with confirmation messaging
   * @param title - Success message title
   * @param description - Additional success details
   */
  success: (title: string, description?: string) => {
    const message = description ? `${title}: ${description}` : title;
    toast.success(message, {
      duration: 4000,
      style: {
        background: '#dcfce7',
        color: '#16a34a',
        border: '1px solid #bbf7d0',
      },
    });
  },

  /**
   * Display loading notification for ongoing operations
   * @param title - Loading message
   * @returns Toast ID for dismissal
   */
  loading: (title: string) => {
    return toast.loading(title, {
      style: {
        background: '#fef3c7',
        color: '#d97706',
        border: '1px solid #fed7aa',
      },
    });
  },

  /**
   * Dismiss a specific toast notification
   * @param toastId - Toast ID to dismiss
   */
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  }
};

export function useContract() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();

  // State
  const [state, setState] = useState<ContractState>({
    signerAddress: null,
    readOnlyContract: null,
    contractWithSigner: null,
    isConnected: false,
    isLoading: false,
    error: null
  });


  // Refs to prevent stale closures
  const mountedRef = useRef(true);

  // Reset mountedRef on mount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Safe state update helper
  const updateState = useCallback((updates: Partial<ContractState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // Initialize read-only contract (fast, using public RPC)
  const initializeReadOnlyContract = useCallback(async (): Promise<void> => {
    // Prevent multiple simultaneous initializations
    if (state.readOnlyContract || state.isLoading) {
      console.log('🔄 Read-only contract already initialized or loading, skipping');
      return;
    }

    try {
      console.log('🔄 Initializing read-only contract...');
      updateState({ isLoading: true });

      // Use public RPC for read operations (much faster)
      const publicProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);

      // Contract deployment verification with retry
      let contractCode;
      let retries = 3;
      while (retries > 0) {
        try {
          contractCode = await publicProvider.getCode(CONTRACT_ADDRESS);
          break;
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          console.log(`⚠️ RPC call failed, retrying... (${retries} left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (contractCode === '0x') {
        throw new Error(`Contract not deployed at address ${CONTRACT_ADDRESS}`);
      }

      // Create read-only contract instance
      const readOnlyContractInstance = getContract(publicProvider);

      // Quick functionality verification with retry
      retries = 3;
      while (retries > 0) {
        try {
          await readOnlyContractInstance.getBattleInfo();
          break;
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          console.log(`⚠️ Contract call failed, retrying... (${retries} left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      updateState({
        readOnlyContract: readOnlyContractInstance,
        isConnected: true,
        isLoading: false,
        error: null
      });

      console.log('✅ Read-only contract connected:', CONTRACT_ADDRESS);

    } catch (error) {
      const contractError = classifyError(error);
      updateState({
        readOnlyContract: null,
        isConnected: false,
        isLoading: false,
        error: contractError.message
      });
      console.error('Read-only contract initialization failed:', error);
    }
  }, [updateState, state.readOnlyContract]);

  // Initialize wallet contract (for write operations)
  const initializeWalletContract = useCallback(async (): Promise<void> => {
    if (!ready || !authenticated || wallets.length === 0) {
      // Only reset if we don't already have a valid contract
      if (state.contractWithSigner) {
        console.log('🔄 Wallet not ready but contract exists, keeping current');
        return;
      }
      updateState({

        contractWithSigner: null,
        isLoading: false
      });
      return;
    }

    try {
      updateState({ isLoading: true });

      const wallet = wallets[0];
      const ethereumProvider = await wallet.getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethereumProvider);

      const signer = await provider.getSigner();
      const contractWithSignerInstance = getContractWithSigner(signer);

      updateState({
        contractWithSigner: contractWithSignerInstance,
        signerAddress: await signer.getAddress(),
        isLoading: false
      });

    } catch (error) {
      const contractError = classifyError(error);
      // Only reset if we don't already have a valid contract
      if (!state.contractWithSigner) {
        updateState({
          contractWithSigner: null,
          signerAddress: null,
          isLoading: false,
          error: contractError.message
        });
      } else {
        updateState({
          signerAddress: null,
          isLoading: false,
          error: contractError.message
        });
      }
      console.error('Wallet contract initialization failed:', error);
    }
  }, [ready, authenticated, wallets.length, state.contractWithSigner, updateState]);

  // Effect to initialize read-only contract (immediate, no wallet needed)
  useEffect(() => {
    // Debounce to prevent rapid re-initializations
    const timer = setTimeout(() => {
      if (!state.readOnlyContract && !state.isLoading) {
        initializeReadOnlyContract();
      }
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CONTRACT_ADDRESS]); // Remove initializeReadOnlyContract from deps to prevent loop

  // Effect to initialize wallet contract (when wallet is ready)
  useEffect(() => {
    initializeWalletContract();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated, wallets.length]); // Remove initializeWalletContract to prevent loop

  // Retry connection
  const retryConnection = useCallback(async () => {
    await Promise.all([
      initializeReadOnlyContract(),
      initializeWalletContract()
    ]);
  }, [initializeReadOnlyContract, initializeWalletContract]);

  // Contract method wrappers with consistent error handling and concurrency protection
  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    operation: string,
    requiresWallet: boolean = false
  ) => {
    return async (...args: T): Promise<R> => {
      // ⚡ CONCURRENCY PROTECTION - Prevent multiple wallet operations
      if (requiresWallet && state.isLoading) {
        console.warn(`🚫 ${operation} already in progress, rejecting concurrent request`);
        throw new Error(`${operation} in progress. Please wait...`);
      }

      // For wallet operations, check wallet contract
      if (requiresWallet) {
        if (!state.contractWithSigner) {
          // If Privy is ready but no signer, trigger wallet request
          if (ready && authenticated && wallets.length > 0) {
            console.log('🔄 Requesting wallet permissions...');
            try {
              const provider = await wallets[0].getEthereumProvider(); // This should trigger permission request
              console.log('🔄 Wallet provider:', provider);
              const signer = await new ethers.BrowserProvider(provider).getSigner();
              console.log('🔄 Wallet signer:', signer);
              const contractWithSignerInstance = getContractWithSigner(signer);
              updateState({
                contractWithSigner: contractWithSignerInstance,
                signerAddress: await signer.getAddress(),
              });
            } catch (e) {
              console.log('⚠️ Wallet permission request failed, user needs to authorize');
              throw new Error('Wallet not connected. Please connect your wallet first.');
            }
          } else {
            throw new Error('Wallet not connected. Please connect your wallet first.');
          }
        }
      } else {
        // For read operations, check read-only contract
        if (!state.isConnected || !state.readOnlyContract) {
          throw new Error('Contract not connected. Please check your network connection.');
        }
      }

      try {
        // Set loading state for wallet operations
        if (requiresWallet) {
          updateState({ isLoading: true });
        }
        
        const result = await fn(...args);
        
        // Clear loading state on success
        if (requiresWallet) {
          updateState({ isLoading: false });
        }
        
        return result;
      } catch (error) {
        if (requiresWallet) {
          updateState({ isLoading: false });
        }
        
        const contractError = classifyError(error);
        
        // Only show notification for user-facing operations (wallet required)
        // Read operations should fail silently to avoid notification spam
        if (requiresWallet) {
          notifications.error(contractError.message, contractError.details);
        }
        
        throw error;
      }
    };
  }, [ready, authenticated, wallets, state.isConnected, state.readOnlyContract, state.contractWithSigner, state.isLoading, updateState]);

  /** =================================================================
   * CONTRACT METHOD IMPLEMENTATIONS
   * 
   * All contract methods are wrapped with consistent error handling,
   * loading state management, and automatic retry logic.
   * ================================================================= */

  /**
   * Retrieve current battle information
   * 
   * @returns Current contest state including timing, participation, and battle number
   */
  const getBattleInfo = useCallback(
    withErrorHandling(async (): Promise<ContestInfo | null> => {
      if (!state.readOnlyContract) {
        // Attempt contract reinitialization if not available
        if (!state.isLoading) {
          initializeReadOnlyContract();
        }
        return null;
      }

      try {
        const result = await state.readOnlyContract.getBattleInfo();
        return {
          active: result[0],
          endsAt: Number(result[1]),
          templates: Number(result[2]),
          totalSubmissions: Number(result[4]),
          battleNumber: Number(result[5])
        };
      } catch (error) {
        // Reset connection state on persistent failures
        updateState({ 
          readOnlyContract: null, 
          isConnected: false,
          error: 'Contract call failed'
        });
        throw error;
      }
    }, 'Get Battle Info'),
    [state.readOnlyContract, state.isLoading, withErrorHandling, initializeReadOnlyContract, updateState]
  );

  /**
   * Submit encrypted vote to the contract
   * 
   * Includes comprehensive validation, timeout protection, and error recovery.
   * Performs pre-flight checks to avoid failed transactions.
   * 
   * @param encryptedTemplateId - Encrypted meme template selection
   * @param templateProof - Cryptographic proof for template
   * @param encryptedCaptionId - Encrypted caption selection  
   * @param captionProof - Cryptographic proof for caption
   * @returns Transaction object with hash and confirmation details
   */
  const submitVote = useCallback(
    withErrorHandling(async (
      encryptedTemplateId: string,
      templateProof: string,
      encryptedCaptionId: string,
      captionProof: string
    ) => {
      // Prevent concurrent vote submissions
      if (state.isLoading) {
        throw new Error('Vote submission in progress. Please wait...');
      }

      // Validate required contract connections
      if (!state.contractWithSigner) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      if (!state.readOnlyContract) {
        throw new Error('Contract not connected. Please check your network connection.');
      }

      // Cache contract references to avoid stale closure issues
      const walletContract = state.contractWithSigner;
      const readOnlyContract = state.readOnlyContract;
      const signerAddress = state.signerAddress;

      if (!signerAddress) {
        throw new Error('Signer address not available. Please reconnect your wallet.');
      }

      // Pre-flight validation to prevent failed transactions
      const [battleInfo, hasVoted] = await Promise.all([
        readOnlyContract.getBattleInfo(),
        readOnlyContract.hasUserVoted(signerAddress)
      ]);

      if (!battleInfo[0]) {
        throw new Error('Battle is not active. Please wait for the next battle to start.');
      }

      if (hasVoted) {
        throw new Error('You have already voted in this battle. One vote per battle allowed.');
      }

      // Execute transaction with timeout protection
      // Note: Loading and success notifications are handled by SubmissionForm component
      // to avoid duplicate toasts and provide better UX with transaction links
      
      try {
        // Submit transaction with 30-second timeout
        const tx = await Promise.race([
          walletContract.submitVote(
            encryptedTemplateId,
            templateProof,
            encryptedCaptionId,
            captionProof
          ),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Transaction timeout after 30 seconds')), 30000)
          )
        ]);
        
        // Wait for blockchain confirmation with 60-second timeout
        await Promise.race([
          tx.wait(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Transaction confirmation timeout after 60 seconds')), 60000)
          )
        ]);

        // Success notification handled by SubmissionForm with transaction link
        return tx;

      } catch (error) {
        // Enhanced error message classification
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        if (errorMessage.includes('timeout')) {
          throw new Error('Transaction timed out. Your vote may still be processing. Please check your wallet.');
        } else if (errorMessage.includes('user rejected')) {
          throw new Error('Transaction cancelled by user.');
        } else if (errorMessage.includes('insufficient funds')) {
          throw new Error('Insufficient funds for transaction. Please check your ETH balance.');
        } else if (errorMessage.includes('nonce')) {
          throw new Error('Transaction nonce conflict. Please try again in a few seconds.');
        }
        
        throw error;
      }
    }, 'Submit Vote', true),
    [state.readOnlyContract, state.contractWithSigner, state.signerAddress, state.isLoading, withErrorHandling]
  );
  
  const hasUserVoted = useCallback(
    withErrorHandling(async (userAddress: string): Promise<boolean> => {
      if (!state.readOnlyContract) return false;

      const result = await state.readOnlyContract.hasUserVoted(userAddress);
      return result;
    }, 'Check User Voted'),
    [state.readOnlyContract, withErrorHandling]
  );

  // Winner information function
  const getBattleWinner = useCallback(
    withErrorHandling(async (): Promise<{ templateId: number, captionId: number, voteCount: number } | null> => {
      if (!state.readOnlyContract) return null;

      const result = await state.readOnlyContract.getBattleWinner();
      return {
        templateId: Number(result[0]),
        captionId: Number(result[1]),
        voteCount: Number(result[2])
      };
    }, 'Get Battle Winner'),
    [state.readOnlyContract, withErrorHandling]
  );

  // Battle history functions
  const getBattleHistory = useCallback(
    withErrorHandling(async (battleNumber: number): Promise<BattleHistoryItem | null> => {
      if (!state.readOnlyContract) return null;

      const result = await state.readOnlyContract.getBattleHistory(battleNumber);
      return {
        revealed: result.revealed,
        winnerTemplateId: Number(result.winnerTemplateId),
        winnerCaptionId: Number(result.winnerCaptionId),
        winnerVotes: Number(result.winnerVotes),
        battleNumber: Number(result.battleNumber),
        endTimestamp: Number(result.endTimestamp),
        totalParticipants: Number(result.totalParticipants)
      };
    }, 'Get Battle History'),
    [state.readOnlyContract, withErrorHandling]
  );

  const getCompletedBattleCount = useCallback(
    withErrorHandling(async (): Promise<number> => {
      if (!state.readOnlyContract) return 0;

      const contractInfo = await state.readOnlyContract.getContractInfo();
      return Number(contractInfo.totalCompletedBattles);
    }, 'Get Completed Battle Count'),
    [state.readOnlyContract, withErrorHandling]
  );

  // Participant tracking functions
  const getBattleParticipants = useCallback(
    withErrorHandling(async (battleNumber: number): Promise<number> => {
      if (!state.readOnlyContract) return 0;

      const result = await state.readOnlyContract.getBattleParticipants(battleNumber);
      return Number(result);
    }, 'Get Battle Participants'),
    [state.readOnlyContract, withErrorHandling]
  );

  const getBattleParticipantsBatch = useCallback(
    withErrorHandling(async (battleNumbers: number[]): Promise<number[]> => {
      if (!state.readOnlyContract) return [];

      const result = await state.readOnlyContract.getBattleParticipantsBatch(battleNumbers);
      return result.map((count: any) => Number(count));
    }, 'Get Battle Participants Batch'),
    [state.readOnlyContract, withErrorHandling]
  );


  /** =================================================================
   * PUBLIC API INTERFACE
   * 
   * Provides clean interface for contract interactions with proper
   * state management, error handling, and method organization.
   * ================================================================= */
  return {
    // Connection state
    contract: state.readOnlyContract, // Legacy compatibility
    contractWithSigner: state.contractWithSigner,
    isConnected: state.isConnected,
    isLoading: state.isLoading,
    error: state.error,

    // Connection management
    retryConnection,

    // Core battle operations
    getBattleInfo,
    submitVote,
    hasUserVoted,
    
    // Results and winner info
    getBattleWinner,

    // Battle history queries
    getBattleHistory,
    getCompletedBattleCount,
    
    // Participant tracking
    getBattleParticipants,
    getBattleParticipantsBatch
  };
}

/**
 * Type exports for external consumption
 * Enables proper TypeScript integration for consumers
 */
export type { ContractState, ContractError };