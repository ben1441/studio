import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { VoteLockLogo } from '@/components/VoteLockLogo';

export const metadata: Metadata = {
  title: 'VoteLock - Decision-Free Zone',
  description: 'Create and vote on polls with one vote per device.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-background text-foreground antialiased min-h-screen flex flex-col">
        <header className="py-4 border-b border-border/40">
          <div className="container mx-auto px-4">
            <VoteLockLogo />
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="py-4 border-t border-border/40">
          <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
            VoteLock - Decision-Free Zone
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
