const { run, ethers } = require("hardhat");

/**
 * Script to verify EncryptedMemeBattle contract on Etherscan
 * 
 * Usage:
 * 1. Deploy contract first: npm run deploy:sepolia
 * 2. Set CONTRACT_ADDRESS: export CONTRACT_ADDRESS=0xYOUR_ADDRESS
 * 3. Run verification: npx hardhat run scripts/verifyContract.js --network sepolia
 */

async function main() {
    // 🔧 CONFIGURATION - Update these values after deployment
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x..."; // Replace with actual deployed address
    
    // Constructor parameters used during deployment
    const TEMPLATE_COUNT = 5;      // Number of meme templates (2-10)
    const CAPTION_COUNT = 100;     // Number of caption options (2-256)
    const BATTLE_DURATION = 300;   // Battle duration in seconds (5 minutes for testing)
    
    // Get battle operator address from env or derive from private key
    let BATTLE_OPERATOR = process.env.BATTLE_OPERATOR;
    if (!BATTLE_OPERATOR && process.env.PRIVATE_KEY) {
        // Create wallet from private key to get address
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
        BATTLE_OPERATOR = wallet.address;
    }
    if (!BATTLE_OPERATOR) {
        BATTLE_OPERATOR = "0x..."; // Fallback - replace manually
    }

    console.log("🔍 Verifying EncryptedMemeBattle Contract...");
    console.log(`📍 Contract Address: ${CONTRACT_ADDRESS}`);
    console.log(`🔧 Template Count: ${TEMPLATE_COUNT}`);
    console.log(`🔧 Caption Count: ${CAPTION_COUNT}`);
    console.log(`⏰ Battle Duration: ${BATTLE_DURATION} seconds`);
    console.log(`👤 Battle Operator: ${BATTLE_OPERATOR}`);
    
    if (CONTRACT_ADDRESS === "0x...") {
        console.error("❌ Please update CONTRACT_ADDRESS in the script with your deployed contract address");
        process.exit(1);
    }

    try {
        // Verify the main contract
        await run("verify:verify", {
            address: CONTRACT_ADDRESS,
            constructorArguments: [
                TEMPLATE_COUNT,
                CAPTION_COUNT,
                BATTLE_DURATION,
                BATTLE_OPERATOR
            ],
            contract: "contracts/EncryptedMemeBattle.sol:EncryptedMemeBattle"
        });

        console.log("✅ Contract verified successfully on Etherscan!");
        console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}#code`);
        
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("ℹ️  Contract already verified on Etherscan");
            console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}#code`);
        } else {
            console.error("❌ Verification failed:", error.message);
            
            // Common troubleshooting tips
            console.log("\n🔧 Troubleshooting Tips:");
            console.log("1. Ensure ETHERSCAN_API_KEY is set in .env file");
            console.log("2. Verify constructor parameters match deployment");
            console.log("3. Wait 1-2 minutes after deployment before verifying");
            console.log("4. Check that contract address is correct");
            console.log("5. Ensure network is 'sepolia' and contract was deployed there");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
