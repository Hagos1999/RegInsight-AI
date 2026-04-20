import type { Metadata } from 'next';
import '@carbon/styles/css/styles.css';
import './globals.css';
import { AppProvider } from '@/lib/app-context';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'RegInsight AI — Nigerian Regulatory Intelligence Platform',
  description:
    'Centralized regulatory intelligence platform for Nigeria. Track procurement contracts, tax compliance, funding flows, and more across FIRS, CAC, and BPP.',
  keywords: 'Nigeria RegTech, FIRS, CAC, BPP, regulatory compliance, procurement transparency',
  openGraph: {
    title: 'RegInsight AI',
    description: 'Nigerian centralized regulatory intelligence — powered by AI',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-carbon-theme="g100" data-scroll-behavior="smooth">
      <body>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
