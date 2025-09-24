'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Wallet, LogOut } from 'lucide-react';

export function WalletConnect() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Button onClick={login} className="flex items-center space-x-2">
        <Wallet className="h-4 w-4" />
        <span>Connect Wallet</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <Badge variant="success">Connected</Badge>
        {user?.wallet?.address && (
          <span className="text-sm text-gray-600 font-mono">
            {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={logout}
        className="flex items-center space-x-1"
      >
        <LogOut className="h-4 w-4" />
        <span>Disconnect</span>
      </Button>
    </div>
  );
}
