import { MemeTemplate } from '@/types';

export const MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: 0,
    name: "Distracted Boyfriend",
    image: "/memes/distracted-boyfriend.svg",
    description: "The classic choice dilemma meme"
  },
  {
    id: 1,
    name: "Drake Pointing",
    image: "/memes/drake-pointing.svg", 
    description: "Drake approving and disapproving"
  },
  {
    id: 2,
    name: "Woman Yelling at Cat",
    image: "/memes/woman-yelling-cat.svg",
    description: "The dinner table argument"
  },
  {
    id: 3,
    name: "This Is Fine",
    image: "/memes/this-is-fine.svg",
    description: "Dog in burning room staying calm"
  },
  {
    id: 4,
    name: "Galaxy Brain",
    image: "/memes/expanding-brain.svg",
    description: "Expanding brain levels of intelligence"
  }
  // Note: Contract deployed with 5 templates (0-4)
];

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x25B6524832E9Cf63D968b305205f1f49e4802f56";

export const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://eth-sepolia.public.blastapi.io";

export const NETWORK_CONFIG = {
  sepolia: {
    chainId: 11155111,
    name: "Sepolia",
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://eth-sepolia.public.blastapi.io",
    fhevmSupported: true,
    isDefault: true,
  },
  zamaDevnet: {
    chainId: 8009,
    name: "Zama Devnet", 
    rpcUrl: process.env.NEXT_PUBLIC_ZAMA_DEVNET_RPC_URL || "https://devnet.zama.ai",
    fhevmSupported: true,
    isDefault: false,
  }
};

// Default network is Sepolia
export const DEFAULT_NETWORK = NETWORK_CONFIG.sepolia;

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "clpispdty00ycl80fpueukbhl";
