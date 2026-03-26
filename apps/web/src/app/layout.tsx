import type { Metadata, Viewport } from 'next';
import './globals.css';
import PageTransitionWrapper from '@/components/ui/PageTransitionWrapper';

export const metadata: Metadata = {
  title: 'ShowMatch · Swipe. Match. Watch.',
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
        {/* Fixed background glows — position:fixed is the only reliable way
            to get a persistent gradient on iOS Safari (background-attachment:fixed is ignored). */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: [
              'radial-gradient(ellipse at 15% 10%,  rgba(229,9,20,0.28)   0%, transparent 55%)',
              'radial-gradient(ellipse at 88% 88%,  rgba(109,40,217,0.20) 0%, transparent 55%)',
              'radial-gradient(ellipse at 80% 10%,  rgba(255,107,53,0.18) 0%, transparent 50%)',
              'radial-gradient(ellipse at 50% 105%, rgba(229,9,20,0.12)   0%, transparent 45%)',
            ].join(', '),
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <PageTransitionWrapper>{children}</PageTransitionWrapper>
        </div>

      </body>
    </html>
  );
}
