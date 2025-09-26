// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IDecryptionCallbacks
 * @notice Interface for FHEVM oracle decryption callbacks
 * @dev Defines callback functions for Zama FHEVM oracle interactions
 */
interface IDecryptionCallbacks {
    /**
     * @notice Callback for combined template and caption decryption results
     * @param requestId Request identifier for replay protection
     * @param cleartexts ABI-encoded decrypted template vote counts and caption IDs
     * @param decryptionProof KMS signature for verification
     */
    function templateDecryptionCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external;
}
