const { ethers } = require("hardhat");

async function main() {
  console.log("💰 Account Balance Checker");
  console.log("==========================");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("👤 Account:", deployer.address);
  console.log("🌐 Network:", network.name, `(Chain ID: ${network.chainId})`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
  
  // Check if this is an FHEVM-compatible network
  const isFHEVMNetwork = network.chainId === 8009n || network.chainId === 11155111n;
  
  if (isFHEVMNetwork) {
    console.log("✅ FHEVM-compatible network detected!");
    if (network.chainId === 11155111n) {
      console.log("🔗 Network: Ethereum Sepolia (FHEVM-enabled)");
    } else if (network.chainId === 8009n) {
      console.log("🔗 Network: Zama Devnet");
    }
  } else {
    console.log("⚠️  Warning: This network may not support FHEVM");
    console.log("🔍 Supported networks: Zama Devnet (8009), Sepolia (11155111)");
  }
  
  // Check if balance is sufficient for deployment
  const minBalance = ethers.parseEther("0.01"); // 0.01 ETH minimum
  const recommendedBalance = ethers.parseEther("0.05"); // 0.05 ETH recommended
  
  console.log("\n💸 Balance Analysis:");
  if (balance < minBalance) {
    console.log("❌ Insufficient balance! Need at least 0.01 ETH for deployment");
    if (network.chainId === 11155111n) {
      console.log("🚰 Get Sepolia ETH from:");
      console.log("   - https://sepoliafaucet.com/");
      console.log("   - https://faucet.sepolia.dev/");
    } else if (network.chainId === 8009n) {
      console.log("🚰 Get Zama Devnet tokens from Zama Discord");
    }
  } else if (balance < recommendedBalance) {
    console.log("⚠️  Low balance. Deployment possible but recommended: 0.05 ETH");
    console.log("✅ Current balance sufficient for basic deployment");
  } else {
    console.log("✅ Excellent balance! Ready for multiple deployments");
  }
  
  // Estimate deployment costs
  console.log("\n📊 Estimated Deployment Costs:");
  console.log("   - EncryptedMemeBattleRoyale: ~0.005-0.015 ETH");
  console.log("   - Gas price dependent on network congestion");
  
  if (isFHEVMNetwork) {
    console.log("\n🎯 Ready to deploy EncryptedMemeBattleRoyale!");
    console.log("   Run: npm run deploy:battle");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
