'use client';

import { AuthProvider } from '@/src/hooks/use-auth';
import { ThemeProvider } from '@/src/hooks/use-theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './toaster';

export const queryClient = new QueryClient();
export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        storageKey="admin-theme"
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
