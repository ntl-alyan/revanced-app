'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '../components/ui/toaster';
import { ThemeProvider } from '../hooks/use-theme-provider';
import { AuthProvider } from '../hooks/use-auth';
import { queryClient } from '../lib/queryClient';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="dark" storageKey="admin-theme">
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}