const { ethers } = require("hardhat");

/**
 * Battle Worker - Automated Battle Management
 * 
 * This script demonstrates how to set up a worker that automatically
 * ends battles when they expire and starts new ones.
 * 
 * Usage:
 * 1. Deploy contract with your worker wallet as BATTLE_OPERATOR
 * 2. Run this script with the deployed contract address
 * 3. Worker will monitor battle status and auto-end expired battles
 */

async function main() {
  console.log("🤖 Starting Battle Worker");
  console.log("========================");

  // Configuration
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  const CHECK_INTERVAL = 10000; // Check every 10 seconds
  
  if (!CONTRACT_ADDRESS) {
    console.error("❌ Please set CONTRACT_ADDRESS environment variable");
    console.log("   Example: CONTRACT_ADDRESS=0x1234... node battleWorker.js");
    process.exit(1);
  }

  const [worker] = await ethers.getSigners();
  console.log("👤 Worker Address:", worker.address);
  console.log("📍 Contract Address:", CONTRACT_ADDRESS);

  // Connect to deployed contract using latest architecture
  const EncryptedMemeBattle = await ethers.getContractFactory("EncryptedMemeBattle");
  const contract = EncryptedMemeBattle.attach(CONTRACT_ADDRESS);

  // Verify worker is authorized
  try {
    const contractInfo = await contract.getContractInfo();
    console.log("🔐 Contract Operator:", contractInfo.operatorAddress);
    console.log("👑 Contract Owner:", contractInfo.contractOwner);
    
    if (contractInfo.operatorAddress.toLowerCase() !== worker.address.toLowerCase()) {
      console.error("❌ Worker is not authorized as battle operator!");
      console.log("   Current operator:", contractInfo.operatorAddress);
      console.log("   Worker address:", worker.address);
      process.exit(1);
    }
    
    console.log("✅ Worker is authorized as battle operator");
  } catch (error) {
    console.error("❌ Failed to verify contract:", error.message);
    process.exit(1);
  }

  console.log("⏰ Starting monitoring loop...");
  console.log(`🔍 Checking battle status every ${CHECK_INTERVAL/1000} seconds`);
  
  // Main monitoring loop
  let battleCount = 0;
  
  while (true) {
    try {
      const battleInfo = await contract.getBattleInfo();
      const currentTime = Math.floor(Date.now() / 1000);
      const battleEndsAt = Number(battleInfo.endsAt);
      
      console.log(`\n📊 Battle #${battleInfo.currentBattleNumber} Status:`);
      console.log("   Active:", battleInfo.active);
      console.log("   Votes:", Number(battleInfo.totalVotes));
      console.log("   Ends at:", new Date(battleEndsAt * 1000).toISOString());
      console.log("   Current:", new Date(currentTime * 1000).toISOString());
      
      if (battleInfo.active && currentTime >= battleEndsAt) {
        console.log("🏁 Battle has expired! Ending battle...");
        
        try {
          const tx = await contract.endBattle();
          console.log("📤 Transaction sent:", tx.hash);
          
          const receipt = await tx.wait();
          console.log("✅ Battle ended successfully!");
          console.log("⛽ Gas used:", Number(receipt.gasUsed));
          
          battleCount++;
          console.log(`🎉 Successfully managed ${battleCount} battles`);
          
          // Wait a bit longer after ending a battle
          console.log("⏳ Waiting for new battle to start...");
          await new Promise(resolve => setTimeout(resolve, 5000));
          
        } catch (error) {
          console.error("❌ Failed to end battle:", error.message);
          
          // If error is about battle still active, someone else ended it
          if (error.message.includes("BattleStillActive") || 
              error.message.includes("NotAuthorized")) {
            console.log("ℹ️  Battle may have been ended by someone else");
          }
        }
      } else if (battleInfo.active) {
        const timeLeft = battleEndsAt - currentTime;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        console.log(`⏱️  Battle ends in: ${minutes}m ${seconds}s`);
      } else {
        console.log("⚠️  Battle is inactive (should not happen)");
      }
      
    } catch (error) {
      console.error("❌ Error checking battle status:", error.message);
    }
    
    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down worker...');
  console.log('👋 Battle worker stopped');
  process.exit(0);
});

main()
  .catch((error) => {
    console.error("❌ Worker failed:", error);
    process.exit(1);
  });
