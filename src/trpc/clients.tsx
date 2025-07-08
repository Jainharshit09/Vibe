'use client';

import { useState } from 'react';
import SuperJSON from 'superjson';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import type { QueryClient } from '@tanstack/react-query';

import { makeQueryClient } from './query-client'; // ✅ Ensure this returns a valid QueryClient
import type { AppRouter } from './routers/_app';

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

// Keep a persistent QueryClient in the browser
let browserQueryClient: QueryClient;

function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: always return a new instance
    return makeQueryClient();
  }

  // Browser: reuse the same instance to avoid re-creating it
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}

function getUrl() {
  const base = (() => {
    if (typeof window !== 'undefined') return '';
    return process.env.NEXT_PUBLIC_APP_URL;
  })();
  return `${base}/api/trpc`;
}


export function TRPCReactProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          transformer: SuperJSON,
          url: getUrl() + '/api/trpc',
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
