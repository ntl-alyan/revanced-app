'use client';
import './globals.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '../components/ui/toaster';
import { ThemeProvider } from '../hooks/use-theme-provider';
import { AuthProvider } from '../hooks/use-auth';
import { queryClient } from '../lib/queryClient';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full bg-background text-foreground antialiased">
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
      </body>
    </html>
  );
}