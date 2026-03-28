import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/lib/providers';

export const metadata: Metadata = {
  title: 'SpotFinder',
  description: 'Discover and share amazing places',
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="mobile-frame">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
