'use client';

import Image from 'next/image';
import { WalletConnect } from '@/components/features/WalletConnect';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Far left */}
          <div className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="Zama Logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Meme Battle Royale</h1>
              <span className="text-xs text-gray-500">Powered by Zama FHEVM</span>
            </div>
          </div>
          
          {/* Wallet - Far right */}
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
