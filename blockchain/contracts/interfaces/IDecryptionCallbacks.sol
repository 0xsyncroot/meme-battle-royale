// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IDecryptionCallbacks
 * @notice Interface for FHEVM oracle decryption callbacks
 * @dev Defines standard callback functions for Zama FHEVM oracle interactions
 */
interface IDecryptionCallbacks {
    /**
     * @notice Callback for template vote decryption results
     * @param requestId Request identifier for replay protection
     * @param cleartexts ABI-encoded decrypted template vote counts
     * @param decryptionProof KMS signature for verification
     */
    function templateDecryptionCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external;

    /**
     * @notice Callback for caption decryption results
     * @param requestId Request identifier for replay protection
     * @param cleartexts ABI-encoded decrypted caption ID
     * @param decryptionProof KMS signature for verification
     */
    function captionDecryptionCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external;
}
