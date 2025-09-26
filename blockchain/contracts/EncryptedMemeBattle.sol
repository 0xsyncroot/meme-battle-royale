// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import "./core/BattleCore.sol";
import "./libraries/BattleStructs.sol";
import "./interfaces/IDecryptionCallbacks.sol";

/**
 * 
 * ███████╗███╗   ██╗ ██████╗██████╗ ██╗   ██╗██████╗ ████████╗███████╗██████╗     ███╗   ███╗███████╗███╗   ███╗███████╗
 * ██╔════╝████╗  ██║██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗╚══██╔══╝██╔════╝██╔══██╗    ████╗ ████║██╔════╝████╗ ████║██╔════╝
 * █████╗  ██╔██╗ ██║██║     ██████╔╝ ╚████╔╝ ██████╔╝   ██║   █████╗  ██║  ██║    ██╔████╔██║█████╗  ██╔████╔██║█████╗  
 * ██╔══╝  ██║╚██╗██║██║     ██╔══██╗  ╚██╔╝  ██╔═══╝    ██║   ██╔══╝  ██║  ██║    ██║╚██╔╝██║██╔══╝  ██║╚██╔╝██║██╔══╝  
 * ███████╗██║ ╚████║╚██████╗██║  ██║   ██║   ██║        ██║   ███████╗██████╔╝    ██║ ╚═╝ ██║███████╗██║ ╚═╝ ██║███████╗
 * ╚══════╝╚═╝  ╚═══╝ ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝        ╚═╝   ╚══════╝╚═════╝     ╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝
 *                                                                                                                        
 * ██████╗  █████╗ ████████╗████████╗██╗     ███████╗    ███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗
 * ██╔══██╗██╔══██╗╚══██╔══╝╚══██╔══╝██║     ██╔════╝    ██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║
 * ██████╔╝███████║   ██║      ██║   ██║     █████╗      ███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║
 * ██╔══██╗██╔══██║   ██║      ██║   ██║     ██╔══╝      ╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║
 * ██████╔╝██║  ██║   ██║      ██║   ███████╗███████╗    ███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║
 * ╚═════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝╚══════╝    ╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                                       ║
 * ║    ██████╗ ██╗  ██╗███████╗██╗   ██╗███╗   ██╗ ██████╗██████╗  ██████╗  ██████╗ ████████╗          ║
 * ║   ██╔═████╗╚██╗██╔╝██╔════╝╚██╗ ██╔╝████╗  ██║██╔════╝██╔══██╗██╔═══██╗██╔═══██╗╚══██╔══╝          ║
 * ║   ██║██╔██║ ╚███╔╝ ███████╗ ╚████╔╝ ██╔██╗ ██║██║     ██████╔╝██║   ██║██║   ██║   ██║             ║
 * ║   ████╔╝██║ ██╔██╗ ╚════██║  ╚██╔╝  ██║╚██╗██║██║     ██╔══██╗██║   ██║██║   ██║   ██║             ║
 * ║   ╚██████╔╝██╔╝ ██╗███████║   ██║   ██║ ╚████║╚██████╗██║  ██║╚██████╔╝╚██████╔╝   ██║             ║
 * ║    ╚═════╝ ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝             ║
 * ║                                                                                                       ║
 * ║           ██╗     ███████╗ █████╗ ██████╗      █████╗ ██████╗  ██████╗██╗  ██╗██╗████████╗         ║
 * ║           ██║     ██╔════╝██╔══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔════╝██║  ██║██║╚══██╔══╝         ║
 * ║           ██║     █████╗  ███████║██║  ██║    ███████║██████╔╝██║     ███████║██║   ██║            ║
 * ║           ██║     ██╔══╝  ██╔══██║██║  ██║    ██╔══██║██╔══██╗██║     ██╔══██║██║   ██║            ║
 * ║           ███████╗███████╗██║  ██║██████╔╝    ██║  ██║██║  ██║╚██████╗██║  ██║██║   ██║            ║
 * ║           ╚══════╝╚══════╝╚═╝  ╚═╝╚═════╝     ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝   ╚═╝            ║
 * ║                                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════════════╝
 * 
 * ┌─ ★ ENTERPRISE SMART CONTRACT ARCHITECTURE ★ ────────────────────────────────────────────────────────┐
 * │                                                                                                       │
 * │  🏗️ Built with Modular Architecture Patterns      🔐 Fully Homomorphic Encryption (FHE)           │
 * │  ⚡ Gas-Optimized & Production-Ready                🎯 Privacy-Preserving Meme Battle System         │
 * │  🛡️ Enterprise-Grade Security Standards            🌐 Multi-Network Zama FHEVM Compatible           │
 * │                                                                                                       │
 * │  ╭─────────────────────────────────────────────────────────────────────────────────────────────╮    │
 * │  │                               POWERED BY ZAMA PROTOCOL                                     │    │
 * │  │                          Fully Homomorphic Encryption Magic                               │    │
 * │  ╰─────────────────────────────────────────────────────────────────────────────────────────────╯    │
 * └───────────────────────────────────────────────────────────────────────────────────────────────────────┘
 *
 * @title EncryptedMemeBattle
 * @author 0xSyncroot & Zama Meme Battle Team
 * @notice A privacy-preserving meme voting battle system powered by Zama's Fully Homomorphic Encryption (FHE)
 * 
 * @dev This is the main contract implementing a continuous battle system where users vote for meme 
 *      template + caption combinations while maintaining complete privacy during the voting process.
 *      Built using modular architecture with separated concerns for maintainability.
 * 
 * ## 🎯 Core Functionality:
 * - **🔐 Private Voting**: Users submit encrypted votes for template+caption combinations
 * - **⚡ Homomorphic Aggregation**: Vote counts computed on encrypted data using FHE operations  
 * - **🔄 Asynchronous Decryption**: Results revealed via Zama's oracle network after battle ends
 * - **♻️  Automatic Progression**: New battles start immediately after previous battle completion
 * 
 * ## 🏗️ Architecture Components:
 * - **BattleCore**: Core battle logic and voting mechanics
 * - **BattleStorage**: Organized storage patterns and state management
 * - **FHEVMHelper**: Reusable utility functions for encrypted operations
 * - **BattleStructs**: Data structure definitions and result types
 * 
 * ## 🛡️ Security & Privacy Features:
 * - Uses Zama's cryptographic proofs for input validation and decryption verification
 * - Access Control Lists (ACL) manage encrypted data permissions properly
 * - Request ID tracking prevents callback replay attacks effectively
 * - Vote choices remain private until battle completion and oracle decryption
 * - MEV-resistant design through encrypted computation and asynchronous result revelation
 * 
 * ## 🚀 Gas Optimization Strategies:
 * - **Lazy Initialization**: Encrypted storage values initialized only on first access
 * - **Battle Number Tracking**: Efficient vote tracking without expensive mapping resets
 * - **Batched Decryption**: Multiple values decrypted in single oracle request
 * - **Modular Libraries**: Shared code reduces deployment size
 * 
 * ## 🌐 FHEVM Environment Compatibility:
 * - **Zama Mainnet**: Full functionality with reliable oracle callbacks
 * - **Testnets (Sepolia)**: Core functionality with potentially delayed/unreliable callbacks  
 * - **Local Development**: Basic battle mechanics without oracle-dependent features
 * - **Fallback Design**: Battle history always persisted regardless of oracle availability
 * 
 * @custom:version 3.0.0 - Final Modular Architecture by 0xSyncroot
 * @custom:author 0xSyncroot - Lead Smart Contract Architect
 * @custom:security-contact security@zama-meme-battle.com  
 * @custom:audit-status Unaudited - Educational/Demonstration purposes only
 * @custom:fhevm-version Compatible with Zama FHEVM v0.8+
 * @custom:architecture Modular design with separated concerns for enterprise-grade applications
 * @custom:copyright © 2024 0xSyncroot & Zama Meme Battle Team. All rights reserved.
 */
contract EncryptedMemeBattle is BattleCore, SepoliaConfig, IDecryptionCallbacks {
    using FHE for euint32;
    using FHE for euint16;
    using FHE for euint8;
    using FHE for ebool;
    
    /**
     * ╔═══════════════════════════════════════════════════════════════════════════════════╗
     * ║                        🚀 CONSTRUCTOR - CONTRACT INITIALIZATION                    ║
     * ╚═══════════════════════════════════════════════════════════════════════════════════╝
     * 
     * @notice Initializes the encrypted meme battle contract and starts the first battle immediately
     * @dev Sets up battle configuration, access controls, and begins the first voting round.
     *      The contract is designed for continuous operation with automatic battle progression.
     *      Built by 0xSyncroot with enterprise-grade modular architecture patterns.
     * 
     * @param _templateCount Number of meme templates available per battle
     *                       ● Must be between 2 and MAX_TEMPLATES (10) for optimal gas usage
     *                       ● Each template requires encrypted vote counting and comparison operations
     * @param _captionCount Number of caption options available per battle
     *                      ● Must be between 2 and MAX_CAPTIONS (256) for storage efficiency  
     *                      ● Used for random caption selection from winning template voters
     * @param _battleDuration Duration of each battle in seconds
     *                        ● Determines how long users have to submit encrypted votes
     *                        ● After expiration, only battle operator can trigger battle end
     * @param _battleOperator Address authorized to end battles and trigger new ones
     *                        ● Should be a worker/automation address separate from owner
     *                        ● Critical for continuous battle operation and decentralized management
     * 
     * ⚡ Effects:
     * - Sets deployer as contract owner with administrative privileges
     * - Configures battle parameters for all future battles (immutable after deployment)
     * - Starts battle #1 immediately with the specified configuration
     * - Emits BattleStarted event for the first battle initialization
     * - Initializes modular architecture components (BattleCore, Storage, etc.)
     * 
     * 🛡️ Security Validation:
     * - Validates all input parameters to prevent misconfiguration attacks
     * - Ensures battle operator is not zero address for operational security
     * - Implements separation of concerns between owner and operator roles
     * 
     * 📊 Gas Optimization:
     * - Battle configuration stored once and reused for all battles
     * - Lazy initialization patterns for encrypted storage to minimize deployment costs
     * - Modular libraries shared across contract instances
     *
     * @custom:modifier none - Public constructor called once during deployment
     * @custom:access-control Deployer becomes owner, operator set separately for automation
     * @custom:gas-optimization Battle parameters stored once, reused for efficiency
     * @custom:author 0xSyncroot - Enterprise smart contract architecture
     */
    constructor(
        uint8 _templateCount,
        uint16 _captionCount, 
        uint256 _battleDuration,
        address _battleOperator
    ) {
        // Input validation
        require(_templateCount > 1 && _templateCount <= MAX_TEMPLATES, "Invalid template count");
        require(_captionCount > 1 && _captionCount <= MAX_CAPTIONS, "Invalid caption count");
        require(_battleDuration > 0, "Battle duration must be positive");
        require(_battleOperator != address(0), "Battle operator cannot be zero address");
        
        // Store configuration
        templateCount = _templateCount;
        captionCount = _captionCount;
        battleDuration = _battleDuration;
        battleNumber = 1;
        
        // Set access control
        owner = msg.sender;
        battleOperator = _battleOperator;
        
        // Initialize first battle immediately
        _startNewBattle();
    }
    
    // ============ DECRYPTION CALLBACKS ============
    
    /**
     * @notice FHEVM oracle callback for template vote decryption
     * @param requestId Request identifier for replay protection
     * @param cleartexts ABI-encoded decrypted template vote counts
     * @param decryptionProof KMS signature for verification
     */
    function templateDecryptionCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external override(IDecryptionCallbacks) {
        // Verify request validity and prevent replay attacks
        require(requestIdToBattleNumber[requestId] > 0, "Invalid request ID");
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);
        
        uint256 targetBattleNumber = requestIdToBattleNumber[requestId];
        
        // Decode only essential winner information (3 values)
        (uint8 winner, uint16 winnerCaptionId, uint32 maxVotes) = 
            FHEVMHelper.decodeWinnerInfo(cleartexts);
            
        // Update battle history with complete results using saved participant count
        _updateBattleHistoryWithResults(targetBattleNumber, winner, winnerCaptionId, maxVotes, uint32(battleParticipants[targetBattleNumber]));
        
        // Prevent replay attacks
        delete requestIdToBattleNumber[requestId];
        delete decryptionRequests[requestId];

        emit BattleResultsRevealed(winner, winnerCaptionId, maxVotes);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Update battle operator address (owner only)
     * @param newOperator New battle operator address for automation
     */
    function setBattleOperator(address newOperator) external onlyOwner {
        require(newOperator != address(0), "New operator cannot be zero address");
        
        address previousOperator = battleOperator;
        battleOperator = newOperator;
        
        emit BattleOperatorUpdated(previousOperator, newOperator);
    }
    
    /**
     * @notice Update battle duration for future battles (owner only)
     * @param newDuration New battle duration in seconds
     * @dev Only affects battles started after this change. Current active battle duration unchanged.
     */
    function setBattleDuration(uint256 newDuration) external onlyOwner {
        require(newDuration > 0, "Battle duration must be positive");
        require(newDuration >= 60, "Battle duration must be at least 60 seconds");
        require(newDuration <= 7 days, "Battle duration cannot exceed 7 days");
        
        uint256 previousDuration = battleDuration;
        battleDuration = newDuration;
        
        emit BattleDurationUpdated(previousDuration, newDuration);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get comprehensive information about the current active battle
     * @return BattleStructs.BattleInfo Complete battle status and configuration
     */
    function getBattleInfo() external view returns (BattleStructs.BattleInfo memory) {
        return BattleStructs.BattleInfo({
            active: battleActive,
            endsAt: battleEndsAt,
            templates: templateCount,
            captions: captionCount,
            totalVotes: totalVoters,
            currentBattleNumber: battleNumber
        });
    }
    
    /**
     * @notice Check if specific user has voted in current battle
     * @param user Address to check voting status for
     * @return bool True if user has already voted in current battle
     */
    function hasUserVoted(address user) external view returns (bool) {
        return _hasVotedInCurrentBattle(user);
    }
    
    /**
     * @notice Get complete battle winner information for current battle
     * @dev Returns winner template, caption, and vote count from battle history.
     * @return templateId Winning template (0-based index)
     * @return captionId Caption from winning template (0 if no caption)
     * @return voteCount Total votes received by winner
     */
    function getBattleWinner() external view returns (uint8 templateId, uint16 captionId, uint32 voteCount) {
        if (!battleHistory[battleNumber].revealed) revert ResultsNotRevealed();
        return (
            battleHistory[battleNumber].winnerTemplateId, 
            battleHistory[battleNumber].winnerCaptionId,
            battleHistory[battleNumber].winnerVotes
        );
    }
    
    
    /**
     * @notice Get complete battle results for specific battle number
     * @param _battleNumber Battle number to query (starts from 1)
     * @return BattleStructs.BattleResults Complete battle data
     */
    function getBattleHistory(uint256 _battleNumber) external view returns (BattleStructs.BattleResults memory) {
        return battleHistory[_battleNumber];
    }
    
    /**
     * @notice Get participant count for specific battle
     * @param _battleNumber Battle number to query (starts from 1)
     * @return uint256 Number of participants in that battle
     */
    function getBattleParticipants(uint256 _battleNumber) external view returns (uint256) {
        return battleParticipants[_battleNumber];
    }
    
    /**
     * @notice Get participant counts for multiple battles in batch
     * @param _battleNumbers Array of battle numbers to query
     * @return uint256[] Array of participant counts in same order as input
     * @dev Optimized for BattleHistory pagination - reduces RPC calls significantly
     */
    function getBattleParticipantsBatch(uint256[] calldata _battleNumbers) external view returns (uint256[] memory) {
        uint256[] memory participants = new uint256[](_battleNumbers.length);
        
        for (uint256 i = 0; i < _battleNumbers.length; i++) {
            participants[i] = battleParticipants[_battleNumbers[i]];
        }
        
        return participants;
    }
    
    /**
     * @notice Get contract deployment configuration and current stats
     * @return BattleStructs.ContractInfo Complete contract information
     */
    function getContractInfo() external view returns (BattleStructs.ContractInfo memory) {
        return BattleStructs.ContractInfo({
            maxTemplates: MAX_TEMPLATES,
            maxCaptions: MAX_CAPTIONS,
            currentTemplates: templateCount,
            currentCaptions: captionCount,
            battleDurationSeconds: battleDuration,
            totalCompletedBattles: completedBattleCount,
            contractOwner: owner,
            operatorAddress: battleOperator
        });
    }
}
