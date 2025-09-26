# EncryptedMemeBattle v3 — Architecture

A privacy-preserving meme battle built on Zama FHEVM. Votes are encrypted end-to-end, the winner is computed homomorphically on-chain, and a single oracle callback decrypts only three final values. Results are written once to on-chain history for simple, reliable reads.

## Components

- contracts/EncryptedMemeBattle.sol — Public interface and oracle callback
- contracts/core/BattleCore.sol — Battle lifecycle, encrypted vote processing, FHE-native winner computation, history writes
- contracts/storage/BattleStorage.sol — All state, including `battleHistory` and `battleParticipants`
- contracts/libraries/FHEVMHelper.sol — FHE helpers and minimal 3-value oracle decoder
- contracts/libraries/BattleStructs.sol — Return and view structs
- contracts/interfaces/* — Events, errors, decryption callback interface

## Data flow

1) Vote (encrypted)
- Users submit encrypted `templateId` and `captionId` plus proofs
- Double-voting prevented; participants counted per battle

2) End battle (FHE compute)
- Winner selection is fully homomorphic: aggregate votes, track current max, and bind caption only for the actual winner
- All intermediate encrypted values are ACL-authorized with `FHE.allowThis`

3) Single oracle decryption
- Contract requests decryption of exactly three handles: `winnerTemplateId`, `winnerCaptionId`, `winnerVotes`
- `templateDecryptionCallback` verifies proofs and writes immutable `battleHistory[targetBattleNumber]` with winner info and `totalParticipants`

4) Read history (plaintext)
- Frontend reads `battleHistory` to render results
- `winnerCaptionId` is mapped to text via `frontend/src/constants/captions.ts`

## Public API (Solidity)

- submitVote(bytes32 encryptedTemplateId, bytes encryptedTemplateProof, bytes32 encryptedCaptionId, bytes encryptedCaptionProof)
- getBattleInfo() → BattleStructs.BattleInfo
- getBattleHistory(uint256 battleNumber) → BattleStructs.BattleResults
- getBattleWinner() → (uint8 winnerTemplateId, uint16 winnerCaptionId, uint32 winnerVotes)
- getBattleParticipants(uint256 battleNumber) → uint256
- getBattleParticipantsBatch(uint256[] battleNumbers) → uint256[]
- setBattleDuration(uint256 newDuration) — owner only
- getContractInfo() → BattleStructs.ContractInfo

## Storage model

- battleHistory[battleNumber] → final results: { winnerTemplateId, winnerCaptionId, winnerVotes, totalParticipants, endTimestamp, revealed }
- battleParticipants[battleNumber] → participant count at the time of battle end
- Current battle state, anti-double-voting tracking, configuration

## FHE logic notes

- Homomorphic primitives: `gt`, `select`, `eq`, `and`
- Intermediate encrypted values must be authorized with `FHE.allowThis`
- Oracle payload: exactly three values; decoded in `FHEVMHelper.decodeWinnerInfo`

## Privacy and gas

- Only final winner data is decrypted (no per-template stats)
- Single callback reduces gas and surface area
- Immutable history avoids duplicate state and expensive recomputation

## Networks

- Zama Devnet: full FHEVM + oracle
- Sepolia: FHEVM-compatible, oracle availability may vary
- Local Hardhat: voting mechanics without oracle decryption
