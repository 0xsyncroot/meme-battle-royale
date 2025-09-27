const { ethers } = require("hardhat");

/**
 * @title Set Battle Duration Script
 * @notice Script to update battle duration to 2 minutes (120 seconds)
 * @dev This script connects to deployed EncryptedMemeBattle contract and calls setBattleDuration
 * @author Zama Meme Battle Team
 */

async function main() {
    console.log("⏰ Setting Battle Duration to 15 Minutes");
    console.log("════════════════════════════════════════");
    
    const [signer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();
    
    console.log("📍 Network:", network.name, `(Chain ID: ${network.chainId})`);
    console.log("👤 Signer:", signer.address);
    
    const balance = await ethers.provider.getBalance(signer.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
    
    // Contract address - UPDATE THIS WITH YOUR DEPLOYED CONTRACT ADDRESS
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
    
    if (!CONTRACT_ADDRESS) {
        console.error("❌ Error: CONTRACT_ADDRESS environment variable not set");
        console.log("💡 Usage: CONTRACT_ADDRESS=0x1234... npx hardhat run scripts/setBattleDuration.js --network <network>");
        process.exit(1);
    }
    
    console.log("📍 Contract Address:", CONTRACT_ADDRESS);
    
    // New battle duration: 2 minutes = 120 seconds
    const NEW_DURATION = 15 * 60; // 2 minutes in seconds
    
    console.log("\n⚙️  Configuration:");
    console.log("🕐 New Duration:", NEW_DURATION, "seconds (15 minutes)");
    
    try {
        // Connect to the deployed contract
        console.log("\n🔗 Connecting to contract...");
        const contractFactory = await ethers.getContractFactory("EncryptedMemeBattle");
        const contract = contractFactory.attach(CONTRACT_ADDRESS);
        
        // Verify contract exists and get current info
        console.log("🔍 Verifying contract...");
        const contractInfo = await contract.getContractInfo();
        const battleInfo = await contract.getBattleInfo();
        
        console.log("✅ Contract verified:");
        console.log("   👑 Owner:", contractInfo.contractOwner);
        console.log("   🤖 Operator:", contractInfo.operatorAddress);
        console.log("   ⏰ Current Duration:", Number(contractInfo.battleDuration), "seconds");
        
        // Check if signer is the owner
        if (signer.address.toLowerCase() !== contractInfo.contractOwner.toLowerCase()) {
            console.error("❌ Error: Only contract owner can change battle duration");
            console.log("👑 Contract Owner:", contractInfo.contractOwner);
            console.log("👤 Your Address:", signer.address);
            process.exit(1);
        }
        
        console.log("✅ Authorization confirmed - you are the contract owner");
        
        // Estimate gas for the transaction
        console.log("\n⛽ Estimating gas...");
        const gasEstimate = await contract.setBattleDuration.estimateGas(NEW_DURATION);
        console.log("📊 Estimated Gas:", gasEstimate.toString());
        
        // Get current gas price
        const gasPrice = await ethers.provider.getFeeData();
        console.log("💰 Gas Price:", ethers.formatUnits(gasPrice.gasPrice, "gwei"), "gwei");
        
        const estimatedCost = gasEstimate * gasPrice.gasPrice;
        console.log("💸 Estimated Cost:", ethers.formatEther(estimatedCost), "ETH");
        
        // Execute the transaction
        console.log("\n🚀 Executing setBattleDuration...");
        const tx = await contract.setBattleDuration(NEW_DURATION);
        
        console.log("📝 Transaction Hash:", tx.hash);
        console.log("⏳ Waiting for confirmation...");
        
        const receipt = await tx.wait();
        
        console.log("✅ Transaction confirmed!");
        console.log("📊 Gas Used:", receipt.gasUsed.toString());
        console.log("💰 Gas Price:", ethers.formatUnits(receipt.gasPrice, "gwei"), "gwei");
        console.log("💸 Total Cost:", ethers.formatEther(receipt.gasUsed * receipt.gasPrice), "ETH");
        
        // Verify the change
        console.log("\n🔍 Verifying changes...");
        const updatedContractInfo = await contract.getContractInfo();
        const newDuration = Number(updatedContractInfo.battleDuration);
        
        if (newDuration === NEW_DURATION) {
            console.log("✅ Battle duration successfully updated!");
            console.log("⏰ New Duration:", newDuration, "seconds (2 minutes)");
        } else {
            console.error("❌ Error: Duration not updated correctly");
            console.log("Expected:", NEW_DURATION);
            console.log("Actual:", newDuration);
        }
        
        // Show current battle status
        const updatedBattleInfo = await contract.getBattleInfo();
        console.log("\n📋 Current Battle Status:");
        console.log("🔴 Active:", updatedBattleInfo.active);
        console.log("📅 Ends At:", new Date(Number(updatedBattleInfo.endsAt) * 1000).toISOString());
        console.log("📝 Total Votes:", Number(updatedBattleInfo.totalVotes));
        
        console.log("\n💡 Important Notes:");
        console.log("   ⚠️  This change only affects NEW battles");
        console.log("   🔄 Current active battle duration remains unchanged");
        console.log("   ⏰ Next battle will use the new 2-minute duration");
        
        console.log("\n✅ Operation completed successfully!");
        console.log("════════════════════════════════════════");
        
    } catch (error) {
        console.error("\n❌ Error occurred:");
        
        if (error.code === 'CALL_EXCEPTION') {
            console.error("🔍 Contract call failed - possible reasons:");
            console.error("   • Contract address is incorrect");
            console.error("   • Contract not deployed on this network");
            console.error("   • Network connection issues");
        } else if (error.code === 'INSUFFICIENT_FUNDS') {
            console.error("💰 Insufficient funds for transaction");
            console.error("   Current balance:", ethers.formatEther(balance), "ETH");
        } else if (error.reason) {
            console.error("📝 Revert reason:", error.reason);
            
            // Common revert reasons
            if (error.reason.includes("duration must be positive")) {
                console.error("💡 Duration must be greater than 0");
            } else if (error.reason.includes("at least 60 seconds")) {
                console.error("💡 Duration must be at least 60 seconds");
            } else if (error.reason.includes("cannot exceed 7 days")) {
                console.error("💡 Duration cannot exceed 7 days (604800 seconds)");
            } else if (error.reason.includes("OnlyOwner")) {
                console.error("💡 Only contract owner can change battle duration");
            }
        } else {
            console.error("🔍 Unexpected error:", error.message);
        }
        
        console.log("\n🛠️  Troubleshooting:");
        console.log("   1. Verify CONTRACT_ADDRESS is correct");
        console.log("   2. Ensure you're connected to the right network");
        console.log("   3. Check you have sufficient ETH for gas");
        console.log("   4. Confirm you're the contract owner");
        
        process.exit(1);
    }
}

// Execute the script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script execution failed:", error);
        process.exit(1);
    });
