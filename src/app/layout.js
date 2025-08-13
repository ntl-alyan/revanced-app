import { Providers } from '../components/ui/provider';
import './globals.css';


export const metadata = {
  title: 'Admin Panel',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
