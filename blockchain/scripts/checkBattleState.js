const { ethers } = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS || "0x25B6524832E9Cf63D968b305205f1f49e4802f56";
  
  console.log("🔍 Checking Battle State...");
  console.log("Contract Address:", contractAddress);
  
  try {
    // Get contract instance using the latest modular architecture
    const EncryptedMemeBattle = await ethers.getContractFactory("EncryptedMemeBattle");
    const contract = EncryptedMemeBattle.attach(contractAddress);
    console.log("✅ Using EncryptedMemeBattle v3.0.0 (Final Architecture by 0xSyncroot)");
    
    // Get battle info
    const battleInfo = await contract.getBattleInfo();
    console.log("\n📊 Battle Info:");
    console.log("- Active:", battleInfo[0]);
    console.log("- Ends At:", new Date(Number(battleInfo[1]) * 1000).toLocaleString());
    console.log("- Template Count:", Number(battleInfo[2]));
    console.log("- Caption Count:", Number(battleInfo[3]));
    console.log("- Total Votes:", Number(battleInfo[4]));
    console.log("- Battle Number:", Number(battleInfo[5]));
    
    // Check current time vs end time
    const currentTime = Math.floor(Date.now() / 1000);
    const endTime = Number(battleInfo[1]);
    const timeLeft = endTime - currentTime;
    
    console.log("\n⏰ Time Info:");
    console.log("- Current Time:", new Date(currentTime * 1000).toLocaleString());
    console.log("- Battle End Time:", new Date(endTime * 1000).toLocaleString());
    console.log("- Time Left:", timeLeft > 0 ? `${Math.floor(timeLeft / 60)} minutes` : "EXPIRED");
    
    // Check battle duration
    const battleDuration = await contract.battleDuration();
    console.log("- Battle Duration:", Number(battleDuration) / 60, "minutes");
    
    // Check completed battles
    const completedCount = await contract.getCompletedBattleCount();
    console.log("\n📈 History:");
    console.log("- Completed Battles:", Number(completedCount));
    
    if (Number(completedCount) > 0) {
      try {
        const latestBattle = await contract.getLatestCompletedBattle();
        console.log("- Latest Completed Battle Number:", Number(latestBattle[6]));
        console.log("- Latest Battle End Time:", new Date(Number(latestBattle[7]) * 1000).toLocaleString());
      } catch (error) {
        console.log("- Could not fetch latest battle (might be empty)");
      }
    }
    
  } catch (error) {
    console.error("❌ Error checking battle state:", error.message);
    
    // Try to get more specific error info
    if (error.message.includes("call revert exception")) {
      console.log("\n🔧 Possible issues:");
      console.log("- Contract might not be deployed at this address");
      console.log("- Network mismatch (check if you're on Sepolia)");
      console.log("- Contract might have different ABI");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
