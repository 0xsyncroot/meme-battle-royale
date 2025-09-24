# Meme Battle Royale - Frontend

A next-generation privacy-preserving meme battle platform built with Next.js, TailwindCSS, and Zama's FHEVM technology.

**Created by 0xSyncroot**

## 🎯 Features

- **🔐 Privacy-First Voting**: All template and caption votes encrypted client-side using FHEVM
- **👛 Seamless Wallet Integration**: One-click connection with Privy authentication
- **🎨 Modern Responsive UI**: Clean, mobile-first design with TailwindCSS
- **⚡ Real-time Battle Progress**: Live countdown timers and encrypted vote aggregation
- **🏆 Fair Oracle Decryption**: Results revealed only after battle completion via Zama oracle
- **📊 Battle History**: Complete historical battle records with winners and vote counts
- **💫 Smooth UX**: Progressive loading states and shimmer animations
- **🔄 Parallel Encryption**: Optimized concurrent encryption for better performance

## 🏗️ Architecture

### Clean Architecture Structure
```
frontend/src/
├── app/                    # Next.js 13+ App Router
│   ├── favicon.ico         # Favicon configuration
│   ├── globals.css         # Global styles and TailwindCSS
│   ├── layout.tsx          # Root layout with metadata
│   └── page.tsx            # Main application entry
├── components/
│   ├── features/           # Core battle components
│   │   ├── BattleHistory.tsx     # Historical battle viewer
│   │   ├── LiveBattle.tsx        # Active battle progress
│   │   ├── MemeTemplateGrid.tsx  # Template selection interface  
│   │   ├── Results.tsx           # Battle results and decryption
│   │   ├── SubmissionForm.tsx    # Encrypted vote submission
│   │   └── WalletConnect.tsx     # Privy wallet integration
│   ├── layout/             # Layout and navigation
│   │   ├── ContestStatus.tsx     # Battle timing and status
│   │   ├── Footer.tsx            # Footer with FHEVM branding
│   │   ├── Header.tsx            # Main header and branding
│   │   ├── LandingPage.tsx       # Landing page content
│   │   ├── LobbyContent.tsx      # Main lobby interface
│   │   └── NavigationTabs.tsx    # Tab navigation system
│   └── ui/                 # Reusable UI components
│       ├── Button.tsx            # Button variants
│       ├── Card.tsx              # Card containers
│       ├── ConnectionErrorMask.tsx # Error overlay
│       ├── Input.tsx             # Form inputs
│       ├── Select.tsx            # Select dropdowns
│       └── Shimmer.tsx           # Loading animations
├── hooks/                  # Custom React hooks
│   ├── useConnectionError.ts     # Network error handling
│   ├── useContract.ts            # Smart contract integration
│   └── useFHEVM.ts              # FHEVM encryption management
├── lib/                    # Core libraries
│   ├── contract/               # Contract interaction utilities
│   ├── fhevm/                  # FHEVM SDK integration
│   └── utils.ts               # Utility functions
├── types/                  # TypeScript definitions
│   └── index.ts            # Shared type definitions
├── constants/              # Configuration constants
│   └── index.ts            # Network configs, addresses, etc.
└── utils/                  # Helper functions
    └── cn.ts              # Tailwind class merging utility
```

### Key Components

- **MemeTemplateGrid**: Interactive template selection with 12 meme options
- **SubmissionForm**: Encrypted vote submission with parallel encryption optimization
- **LiveBattle**: Real-time battle progress with privacy-preserving aggregation
- **Results**: Oracle decryption results with winner announcements  
- **BattleHistory**: Historical battle viewer with pagination
- **NavigationTabs**: Tab-based navigation (Battle, Results, History)
- **ConnectionErrorMask**: Smart error recovery and retry mechanisms

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

Configure your environment variables:
```env
# Privy Wallet Integration (Required)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# Smart Contract Configuration (Required)  
NEXT_PUBLIC_CONTRACT_ADDRESS=0x25B6524832E9Cf63D968b305205f1f49e4802f56

# Network RPC Configuration
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
NEXT_PUBLIC_ZAMA_DEVNET_RPC_URL=https://devnet.zama.ai
```

### 3. Start Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Privy Wallet Setup

1. Go to [Privy Dashboard](https://dashboard.privy.io)
2. Create a new application
3. Copy your App ID to `NEXT_PUBLIC_PRIVY_APP_ID`
4. Configure allowed domains and wallet settings

### Contract Integration

The application connects to the **EncryptedMemeBattle** contract:
- **Sepolia Address**: `0x25B6524832E9Cf63D968b305205f1f49e4802f56`
- **Supports**: Encrypted voting, oracle decryption, battle management
- **Network**: Ethereum Sepolia (recommended) or Zama Devnet

### Supported Networks

- **Ethereum Sepolia** ✅ Primary network with full FHEVM support
- **Zama Devnet** ✅ Alternative FHEVM testing network

## 🎮 User Flow

### 1. Connect Wallet
- Users connect via Privy (MetaMask, Coinbase Wallet, etc.)
- Automatic network detection and switching
- FHEVM initialization and key management

### 2. Battle Participation  
- Select from 12 meme templates in interactive grid
- Choose caption from categorized options (meme, emoji, reaction)
- Frontend encrypts both selections using FHEVM
- Submit encrypted vote with cryptographic proofs

### 3. Live Battle Monitoring
- Real-time countdown timer with battle number
- Privacy-preserving progress indicators (no individual votes revealed)
- Encrypted vote aggregation happening on-chain
- Battle status updates (Active → Processing → Completed)

### 4. Results & Decryption
- Oracle automatically decrypts results after battle ends
- Winner template and caption revealed with vote counts
- Transaction links to Sepolia Etherscan for verification
- Historical battle records maintained

### 5. Battle History
- Browse previous battle results with pagination
- View winning combinations and participation stats
- Shimmer loading states for smooth UX
- Empty state handling for new deployments

## 🔐 Privacy & Encryption

### FHEVM Integration
```typescript
// Parallel encryption for optimal performance
const [encryptedTemplate, encryptedCaption] = await Promise.all([
  encryptVote(selectedTemplate, CONTRACT_ADDRESS),
  encryptCaptionText(selectedCaption.id, CONTRACT_ADDRESS)
]);

// Submit with timeout protection
const tx = await submitVote(
  encryptedTemplate.encryptedData,
  encryptedTemplate.proof,
  encryptedCaption.encryptedData, 
  encryptedCaption.proof
);
```

### Security Features
- **Client-side encryption** using `@zama-fhe/relayer-sdk`
- **Cryptographic proofs** for input validation
- **ACL permissions** for encrypted data access
- **Timeout protection** for all blockchain operations
- **Parallel encryption** with UI yielding for responsiveness

## 🎨 UI/UX Design

### Design System
- **Privacy-First**: Clear encryption indicators and privacy explanations
- **Responsive**: Mobile-first design with tablet and desktop optimizations  
- **Accessible**: WCAG compliant components with proper focus management
- **Performance**: Shimmer loading, progressive enhancement, parallel operations

### Visual Elements
- 🔒 Encryption status indicators during vote submission
- 📊 Blurred progress visualization during active battles
- ✅ Clear success states with Etherscan transaction links
- 🎯 Intuitive tab navigation between Battle/Results/History
- 💫 Smooth animations with CSS transitions and progress bars

## 📱 Responsive Breakpoints

- **Mobile** (320px-768px): Optimized for touch with stacked layouts
- **Tablet** (768px-1024px): Balanced grid layouts with sidebar navigation  
- **Desktop** (1024px+): Full-featured experience with multi-column layouts

## 🧪 Development

### Available Scripts

```bash
pnpm run dev          # Start development server with hot reload
pnpm run build        # Production build with optimization
pnpm run start        # Start production server
pnpm run lint         # ESLint code quality checks
pnpm run type-check   # TypeScript type validation
```

### Code Quality Standards

- **TypeScript**: Full type safety with strict mode
- **ESLint**: Code linting with React and Next.js rules
- **Prettier**: Automated code formatting via ESLint integration
- **Component Architecture**: Feature-based organization with clear separation

### Performance Optimizations

- **Parallel Encryption**: Template and caption encryption run concurrently
- **Async Scheduling**: Uses `requestIdleCallback` to prevent UI blocking  
- **Progressive Loading**: Shimmer states prevent layout shifts
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Splitting**: Automatic code splitting for optimal loading

## 🚀 Deployment

### Vercel (Recommended)

1. Connect GitHub repository to Vercel dashboard
2. Set environment variables in Vercel project settings
3. Deploy automatically on push to main branch
4. Custom domain configuration available

### Manual Deployment

```bash
pnpm run build
pnpm run start
```

Set `NODE_ENV=production` for production optimizations.

## 🔍 Troubleshooting

### Common Issues

**FHEVM Initialization Failed**
- ✅ Verify contract address matches deployed contract
- ✅ Check RPC URL is accessible and responding
- ✅ Ensure wallet is connected to correct network
- ✅ Clear browser cache and localStorage

**Wallet Connection Issues**  
- ✅ Verify Privy App ID configuration
- ✅ Check wallet browser extension is installed
- ✅ Ensure network is supported (Sepolia/Zama Devnet)
- ✅ Try different browser or incognito mode

**Transaction Failures**
- ✅ Check wallet has sufficient ETH for gas fees
- ✅ Verify battle is currently active
- ✅ Ensure user hasn't already voted in current battle
- ✅ Check network congestion and gas prices

**Encryption Timeouts**
- ✅ Reload page to reinitialize FHEVM
- ✅ Check network connection stability
- ✅ Verify contract is responding to queries

### Performance Issues

**Slow Loading**
- ✅ Check network RPC endpoint performance
- ✅ Verify contract is deployed and functional
- ✅ Clear browser cache and restart

**UI Blocking**
- ✅ Encryption operations use parallel processing
- ✅ Progress indicators show during heavy operations
- ✅ UI yields control during crypto computations

## 📚 Technical Resources

- [Next.js 13+ App Router Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Privy Wallet Authentication](https://docs.privy.io)
- [Zama FHEVM Developer Guide](https://docs.zama.ai/fhevm)
- [React Hooks Best Practices](https://react.dev/reference/react)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper TypeScript types
4. Add tests if applicable
5. Ensure linting passes (`pnpm run lint`)
6. Submit a pull request with clear description

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ for privacy-preserving Web3 by 0xSyncroot**

*Meme Battle Royale - Where Privacy Meets Fun in Decentralized Meme Battles*