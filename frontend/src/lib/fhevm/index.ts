/**
 * FHEVM Core Module
 * 
 * @description Main entry point for FHEVM operations in the Zama Privacy Meme Battle.
 * Provides a clean, professional API for encrypted voting and meme contest interactions.
 * 
 * @author Zama Privacy Meme Battle Team
 * @version 1.0.0
 */

// Re-export all types for external use
export * from './types';
export * from './constants';

// Re-export network utilities
export * from './network';

// Re-export encryption functions
export { encryptTemplateId, encryptCaptionId, encryptVoteValue, setFHEVMInstanceGetter } from './encryption';

// Import required dependencies
import { isAddress } from 'ethers';
import { FHEVMSDKInstance, FHEVMError, FHEVMErrorType, EncryptionParams } from './types';
import { loadRelayerSDK, initializeRelayerSDK, getRelayerSDK } from './sdk-loader';
import { validateNetworkSupport, getNetworkConfig } from './network';
import { DEFAULT_NETWORK } from './constants';
import { setFHEVMInstanceGetter } from './encryption';

/**
 * Global FHEVM instance cache
 * Prevents multiple initializations and ensures singleton behavior
 */
let fhevmInstance: FHEVMSDKInstance | null = null;

/**
 * Initializes FHEVM for encrypted operations
 * 
 * @description Sets up the FHEVM environment for a specific blockchain network.
 * This is the primary initialization function that must be called before
 * performing any encryption operations.
 * 
 * @param chainId - Target blockchain network chain ID
 * @param networkUrl - RPC endpoint URL for network communication (optional)
 * @returns Promise resolving to FHEVM instance
 * @throws {FHEVMError} When initialization fails or network is unsupported
 * 
 * @example
 * ```typescript
 * // Initialize for Sepolia testnet
 * const fhevm = await initializeFHEVM(11155111);
 * 
 * // Initialize with custom RPC
 * const fhevm = await initializeFHEVM(11155111, "https://sepolia.infura.io/v3/YOUR_KEY");
 * ```
 */
export async function initializeFHEVM(
    chainId?: number,
    networkUrl?: string
): Promise<FHEVMSDKInstance> {
    // Client-side only validation
    if (typeof window === 'undefined') {
        throw new FHEVMError(
            FHEVMErrorType.INITIALIZATION_FAILED,
            'FHEVM can only be initialized in browser environment',
            { environment: 'server' }
        );
    }

    // Use default network if not specified
    const targetChainId = chainId ?? DEFAULT_NETWORK.chainId;

    // Return cached instance if already initialized for the same network
    if (fhevmInstance && fhevmInstance.config.chainId === targetChainId) {
        return fhevmInstance as FHEVMSDKInstance;
    }

    // Validate network support
    validateNetworkSupport(targetChainId);

    try {
        // Setup global polyfill for SDK compatibility
        setupGlobalPolyfill();

        // Get network configuration
        const networkConfig = getNetworkConfig(targetChainId);

        // Load and initialize SDK
        await loadRelayerSDK();
        await initializeRelayerSDK();

        // Get SDK instance and network-specific config
        const relayerSDK = getRelayerSDK();
        const sdkNetworkConfig = getSDKNetworkConfig(relayerSDK, targetChainId);

        // Create FHEVM instance
        const instance = await relayerSDK.createInstance(sdkNetworkConfig);

        // Cache the instance with configuration
        fhevmInstance = {
            ...instance,
            config: {
                ...networkConfig,
                aclAddress: sdkNetworkConfig.aclContractAddress,
            }
        };

        // Set up the getter function for encryption operations
        setFHEVMInstanceGetter(() => fhevmInstance);

        return fhevmInstance!;
    } catch (error) {
        // Clear cached instance on failure
        fhevmInstance = null;

        if (error instanceof FHEVMError) {
            throw error;
        }

        throw new FHEVMError(
            FHEVMErrorType.INITIALIZATION_FAILED,
            `FHEVM initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            { chainId: targetChainId, networkUrl, originalError: error }
        );
    }
}

/**
 * Gets the current FHEVM instance
 * 
 * @description Provides access to the initialized FHEVM instance.
 * Ensures instance is available before returning.
 * 
 * @returns Current FHEVM instance
 * @throws {FHEVMError} When FHEVM is not initialized
 */
export function getFHEVMInstance(): FHEVMSDKInstance {
    if (!fhevmInstance) {
        throw new FHEVMError(
            FHEVMErrorType.INITIALIZATION_FAILED,
            'FHEVM not initialized. Call initializeFHEVM() first.',
            { suggestion: 'Call initializeFHEVM() before using encryption functions' }
        );
    }

    return fhevmInstance as FHEVMSDKInstance;
}

/**
 * Creates encryption parameters from addresses
 * 
 * @description Helper function to create properly validated encryption parameters
 * for FHEVM operations.
 * 
 * @param contractAddress - Target smart contract address
 * @param userAddress - User's wallet address
 * @returns Validated encryption parameters
 * @throws {FHEVMError} When addresses are invalid
 */
export function createEncryptionParams(
    contractAddress: string,
    userAddress: string
): EncryptionParams {
    if (!contractAddress || !isAddress(contractAddress)) {
        throw new FHEVMError(
            FHEVMErrorType.INVALID_ADDRESS,
            'Invalid or missing contract address',
            { contractAddress }
        );
    }

    if (!userAddress || !isAddress(userAddress)) {
        throw new FHEVMError(
            FHEVMErrorType.INVALID_ADDRESS,
            'Invalid or missing user address',
            { userAddress }
        );
    }

    return {
        contractAddress,
        userAddress,
    };
}

/**
 * Resets FHEVM instance
 * 
 * @description Clears the cached FHEVM instance. Used for testing
 * and when switching networks.
 * 
 * @internal This function is primarily for internal use and testing
 */
export function resetFHEVMInstance(): void {
    fhevmInstance = null;
}

/**
 * Sets up global polyfill for SDK compatibility
 * 
 * @description Ensures the global object is available for SDK requirements.
 * Required for proper SDK initialization in browser environments.
 * 
 * @private
 */
function setupGlobalPolyfill(): void {
    if (typeof (globalThis as any).global === 'undefined') {
        (globalThis as any).global = globalThis;
    }
}

/**
 * Gets SDK network configuration for specific chain
 * 
 * @description Retrieves the appropriate SDK configuration object
 * based on the target chain ID.
 * 
 * @param relayerSDK - RelayerSDK instance
 * @param chainId - Target chain ID
 * @returns SDK network configuration
 * @throws {FHEVMError} When configuration is not available
 * 
 * @private
 */
function getSDKNetworkConfig(relayerSDK: any, chainId: number): any {
    switch (chainId) {
        case 11155111: // Sepolia
            if (!relayerSDK.SepoliaConfig) {
                throw new FHEVMError(
                    FHEVMErrorType.INITIALIZATION_FAILED,
                    'Sepolia configuration not available in SDK',
                    { chainId }
                );
            }
            return relayerSDK.SepoliaConfig;

        case 8009: // Zama Devnet
            if (!relayerSDK.DevnetConfig) {
                throw new FHEVMError(
                    FHEVMErrorType.INITIALIZATION_FAILED,
                    'Devnet configuration not available in SDK',
                    { chainId }
                );
            }
            return relayerSDK.DevnetConfig;

        default:
            throw new FHEVMError(
                FHEVMErrorType.NETWORK_UNSUPPORTED,
                `No SDK configuration available for chain ID ${chainId}`,
                { chainId }
            );
    }
}
