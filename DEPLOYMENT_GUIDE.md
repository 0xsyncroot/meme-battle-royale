# 🚀 Deployment & Verification Guide

## Smart Contract Deployment

### Prerequisites

1. **Environment Setup**
```bash
cd blockchain/
cp .env.example .env
```

2. **Required Environment Variables**
```env
# Wallet Configuration
PRIVATE_KEY=your_private_key_without_0x_prefix
BATTLE_OPERATOR=operator_address_for_automation

# Network RPC URLs  
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ZAMA_DEVNET_RPC_URL=https://devnet.zama.ai

# Etherscan API Key for Contract Verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Deployment Steps

#### 1. **Sepolia Testnet Deployment**

```bash
# Deploy contract
npm run deploy:sepolia

# Check deployment
npm run check-balance:sepolia
```

#### 2. **Zama Devnet Deployment**

```bash  
# Deploy contract (Full FHEVM support)
npm run deploy:zama

# Check deployment
npm run check-balance:zama
```

#### 3. **Local Development**

```bash
# Start local node
npm run node

# Deploy locally (separate terminal)
npm run deploy
```

## 📋 Contract Verification

### Sepolia Testnet Verification

#### Method 1: Automatic Verification Script

```bash
# 1. Set contract address in environment
export CONTRACT_ADDRESS=0x_YOUR_DEPLOYED_CONTRACT_ADDRESS

# 2. Run verification script
npx hardhat run scripts/verifyContract.js --network sepolia
```

#### Method 2: Manual Verification Command

```bash
# Replace with your actual deployed address and constructor parameters
npx hardhat verify --network sepolia \
  0xYOUR_CONTRACT_ADDRESS \
  5 \
  100 \
  300 \
  0xYOUR_BATTLE_OPERATOR_ADDRESS
```

#### Method 3: Etherscan Web Interface

1. **Go to Etherscan Sepolia**
   - Visit: https://sepolia.etherscan.io/
   - Search for your contract address

2. **Navigate to Contract Tab**
   - Click "Contract" tab
   - Click "Verify and Publish"

3. **Fill Verification Form**
   ```
   Contract Address: 0xYOUR_DEPLOYED_ADDRESS
   Compiler Type: Solidity (Single file)
   Compiler Version: v0.8.24+commit.e11b9ed9
   Open Source License: MIT
   ```

4. **Upload Contract Code**
   - Copy the flattened contract code
   - Use: `npx hardhat flatten contracts/EncryptedMemeBattle.sol`

5. **Constructor Arguments (ABI-encoded)**
   ```
   Template Count: 5 (uint8)
   Caption Count: 100 (uint16) 
   Battle Duration: 300 (uint256) - seconds
   Battle Operator: 0xYOUR_OPERATOR_ADDRESS (address)
   ```

### Zama Devnet Verification

**Note**: Zama Devnet uses a custom block explorer. Contract source code verification follows a different process:

1. **Zama Block Explorer**
   - Visit: https://devnet.zama.ai
   - Manual verification required through Zama's process

2. **Alternative: GitHub Repository**
   - Link your contract to this repository
   - Include deployment transaction hash
   - Provide constructor parameters in README

## 🔍 Verification Troubleshooting

### Common Issues

#### 1. **"Already Verified" Error**
```
Solution: Contract is already verified, check Etherscan
```

#### 2. **Constructor Parameter Mismatch**
```bash
# Get constructor args from deployment transaction
npx hardhat run scripts/getConstructorArgs.js --network sepolia
```

#### 3. **Compiler Version Mismatch**
```
Ensure Hardhat config matches:
- Solidity version: 0.8.24
- Optimizer enabled: true  
- Optimizer runs: 200
```

#### 4. **API Key Issues**
```bash
# Test your Etherscan API key
curl "https://api-sepolia.etherscan.io/api?module=account&action=balance&address=0x0000000000000000000000000000000000000000&tag=latest&apikey=YOUR_API_KEY"
```

### Verification Status Check

```bash
# Check if contract is verified
npx hardhat run scripts/checkVerification.js --network sepolia
```

## 📊 Post-Deployment Actions

### 1. **Contract Interaction Testing**

```bash
# Check battle state
npm run check-state

# Start automated worker
npm run worker
```

### 2. **Frontend Configuration**

Update frontend environment variables:
```env
# frontend/.env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_VERIFIED_CONTRACT_ADDRESS
NEXT_PUBLIC_NETWORK_NAME=sepolia
```

### 3. **Battle Operator Setup**

For automated battle management:
```bash
# Configure battle operator in worker
export BATTLE_OPERATOR_PRIVATE_KEY=operator_private_key
export CONTRACT_ADDRESS=verified_contract_address

# Start automated battle worker
npm run worker
```

## 🌐 Network-Specific Notes

### Sepolia Testnet
- **Full Etherscan support** with source code verification
- **FHEVM support** with oracle callbacks
- **Test ETH** required from faucets
- **Gas limits** may need adjustment for FHEVM operations

### Zama Devnet  
- **Custom block explorer** with different verification process
- **Full FHEVM support** with reliable oracle network
- **Native test tokens** available
- **Optimal performance** for FHEVM operations

### Local Development
- **No verification** needed for local testing
- **Mock FHEVM** functionality for development
- **Fast iteration** without network delays
- **Full debugging** capabilities with Hardhat

## 📚 Additional Resources

- **Hardhat Documentation**: https://hardhat.org/docs
- **Etherscan API**: https://docs.etherscan.io/
- **Zama FHEVM Docs**: https://docs.zama.ai/fhevm  
- **Contract Source**: https://github.com/your-repo/meme-battle-royale

---

**Built by 0xSyncroot - Enterprise Smart Contract Architecture**
