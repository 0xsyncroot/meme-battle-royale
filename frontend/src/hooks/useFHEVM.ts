/**
 * FHEVM React Hook
 * 
 * @description Professional React hook for managing FHEVM state and operations
 * in the Zama Privacy Meme Battle application. Provides encrypted voting
 * capabilities with proper error handling and network validation.
 * 
 * @author Zama Privacy Meme Battle Team
 * @version 2.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { 
  initializeFHEVM, 
  encryptTemplateId, 
  encryptCaptionId,
  createEncryptionParams,
  isFHEVMSupported, 
  getNetworkName,
  FHEVMError,
  FHEVMErrorType,
  EncryptedData
} from '@/lib/fhevm';
import { DEFAULT_NETWORK } from '@/constants';

/**
 * FHEVM Hook State Interface
 * Represents the complete state of FHEVM operations
 */
interface FHEVMState {
  /** Whether FHEVM has been successfully initialized */
  initialized: boolean;
  /** Loading state for initialization operations */
  loading: boolean;
  /** Error message if initialization or operations fail */
  error: string | null;
  /** Current network name for user display */
  currentNetwork: string;
}

/**
 * FHEVM Hook Return Interface
 * Provides all necessary functions and state for FHEVM operations
 */
interface UseFHEVMReturn extends FHEVMState {
  /** Encrypts a meme template ID for private voting */
  encryptVote: (templateId: number, contractAddress: string) => Promise<EncryptedData>;
  /** Encrypts a caption ID for private submission */
  encryptCaptionText: (captionId: number, contractAddress: string) => Promise<EncryptedData>;
  /** Validates if the current network supports FHEVM */
  isNetworkSupported: (chainId: number) => boolean;
  /** Resets error state */
  clearError: () => void;
}

/**
 * Custom hook for FHEVM operations
 * 
 * @description Manages FHEVM initialization, encryption operations, and network
 * validation. Automatically initializes when wallet is connected and handles
 * network switching with proper validation.
 * 
 * @returns FHEVM state and operation functions
 * 
 * @example
 * ```typescript
 * const { 
 *   initialized, 
 *   loading, 
 *   error, 
 *   encryptVote, 
 *   encryptCaptionText 
 * } = useFHEVM();
 * 
 * // Encrypt template vote
 * const encrypted = await encryptVote(1, contractAddress);
 * ```
 */
export function useFHEVM(): UseFHEVMReturn {
  // Hook state management
  const [state, setState] = useState<FHEVMState>({
    initialized: false,
    loading: false,
    error: null,
    currentNetwork: '',
  });
  

  // Privy wallet integration
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();

  /**
   * Updates hook state with partial state changes
   * Provides immutable state updates with proper TypeScript support
   */
  const updateState = useCallback((updates: Partial<FHEVMState>) => {
    setState(prevState => ({ ...prevState, ...updates }));
  }, []);

  /**
   * Gets user's wallet address
   * Validates wallet connection and extracts user address
   * 
   * @returns Promise resolving to user's wallet address
   * @throws {FHEVMError} When wallet is not connected or address unavailable
   */
  const getUserAddress = useCallback(async (): Promise<string> => {
    if (!wallets.length) {
      throw new FHEVMError(
        FHEVMErrorType.WALLET_NOT_CONNECTED,
        'Wallet not connected'
      );
    }

    const wallet = wallets[0];
    const provider = await wallet.getEthereumProvider();
    const accounts = await provider.request({ method: 'eth_accounts' });
    const userAddress = accounts[0];

    if (!userAddress) {
      throw new FHEVMError(
        FHEVMErrorType.WALLET_NOT_CONNECTED,
        'User address not available'
      );
    }

    return userAddress;
  }, [wallets]);

  /**
   * Gets current network chain ID from wallet
   * 
   * @returns Promise resolving to current chain ID
   * @throws {FHEVMError} When wallet is not connected
   */
  const getCurrentChainId = useCallback(async (): Promise<number> => {
    if (!wallets.length) {
      throw new FHEVMError(
        FHEVMErrorType.WALLET_NOT_CONNECTED,
        'Wallet not connected'
      );
    }

    const wallet = wallets[0];
    const provider = await wallet.getEthereumProvider();
    const chainId = await provider.request({ method: 'eth_chainId' });
    
    return parseInt(chainId, 16);
  }, [wallets]);

  /**
   * Attempts to switch user's wallet to Sepolia testnet
   * Handles both network switching and network addition if needed
   * 
   * @returns Promise<boolean> - True if switch successful, false otherwise
   */
  const switchToSepolia = useCallback(async (): Promise<boolean> => {
    if (!wallets.length) {
      return false;
    }

    try {
      const wallet = wallets[0];
      const provider = await wallet.getEthereumProvider();
      const SEPOLIA_CHAIN_HEX = `0x${DEFAULT_NETWORK.chainId.toString(16)}`;

      // First, attempt to switch to existing Sepolia network
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_HEX }],
        });
        
        return true;
        
      } catch (switchError: any) {
        // Error code 4902 means the chain has not been added to wallet
        if (switchError.code === 4902) {
          // Add Sepolia network to wallet
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_HEX,
                chainName: DEFAULT_NETWORK.name,
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'SepoliaETH',
                  decimals: 18,
                },
                rpcUrls: [DEFAULT_NETWORK.rpcUrl, 'https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
          
          return true;
          
        } else if (switchError.code === 4001) {
          // User rejected the request
          return false;
        } else {
          throw switchError;
        }
      }
      
    } catch (error) {
      console.error('Network switch failed:', error);
      return false;
    }
  }, [wallets]);

  /**
   * Initializes FHEVM with automatic network switching
   * Attempts to switch to Sepolia if on wrong network, then initializes FHEVM
   */
  const initializeFHEVMWithValidation = useCallback(async () => {
    if (!ready || !authenticated || !wallets.length) {
      return;
    }

    try {
      updateState({ loading: true, error: null });
      
      // Get current network information
      const chainId = await getCurrentChainId();
      const networkName = getNetworkName(chainId);
      updateState({ currentNetwork: networkName });
      
      // Auto-switch to Sepolia if on wrong network
      if (chainId !== DEFAULT_NETWORK.chainId) {
        updateState({ 
          loading: true, 
          error: null,
          currentNetwork: `Switching from ${networkName} to ${DEFAULT_NETWORK.name}...`
        });
        
        const switchSuccess = await switchToSepolia();
        
        if (!switchSuccess) {
          throw new FHEVMError(
            FHEVMErrorType.NETWORK_UNSUPPORTED,
            `Failed to switch to ${DEFAULT_NETWORK.name}. Please manually switch to ${DEFAULT_NETWORK.name} network.`
          );
        }
        
        // Wait for network switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update network info after switch
        const newChainId = await getCurrentChainId();
        const newNetworkName = getNetworkName(newChainId);
        updateState({ currentNetwork: newNetworkName });
        
        // Verify switch was successful
        if (newChainId !== DEFAULT_NETWORK.chainId) {
          throw new FHEVMError(
            FHEVMErrorType.NETWORK_UNSUPPORTED,
            `Network switch failed. Expected ${DEFAULT_NETWORK.name}, got ${newNetworkName}.`
          );
        }
      }
      
      // Initialize FHEVM for Sepolia network
      await initializeFHEVM(DEFAULT_NETWORK.chainId);
      
      updateState({ 
        initialized: true, 
        loading: false,
        error: null,
        currentNetwork: DEFAULT_NETWORK.name
      });
      
    } catch (error) {
      const errorMessage = error instanceof FHEVMError 
        ? error.message 
        : `FHEVM initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      updateState({ 
        initialized: false, 
        loading: false, 
        error: errorMessage 
      });
    }
  }, [ready, authenticated, wallets, updateState, getCurrentChainId, switchToSepolia]);

  /**
   * Effect for automatic FHEVM initialization
   * Triggers initialization when wallet connection state changes
   */
  useEffect(() => {
    initializeFHEVMWithValidation();
  }, [initializeFHEVMWithValidation]);

  /**
   * Encrypts a meme template ID for private voting
   * 
   * @param templateId - Template ID to encrypt (0-255)
   * @param contractAddress - Target contract address
   * @returns Promise resolving to encrypted data with proof
   * @throws {FHEVMError} When encryption fails or FHEVM not initialized
   */
  const encryptVote = useCallback(async (
    templateId: number,
    contractAddress: string
  ): Promise<EncryptedData> => {
    if (!state.initialized) {
      throw new FHEVMError(
        FHEVMErrorType.INITIALIZATION_FAILED,
        'FHEVM not initialized'
      );
    }

    if (!contractAddress) {
      throw new FHEVMError(
        FHEVMErrorType.INVALID_ADDRESS,
        'Contract address is required for encryption'
      );
    }

    try {
      // Direct encryption approach for FHEVM operations
      const userAddress = await getUserAddress();
      const params = createEncryptionParams(contractAddress, userAddress);
      
      return await encryptTemplateId(templateId, params);
    } catch (error) {
      const errorMsg = error instanceof FHEVMError 
        ? error.message 
        : `Failed to encrypt vote: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      throw new FHEVMError(FHEVMErrorType.ENCRYPTION_FAILED, errorMsg);
    }
  }, [state.initialized, getUserAddress]);

  /**
   * Encrypts a caption ID for private submission
   * 
   * @param captionId - Caption ID to encrypt (0-65535)
   * @param contractAddress - Target contract address
   * @returns Promise resolving to encrypted data with proof
   * @throws {FHEVMError} When encryption fails or FHEVM not initialized
   */
  const encryptCaptionText = useCallback(async (
    captionId: number,
    contractAddress: string
  ): Promise<EncryptedData> => {
    if (!state.initialized) {
      throw new FHEVMError(
        FHEVMErrorType.INITIALIZATION_FAILED,
        'FHEVM not initialized'
      );
    }

    if (!contractAddress) {
      throw new FHEVMError(
        FHEVMErrorType.INVALID_ADDRESS,
        'Contract address is required for encryption'
      );
    }

    try {
      // Direct encryption approach for FHEVM operations
      const userAddress = await getUserAddress();
      const params = createEncryptionParams(contractAddress, userAddress);
      
      return await encryptCaptionId(captionId, params);
    } catch (error) {
      const errorMsg = error instanceof FHEVMError 
        ? error.message 
        : `Failed to encrypt caption: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      throw new FHEVMError(FHEVMErrorType.ENCRYPTION_FAILED, errorMsg);
    }
  }, [state.initialized, getUserAddress]);

  /**
   * Validates network support for FHEVM operations
   * 
   * @param chainId - Chain ID to validate
   * @returns True if network supports FHEVM, false otherwise
   */
  const isNetworkSupported = useCallback((chainId: number): boolean => {
    return isFHEVMSupported(chainId);
  }, []);

  /**
   * Clears current error state
   * Allows users to dismiss error messages
   */
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  return {
    ...state,
    encryptVote,
    encryptCaptionText,
    isNetworkSupported,
    clearError,
  };
}