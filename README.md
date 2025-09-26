# Meme Battle Royale

A next-generation privacy-preserving meme battle platform powered by **Zama's FHEVM** (Fully Homomorphic Encryption Virtual Machine).

**Created by 0xSyncroot**

## 🎯 Overview

This DApp demonstrates cutting-edge **confidential smart contracts** where:
- **🔐 Votes are encrypted** and counted homomorphically on-chain using FHEVM
- **💬 Captions remain private** until users choose to reveal them
- **⚡ Real-time battles** with privacy-preserving leaderboards
- **🏆 Oracle decryption** reveals results only after battle completion
- **🔄 Automatic progression** - new battles start immediately after completion

### 🚀 Live Deployment

**Contract Address (Sepolia):** [`0x2C7d3c0921BcC6410aeB0d81B670B4cB51518b00`](https://sepolia.etherscan.io/address/0x2C7d3c0921BcC6410aeB0d81B670B4cB51518b00)

- **✅ Verified Source Code** - Full transparency with open-source verification
- **🔐 FHEVM Compatible** - Privacy-preserving encryption on Ethereum Sepolia
- **⚡ Production Ready** - Battle-tested smart contract architecture
- **🛡️ Enterprise Grade** - Modular design with comprehensive testing

## 🏗️ Project Architecture

```
zama-meme-battle/
├── blockchain/                 # FHEVM Smart Contracts (v3.0.0)
│   ├── contracts/
│   │   ├── EncryptedMemeBattle.sol         # 🎯 Main contract (481 lines)
│   │   ├── core/
│   │   │   └── BattleCore.sol              # ⚙️ Core battle logic (305 lines)
│   │   ├── storage/
│   │   │   └── BattleStorage.sol           # 💾 Storage management (150+ lines)
│   │   ├── libraries/
│   │   │   ├── BattleStructs.sol           # 📊 Data structures (146 lines)
│   │   │   └── FHEVMHelper.sol             # 🔧 FHEVM utilities (199 lines)
│   │   └── interfaces/
│   │       ├── IBattleEvents.sol           # 📢 Event definitions (50+ lines)
│   │       └── IBattleErrors.sol           # ❌ Custom errors (30+ lines)
│   ├── scripts/
│   │   ├── deployEncryptedMemeBattle.js    # 🚀 Production deployment
│   │   └── checkBattleState.js             # 📊 State monitoring
│   ├── test/                               # Contract test suite
│   ├── hardhat.config.js                  # Network configuration
│   └── env.example                         # Environment template
├── frontend/                   # Next.js 15 DApp Interface
│   ├── src/
│   │   ├── app/                           # App Router (Next.js 15)
│   │   ├── components/
│   │   │   ├── features/                  # Battle components
│   │   │   │   ├── MemeTemplateGrid.tsx   # Template selection (12 memes)
│   │   │   │   ├── SubmissionForm.tsx     # Encrypted voting
│   │   │   │   ├── LiveBattle.tsx         # Real-time progress
│   │   │   │   ├── Results.tsx            # Oracle decryption results
│   │   │   │   ├── BattleHistory.tsx      # Historical battles
│   │   │   │   └── WalletConnect.tsx      # Privy integration
│   │   │   ├── layout/                    # Navigation & layout
│   │   │   └── ui/                        # Reusable components
│   │   ├── hooks/
│   │   │   ├── useContract.ts             # Smart contract integration
│   │   │   ├── useFHEVM.ts               # FHEVM encryption management
│   │   │   └── useConnectionError.ts      # Error handling
│   │   ├── lib/
│   │   │   ├── fhevm/                    # FHEVM SDK integration
│   │   │   └── contract/                 # Contract utilities
│   │   ├── constants/                    # Network configs & addresses
│   │   └── types/                        # TypeScript definitions
│   ├── package.json                      # Dependencies (Next.js 15, React 19)
│   └── env.local.example                 # Environment template
├── worker/                     # Battle Automation Worker
│   ├── index.js                          # Node-cron worker
│   ├── package.json                      # Dependencies
│   └── env.example                       # Configuration template
├── setup.sh                   # 🚀 Automated setup script
└── package.json               # Workspace configuration
```

**Total: 1,481+ lines of smart contract code across 7 modular files**

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (Required)
- **pnpm** (Recommended) or npm
- **MetaMask** or compatible Web3 wallet
- **Git** for cloning

### 1. Automated Setup (Recommended)

```bash
# Clone repository
git clone <repository-url>
cd zama-meme-battle

# Run automated setup
chmod +x setup.sh
./setup.sh
```

The setup script will:
- ✅ Check Node.js version (18+)
- ✅ Install pnpm if needed
- ✅ Install all dependencies (blockchain, frontend, worker)
- ✅ Compile smart contracts
- ✅ Create environment files from examples
- ✅ Build frontend for production

### 2. Manual Setup (Alternative)

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all

# Compile contracts
cd blockchain && npm run compile

# Build frontend  
cd ../frontend && pnpm run build
```

### 3. Environment Configuration

#### Blockchain Configuration (`blockchain/.env`)

```bash
cd blockchain
cp env.example .env
```

Edit `blockchain/.env`:
```env
# Ethereum Sepolia (RECOMMENDED - Full FHEVM support)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
SEPOLIA_CHAIN_ID=11155111

# Zama Devnet (Alternative FHEVM network) 
ZAMA_DEVNET_RPC_URL=https://devnet.zama.ai
ZAMA_DEVNET_CHAIN_ID=8009

# Deployment private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here
```

#### Frontend Configuration (`frontend/.env.local`)

```bash
cd frontend
cp env.local.example .env.local
```

Edit `frontend/.env.local`:
```env
# Privy Wallet Integration (Required)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# Deployed Contract Address (Update after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address_here

# Network RPC URLs (Use same as blockchain config)
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
NEXT_PUBLIC_ZAMA_DEVNET_RPC_URL=https://devnet.zama.ai
```

### 4. Get Required API Keys

#### Infura RPC (Recommended)
1. Go to [Infura Dashboard](https://infura.io/dashboard)
2. Create new project → Web3 API
3. Copy **Project ID** for Sepolia RPC URL

#### Privy App ID (Required)
1. Go to [Privy Dashboard](https://dashboard.privy.io)
2. Create new application
3. Copy **App ID** to frontend config
4. Configure allowed domains and wallet settings

### 5. Deploy Smart Contracts

#### Option A: Deploy to Sepolia (Production Ready)

```bash
cd blockchain

# Check your balance first
npm run check-balance:sepolia

# Deploy with specific battle operator (optional)
BATTLE_OPERATOR=0x_worker_address_here npm run deploy:sepolia

# Deploy with default settings (deployer as operator)
npm run deploy:sepolia
```

**Sample successful deployment:**
```
🎭 Deploying EncryptedMemeBattle v3.0.0 by 0xSyncroot
════════════════════════════════════════════════════════════════
📍 Network: sepolia (Chain ID: 11155111)
👤 Deployer: 0x3840...Ee5
💰 Balance: 0.05 ETH
✅ FHEVM-compatible network detected: sepolia

⚙️  Battle Configuration:
📊 Template Count: 5
💬 Caption Count: 100
⏰ Battle Duration: 300 seconds (5 minutes)
🤖 Battle Operator: 0x3840...Ee5

🚀 Deploying EncryptedMemeBattle...
✅ EncryptedMemeBattle deployed at: 0x2C7d3c0921BcC6410aeB0d81B670B4cB51518b00
🎉 Deployment successful!
```

**🔗 Live Contract:** [View on Etherscan](https://sepolia.etherscan.io/address/0x2C7d3c0921BcC6410aeB0d81B670B4cB51518b00)

#### Option B: Local Development

```bash
# Terminal 1: Start local Hardhat node
cd blockchain
npm run node

# Terminal 2: Deploy contracts
npm run deploy:localhost  
```

### 6. Update Frontend Contract Address

After successful deployment, update `frontend/.env.local`:
```env
# Use the live deployed contract address or deploy your own
NEXT_PUBLIC_CONTRACT_ADDRESS=0x46d1b172B48f9870E4aB24C146B303e180Cb1504
```

**Note:** You can use the live deployed contract above for testing, or deploy your own instance following the deployment steps.

### 7. Start the DApp

```bash
# Start frontend development server
cd frontend
pnpm run dev

# Visit http://localhost:3000
```

**🎉 Your Meme Battle Royale DApp is now running!**

## 🔧 Advanced Configuration

### Worker Automation (Optional)

For automated battle management, configure the worker:

```bash
cd worker
cp env.example .env
```

Edit `worker/.env`:
```env
# Contract configuration
CONTRACT_ADDRESS=0x_your_deployed_contract_address
RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
CHAIN_ID=11155111

# Worker private key (different from deployer for security)
PRIVATE_KEY=worker_private_key_here

# Battle automation settings
CHECK_INTERVAL_MINUTES=1
AUTO_START_BATTLES=true
```

Start worker:
```bash
npm run start
```

### Supported Networks

| Network | Chain ID | FHEVM Support | RPC URL | Purpose |
|---------|----------|---------------|---------|---------|
| **Sepolia** | 11155111 | ✅ **Full** | `https://sepolia.infura.io/v3/PROJECT_ID` | **Production** |
| **Zama Devnet** | 8009 | ✅ **Full** | `https://devnet.zama.ai` | **Testing** |
| **Localhost** | 31337 | ⚠️ **Limited** | `http://127.0.0.1:8545` | **Development** |

## 🎮 User Experience Flow

### 1. **Landing & Connection**
- 👛 Connect wallet via Privy (MetaMask, Coinbase Wallet, etc.)
- 🔄 Automatic FHEVM initialization
- 📊 View current battle status and countdown

### 2. **Battle Participation**
- 🎨 Select from **12 meme templates** in interactive grid
- 💬 Choose caption from **categorized options** (meme/emoji/reaction)
- 🔐 **Client-side encryption** using FHEVM before submission
- 📝 Submit encrypted vote with cryptographic proofs

### 3. **Live Battle Monitoring** 
- ⏰ Real-time countdown timer with battle number
- 📊 **Privacy-preserving progress** (no individual votes revealed)
- 🔒 Encrypted vote aggregation happening on-chain
- 🎯 Battle status updates (Active → Processing → Completed)

### 4. **Results & History**
- 🏆 **Oracle decryption** reveals winners after battle completion  
- 📈 Vote counts and winning combinations displayed
- 🔗 **Transaction links** to Etherscan for verification
- 📚 **Battle history** with pagination and statistics

## 🔐 Privacy & Encryption Features

### FHEVM Integration Details

```typescript
// 1. Client-side encryption before submission
const encryptedTemplate = await encryptVote(selectedTemplate, CONTRACT_ADDRESS);
const encryptedCaption = await encryptCaptionText(selectedCaption.id, CONTRACT_ADDRESS);

// 2. Submit with cryptographic proofs
await submitVote(
  encryptedTemplate.encryptedData,
  encryptedTemplate.proof,
  encryptedCaption.encryptedData,
  encryptedCaption.proof
);

// 3. Homomorphic aggregation on-chain (happens automatically)
// Vote counts computed on encrypted data without revealing individual votes

// 4. Oracle decryption (triggered automatically after battle ends)
// Results revealed through Zama's oracle network
```

### Security Features
- 🔐 **Client-side encryption** using `fhevmjs` SDK
- 🛡️ **Cryptographic proofs** for input validation  
- 🔒 **ACL permissions** for encrypted data access
- 🚫 **Anti-double-voting** protection
- ⏰ **Timeout protection** for all blockchain operations
- 🔄 **MEV-resistant** design through encrypted computation

## 🛠️ Development Commands

### Root Level Scripts
```bash
npm run setup                 # Run setup script
npm run install:all          # Install all workspace dependencies
npm run build:all            # Build all components
npm run deploy:sepolia       # Deploy contracts to Sepolia
npm run start:frontend       # Start frontend dev server
npm run start:worker         # Start worker automation
npm run test:contracts       # Run contract tests
npm run clean               # Clean all build artifacts
```

### Blockchain Commands
```bash
cd blockchain

# Development
npm run compile             # Compile smart contracts
npm run test               # Run comprehensive test suite
npm run clean              # Clean build artifacts

# Deployment
npm run deploy:sepolia     # Deploy to Sepolia testnet
npm run deploy:zama        # Deploy to Zama Devnet
npm run deploy:localhost   # Deploy to local network
npm run node              # Start local Hardhat node

# Monitoring
npm run check-balance      # Check deployer balance
npm run check-state       # Monitor battle state
```

### Frontend Commands
```bash
cd frontend

# Development  
pnpm run dev              # Start development server
pnpm run build            # Build for production
pnpm run start            # Start production server
pnpm run lint             # Run ESLint checks
pnpm run type-check       # TypeScript validation
```

### Worker Commands
```bash
cd worker

npm run start             # Start battle automation worker
npm run dev               # Same as start (no dev mode needed)
```

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. **FHEVM Initialization Failed**
```bash
# Symptoms: "FHEVM initialization failed" error
✅ Solution:
- Verify you're connected to Sepolia (Chain ID: 11155111) or Zama Devnet (8009)
- Check contract address matches deployed contract
- Ensure RPC URL is accessible: curl -X POST https://sepolia.infura.io/v3/YOUR_ID
- Clear browser cache and localStorage
```

#### 2. **Contract Deployment Fails** 
```bash
# Symptoms: Deployment script fails or runs out of gas
✅ Solution:
- Check private key format (no 0x prefix)
- Verify sufficient testnet ETH: npm run check-balance:sepolia
- Get Sepolia ETH from faucets: https://sepoliafaucet.com
- Check RPC URL connectivity
```

#### 3. **Wallet Connection Issues**
```bash
# Symptoms: Cannot connect wallet or wrong network
✅ Solution:
- Verify Privy App ID in frontend/.env.local
- Check allowed domains in Privy dashboard
- Ensure MetaMask is connected to Sepolia network
- Try different browser or incognito mode
```

#### 4. **Build Errors**
```bash
# Symptoms: npm install or build failures
✅ Solution:
- Verify Node.js version: node -v (must be 18+)
- Clear node_modules: rm -rf node_modules && npm install
- Check pnpm version: pnpm -v
- Use exact versions from package.json
```

#### 5. **Transaction Failures**
```bash
# Symptoms: Vote submission fails or reverts
✅ Solution:
- Check user hasn't already voted in current battle
- Verify battle is currently active (not expired)
- Ensure sufficient ETH for gas fees
- Check network congestion and gas prices
```

### Debug Commands

```bash
# Check contract deployment status
cd blockchain && npm run check-state

# Verify frontend build
cd frontend && pnpm run build

# Test network connectivity  
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Monitor battle status
cd blockchain && npm run check-state

# Check account balance
cd blockchain && npm run check-balance:sepolia
```

## 🚀 Production Deployment

### 1. Contract Deployment
```bash
# Set worker address for automated battle management (optional)
BATTLE_OPERATOR=0x_worker_address npm run deploy:sepolia

# Or deploy with deployer as operator
npm run deploy:sepolia
```

### 2. Frontend Deployment (Vercel)
```bash
# Connect GitHub repo to Vercel
# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_PRIVY_APP_ID
# - NEXT_PUBLIC_CONTRACT_ADDRESS  
# - NEXT_PUBLIC_SEPOLIA_RPC_URL

# Deploy automatically on push to main
```

### 3. Worker Deployment (Optional)
```bash
# Deploy to cloud provider (Railway, Heroku, etc.)
# Or run locally with pm2:
npm install -g pm2
cd worker && pm2 start index.js --name "meme-battle-worker"
```

## 📚 Technical Resources

### Zama FHEVM Documentation
- [FHEVM Overview](https://docs.zama.ai/fhevm) - Core concepts and capabilities
- [fhevmjs SDK](https://docs.zama.ai/fhevm/integrations/js_client) - Client-side encryption
- [Solidity Library](https://docs.zama.ai/fhevm/solidity/getting-started) - Smart contract development

### Development Resources
- [Hardhat Documentation](https://hardhat.org/docs) - Smart contract development
- [Next.js 15 Documentation](https://nextjs.org/docs) - Frontend framework
- [Privy Documentation](https://docs.privy.io) - Wallet authentication
- [TailwindCSS](https://tailwindcss.com/docs) - Styling framework

## 🤝 Contributing

1. **Fork the repository** on GitHub
2. **Create feature branch**: `git checkout -b feature/amazing-feature`  
3. **Make changes** with proper TypeScript types and tests
4. **Test thoroughly**: `npm run test:contracts` and `pnpm run build`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open Pull Request** with detailed description

### Development Guidelines
- Follow TypeScript strict mode
- Add JSDoc documentation for functions
- Include tests for new features
- Maintain consistent code formatting
- Update documentation for API changes

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **0xSyncroot** - Project architect and lead developer
- **Zama Team** - For pioneering FHEVM technology and cryptographic innovations
- **Ethereum Community** - For the robust development ecosystem and standards
- **Open Source Contributors** - For the amazing tools and libraries that make this possible

---

**🔐 Built with Zama FHEVM - The Future of Privacy-Preserving Smart Contracts 🚀**

*Meme Battle Royale: Where Privacy Meets Fun in Decentralized Battles*