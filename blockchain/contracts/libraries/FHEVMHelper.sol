// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";

/**
 * @title FHEVMHelper  
 * @notice Utility library for common FHEVM operations in the Meme Battle system
 * @dev Provides reusable functions for encrypted operations, ACL management,
 *      and privacy-preserving validation patterns used throughout the battle system.
 * @author Zama Meme Battle Team
 */
library FHEVMHelper {
    using FHE for euint32;
    using FHE for euint16;
    using FHE for euint8;
    using FHE for ebool;
    
    // ============ ACL MANAGEMENT FUNCTIONS ============
    
    /**
     * @notice Set up Access Control List permissions for encrypted values
     * @dev Grants both contract and user access to encrypted vote inputs.
     *      Required pattern for FHEVM operations on user-provided encrypted data.
     * 
     * @param templateId Encrypted template choice from user
     * @param captionId Encrypted caption choice from user  
     * @param user Address of the voting user to retain access rights
     * 
     * Effects:
     * - Contract gains permission for homomorphic operations
     * - User retains permission for potential future operations
     * - Enables proper ACL setup for privacy-preserving vote processing
     */
    function setupVoteACL(
        euint8 templateId, 
        euint16 captionId, 
        address user
    ) internal {
        // Grant contract permissions for encrypted operations
        FHE.allowThis(templateId);
        FHE.allowThis(captionId);
        
        // Preserve user access rights to their encrypted inputs
        FHE.allow(templateId, user);
        FHE.allow(captionId, user);
    }
    
    /**
     * @notice Grant contract permission for newly created encrypted values
     * @dev Standard pattern for encrypted values created within contract operations.
     *      Must be called after any FHE operation that produces new encrypted values.
     * 
     * @param encryptedValue The encrypted value needing permission setup
     */
    function allowContractAccess(euint32 encryptedValue) internal {
        FHE.allowThis(encryptedValue);
    }
    
    // ============ PRIVACY-PRESERVING VALIDATION ============
    
    /**
     * @notice Validate encrypted template selection without revealing the choice
     * @dev Uses homomorphic comparison to check if encrypted templateId is valid.
     *      This preserves privacy by never decrypting the user's actual selection.
     * 
     * @param encryptedTemplateId User's encrypted template choice
     * @param maxTemplateCount Maximum valid template index (templateCount)
     * @return ebool Encrypted boolean indicating validity (true if valid)
     * 
     * Privacy Features:
     * - Template choice remains encrypted throughout validation
     * - Result is encrypted boolean, not plaintext
     * - Invalid votes can be handled without revealing invalid choices
     */
    function validateTemplateChoice(
        euint8 encryptedTemplateId, 
        uint8 maxTemplateCount
    ) internal returns (ebool) {
        // Encrypted comparison: templateId < templateCount  
        return FHE.lt(encryptedTemplateId, FHE.asEuint8(maxTemplateCount));
    }
    
    /**
     * @notice Check if encrypted template matches a specific index
     * @dev Privacy-preserving equality check for vote tallying loops.
     *      Used to determine which template received a vote without decryption.
     * 
     * @param encryptedTemplateId User's encrypted template choice
     * @param targetTemplateIndex Plain template index to check against (0-based)
     * @return ebool Encrypted boolean indicating match (true if equal)
     * 
     * Usage Pattern:
     * - Loop through all possible template indices (0 to templateCount-1)
     * - For each index, check if user's encrypted choice matches
     * - Increment vote count only for matching template using FHE.select()
     */
    function isTemplateMatch(
        euint8 encryptedTemplateId, 
        uint8 targetTemplateIndex
    ) internal returns (ebool) {
        // Convert plain index to encrypted form for comparison
        return FHE.eq(encryptedTemplateId, FHE.asEuint8(targetTemplateIndex));
    }
    
    // ============ CONDITIONAL LOGIC HELPERS ============
    
    /**
     * @notice Privacy-preserving conditional increment for vote tallying
     * @dev Converts encrypted boolean condition to increment value (0 or 1).
     *      Core pattern for counting votes while preserving privacy of individual choices.
     * 
     * @param condition Encrypted boolean from validation or matching operations
     * @return euint32 Encrypted increment value (1 if condition true, 0 if false)
     * 
     * How it works:
     * - FHE.select() performs encrypted conditional: condition ? 1 : 0
     * - Result can be added to vote counts using FHE.add()
     * - Only matching votes increment counters, others add zero
     */
    function conditionalIncrement(ebool condition) internal returns (euint32) {
        return FHE.select(condition, FHE.asEuint32(1), FHE.asEuint32(0));
    }
    
    /**
     * @notice Combine multiple encrypted boolean conditions with AND logic
     * @dev Privacy-preserving logical AND for complex validation scenarios.
     *      Used when multiple conditions must be true simultaneously.
     * 
     * @param condition1 First encrypted boolean condition
     * @param condition2 Second encrypted boolean condition  
     * @return ebool Encrypted result of condition1 AND condition2
     * 
     * Use Cases:
     * - Valid template AND matching template: FHE.and(validTemplate, isThisTemplate)
     * - Multiple validation checks that must all pass
     * - Complex conditional logic while preserving privacy
     */
    function combineConditions(ebool condition1, ebool condition2) internal returns (ebool) {
        return FHE.and(condition1, condition2);
    }
    
    // ============ ENCRYPTION CONVERSION HELPERS ============
    
    /**
     * @notice Convert external encrypted input to internal FHEVM type with proof verification
     * @dev Standard pattern for processing user-submitted encrypted values.
     *      Validates cryptographic proofs to ensure data integrity.
     * 
     * @param externalEncryptedTemplate Client-side encrypted template value
     * @param templateProof Cryptographic proof for template encryption
     * @return euint8 Internal FHEVM encrypted type ready for operations
     * 
     * Security Features:
     * - Proof verification prevents tampering with encrypted values
     * - Seamless conversion from external to internal encrypted types
     * - Required for all user-provided encrypted inputs
     */
    function convertExternalTemplate(
        externalEuint8 externalEncryptedTemplate,
        bytes calldata templateProof
    ) internal returns (euint8) {
        return FHE.fromExternal(externalEncryptedTemplate, templateProof);
    }
    
    /**
     * @notice Convert external encrypted caption input with proof verification
     * @dev Companion function to convertExternalTemplate for caption processing.
     * 
     * @param externalEncryptedCaption Client-side encrypted caption value
     * @param captionProof Cryptographic proof for caption encryption
     * @return euint16 Internal FHEVM encrypted type ready for operations
     */
    function convertExternalCaption(
        externalEuint16 externalEncryptedCaption,
        bytes calldata captionProof
    ) internal returns (euint16) {
        return FHE.fromExternal(externalEncryptedCaption, captionProof);
    }
    
    // ============ INITIALIZATION HELPERS ============
    
    /**
     * @notice Create encrypted zero value for lazy initialization
     * @dev Standard pattern for initializing encrypted storage on first access.
     *      Avoids expensive zero writes during contract deployment.
     * 
     * @return euint32 Encrypted zero value ready for use in vote counting
     * 
     * Gas Optimization:
     * - Only creates encrypted zeros when actually needed
     * - Prevents upfront initialization costs for unused templates
     * - Essential for efficient encrypted storage management
     */
    function createEncryptedZero() internal returns (euint32) {
        return FHE.asEuint32(0);
    }
    
    // ============ FHEVM ORACLE DECRYPTION HELPERS ============
    
    /**
     * @notice Decode minimal winner information from oracle (3 values only)
     * @dev Ultra-optimized oracle response with only essential winner data.
     *      Vote count statistics handled separately without decryption.
     * @param cleartexts Minimal oracle response with winner info
     * @return winnerTemplateId Winning template index
     * @return winnerCaptionId Caption from winning template  
     * @return maxVotes Maximum vote count achieved
     */
    function decodeWinnerInfo(
        bytes memory cleartexts
    ) internal pure returns (
        uint8 winnerTemplateId,
        uint16 winnerCaptionId,
        uint32 maxVotes
    ) {
        assembly {
            let dataPtr := add(cleartexts, 0x20)
            
            // Extract 3 values from oracle response
            winnerTemplateId := mload(dataPtr)
            winnerCaptionId := mload(add(dataPtr, 0x20))
            maxVotes := mload(add(dataPtr, 0x40))
        }
        
        return (winnerTemplateId, winnerCaptionId, maxVotes);
    }
}
