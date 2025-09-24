# Zama Meme Battle Worker

Simple automated worker to end battles when they expire using node-cron.

## 🚀 Setup

### 1. Configure Environment
```bash
cp env.example .env
```

Edit `.env`:
```bash
CONTRACT_ADDRESS=0x1234...  # Your deployed contract
PRIVATE_KEY=0x5678...       # Battle operator wallet private key
RPC_URL=https://rpc.sepolia.org  # Optional, defaults to Sepolia
CRON_SCHEDULE=*/30 * * * * *     # Optional, defaults to every 30 seconds
```

### 2. Install and Run
```bash
npm install
npm start
```

## ⚙️ How It Works

1. **Connects** to your deployed battle contract
2. **Verifies** worker wallet is authorized as battle operator
3. **Schedules** cron job to check battles (default: every 30 seconds)
4. **Smart Transaction Management:**
   - Tracks pending transactions to avoid duplicates
   - Waits for confirmation before processing next battle
   - Prevents multiple endBattle() calls for same battle
   - Handles nonce conflicts and failed transactions
5. **Automatically ends** expired battles (`block.timestamp >= battleEndsAt`)
6. **Logs** activity and battle statistics

## 🔧 Configuration

### Cron Schedule Examples
- `*/30 * * * * *` - Every 30 seconds (default)
- `0 * * * * *` - Every minute  
- `0 */5 * * * *` - Every 5 minutes
- `0 0 * * * *` - Every hour

### Authorization
Your worker wallet must be set as `battleOperator` in the contract:
```solidity
// Owner calls this to set worker as operator
contract.setBattleOperator("0xYourWorkerAddress")
```

## 🐛 Troubleshooting

### "Worker not authorized"
Make sure your wallet is set as battle operator in the contract.

### "insufficient funds"
Worker wallet needs ETH for gas fees to call `endBattle()`.

### "could not detect network"
Check your `RPC_URL` is correct and accessible.

## 📊 Output Example
```
🤖 Zama Meme Battle Worker Starting...
🔗 Connecting to blockchain...
✅ Connected!
👤 Worker: 0x1234...
📍 Contract: 0x5678...
✅ Worker authorized as battle operator
⏰ Starting cron job: */30 * * * * *
📊 Battle #1: 5 votes, 120s left
📊 Battle #1: 8 votes, 60s left
🏁 Battle expired! Ending...
📤 TX sent: 0xabcd...
⏳ Waiting for transaction confirmation...
⏳ Transaction still pending...
✅ Battle ended successfully! New battle started automatically
🎉 Total battles managed: 1
⏭️  Battle #1 already processed, waiting for new battle...
📊 Battle #2: 0 votes, 299s left
```

That's it! Simple and effective. 🎯