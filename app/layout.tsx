import type { Metadata, Viewport } from 'next'; // Import Viewport
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Xpress Point',
  description: 'All your services in one place',
};

// --- THIS IS THE FIX for "Pinch Zoom" ---
// This tells all mobile devices not to allow zooming
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // This disables pinch-zoom
};
// ----------------------------------------

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
