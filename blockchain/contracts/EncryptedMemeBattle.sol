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
        
        // Decode template vote counts from ABI-encoded cleartexts
        uint32[] memory voteCounts = abi.decode(cleartexts, (uint32[]));
        require(voteCounts.length == templateCount, "Invalid vote count array");
        
        // Determine winning template
        uint8 winner = 0;
        uint32 maxVotes = 0;
        
        for (uint8 i = 0; i < templateCount; i++) {
            if (voteCounts[i] > maxVotes) {
                maxVotes = voteCounts[i];
                winner = i;
            }
        }
        
        // Update current battle results
        currentBattleResults.templateVoteCounts = voteCounts;
        currentBattleResults.winnerTemplateId = winner;
        currentBattleResults.winnerVotes = maxVotes;
        currentBattleResults.battleNumber = targetBattleNumber;
        currentBattleResults.totalParticipants = totalVoters;
        
        // Update historical battle record
        if (battleHistory[targetBattleNumber].endTimestamp > 0) {
            battleHistory[targetBattleNumber].templateVoteCounts = voteCounts;
            battleHistory[targetBattleNumber].winnerTemplateId = winner;
            battleHistory[targetBattleNumber].winnerVotes = maxVotes;
        }
        
        // Request caption decryption for winner
        _selectRandomCaptionFromTemplate(winner, targetBattleNumber);
        
        // Prevent replay attacks
        delete requestIdToBattleNumber[requestId];
        delete decryptionRequests[requestId];
        
        emit TemplateResultsRevealed(winner, voteCounts);
    }
    
    /**
     * @notice FHEVM oracle callback for caption decryption
     * @param requestId Request identifier for replay protection
     * @param cleartexts ABI-encoded decrypted caption ID
     * @param decryptionProof KMS signature for verification
     */
    function captionDecryptionCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external override(IDecryptionCallbacks) {
        // Verify request validity and prevent replay attacks
        require(requestIdToBattleNumber[requestId] > 0, "Invalid request ID");
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);
        
        uint256 targetBattleNumber = requestIdToBattleNumber[requestId];
        
        // Decode caption ID from ABI-encoded cleartexts
        uint16 captionId = abi.decode(cleartexts, (uint16));
        
        // Finalize battle results
        currentBattleResults.winnerCaptionId = captionId;
        currentBattleResults.revealed = true;
        
        // Update historical battle record
        _updateBattleHistoryWithResults(targetBattleNumber, captionId);
        
        // Prevent replay attacks
        delete requestIdToBattleNumber[requestId];
        delete decryptionRequests[requestId];
        
        emit CombinationResultsRevealed(
            currentBattleResults.winnerTemplateId, 
            captionId, 
            currentBattleResults.winnerVotes
        );
    }
    
    // ============ CAPTION SELECTION LOGIC ============
    
    /**
     * @notice Select random caption from captions that voted for the winning template
     * @dev Uses pseudo-random selection from the caption pool of the winning template.
     * 
     * @param winnerTemplateId The winning template ID (highest vote count)
     * @param targetBattleNumber Battle number to select caption from
     */
    function _selectRandomCaptionFromTemplate(uint8 winnerTemplateId, uint256 targetBattleNumber) private {
        euint16[] memory winnerCaptions = templateCaptionVotes[targetBattleNumber][winnerTemplateId];
        
        // Handle no captions case
        if (winnerCaptions.length == 0) {
            currentBattleResults.winnerCaptionId = 0;
            currentBattleResults.revealed = true;
            _updateBattleHistoryWithResults(targetBattleNumber, 0);
            emit CombinationResultsRevealed(winnerTemplateId, 0, currentBattleResults.winnerVotes);
            return;
        }
        
        // Generate pseudo-random index
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            targetBattleNumber,
            winnerTemplateId,
            winnerCaptions.length
        )));
        
        uint256 randomIndex = randomSeed % winnerCaptions.length;
        euint16 selectedCaption = winnerCaptions[randomIndex];
        
        // Request caption decryption
        bytes32[] memory handles = new bytes32[](1);
        handles[0] = euint16.unwrap(selectedCaption);
        
        uint256 requestId = FHE.requestDecryption(handles, IDecryptionCallbacks.captionDecryptionCallback.selector);
        
        requestIdToBattleNumber[requestId] = targetBattleNumber;
        decryptionRequests[requestId] = handles;
        emit DecryptionRequested(requestId, "selected_caption");
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
     * @notice Get decrypted template vote results for current battle
     * @dev Returns results immediately after template oracle decryption completes.
     *      Does not require caption decryption to complete - template results are available first.
     * @return uint32[] Vote counts per template (available after templateDecryptionCallback)
     */
    function getTemplateResults() external view returns (uint32[] memory) {
        // Check if template results are available (decrypted in templateDecryptionCallback)
        if (currentBattleResults.templateVoteCounts.length == 0) revert ResultsNotRevealed();
        return currentBattleResults.templateVoteCounts;
    }
    
    /**
     * @notice Get winning template ID (available immediately after templateDecryptionCallback)
     * @dev Returns winner template as soon as template vote decryption completes.
     *      Does not require caption decryption - provides faster access to core results.
     * @return templateId Winning template (0-based index)
     * @return voteCount Total votes received by winning template  
     */
    function getWinningTemplate() external view returns (uint8 templateId, uint32 voteCount) {
        // Template winner is available after templateDecryptionCallback
        if (currentBattleResults.templateVoteCounts.length == 0) revert ResultsNotRevealed();
        return (currentBattleResults.winnerTemplateId, currentBattleResults.winnerVotes);
    }

    /**
     * @notice Get complete winners (template + caption) - requires full oracle completion
     * @dev Returns both template and caption winners after all oracle callbacks complete.
     *      Use getWinningTemplate() for faster access to template winner only.
     * @return templateId Winning template (0-based index) 
     * @return captionId Randomly selected caption from winning template
     */
    function getWinners() external view returns (uint8 templateId, uint16 captionId) {
        if (!currentBattleResults.revealed) revert ResultsNotRevealed();
        return (currentBattleResults.winnerTemplateId, currentBattleResults.winnerCaptionId);
    }
    
    /**
     * @notice Get battle info including partial results if oracle hasn't completed
     * @dev Enhanced version that provides maximum available information without waiting for oracle.
     *      Combines battle metadata with any available decrypted results.
     * 
     * @return info Extended battle information structure
     * @return hasTemplateResults True if template decryption has completed
     * @return hasFullResults True if full oracle decryption (template + caption) has completed  
     * @return winnerTemplateId Winner template ID (valid if hasTemplateResults=true)
     * @return winnerVotes Winner vote count (valid if hasTemplateResults=true)
     * 
     * Usage:
     * - Frontend can show battle status immediately
     * - Display template results when available (after templateDecryptionCallback)
     * - Display full results when available (after captionDecryptionCallback)
     */
    function getExtendedBattleInfo() external view returns (
        BattleStructs.BattleInfo memory info,
        bool hasTemplateResults,
        bool hasFullResults,
        uint8 winnerTemplateId,
        uint32 winnerVotes
    ) {
        info = BattleStructs.BattleInfo({
            active: battleActive,
            endsAt: battleEndsAt,
            templates: templateCount,
            captions: captionCount,
            totalVotes: totalVoters,
            currentBattleNumber: battleNumber
        });
        
        // Template results available after templateDecryptionCallback
        hasTemplateResults = currentBattleResults.templateVoteCounts.length > 0;
        
        // Full results available after captionDecryptionCallback  
        hasFullResults = currentBattleResults.revealed;
        
        // Winner info (available when template results ready)
        winnerTemplateId = hasTemplateResults ? currentBattleResults.winnerTemplateId : 0;
        winnerVotes = hasTemplateResults ? currentBattleResults.winnerVotes : 0;
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
