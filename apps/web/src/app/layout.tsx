import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShowMatch — Swipe. Match. Watch.',
  description: 'Find something everyone wants to watch. Together.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dark text-white overscroll-none">
        {children}
      </body>
    </html>
  );
}
