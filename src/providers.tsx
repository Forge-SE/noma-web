import { ApolloProvider } from '@apollo/client/react';
import { Provider } from 'jotai';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@radix-ui/react-tooltip';

import { SearchMenu } from '@/components/search';
import { apolloClient } from '@/lib/apollo-client';
import { AuthProvider } from '@/providers/auth-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <Provider>
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
          <TooltipProvider
            delayDuration={100}
            skipDelayDuration={300}
            disableHoverableContent
          >
            <AuthProvider>
              {children}
              <SearchMenu />
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </Provider>
    </ApolloProvider>
  );
}
