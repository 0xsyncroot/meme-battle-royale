const { ethers } = require("ethers");
const cron = require("node-cron");
require('dotenv').config();

console.log("🤖 Zama Meme Battle Worker Starting...");

// Configuration
const CONFIG = {
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  RPC_URL: process.env.RPC_URL || "https://rpc.sepolia.org",
  CRON_SCHEDULE: process.env.CRON_SCHEDULE || "*/30 * * * * *", // Every 30 seconds
};

// Validate config
if (!CONFIG.CONTRACT_ADDRESS || !CONFIG.PRIVATE_KEY) {
  console.error("❌ Missing required environment variables:");
  console.log("   CONTRACT_ADDRESS - Deployed battle contract address");
  console.log("   PRIVATE_KEY - Battle operator wallet private key");
  process.exit(1);
}

// Contract ABI - only what we need
const CONTRACT_ABI = [
  "function getBattleInfo() view returns (bool active, uint256 endsAt, uint8 templates, uint16 captions, uint256 totalVotes, uint256 currentBattleNumber)",
  "function getContractInfo() view returns (uint8 maxTemplates, uint16 maxCaptions, uint8 currentTemplates, uint16 currentCaptions, uint256 battleDurationSeconds, uint256 totalCompletedBattles, address contractOwner, address operatorAddress)",
  "function endBattle()"
];

// Initialize blockchain connection
console.log("🔗 Connecting to blockchain...");
const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
const wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

console.log("✅ Connected!");
console.log("👤 Worker:", wallet.address);
console.log("📍 Contract:", CONFIG.CONTRACT_ADDRESS);

// State tracking
let totalBattlesEnded = 0;
let pendingTransaction = null;
let lastProcessedBattle = null;
let processingUntil = null;

// Main worker function
async function checkAndEndBattle() {
  try {
    // Skip if we're still processing a transaction
    if (processingUntil && Date.now() < processingUntil) {
      console.log("⏳ Still processing previous transaction...");
      return;
    }
    
    // Check pending transaction status
    if (pendingTransaction) {
      try {
        const receipt = await provider.getTransactionReceipt(pendingTransaction.hash);
        if (receipt) {
          if (receipt.status === 1) {
            console.log("✅ Battle ended successfully! New battle started automatically");
            totalBattlesEnded++;
            console.log(`🎉 Total battles managed: ${totalBattlesEnded}`);
            
            // Set cooldown period to allow new battle to initialize
            processingUntil = Date.now() + 10000; // 10 second cooldown
          } else {
            console.log("❌ Transaction failed");
          }
          pendingTransaction = null;
          lastProcessedBattle = null;
        } else {
          console.log("⏳ Transaction still pending...");
          return; // Don't check battles while transaction is pending
        }
      } catch (error) {
        console.log("❌ Error checking transaction:", error.message);
        pendingTransaction = null; // Clear failed transaction
      }
    }
    
    const battleInfo = await contract.getBattleInfo();
    const currentTime = Math.floor(Date.now() / 1000);
    const battleEndsAt = Number(battleInfo.endsAt);
    const timeLeft = battleEndsAt - currentTime;
    const battleNumber = Number(battleInfo.currentBattleNumber);
    
    // Skip if we already processed this battle
    if (lastProcessedBattle === battleNumber) {
      console.log(`⏭️  Battle #${battleNumber} already processed, waiting for new battle...`);
      return;
    }
    
    console.log(`📊 Battle #${battleNumber}: ${battleInfo.totalVotes} votes, ${timeLeft > 0 ? `${timeLeft}s left` : `expired ${Math.abs(timeLeft)}s ago`}`);
    
    if (battleInfo.active && currentTime >= battleEndsAt) {
      console.log("🏁 Battle expired! Ending...");
      
      try {
        const tx = await contract.endBattle();
        console.log("📤 TX sent:", tx.hash);
        
        // Track the pending transaction
        pendingTransaction = tx;
        lastProcessedBattle = battleNumber;
        
        console.log("⏳ Waiting for transaction confirmation...");
        
      } catch (txError) {
        if (txError.message.includes("BattleStillActive") || 
            txError.message.includes("battle not active")) {
          console.log("ℹ️  Battle already ended by someone else");
          lastProcessedBattle = battleNumber; // Mark as processed
        } else {
          throw txError;
        }
      }
    }
    
  } catch (error) {
    if (error.message.includes("NotAuthorized")) {
      console.error("❌ Worker not authorized as battle operator!");
    } else if (error.message.includes("nonce too low")) {
      console.log("⚠️  Nonce conflict, clearing pending transaction");
      pendingTransaction = null;
    } else {
      console.error("❌ Error:", error.message);
    }
  }
}

// Verify authorization on startup
async function verifyAuth() {
  try {
    const contractInfo = await contract.getContractInfo();
    if (contractInfo.operatorAddress.toLowerCase() !== wallet.address.toLowerCase()) {
      console.error("❌ Worker not authorized!");
      console.log("   Expected:", contractInfo.operatorAddress);
      console.log("   Got:", wallet.address);
      process.exit(1);
    }
    console.log("✅ Worker authorized as battle operator");
  } catch (error) {
    console.error("❌ Failed to verify authorization:", error.message);
    process.exit(1);
  }
}

// Start worker
async function main() {
  await verifyAuth();
  
  console.log(`⏰ Starting cron job: ${CONFIG.CRON_SCHEDULE}`);
  
  // Schedule the worker
  cron.schedule(CONFIG.CRON_SCHEDULE, checkAndEndBattle);
  
  // Run once immediately
  await checkAndEndBattle();
  
  console.log("🚀 Worker is running! Press Ctrl+C to stop");
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down worker...');
  console.log(`👋 Total battles managed: ${totalBattlesEnded}`);
  
  if (pendingTransaction) {
    console.log(`⏳ Pending transaction: ${pendingTransaction.hash}`);
    console.log("   Check transaction status manually if needed");
  }
  
  process.exit(0);
});

main().catch((error) => {
  console.error("❌ Worker failed:", error.message);
  process.exit(1);
});