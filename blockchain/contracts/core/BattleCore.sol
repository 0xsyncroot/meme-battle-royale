// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "../storage/BattleStorage.sol";
import "../libraries/FHEVMHelper.sol";
import "../libraries/BattleStructs.sol";
import "../interfaces/IBattleEvents.sol";
import "../interfaces/IBattleErrors.sol";
import "../interfaces/IDecryptionCallbacks.sol";

/**
 * @title BattleCore
 * @notice Core battle logic for the Encrypted Meme Battle system
 * @dev Implements the main battle mechanics including voting, battle lifecycle,
 *      and privacy-preserving vote processing using Zama FHEVM.
 * @author Zama Meme Battle Team
 */
abstract contract BattleCore is BattleStorage, IBattleEvents, IBattleErrors {
    using FHE for euint32;
    using FHE for euint16;
    using FHE for euint8;
    using FHE for ebool;
    
    // ============ MODIFIERS ============
    
    /**
     * @notice Restrict function to battle operator only (for worker automation)
     */
    modifier onlyBattleOperator() {
        if (msg.sender != battleOperator) revert NotAuthorized();
        _;
    }
    
    /**
     * @notice Restrict function to contract owner only (for admin operations)  
     */
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    // ============ BATTLE LIFECYCLE ============
    
    /**
     * @notice Initialize new battle round with fresh state
     * @dev Resets vote counters and battle metadata, emits BattleStarted event.
     *      Called automatically after previous battle ends to maintain continuous operation.
     * 
     * Effects:
     * - Sets battleActive = true and calculates new battleEndsAt
     * - Resets totalVoters counter
     * - Clears previousBattleResults for new battle
     * - Emits BattleStarted event with battle details
     */
    function _startNewBattle() internal {
        battleActive = true;
        battleEndsAt = block.timestamp + battleDuration;
        totalVoters = 0;
        
        // Clear previous battle results - new battle starts clean
        delete currentBattleResults;
        
        emit BattleStarted(block.timestamp, battleNumber, battleEndsAt);
    }
    
    /**
     * @notice End current battle and automatically start next battle
     * @dev Can only be called by battle operator after battle expiration.
     *      Initiates FHEVM decryption chain to determine winner and saves battle history.
     * 
     * Requirements:
     * - Battle must be expired (block.timestamp >= battleEndsAt)
     * - Battle must be active (prevents double execution)
     * - Only callable by authorized battle operator
     * 
     * Effects:
     * - Sets battleActive = false
     * - Saves battle to history immediately (guarantees history entry)
     * - Requests FHEVM decryption for vote results (if votes exist)
     * - Increments battleNumber and starts new battle automatically
     * - Emits BattleEnded event
     * 
     * Decryption Strategy:
     * - Battle history saved immediately for all environments
     * - FHEVM decryption requested to update results when oracle responds
     * - Works reliably on mainnet, degrades gracefully on testnets/local
     */
    function endBattle() external onlyBattleOperator {
        // Time-based validation - battle must have reached end time
        if (block.timestamp < battleEndsAt) {
            revert BattleStillActive();
        }
        
        // Idempotency check - prevent double execution
        if (!battleActive) {
            return;
        }
        
        battleActive = false;
        
        // Save battle to history immediately
        _saveBattleToHistory();
        
        // Request FHEVM decryption to determine winner
        _requestTemplateResultsDecryption();
        
        emit BattleEnded(block.timestamp, battleNumber);
        
        // Auto-restart: increment counter and begin next battle immediately
        battleNumber++;
        _startNewBattle();
    }
    
    // ============ VOTING MECHANICS ============
    
    /**
     * @notice Submit an encrypted vote for a template + caption combination
     * @dev Processes encrypted user input through Zama FHEVM operations while preserving privacy.
     *      Validates inputs using homomorphic comparisons and updates vote counts using encrypted arithmetic.
     * 
     * @param encryptedTemplateId Client-side encrypted template choice (0-based index)
     * @param templateProof Cryptographic proof verifying the encrypted template value
     * @param encryptedCaptionId Client-side encrypted caption choice (0-based index)  
     * @param captionProof Cryptographic proof verifying the encrypted caption value
     * 
     * Requirements:
     * - Battle must be active and not expired
     * - User must not have voted in current battle
     * - Cryptographic proofs must be valid (verified by FHEVM)
     * - Template ID must be < templateCount (validated homomorphically)
     * 
     * Privacy Features:
     * - Template and caption choices remain encrypted throughout voting process
     * - Uses privacy-preserving validation with FHE operations
     * - Vote tallying through encrypted conditional logic
     * - No plaintext vote information revealed until post-battle decryption
     * 
     * Gas Optimization:
     * - Lazy initialization of encrypted vote counters
     * - Efficient ACL permission setup
     * - Single loop through templates minimizes gas scaling
     */
    function submitVote(
        externalEuint8 encryptedTemplateId,
        bytes calldata templateProof,
        externalEuint16 encryptedCaptionId,
        bytes calldata captionProof
    ) external {
        // Battle state validation
        if (!battleActive || block.timestamp >= battleEndsAt) {
            revert BattleNotActive();
        }
        if (_hasVotedInCurrentBattle(msg.sender)) {
            revert AlreadyVoted();
        }
        
        // Convert external encrypted inputs
        euint8 templateId = FHEVMHelper.convertExternalTemplate(encryptedTemplateId, templateProof);
        euint16 captionId = FHEVMHelper.convertExternalCaption(encryptedCaptionId, captionProof);
        
        // Configure FHEVM access control
        FHEVMHelper.setupVoteACL(templateId, captionId, msg.sender);
        
        // Validate template choice homomorphically
        ebool validTemplate = FHEVMHelper.validateTemplateChoice(templateId, templateCount);
        
        // Process encrypted vote tallying
        for (uint8 i = 0; i < templateCount; i++) {
            euint32 currentCount = _getOrInitializeTemplateVotes(i);
            ebool isThisTemplate = FHEVMHelper.isTemplateMatch(templateId, i);
            ebool validAndMatching = FHEVMHelper.combineConditions(validTemplate, isThisTemplate);
            euint32 increment = FHEVMHelper.conditionalIncrement(validAndMatching);
            
            encryptedTemplateVotes[i] = FHE.add(currentCount, increment);
            FHEVMHelper.allowContractAccess(encryptedTemplateVotes[i]);
            
            _storeCaptionForTemplate(i, captionId);
        }
        
        // Update user voting status
        lastVotedBattle[msg.sender] = battleNumber;
        totalVoters++;
        
        emit VoteSubmitted(msg.sender, block.timestamp);
    }
    
    // ============ HISTORY MANAGEMENT ============
    
    /**
     * @notice Archive current battle metadata to history (immediate save)
     * @dev Saves battle with basic metadata immediately - ensures history always exists.
     *      FHEVM decryption callbacks will update with real results when available.
     * 
     * Effects:
     * - Creates battleHistory entry with current battle metadata
     * - Sets revealed=false (updated when FHEVM oracle completes)
     * - Increments completedBattleCount immediately  
     * - Provides fallback battle data for all environments
     */
    function _saveBattleToHistory() internal {
        battleHistory[battleNumber] = BattleStructs.BattleResults({
            revealed: false,                               // Updated when FHEVM oracle responds
            winnerTemplateId: 0,                          // Updated in templateDecryptionCallback
            winnerCaptionId: 0,                           // Updated in captionDecryptionCallback
            winnerVotes: 0,                               // Updated with real vote counts
            templateVoteCounts: new uint32[](templateCount), // Updated with decrypted counts
            battleNumber: battleNumber,
            endTimestamp: block.timestamp,
            totalParticipants: totalVoters
        });
        
        completedBattleCount++;
    }
    
    /**
     * @notice Update battle history with complete decrypted results
     * @dev Called by FHEVM oracle callbacks when decryption completes successfully.
     *      Updates existing history entry with real encrypted vote results.
     * 
     * @param targetBattleNumber Battle number to update results for
     * @param finalCaptionId Final decrypted caption ID (0 if no captions/default)
     * 
     * Effects:
     * - Updates existing battleHistory entry if it exists
     * - Sets revealed=true and populates all result fields
     * - Preserves historical accuracy for cross-battle decryption timing
     */
    function _updateBattleHistoryWithResults(uint256 targetBattleNumber, uint16 finalCaptionId) internal {
        if (battleHistory[targetBattleNumber].endTimestamp > 0) {
            battleHistory[targetBattleNumber].revealed = true;
            battleHistory[targetBattleNumber].winnerTemplateId = currentBattleResults.winnerTemplateId;
            battleHistory[targetBattleNumber].winnerCaptionId = finalCaptionId;
            battleHistory[targetBattleNumber].winnerVotes = currentBattleResults.winnerVotes;
            battleHistory[targetBattleNumber].templateVoteCounts = currentBattleResults.templateVoteCounts;
        }
    }
    
    // ============ DECRYPTION REQUEST MANAGEMENT ============
    
    /**
     * @notice Request decryption of template vote counts from FHEVM oracle
     * @dev Submits batch decryption request for all template vote counts.
     *      Oracle calls templateDecryptionCallback with results.
     */
    function _requestTemplateResultsDecryption() internal {
        if (totalVoters == 0) {
            emit TemplateResultsRevealed(0, new uint32[](templateCount));
            return;
        }
        
        bytes32[] memory handles = new bytes32[](templateCount);
        
        for (uint8 i = 0; i < templateCount; i++) {
            euint32 voteCount = _getOrInitializeTemplateVotes(i);
            handles[i] = euint32.unwrap(voteCount);
        }
        
        uint256 requestId = FHE.requestDecryption(
            handles,
            IDecryptionCallbacks.templateDecryptionCallback.selector
        );
        
        // Store battle context for callback processing
        requestIdToBattleNumber[requestId] = battleNumber;
        decryptionRequests[requestId] = handles;
        
        emit DecryptionRequested(requestId, "template_votes");
    }
}
