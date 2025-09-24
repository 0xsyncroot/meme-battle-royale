'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { WalletConnect } from '@/components/features/WalletConnect';
import { Shield, Users, Eye } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          Privacy-Preserving Meme Battle Royale
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Vote on meme templates and submit captions while keeping your choices completely private 
          using Zama's FHEVM technology.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 text-gray-800 mx-auto mb-3" />
            <h3 className="font-semibold text-sm mb-2">Fully Encrypted</h3>
            <p className="text-xs text-gray-600">
              Votes and captions encrypted client-side, private during battle
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-gray-800 mx-auto mb-3" />
            <h3 className="font-semibold text-sm mb-2">Fair Competition</h3>
            <p className="text-xs text-gray-600">
              No vote manipulation - aggregation on encrypted data
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-8 w-8 text-gray-800 mx-auto mb-3" />
            <h3 className="font-semibold text-sm mb-2">Controlled Reveals</h3>
            <p className="text-xs text-gray-600">
              Results revealed only after battle completion
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <WalletConnect />
        <p className="text-sm text-gray-500">
          Connect your wallet to participate in the privacy-preserving meme battle
        </p>
      </div>
    </div>
  );
}
