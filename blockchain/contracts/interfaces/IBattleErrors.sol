// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IBattleErrors
 * @notice Custom error definitions for the Encrypted Meme Battle system
 * @dev Centralizes all error declarations following Solidity 0.8.4+ custom errors pattern.
 *      Custom errors are more gas-efficient than require() statements with string messages.
 * @author Zama Meme Battle Team
 */
interface IBattleErrors {
    
    // ============ BATTLE STATE ERRORS ============
    
    /**
     * @notice Thrown when attempting to vote while battle is inactive or expired
     * @dev Occurs when battleActive == false OR block.timestamp >= battleEndsAt
     */
    error BattleNotActive();
    
    /**
     * @notice Thrown when attempting to end a battle before its expiration time
     * @dev Occurs when block.timestamp < battleEndsAt during endBattle() call
     */
    error BattleStillActive();
    
    // ============ INPUT VALIDATION ERRORS ============
    
    /**
     * @notice Thrown when provided template ID exceeds available template count
     * @dev Used during vote validation, though in FHEVM this is checked homomorphically
     */
    error InvalidTemplateId();
    
    /**
     * @notice Thrown when provided caption ID exceeds available caption count
     * @dev Used during vote validation, though in FHEVM this is checked homomorphically
     */
    error InvalidCaptionId();
    
    // ============ VOTING ERRORS ============
    
    /**
     * @notice Thrown when user tries to vote twice in the same battle
     * @dev Prevents double voting by checking lastVotedBattle[user] == battleNumber
     */
    error AlreadyVoted();
    
    // ============ RESULT ACCESS ERRORS ============
    
    /**
     * @notice Thrown when attempting to access results before FHEVM decryption completes
     * @dev Occurs when trying to call getTemplateResults(), getWinners(), etc. before revealed=true
     */
    error ResultsNotRevealed();
    
    // ============ ACCESS CONTROL ERRORS ============
    
    /**
     * @notice Thrown when non-operator tries to perform operator-only actions
     * @dev Used in onlyBattleOperator modifier for endBattle() and similar functions
     */
    error NotAuthorized();
    
    /**
     * @notice Thrown when non-owner tries to perform owner-only actions
     * @dev Used in onlyOwner modifier for setBattleOperator() and admin functions
     */
    error OnlyOwner();
    
    // ============ DECRYPTION ERRORS ============
    
    /**
     * @notice Thrown when trying to request decryption with no completed battles
     * @dev Occurs when completedBattleCount == 0 during decryption requests
     */
    error NoCompletedBattles();
    
    /**
     * @notice Thrown when trying to decrypt already revealed battle results
     * @dev Occurs when battleHistory[battleId].revealed == true
     */
    error ResultsAlreadyRevealed();
    
    /**
     * @notice Thrown when invalid battle number is provided for decryption
     * @dev Occurs when battleNum == 0 OR battleNum > completedBattleCount
     */
    error InvalidBattleNumber();

    /**
     * @notice Thrown when invalid vote count array is provided
     * @dev Occurs when voteCounts.length != templateCount
     */
    error InvalidVoteCountArray(uint32 expectedLength, uint256 actualLength);
}
