// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IBattleEvents
 * @notice Event definitions for the Encrypted Meme Battle system
 * @dev Centralizes all event declarations for better organization and reusability
 * @author Zama Meme Battle Team
 */
interface IBattleEvents {
    
    // ============ BATTLE LIFECYCLE EVENTS ============
    
    /**
     * @notice Emitted when a new battle begins
     * @param timestamp Block timestamp when battle started  
     * @param battleNumber Sequential battle identifier (starts from 1)
     * @param endsAt Unix timestamp when this battle will expire
     */
    event BattleStarted(uint256 timestamp, uint256 indexed battleNumber, uint256 endsAt);
    
    /**
     * @notice Emitted when a battle ends (before starting the next battle)
     * @param timestamp Block timestamp when battle ended
     * @param battleNumber Battle that just ended (indexed for filtering)
     */
    event BattleEnded(uint256 timestamp, uint256 indexed battleNumber);
    
    // ============ VOTING EVENTS ============
    
    /**
     * @notice Emitted when a user successfully submits an encrypted vote
     * @param voter Address of the voting user (indexed for filtering)
     * @param timestamp Block timestamp when vote was recorded
     */
    event VoteSubmitted(address indexed voter, uint256 timestamp);
    
    // ============ FHEVM DECRYPTION EVENTS ============
    
    /**
     * @notice Emitted when FHEVM decryption is requested from the oracle
     * @param requestId Unique request identifier (indexed for callback matching)
     * @param dataType Description of what is being decrypted ("template_votes", "selected_caption")
     */
    event DecryptionRequested(uint256 indexed requestId, string dataType);
    
    /**
     * @notice Emitted when template vote results are decrypted and winner determined
     * @param winnerTemplateId Template with highest vote count (0-based index)
     * @param voteCounts Array of vote counts per template [template0, template1, ...]
     */
    event TemplateResultsRevealed(uint8 winnerTemplateId, uint32[] voteCounts);
    
    /**
     * @notice Emitted when final combination (template + random caption) is revealed
     * @param winnerTemplateId Winning template ID (0-based index)
     * @param winnerCaptionId Randomly selected caption from winning template (0-based index)  
     * @param winnerVotes Total votes the winning template received
     */
    event BattleResultsRevealed(uint8 winnerTemplateId, uint16 winnerCaptionId, uint32 winnerVotes);
    
    // ============ ACCESS CONTROL EVENTS ============
    
    /**
     * @notice Emitted when battle operator address is updated
     * @param previousOperator Previous operator address (indexed)
     * @param newOperator New operator address (indexed)
     */
    event BattleOperatorUpdated(address indexed previousOperator, address indexed newOperator);
    
    /**
     * @notice Emitted when battle duration is updated by owner
     * @param previousDuration Previous battle duration in seconds
     * @param newDuration New battle duration in seconds
     */
    event BattleDurationUpdated(uint256 previousDuration, uint256 newDuration);
}
