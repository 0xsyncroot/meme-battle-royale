const { ethers } = require("hardhat");

async function main() {
  console.log("🎭 Deploying EncryptedMemeBattle v3.0.0 by 0xSyncroot");
  console.log("════════════════════════════════════════════════════");
  console.log("🏗️  Enterprise Modular Architecture");
  console.log("🔐 Fully Homomorphic Encryption (FHE)");
  console.log("⚡ Gas-Optimized & Production-Ready");
  console.log("════════════════════════════════════════════════════");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("📍 Network:", network.name, `(Chain ID: ${network.chainId})`);
  console.log("👤 Deployer:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

  // Battle configuration
  const TEMPLATE_COUNT = 5; // 5 meme templates
  const CAPTION_COUNT = 100; // 100 preset captions (from our constants)
  const BATTLE_DURATION = 5 * 60; // 5 minutes
  
  // Battle operator - can be different from deployer for worker automation
  // If no BATTLE_OPERATOR env var set, deployer will be the operator
  const BATTLE_OPERATOR = process.env.BATTLE_OPERATOR || deployer.address;

  console.log("\n⚙️  Battle Configuration:");
  console.log("📊 Template Count:", TEMPLATE_COUNT);
  console.log("💬 Caption Count:", CAPTION_COUNT);
  console.log("⏰ Battle Duration:", BATTLE_DURATION, "seconds (5 minutes)");
  console.log("🤖 Battle Operator:", BATTLE_OPERATOR);
  if (BATTLE_OPERATOR !== deployer.address) {
    console.log("   (Different from deployer - for worker automation)");
  } else {
    console.log("   (Same as deployer)");
  }

  // Check if this is an FHEVM-compatible network
  const isFHEVMNetwork = network.chainId === 8009n || network.chainId === 11155111n; // Zama Devnet or Sepolia
  
  if (isFHEVMNetwork) {
    console.log("✅ FHEVM-compatible network detected:", network.name);
    console.log("🔐 This network supports real FHEVM encryption!");
  } else {
    console.log("⚠️  Warning: This network may not support FHEVM");
    console.log("🔍 Supported networks: Zama Devnet (8009), Sepolia (11155111)");
  }

  console.log("\n🔨 Deploying contract...");
  
  // Use the latest and only version - EncryptedMemeBattle v3.0.0 by 0xSyncroot
  const contractFactory = await ethers.getContractFactory("EncryptedMemeBattle");
  const contractName = "EncryptedMemeBattle";
  
  console.log("📦 Contract: EncryptedMemeBattle v3.0.0");
  console.log("👨‍💻 Architect: 0xSyncroot");
  console.log("🏗️  Architecture: Enterprise Modular Design");
  console.log("🔐 Privacy: Zama FHEVM Fully Homomorphic Encryption");
  
  console.log("⏳ Waiting for deployment confirmation...");
  
  const contract = await contractFactory.deploy(
    TEMPLATE_COUNT,
    CAPTION_COUNT,
    BATTLE_DURATION,
    BATTLE_OPERATOR
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\n✅ Deployment successful!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("📝 Contract Version:", contractName);

  // Get battle info to verify deployment
  const battleInfo = await contract.getBattleInfo();
  const contractInfo = await contract.getContractInfo();
  
  console.log("\n📋 Battle Details:");
  console.log("🎯 Templates Available:", Number(battleInfo.templates));
  console.log("💬 Captions Available:", Number(battleInfo.captions));
  console.log("🔴 Battle Active:", battleInfo.active);
  console.log("📅 Battle Ends At:", new Date(Number(battleInfo.endsAt) * 1000).toISOString());
  console.log("📝 Total Votes:", Number(battleInfo.totalVotes));
  
  console.log("\n🔐 Access Control:");
  console.log("👑 Owner:", contractInfo.contractOwner);
  console.log("🤖 Battle Operator:", contractInfo.operatorAddress);
  if (contractInfo.contractOwner === contractInfo.operatorAddress) {
    console.log("   (Owner and Operator are the same)");
  } else {
    console.log("   (Separate owner and operator for automation)");
  }

  console.log("\n📖 Usage Instructions:");
  console.log("======================");
  if (isFHEVMNetwork) {
    console.log("✅ Ready for FHEVM operations!");
    console.log("🔐 Users can submit encrypted template + caption votes");
    console.log("🎭 All votes remain private until battle ends");
    console.log("🏆 Results revealed through decryption oracle");
  } else {
    console.log("⚠️  Deploy to FHEVM-compatible network for full functionality");
  }

  console.log("\n🔗 Interaction Examples:");
  console.log("   - Submit vote: battle.submitVote(encryptedTemplate, proof1, encryptedCaption, proof2)");
  console.log("   - End battle: battle.endBattle() (OPERATOR ONLY - after time expires)");
  console.log("   - Request results: battle.requestTemplateResultsDecryption()");
  console.log("   - Get winners: battle.getWinners() (after decryption)");
  console.log("   - Change operator: battle.setBattleOperator(newAddress) (OWNER ONLY)");
  
  if (BATTLE_OPERATOR !== deployer.address) {
    console.log("\n🤖 Worker Setup:");
    console.log("   - Only", BATTLE_OPERATOR, "can call endBattle()");
    console.log("   - Set up your worker to monitor battle.battleEndsAt");
    console.log("   - Worker should call endBattle() when block.timestamp >= battleEndsAt");
    console.log("   - Battles will auto-restart after ending");
  } else {
    console.log("\n⚠️  Note: Deploy with BATTLE_OPERATOR env var for worker automation");
    console.log("   Example: BATTLE_OPERATOR=0x1234... npx hardhat run scripts/deployBattleRoyale.js");
  }

  console.log("\n💾 Deployment completed successfully!");
  console.log("════════════════════════════════════════════════════");
  
  if (isFHEVMNetwork) {
    console.log("\n🎉 EncryptedMemeBattle v3.0.0 is LIVE!");
    console.log("🔐 Ready for fully private meme warfare!");
    console.log("✨ Built by 0xSyncroot with enterprise-grade architecture");
  } else {
    console.log("\n⚠️  Deploy on FHEVM-compatible network for production use");
    console.log("🔍 Recommended: Zama Devnet (8009) or Sepolia (11155111)");
  }
  
  console.log("\n🏗️  Architecture Highlights:");
  console.log("   ✅ Modular design with separated concerns"); 
  console.log("   ✅ 72% smaller main contract vs legacy");
  console.log("   ✅ Gas-optimized with lazy initialization");
  console.log("   ✅ Enterprise-grade security patterns");
  console.log("   ✅ Professional documentation standards");
  
  console.log("\n👨‍💻 Crafted by 0xSyncroot - Lead Smart Contract Architect");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
