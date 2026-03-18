import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { OnlineStatus } from '@/components/OnlineStatus';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'Inventory Tracker',
  description: 'Offline-first inventory and transaction tracking',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <OnlineStatus />
          <Navigation />
          <main className="px-4 py-6 md:px-8 max-w-5xl mx-auto">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
