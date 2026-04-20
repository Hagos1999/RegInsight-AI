'use client';
import { useApp } from '@/lib/app-context';
import SideNavigation from './SideNavigation';
import TopHeader from './TopHeader';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useApp();

  return (
    <div className="ri-app-shell">
      {/* Mobile overlay */}
      <div
        className={`ri-nav-overlay${sidebarOpen ? ' visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Side navigation */}
      <SideNavigation />

      {/* Main content area */}
      <div className="ri-main">
        <TopHeader />
        <main>{children}</main>
      </div>
    </div>
  );
}
