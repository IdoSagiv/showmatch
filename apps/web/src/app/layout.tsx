import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShowMatch — Swipe. Match. Watch.',
  description: 'Find something everyone wants to watch. Together.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dark text-white">
        {children}
      </body>
    </html>
  );
}
