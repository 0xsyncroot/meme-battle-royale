# EncryptedMemeBattle v3

```
███████╗███╗   ██╗ ██████╗██████╗ ██╗   ██╗██████╗ ████████╗███████╗██████╗     ███╗   ███╗███████╗███╗   ███╗███████╗
██╔════╝████╗  ██║██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗╚══██╔══╝██╔════╝██╔══██╗    ████╗ ████║██╔════╝████╗ ████║██╔════╝
█████╗  ██╔██╗ ██║██║     ██████╔╝ ╚████╔╝ ██████╔╝   ██║   █████╗  ██║  ██║    ██╔████╔██║█████╗  ██╔████╔██║█████╗  
██╔══╝  ██║╚██╗██║██║     ██╔══██╗  ╚██╔╝  ██╔═══╝    ██║   ██╔══╝  ██║  ██║    ██║╚██╔╝██║██╔══╝  ██║╚██╔╝██║██╔══╝  
███████╗██║ ╚████║╚██████╗██║  ██║   ██║   ██║        ██║   ███████╗██████╔╝    ██║ ╚═╝ ██║███████╗██║ ╚═╝ ██║███████╗
╚══════╝╚═╝  ╚═══╝ ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝        ╚═╝   ╚══════╝╚═════╝     ╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝
██████╗  █████╗ ████████╗████████╗██╗     ███████╗    ███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗
██╔══██╗██╔══██╗╚══██╔══╝╚══██╔══╝██║     ██╔════╝    ██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║
██████╔╝███████║   ██║      ██║   ██║     █████╗      ███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║
██╔══██╗██╔══██║   ██║      ██║   ██║     ██╔══╝      ╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║
██████╔╝██║  ██║   ██║      ██║   ███████╗███████╗    ███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║
╚═════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝╚══════╝    ╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝
🏗️ ENTERPRISE MODULAR ARCHITECTURE | 👨‍💻 CRAFTED BY 0xSyncroot | 🔐 ZAMA FHEVM POWERED
```

Privacy-preserving meme battle smart contract powered by Zama FHEVM. Voters submit encrypted choices; the winner is computed homomorphically on-chain and revealed via a single minimal oracle callback. Battle results are persisted on-chain for simple, reliable reads by the frontend.

## What you get

- Private, encrypted voting (templates and captions)
- FHE-native winner computation (no intermediate plaintext)
- Single oracle callback with 3 decrypted values only: winnerTemplateId, winnerCaptionId, winnerVotes
- Persistent `battleHistory` for simple reads; no redundant view logic
- Participant tracking per battle number
- Minimal, focused public API for frontend integration

## Install and build

Prerequisites: Node.js 18+, npm, Hardhat.

```bash
npm install
npm run compile
npm test
```

Deploy:

```bash
# Local
npm run deploy

# Zama Devnet
npm run deploy:zama

# Sepolia
npm run deploy:sepolia
```

Verify (Sepolia):

```bash
export CONTRACT_ADDRESS=0xYOUR_DEPLOYED_ADDRESS
npx hardhat run scripts/verifyContract.js --network sepolia
```

## Public API (Solidity)

Core functions (irreducible set used by the frontend):

- submitVote(bytes32 encryptedTemplateId, bytes encryptedTemplateProof, bytes32 encryptedCaptionId, bytes encryptedCaptionProof)
- getBattleInfo() → BattleStructs.BattleInfo
- getBattleHistory(uint256 battleNumber) → BattleStructs.BattleResults
- getBattleWinner() → (uint8 winnerTemplateId, uint16 winnerCaptionId, uint32 winnerVotes)
- getBattleParticipants(uint256 battleNumber) → uint256
- getBattleParticipantsBatch(uint256[] battleNumbers) → uint256[]
- setBattleDuration(uint256 newDuration) — owner only
- getContractInfo() → BattleStructs.ContractInfo

## How it works

1) Users submit encrypted template and caption choices. Double voting is prevented.

2) On battle end, the contract computes the winner entirely in FHE (finds max vote count and associated caption). Only three encrypted handles are prepared for decryption.

3) A single oracle callback (`templateDecryptionCallback`) verifies proofs and decodes exactly three plaintext values: winnerTemplateId, winnerCaptionId, winnerVotes. Results are stored in `battleHistory` alongside `totalParticipants` for that battle.

4) The frontend reads the immutable history to display the winner template, the caption (mapped via `frontend/src/constants/captions.ts`), and total participants. No per-template plaintext stats are exposed.

## Design highlights

- Minimal oracle payload (exactly three values)
- FHE-native aggregation and selection (`gt`, `select`, `eq`) with proper ACL (`FHE.allowThis`)
- Immutable `battleHistory`; no duplicated state
- Participant counts tracked per battle for accurate history

## Network notes

- Zama Devnet: full FHEVM + oracle callbacks
- Sepolia: oracle availability may vary
- Local Hardhat: voting mechanics without oracle decryption

## Configure

Environment variables:

```bash
# Deployment keys
PRIVATE_KEY=your_private_key
BATTLE_OPERATOR=operator_address

# RPC endpoints
ZAMA_DEVNET_RPC_URL=https://devnet.zama.ai
SEPOLIA_RPC_URL=your_sepolia_endpoint

# Optional: verification
ETHERSCAN_API_KEY=your_key
CONTRACT_ADDRESS=deployed_contract_address
```

## 🎮 Usage Guide

### Quick usage

```solidity
// Vote (encrypted)
battle.submitVote(encryptedTemplateId, templateProof, encryptedCaptionId, captionProof);

// Live info
BattleStructs.BattleInfo memory info = battle.getBattleInfo();

// Winner (from history)
BattleStructs.BattleResults memory res = battle.getBattleHistory(battleNumber);

// Participants
uint256 p = battle.getBattleParticipants(battleNumber);
```

### Operators

```solidity
battle.endBattle();
bool canEnd = block.timestamp >= battle.battleEndsAt();
```

### Owners

```solidity
battle.setBattleOperator(newOperatorAddress);
battle.setBattleDuration(newDurationInSeconds);
BattleStructs.ContractInfo memory cfg = battle.getContractInfo();
```

## 🧪 Testing

### Test Coverage
- ✅ **24/24 tests passing** - Full coverage
- ✅ **Deployment validation** - Constructor parameter testing
- ✅ **Vote submission** - Encrypted voting mechanics  
- ✅ **Battle lifecycle** - Start/end battle flow
- ✅ **Access control** - Owner/operator permissions
- ✅ **View functions** - Data retrieval testing
- ✅ **FHEVM integration** - Mock encryption testing

### Run Specific Tests
```bash
# All tests
npm test

# Specific test patterns
npx hardhat test --grep "Deployment"
npx hardhat test --grep "Vote Submission"
npx hardhat test --grep "Battle Lifecycle"
```

## 🔧 Development Tools

### Available Scripts
```bash
npm run compile       # Compile contracts
npm test             # Run test suite  
npm run deploy       # Deploy locally
npm run deploy:zama  # Deploy to Zama Devnet
npm run deploy:sepolia # Deploy to Sepolia
npm run check-balance # Check account balance
npm run check-state  # Check battle state
npm run worker       # Run battle worker
npm run clean        # Clean build artifacts
```

### Environment Variables
```bash
# Required for deployment
PRIVATE_KEY=your_private_key
BATTLE_OPERATOR=operator_address

# Network endpoints
ZAMA_DEVNET_RPC_URL=https://devnet.zama.ai
SEPOLIA_RPC_URL=your_sepolia_endpoint

# Contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Contract interaction
CONTRACT_ADDRESS=deployed_contract_address
```

## Contract stats

| Metric | Value |
|--------|-------|
| Architecture | Modular (core, storage, libraries, interfaces) |
| Oracle payload | 3 values (templateId, captionId, votes) |
| Gas strategy | FHE-native compute, minimal writes |
| History | Immutable per-battle results |
| Participants | Per-battle tracking |
| Compatibility | FHEVM-ready (Devnet, Sepolia) |

## Notes

- No per-template plaintext statistics are exposed. The only decrypted values are the final winner template, caption, and vote count.
- Frontend maps `winnerCaptionId` to human-readable text via `frontend/src/constants/captions.ts`.

## License

MIT