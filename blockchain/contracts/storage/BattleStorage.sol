// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "../libraries/BattleStructs.sol";

/**
 * @title BattleStorage
 * @notice Storage contract for the Encrypted Meme Battle system
 * @dev Centralizes all storage variables and provides organized access patterns.
 *      Uses inheritance to separate storage concerns from business logic.
 *      Implements lazy initialization for gas optimization.
 * @author Zama Meme Battle Team
 */
abstract contract BattleStorage {
    using FHE for euint32;
    using FHE for euint16;
    using FHE for euint8;
    
    // ============ CONFIGURATION CONSTANTS ============
    
    /**
     * @notice Maximum number of meme templates allowed per battle
     * @dev Prevents excessive gas consumption during vote processing loops.
     *      Each template requires encrypted vote counting and comparison operations.
     */
    uint8 public constant MAX_TEMPLATES = 10;
    
    /**
     * @notice Maximum number of caption options allowed per battle
     * @dev Uses uint16 for gas-efficient storage while supporting large caption sets.
     *      Caption selection uses pseudo-random indexing, so higher limits don't
     *      significantly impact gas costs beyond initial validation.
     */
    uint16 public constant MAX_CAPTIONS = 256;
    
    // ============ BATTLE CONFIGURATION ============
    
    /// @notice Number of available templates in current battle (2-10)
    uint8 public templateCount;
    
    /// @notice Number of available captions in current battle (2-256)  
    uint16 public captionCount;
    
    /// @notice Duration of each battle in seconds (set at deployment)
    uint256 public battleDuration;
    
    // ============ BATTLE STATE MANAGEMENT ============
    
    /// @notice Current battle status (true = accepting votes)
    bool public battleActive;
    
    /// @notice Unix timestamp when current battle ends
    uint256 public battleEndsAt;
    
    /// @notice Count of unique voters in current battle
    uint256 public totalVoters;
    
    /// @notice Incremental ID for FHEVM decryption requests
    uint256 internal nextRequestId;
    
    /// @notice Current battle number (starts from 1)
    uint256 public battleNumber;
    
    /// @notice Total count of completed battles (gas-efficient counter)
    uint256 public completedBattleCount;
    
    // ============ ACCESS CONTROL ============
    
    /// @notice Address authorized to end battles and trigger new ones
    address public battleOperator;
    
    /// @notice Contract deployer with admin privileges
    address public owner;
    
    // ============ ENCRYPTED STORAGE ============
    
    /**
     * @notice Encrypted vote counts for each template in the current battle
     * @dev Maps templateId (0-based index) to encrypted vote count using Zama's euint32 type.
     *      Uses lazy initialization pattern - encrypted zeros only stored on first access.
     * @custom:storage-pattern Lazy initialization to avoid unnecessary encrypted zero writes
     * @custom:encryption-type euint32 - supports up to ~4.2B votes per template per battle
     */
    mapping(uint8 => euint32) internal encryptedTemplateVotes;
    
    /**
     * @notice Stores encrypted caption choices grouped by template for random winner selection
     * @dev Two-level mapping: battleNumber => templateId => array of encrypted caption IDs.
     *      When users vote, their encrypted caption choice is stored in the array for their template.
     * @custom:storage-pattern Nested mapping for efficient caption grouping by template choice
     * @custom:encryption-type euint16 - supports caption indices up to 65,535
     */
    mapping(uint256 => mapping(uint8 => euint16[])) internal templateCaptionVotes;
    
    // ============ USER TRACKING ============
    
    /**
     * @notice Tracks the last battle number each user participated in
     * @dev Maps user address to battle number to prevent double voting within same battle.
     *      Gas-efficient approach avoiding expensive mapping resets between battles.
     * @custom:anti-pattern Avoids expensive mapping deletion/reset operations
     */
    mapping(address => uint256) public lastVotedBattle;
    
    // ============ DECRYPTION MANAGEMENT ============
    
    /**
     * @notice Maps decryption request IDs to arrays of encrypted data handles
     * @dev Stores bytes32 handles of encrypted values submitted to Zama's oracle network.
     *      Used for callback verification to ensure only valid decryption requests are processed.
     * @custom:security-feature Prevents unauthorized callback execution
     */
    mapping(uint256 => bytes32[]) internal decryptionRequests;
    
    /**
     * @notice Maps decryption request IDs to their originating battle numbers
     * @dev Critical for handling asynchronous decryption callbacks that may arrive after
     *      new battles have started. Ensures results update correct historical battles.
     * @custom:async-safety Prevents race conditions between callbacks and battle progression
     */
    mapping(uint256 => uint256) internal requestIdToBattleNumber;
    
    // ============ RESULTS STORAGE ============
    
    /// @notice Current battle results (reset when new battle starts)
    BattleStructs.BattleResults public currentBattleResults;
    
    /// @notice Permanent historical storage for all completed battles
    /// @dev Key: battleNumber => BattleResults
    mapping(uint256 => BattleStructs.BattleResults) public battleHistory;
    
    // ============ STORAGE HELPER FUNCTIONS ============
    
    /**
     * @notice Get or initialize encrypted template vote count with lazy initialization
     * @dev Implements lazy initialization pattern to optimize gas usage.
     *      Only creates encrypted zero when storage slot is first accessed.
     * 
     * @param templateId Template index to get/initialize votes for (0-based)
     * @return euint32 Encrypted vote count (0 if first access, current value otherwise)
     * 
     * Gas Optimization:
     * - Avoids expensive encrypted zero writes during contract deployment
     * - Only initializes storage when actually needed for vote processing
     * - Reduces deployment gas costs significantly for unused templates
     */
    function _getOrInitializeTemplateVotes(uint8 templateId) internal returns (euint32) {
        bytes32 handle = euint32.unwrap(encryptedTemplateVotes[templateId]);
        
        if (handle == bytes32(0)) {
            // First access - initialize with encrypted zero
            encryptedTemplateVotes[templateId] = FHE.asEuint32(0);
        }
        
        return encryptedTemplateVotes[templateId];
    }
    
    /**
     * @notice Store encrypted caption choice for specific template
     * @dev Groups captions by template choice for efficient random selection later.
     *      Each caption is stored in the array corresponding to its template choice.
     * 
     * @param templateId Plain template ID (0-based) to group caption under
     * @param encryptedCaptionId Encrypted caption ID from user's vote
     * 
     * Privacy Features:
     * - Caption remains encrypted until winner selection
     * - Grouped by template for efficient winner processing
     * - ACL permissions set for contract access
     */
    function _storeCaptionForTemplate(uint8 templateId, euint16 encryptedCaptionId) internal {
        templateCaptionVotes[battleNumber][templateId].push(encryptedCaptionId);
        FHE.allowThis(encryptedCaptionId);
    }
    
    /**
     * @notice Check if user has already voted in current battle
     * @dev Gas-efficient check using battle number comparison.
     *      Avoids expensive mapping resets between battles.
     * 
     * @param user Address to check voting status for
     * @return bool True if user has voted in current battle
     * 
     * Implementation:
     * - Compares user's lastVotedBattle with current battleNumber
     * - No storage writes required, very gas efficient
     * - Automatic reset when battleNumber increments
     */
    function _hasVotedInCurrentBattle(address user) internal view returns (bool) {
        return lastVotedBattle[user] == battleNumber;
    }
}
