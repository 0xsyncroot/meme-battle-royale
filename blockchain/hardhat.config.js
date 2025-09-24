require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.24",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            url: "http://127.0.0.1:8545",
        },
        // Zama FHEVM Devnet - The only network that supports FHEVM
        zamaDevnet: {
            url: process.env.ZAMA_DEVNET_RPC_URL || "https://devnet.zama.ai",
            chainId: parseInt(process.env.ZAMA_DEVNET_CHAIN_ID) || 8009,
            accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : [],
        },
        // Ethereum Sepolia - FHEVM Protocol supported with real encryption
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
            chainId: 11155111,
            accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : [],
            gas: 10000000, // 10M gas limit for FHEVM operations
            gasPrice: 20000000000, // 20 gwei
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
};
