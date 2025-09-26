# EncryptedMemeBattle Frontend

Privacy-preserving meme battle interface built with Next.js 15 and Zama FHEVM. Users submit encrypted votes; results are revealed via oracle decryption and displayed from immutable on-chain history.

## What it does

- **🔐 Private voting**: Template and caption choices encrypted client-side before submission
- **⚡ Real-time battles**: Live countdown and participant tracking without revealing individual votes
- **🏆 Oracle results**: Winner revealed after homomorphic computation and minimal oracle decryption
- **📊 Battle history**: Browse past winners with captions mapped from `constants/captions.ts`
- **💫 Smooth UX**: Progressive loading states and shimmer animations

## Install and run

Prerequisites: Node.js 18+, pnpm.

```bash
pnpm install
cp .env.local.example .env.local
# Configure .env.local (see below)
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configure

Create `.env.local`:

```bash
# Privy wallet integration (required)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Contract address (required)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x25B6524832E9Cf63D968b305205f1f49e4802f56

# RPC endpoints
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
NEXT_PUBLIC_ZAMA_DEVNET_RPC_URL=https://devnet.zama.ai
```

### Privy setup

1. Go to [Privy Dashboard](https://dashboard.privy.io)
2. Create app, copy App ID to `NEXT_PUBLIC_PRIVY_APP_ID`
3. Configure allowed domains

## User flow

1. **Connect wallet** → Privy handles MetaMask, Coinbase Wallet, etc.
2. **Vote** → Select template + caption; both encrypted client-side and submitted
3. **Live battle** → Real-time countdown, participant count, privacy-preserving progress
4. **Results** → Oracle decrypts winner info; frontend maps `winnerCaptionId` to readable text
5. **History** → Browse past battles from immutable `battleHistory`

## Key components

- `page.tsx` — Main app with tab routing (lobby/submit/battle/results/history)
- `SubmissionForm.tsx` — Template/caption selection and encrypted vote submission
- `LiveBattle.tsx` — Real-time battle progress and participant count
- `Results.tsx` — Winner display with caption mapping from `constants/captions.ts`
- `BattleHistory.tsx` — Historical battles with winner info and participant stats
- `useContract.ts` — Smart contract integration (minimal API: getBattleInfo, submitVote, getBattleHistory, getBattleParticipants)
- `TabRouter.tsx` — URL-based tab persistence

## Architecture notes

- **Minimal contract API**: Only essential functions exposed (getBattleWinner, getBattleHistory, getBattleParticipants)
- **Single oracle callback**: Contract decrypts exactly 3 values (templateId, captionId, votes)
- **Immutable history**: `battleHistory[battleNumber]` written once, read many times
- **Caption mapping**: `winnerCaptionId` mapped to text via `constants/captions.ts` (100 predefined captions)
- **Participant tracking**: Real-time count per battle without revealing votes
- **URL routing**: Tab state persisted in URL for F5 refresh

## Privacy model

- All votes encrypted using FHEVM before leaving the browser
- Winner computed homomorphically on-chain (no intermediate plaintext)
- Only final winner data decrypted (no per-template statistics exposed)
- Individual vote choices never revealed

## Networks

- **Sepolia**: Primary network with FHEVM support
- **Zama Devnet**: Alternative testing network
- **Local Hardhat**: Development (no oracle decryption)

## Build and deploy

```bash
pnpm run build    # Production build
pnpm run start    # Production server
pnpm run lint     # Code quality
```

Deploy to Vercel: connect GitHub repo, set environment variables, auto-deploy on push.

## Troubleshooting

**FHEVM initialization failed**
- Check contract address and RPC URL
- Verify wallet connected to correct network
- Clear browser cache/localStorage

**Vote submission failed**
- Ensure sufficient ETH for gas
- Check battle is active
- Verify not already voted in current battle

**Results not loading**
- Battle may not be completed yet
- Oracle decryption in progress (check loading states)
- Try refreshing after battle ends

## Tech stack

- Next.js 15 (App Router)
- React 19
- TypeScript (strict mode)
- TailwindCSS
- Privy (wallet auth)
- Zama FHEVM SDK

**Built with ❤️ for privacy-preserving Web3 by 0xSyncroot**

*Meme Battle Royale - Where Privacy Meets Fun in Decentralized Meme Battles*