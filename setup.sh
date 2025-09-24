#!/bin/bash

# Meme Battle Royale - Setup Script
# Author: 0xSyncroot
# This script sets up development environment with minimal configuration

set -e

echo ""
echo "    ██████╗ ██╗  ██╗███████╗██╗   ██╗███╗   ██╗ ██████╗██████╗  ██████╗  ██████╗ ████████╗"
echo "   ██╔═████╗╚██╗██╔╝██╔════╝╚██╗ ██╔╝████╗  ██║██╔════╝██╔══██╗██╔═══██╗██╔═══██╗╚══██╔══╝"
echo "   ██║██╔██║ ╚███╔╝ ███████╗ ╚████╔╝ ██╔██╗ ██║██║     ██████╔╝██║   ██║██║   ██║   ██║   "
echo "   ████╔╝██║ ██╔██╗ ╚════██║  ╚██╔╝  ██║╚██╗██║██║     ██╔══██╗██║   ██║██║   ██║   ██║   "
echo "   ╚██████╔╝██╔╝ ██╗███████║   ██║   ██║ ╚████║╚██████╗██║  ██║╚██████╔╝╚██████╔╝   ██║   "
echo "    ╚═════╝ ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝   "
echo ""
echo "                      🎭 Meme Battle Royale - Development Setup 🎭"
echo "                            Privacy-Preserving Battles with FHEVM"
echo "                                     by 0xSyncroot"
echo ""
echo "══════════════════════════════════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher. Current: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check pnpm (Required for this project)
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm not found. Installing pnpm globally...${NC}"
    npm install -g pnpm
    echo -e "${GREEN}✅ pnpm installed successfully${NC}"
else
    echo -e "${GREEN}✅ pnpm $(pnpm -v)${NC}"
fi

echo ""

# Setup blockchain
echo -e "${BLUE}🔗 Setting up blockchain components...${NC}"
cd blockchain

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 Creating blockchain .env file...${NC}"
    cp env.example .env
    echo -e "${YELLOW}⚠️  Please edit blockchain/.env with your configuration${NC}"
fi

echo -e "${BLUE}📦 Installing blockchain dependencies...${NC}"
pnpm install

echo -e "${BLUE}🔨 Compiling smart contracts...${NC}"
pnpm run compile

echo -e "${GREEN}✅ Blockchain setup complete${NC}"
echo ""

# Setup frontend
echo -e "${BLUE}🎨 Setting up frontend components...${NC}"
cd ../frontend

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}📝 Creating frontend .env.local file...${NC}"
    cp env.local.example .env.local
    echo -e "${YELLOW}⚠️  Please edit frontend/.env.local with your configuration${NC}"
fi

echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
pnpm install

echo -e "${GREEN}✅ Frontend setup complete${NC}"
echo -e "${BLUE}ℹ️  Frontend build will be done after contract deployment${NC}"
echo ""

# Setup worker (optional)
echo -e "${BLUE}🤖 Setting up worker automation (optional)...${NC}"
cd ../worker

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 Creating worker .env file...${NC}"
    cp env.example .env
    echo -e "${YELLOW}⚠️  Configure worker/.env if you want automated battle management${NC}"
fi

echo -e "${BLUE}📦 Installing worker dependencies...${NC}"
pnpm install

echo -e "${GREEN}✅ Worker setup complete${NC}"
echo ""

# Return to root directory
cd ..

# Final instructions
echo "══════════════════════════════════════════════════════════════════════════════════════════"
echo -e "${GREEN}                                🎉 Setup Complete! 🎉${NC}"
echo "══════════════════════════════════════════════════════════════════════════════════════════"
echo ""
echo -e "${BLUE}📋 Next Steps to Deploy & Run:${NC}"
echo ""
echo -e "${YELLOW}1. Configure Environment Variables:${NC}"
echo "   📝 Edit blockchain/.env with your private key and RPC URLs"
echo "   📝 Edit frontend/.env.local with Privy App ID"
echo ""
echo -e "${YELLOW}2. Deploy Smart Contracts:${NC}"
echo "   cd blockchain"
echo "   pnpm run check-balance:sepolia    # Check your balance first"
echo "   pnpm run deploy:sepolia           # Deploy to Sepolia testnet"
echo "   # Copy the deployed contract address!"
echo ""
echo -e "${YELLOW}3. Update Frontend Config:${NC}"
echo "   📝 Edit frontend/.env.local and set NEXT_PUBLIC_CONTRACT_ADDRESS"
echo ""
echo -e "${YELLOW}4. Build & Start DApp:${NC}"
echo "   cd frontend"
echo "   pnpm run build                    # Build with contract address"
echo "   pnpm run dev                      # Start development server"
echo "   🌐 Visit: http://localhost:3000"
echo ""
echo -e "${YELLOW}5. (Optional) Start Worker for Automation:${NC}"
echo "   📝 Configure worker/.env with contract address"
echo "   cd worker && pnpm start"
echo ""
echo "══════════════════════════════════════════════════════════════════════════════════════════"
echo -e "${GREEN}🔐 Privacy Features Powered by Zama FHEVM:${NC}"
echo "   ✅ Client-side encryption of votes and captions"
echo "   ✅ Homomorphic computation on encrypted data"
echo "   ✅ Oracle-based selective result disclosure"
echo "   ✅ MEV-resistant private voting mechanism"
echo ""
echo -e "${BLUE}📚 Documentation & Support:${NC}"
echo "   📖 Main README: ./README.md"
echo "   📖 Blockchain: ./blockchain/README.md"
echo "   📖 Frontend: ./frontend/README.md"
echo ""
echo -e "${GREEN}                          Happy Building with FHEVM! 🚀${NC}"
echo -e "${BLUE}                              Created by 0xSyncroot${NC}"
echo ""
