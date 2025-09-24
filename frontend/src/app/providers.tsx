'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { sepolia } from 'viem/chains';
import { PRIVY_APP_ID } from '@/constants';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          loginMethods: ['wallet'],
          appearance: {
            theme: 'light',
            accentColor: '#6366F1',
            logo: '/logo.png',
            showWalletLoginFirst: true,
            walletChainType: 'ethereum-only',
            landingHeader: 'Connect to Meme Battle Royale',
            loginMessage: 'Join the battle with your wallet',
          },
          defaultChain: sepolia,
          supportedChains: [sepolia],
          embeddedWallets: {
            ethereum: {
              createOnLogin: 'users-without-wallets',
            },
          },
        }}
      >
        {children}
      </PrivyProvider>
    </QueryClientProvider>
  );
}
