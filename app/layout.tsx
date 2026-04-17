import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/app-context';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'RegInsight AI — Nigerian Regulatory Intelligence Platform',
  description: 'Centralized regulatory intelligence platform for Nigeria. Track procurement contracts, tax compliance, funding flows, and more across FIRS, CAC, and BPP.',
  keywords: 'Nigeria RegTech, FIRS, CAC, BPP, regulatory compliance, procurement transparency',
  openGraph: {
    title: 'RegInsight AI',
    description: 'Nigerian centralized regulatory intelligence — powered by AI',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <div className="app-layout">
            <Sidebar />
            <div className="main-content">
              {children}
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
