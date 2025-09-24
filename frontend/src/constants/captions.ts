export interface CaptionPreset {
  id: number;
  text: string;
  emoji: string;
  category: 'meme' | 'emoji' | 'reaction';
}

export const CAPTION_PRESETS: CaptionPreset[] = [
  // Classic Meme Phrases (0-19)
  { id: 0, text: "This is fine", emoji: "🔥", category: 'meme' },
  { id: 1, text: "Big brain time", emoji: "🧠", category: 'meme' },
  { id: 2, text: "Stonks", emoji: "📈", category: 'meme' },
  { id: 3, text: "Not stonks", emoji: "📉", category: 'meme' },
  { id: 4, text: "Hello FHEVM", emoji: "🔐", category: 'meme' },
  { id: 5, text: "To the moon", emoji: "🚀", category: 'meme' },
  { id: 6, text: "HODL", emoji: "💎", category: 'meme' },
  { id: 7, text: "Wen lambo", emoji: "🏎️", category: 'meme' },
  { id: 8, text: "GM frens", emoji: "☀️", category: 'meme' },
  { id: 9, text: "WAGMI", emoji: "🤝", category: 'meme' },
  { id: 10, text: "LFG", emoji: "🚀", category: 'meme' },
  { id: 11, text: "Based", emoji: "💯", category: 'meme' },
  { id: 12, text: "Cringe", emoji: "😬", category: 'meme' },
  { id: 13, text: "Sus", emoji: "🤔", category: 'meme' },
  { id: 14, text: "No cap", emoji: "🧢", category: 'meme' },
  { id: 15, text: "Fr fr", emoji: "💯", category: 'meme' },
  { id: 16, text: "Skill issue", emoji: "🤡", category: 'meme' },
  { id: 17, text: "Touch grass", emoji: "🌱", category: 'meme' },
  { id: 18, text: "Ratio", emoji: "📊", category: 'meme' },
  { id: 19, text: "L + Ratio", emoji: "❌", category: 'meme' },

  // Emoji Reactions (20-39)
  { id: 20, text: "😂", emoji: "😂", category: 'emoji' },
  { id: 21, text: "🤣", emoji: "🤣", category: 'emoji' },
  { id: 22, text: "😭", emoji: "😭", category: 'emoji' },
  { id: 23, text: "💀", emoji: "💀", category: 'emoji' },
  { id: 24, text: "🔥", emoji: "🔥", category: 'emoji' },
  { id: 25, text: "💯", emoji: "💯", category: 'emoji' },
  { id: 26, text: "👑", emoji: "👑", category: 'emoji' },
  { id: 27, text: "🚀", emoji: "🚀", category: 'emoji' },
  { id: 28, text: "💎", emoji: "💎", category: 'emoji' },
  { id: 29, text: "🌙", emoji: "🌙", category: 'emoji' },
  { id: 30, text: "⚡", emoji: "⚡", category: 'emoji' },
  { id: 31, text: "🎯", emoji: "🎯", category: 'emoji' },
  { id: 32, text: "🎪", emoji: "🎪", category: 'emoji' },
  { id: 33, text: "🤡", emoji: "🤡", category: 'emoji' },
  { id: 34, text: "👀", emoji: "👀", category: 'emoji' },
  { id: 35, text: "🙈", emoji: "🙈", category: 'emoji' },
  { id: 36, text: "🙉", emoji: "🙉", category: 'emoji' },
  { id: 37, text: "🙊", emoji: "🙊", category: 'emoji' },
  { id: 38, text: "🤯", emoji: "🤯", category: 'emoji' },
  { id: 39, text: "🤩", emoji: "🤩", category: 'emoji' },

  // Reaction Phrases (40-59)
  { id: 40, text: "OMG", emoji: "😱", category: 'reaction' },
  { id: 41, text: "LOL", emoji: "😂", category: 'reaction' },
  { id: 42, text: "LMAO", emoji: "🤣", category: 'reaction' },
  { id: 43, text: "ROFL", emoji: "🤣", category: 'reaction' },
  { id: 44, text: "WTF", emoji: "🤨", category: 'reaction' },
  { id: 45, text: "Bruh", emoji: "🤦", category: 'reaction' },
  { id: 46, text: "Yikes", emoji: "😬", category: 'reaction' },
  { id: 47, text: "Oof", emoji: "😵", category: 'reaction' },
  { id: 48, text: "Sheesh", emoji: "😤", category: 'reaction' },
  { id: 49, text: "Bussin", emoji: "😋", category: 'reaction' },
  { id: 50, text: "Slay", emoji: "💅", category: 'reaction' },
  { id: 51, text: "Periodt", emoji: "💅", category: 'reaction' },
  { id: 52, text: "Facts", emoji: "📠", category: 'reaction' },
  { id: 53, text: "Mood", emoji: "😌", category: 'reaction' },
  { id: 54, text: "Vibe", emoji: "✨", category: 'reaction' },
  { id: 55, text: "Energy", emoji: "⚡", category: 'reaction' },
  { id: 56, text: "Iconic", emoji: "👑", category: 'reaction' },
  { id: 57, text: "Legend", emoji: "🏆", category: 'reaction' },
  { id: 58, text: "King", emoji: "👑", category: 'reaction' },
  { id: 59, text: "Queen", emoji: "👸", category: 'reaction' },

  // Crypto/Web3 Specific (60-79)
  { id: 60, text: "Bullish", emoji: "🐂", category: 'meme' },
  { id: 61, text: "Bearish", emoji: "🐻", category: 'meme' },
  { id: 62, text: "Diamond hands", emoji: "💎🙌", category: 'meme' },
  { id: 63, text: "Paper hands", emoji: "📄🙌", category: 'meme' },
  { id: 64, text: "Ape in", emoji: "🦍", category: 'meme' },
  { id: 65, text: "FOMO", emoji: "😰", category: 'meme' },
  { id: 66, text: "FUD", emoji: "😨", category: 'meme' },
  { id: 67, text: "Pump it", emoji: "📈", category: 'meme' },
  { id: 68, text: "Dump it", emoji: "📉", category: 'meme' },
  { id: 69, text: "Rekt", emoji: "💥", category: 'meme' },
  { id: 70, text: "Giga chad", emoji: "💪", category: 'meme' },
  { id: 71, text: "Chad move", emoji: "😎", category: 'meme' },
  { id: 72, text: "Virgin vs Chad", emoji: "🤓", category: 'meme' },
  { id: 73, text: "Cope", emoji: "😤", category: 'meme' },
  { id: 74, text: "Seethe", emoji: "😡", category: 'meme' },
  { id: 75, text: "Mald", emoji: "🤬", category: 'meme' },
  { id: 76, text: "Hopium", emoji: "🙏", category: 'meme' },
  { id: 77, text: "Copium", emoji: "😮‍💨", category: 'meme' },
  { id: 78, text: "Hopeless", emoji: "😞", category: 'meme' },
  { id: 79, text: "Degen", emoji: "🎰", category: 'meme' },

  // FHEVM/Privacy Themed (80-99)
  { id: 80, text: "Encrypted vibes", emoji: "🔐", category: 'meme' },
  { id: 81, text: "Privacy gang", emoji: "🥷", category: 'meme' },
  { id: 82, text: "Zero knowledge", emoji: "🤐", category: 'meme' },
  { id: 83, text: "Homomorphic", emoji: "🧮", category: 'meme' },
  { id: 84, text: "Decrypt this", emoji: "🔓", category: 'meme' },
  { id: 85, text: "Zama gang", emoji: "⚡", category: 'meme' },
  { id: 86, text: "FHE supremacy", emoji: "👑", category: 'meme' },
  { id: 87, text: "Compute blindly", emoji: "🙈", category: 'meme' },
  { id: 88, text: "Secret sauce", emoji: "🤫", category: 'meme' },
  { id: 89, text: "Proof verified", emoji: "✅", category: 'meme' },
  { id: 90, text: "Cryptographically", emoji: "🔒", category: 'meme' },
  { id: 91, text: "Trustless", emoji: "🤝", category: 'meme' },
  { id: 92, text: "Verifiable", emoji: "🔍", category: 'meme' },
  { id: 93, text: "On-chain", emoji: "⛓️", category: 'meme' },
  { id: 94, text: "Decentralized", emoji: "🌐", category: 'meme' },
  { id: 95, text: "Permissionless", emoji: "🚪", category: 'meme' },
  { id: 96, text: "Immutable", emoji: "🗿", category: 'meme' },
  { id: 97, text: "Consensus", emoji: "🤝", category: 'meme' },
  { id: 98, text: "Byzantine fault", emoji: "🏛️", category: 'meme' },
  { id: 99, text: "Satoshi approved", emoji: "👻", category: 'meme' },
];

export const getCaptionById = (id: number): CaptionPreset | undefined => {
  return CAPTION_PRESETS.find(caption => caption.id === id);
};

export const getCaptionsByCategory = (category: 'meme' | 'emoji' | 'reaction'): CaptionPreset[] => {
  return CAPTION_PRESETS.filter(caption => caption.category === category);
};

export const CAPTION_COUNT = CAPTION_PRESETS.length;
