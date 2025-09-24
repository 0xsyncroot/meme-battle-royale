// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title BattleStructs
 * @notice Data structure definitions for the Encrypted Meme Battle system
 * @dev Centralizes all struct definitions for better organization and reusability.
 *      These structures handle battle results, configuration, and historical data.
 * @author Zama Meme Battle Team
 */
library BattleStructs {
    
    /**
     * @notice Complete battle results after FHEVM decryption
     * @dev Immutable once revealed=true, stored permanently for historical analytics.
     *      This structure represents the final state of a completed battle with
     *      all encrypted votes decrypted and winners determined.
     */
    struct BattleResults {
        /// @notice Whether FHEVM oracle has completed all decryptions successfully
        /// @dev Set to true only after both template votes and winning caption are decrypted
        bool revealed;
        
        /// @notice Winning template ID determined by highest vote count (0-based index)
        /// @dev Template with maximum votes among all templateVoteCounts entries
        uint8 winnerTemplateId;
        
        /// @notice Randomly selected caption from captions that voted for winning template (0-based index)
        /// @dev Selected using pseudo-random algorithm from winning template's caption pool
        uint16 winnerCaptionId;
        
        /// @notice Total vote count received by the winning template
        /// @dev Equals templateVoteCounts[winnerTemplateId] for data consistency
        uint32 winnerVotes;
        
        /// @notice Decrypted vote counts for all templates in order [template0, template1, ...]
        /// @dev Array length equals templateCount configured at battle creation
        uint32[] templateVoteCounts;
        
        /// @notice Battle identifier matching the battleNumber when battle ended
        /// @dev Used to correlate results with specific battle instance
        uint256 battleNumber;
        
        /// @notice Block timestamp when battle was ended and results processing began
        /// @dev Marks the transition from voting phase to decryption phase
        uint256 endTimestamp;
        
        /// @notice Total number of unique users who submitted votes in this battle
        /// @dev Equals the totalVoters count when battle ended
        uint256 totalParticipants;
    }
    
    /**
     * @notice Configuration parameters for battle initialization
     * @dev Used during contract deployment and configuration updates.
     *      Encapsulates all parameters needed to set up battle mechanics.
     */
    struct BattleConfig {
        /// @notice Number of meme template options available for voting (2-10)
        /// @dev Must be between 2 and MAX_TEMPLATES for optimal gas usage
        uint8 templateCount;
        
        /// @notice Number of caption options available for voting (2-256)
        /// @dev Must be between 2 and MAX_CAPTIONS for storage efficiency
        uint16 captionCount;
        
        /// @notice Duration of each battle in seconds
        /// @dev Determines voting window length before battle auto-expires
        uint256 battleDuration;
        
        /// @notice Address authorized to end battles and trigger new ones
        /// @dev Should be worker/automation address separate from contract owner
        address battleOperator;
    }
    
    /**
     * @notice Current battle status and metadata for frontend queries
     * @dev Read-only structure returned by getBattleInfo() for UI display.
     *      Provides all essential information about the active battle state.
     */
    struct BattleInfo {
        /// @notice Whether battle is currently accepting votes
        /// @dev True if battleActive && block.timestamp < battleEndsAt
        bool active;
        
        /// @notice Unix timestamp when current battle expires and voting closes
        /// @dev After this time, endBattle() can be called to process results
        uint256 endsAt;
        
        /// @notice Number of template options available in current battle
        /// @dev Used by frontend to generate voting interface (0 to templates-1)
        uint8 templates;
        
        /// @notice Number of caption options available in current battle
        /// @dev Used by frontend to generate voting interface (0 to captions-1)
        uint16 captions;
        
        /// @notice Number of unique users who have voted in current battle
        /// @dev Real-time participation counter for engagement metrics
        uint256 totalVotes;
        
        /// @notice Sequential identifier of current battle (starts from 1)
        /// @dev Increments automatically when new battles start
        uint256 currentBattleNumber;
    }
    
    /**
     * @notice Contract configuration and administrative information
     * @dev Read-only structure returned by getContractInfo() for contract inspection.
     *      Provides deployment configuration and access control details.
     */
    struct ContractInfo {
        /// @notice Maximum templates allowed per battle (deployment constant)
        /// @dev Hard limit to prevent excessive gas consumption
        uint8 maxTemplates;
        
        /// @notice Maximum captions allowed per battle (deployment constant) 
        /// @dev Hard limit for storage optimization
        uint16 maxCaptions;
        
        /// @notice Current template count for all battles
        /// @dev Set at deployment, consistent across all battle rounds
        uint8 currentTemplates;
        
        /// @notice Current caption count for all battles
        /// @dev Set at deployment, consistent across all battle rounds
        uint16 currentCaptions;
        
        /// @notice Duration of each battle in seconds
        /// @dev Set at deployment, consistent across all battle rounds
        uint256 battleDurationSeconds;
        
        /// @notice Total number of battles completed and stored in history
        /// @dev Increments each time a battle ends, used for pagination
        uint256 totalCompletedBattles;
        
        /// @notice Contract deployer with administrative privileges
        /// @dev Can update battle operator and perform owner-only actions
        address contractOwner;
        
        /// @notice Address authorized to end battles (usually automation worker)
        /// @dev Separated from owner for security and operational efficiency
        address operatorAddress;
    }
}
