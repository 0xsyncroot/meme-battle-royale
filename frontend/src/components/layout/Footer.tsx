'use client';

import Image from 'next/image';
import { ExternalLink, Github, Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto bg-slate-50 border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="Meme Battle Logo"
              width={24}
              height={24}
              className="rounded-md"
            />
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-slate-800">Meme Battle Royale</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Shield className="h-3 w-3 text-indigo-600" />
                <span>Privacy-preserving with Zama FHEVM</span>
              </div>
            </div>
          </div>
          
          {/* Links */}
          <div className="flex items-center space-x-4">
            <a 
              href="https://docs.zama.ai/protocol/solidity-guides" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-slate-600 hover:text-indigo-600 transition-colors flex items-center space-x-1 hover:underline"
            >
              <span>FHEVM Docs</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-slate-300">•</span>
            <a 
              href="https://github.com/zama-ai/fhevm" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-slate-600 hover:text-indigo-600 transition-colors flex items-center space-x-1 hover:underline"
            >
              <Github className="h-3 w-3" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
