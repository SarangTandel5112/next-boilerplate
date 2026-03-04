import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Providers } from './providers';
import '@/styles/global.css';

export const metadata: Metadata = {
  title: 'Next.js Enterprise Boilerplate',
  description: 'Enterprise-ready Next.js application foundation with strict architecture and secure defaults.',
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 font-sans text-neutral-100">
        <Providers>{props.children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
