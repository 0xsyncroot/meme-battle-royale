import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '@/constants';

// EncryptedMemeBattleRoyale Contract ABI
export const CONTRACT_ABI = [
  // Main functions
  "function submitVote(bytes32 encryptedTemplateId, bytes calldata templateProof, bytes32 encryptedCaptionId, bytes calldata captionProof) external",
  "function endBattle() external",
  "function requestTemplateResultsDecryption() external returns (uint256 requestId)",
  "function requestBattleResultsDecryption(uint256 battleNum) external returns (uint256 requestId)",
  
  // View functions
  "function getBattleInfo() external view returns (bool active, uint256 endsAt, uint8 templates, uint16 captions, uint256 totalVotes, uint256 currentBattleNumber)",
  "function hasUserVoted(address user) external view returns (bool)",
  "function getTemplateResults() external view returns (uint32[] memory)",
  "function getWinners() external view returns (uint8 templateId, uint16 captionId)",
  "function getContractInfo() external view returns (uint8 maxTemplates, uint16 maxCaptions, uint8 currentTemplates, uint16 currentCaptions, uint256 battleDurationSeconds, uint256 totalCompletedBattles, address contractOwner, address operatorAddress)",
  
  // Historical battle functions
  "function getBattleHistory(uint256 battleNumber) external view returns (tuple(bool revealed, uint8 winnerTemplateId, uint16 winnerCaptionId, uint32 winnerVotes, uint32[] templateVoteCounts, uint256 battleNumber, uint256 endTimestamp, uint256 totalParticipants))",
  "function getCompletedBattlesRange(uint256 offset, uint256 limit) external view returns (uint256[] memory)",
  "function getCompletedBattleCount() external view returns (uint256)",
  "function getLatestCompletedBattle() external view returns (tuple(bool revealed, uint8 winnerTemplateId, uint16 winnerCaptionId, uint32 winnerVotes, uint32[] templateVoteCounts, uint256 battleNumber, uint256 endTimestamp, uint256 totalParticipants))",
  
  // Events
  "event VoteSubmitted(address indexed voter, uint256 timestamp)",
  "event BattleEnded(uint256 timestamp, uint256 battleNumber)",
  "event BattleStarted(uint256 timestamp, uint256 battleNumber, uint256 endsAt)",
  "event DecryptionRequested(uint256 indexed requestId, string dataType)",
  "event TemplateResultsRevealed(uint8 winnerTemplateId, uint32[] voteCounts)",
  "event CombinationResultsRevealed(uint8 winnerTemplateId, uint16 winnerCaptionId, uint32 winnerVotes)"
];

export function getContract(provider: ethers.Provider) {
  if (!CONTRACT_ADDRESS) {
    throw new Error('CONTRACT_ADDRESS not configured');
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

export function getContractWithSigner(signer: ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}
