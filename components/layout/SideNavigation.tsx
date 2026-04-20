'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import {
  Dashboard,
  DocumentSentiment,
  ContainerSoftware,
  FlowStream,
  ChartBar,
  Security,
  Building,
  Money,
  Catalog,
} from '@carbon/icons-react';
// Note: DocumentSentiment, ContainerSoftware, Dashboard, FlowStream, ChartBar, Security all exist in @carbon/icons-react v11



const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    desc: 'Agency Overview',
    Icon: Dashboard,
  },
  {
    href: '/documents',
    label: 'AI Processor',
    desc: 'Document Intelligence',
    Icon: DocumentSentiment,
  },
  {
    href: '/contracts',
    label: 'Contract Tracker',
    desc: 'Procurement Lifecycle',
    Icon: ContainerSoftware,
  },
  {
    href: '/funding',
    label: 'Funding Flow',
    desc: 'Money Movement Map',
    Icon: FlowStream,
  },
  {
    href: '/compliance',
    label: 'Compliance',
    desc: 'Regulatory Scorecard',
    Icon: ChartBar,
  },
  {
    href: '/audit-log',
    label: 'Audit Log',
    desc: 'Blockchain Ledger',
    Icon: Security,
  },
];

const agencies = [
  { id: 'firs', name: 'FIRS', full: 'Federal Inland Revenue Service', Icon: Money },
  { id: 'cac', name: 'CAC', full: 'Corporate Affairs Commission', Icon: Building },
  { id: 'bpp', name: 'BPP', full: 'Bureau of Public Procurement', Icon: Catalog },
];

export default function SideNavigation() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useApp();

  return (
    <nav
      id="ri-sidenav"
      className={`ri-sidenav${sidebarOpen ? ' open' : ''}`}
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div className="ri-sidenav-brand">
        <div className="ri-sidenav-logo" aria-hidden="true">RI</div>
        <div>
          <div className="ri-sidenav-title">RegInsight AI</div>
          <div className="ri-sidenav-subtitle">Nigeria RegTech</div>
        </div>
      </div>

      {/* Navigation links */}
      <div className="ri-sidenav-nav">
        <div className="ri-sidenav-section-label">Navigation</div>
        {navItems.map(({ href, label, desc, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`ri-sidenav-item${isActive ? ' active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} className="ri-sidenav-icon" aria-hidden="true" />
              <div className="ri-sidenav-item-text">
                <div className="ri-sidenav-item-label">{label}</div>
                <div className="ri-sidenav-item-desc">{desc}</div>
              </div>
            </Link>
          );
        })}

        {/* Agencies section */}
        <div className="ri-sidenav-section-label" style={{ marginTop: '1.25rem' }}>Agencies</div>
        {agencies.map(({ id, name, full, Icon }) => (
          <div key={id} className="ri-sidenav-item" style={{ cursor: 'default' }}>
            <Icon size={16} className="ri-sidenav-icon" aria-hidden="true" />
            <div className="ri-sidenav-item-text">
              <div className="ri-sidenav-item-label">{name}</div>
              <div className="ri-sidenav-item-desc">{full}</div>
            </div>
            <span className="ri-live-dot" aria-label="Active" />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="ri-sidenav-footer">
        <div className="ri-sidenav-agency-chip">
          <span className="ri-dot" aria-hidden="true" />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Live Regulatory Feed</span>
        </div>
        <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 6 }}>
          Federal Republic of Nigeria
        </div>
      </div>
    </nav>
  );
}
