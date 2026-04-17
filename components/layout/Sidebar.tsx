'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, KanbanSquare, GitFork,
  BarChart3, Shield, X, ChevronRight, Building2, Landmark, ScrollText
} from 'lucide-react';
import { useApp } from '@/lib/app-context';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Agency Overview' },
  { href: '/documents', label: 'AI Processor', icon: FileText, description: 'Document Intelligence' },
  { href: '/contracts', label: 'Contract Tracker', icon: KanbanSquare, description: 'Procurement Lifecycle' },
  { href: '/funding', label: 'Funding Flow', icon: GitFork, description: 'Money Movement Map' },
  { href: '/compliance', label: 'Compliance', icon: BarChart3, description: 'Regulatory Scorecard' },
  { href: '/audit-log', label: 'Audit Log', icon: Shield, description: 'Blockchain Ledger' },
];

const agencies = [
  { id: 'firs', name: 'FIRS', full: 'Federal Inland Revenue Service', color: '#008751', icon: Landmark },
  { id: 'cac', name: 'CAC', full: 'Corporate Affairs Commission', color: '#005f38', icon: Building2 },
  { id: 'bpp', name: 'BPP', full: 'Bureau of Public Procurement', color: '#006b40', icon: ScrollText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useApp();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`sidebar fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300
          ${sidebarOpen ? 'open' : ''}`}
        style={{
          width: 'var(--sidebar-width, 260px)',
          background: 'linear-gradient(180deg, #004d2c 0%, #006b40 40%, #008751 100%)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
              RI
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">RegInsight AI</div>
              <div className="text-white/50 text-[10px] uppercase tracking-wider">Nigeria RegTech</div>
            </div>
          </div>
          <button className="lg:hidden text-white/60 hover:text-white p-1" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="text-white/40 text-[10px] uppercase tracking-widest px-2 mb-2 font-semibold">Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 group transition-all duration-150 no-underline
                  ${isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-white/65 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Icon size={17} className={isActive ? 'text-green-300' : 'text-white/50 group-hover:text-white/80'} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-tight">{item.label}</div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-white/60' : 'text-white/35 group-hover:text-white/50'}`}>
                    {item.description}
                  </div>
                </div>
                {isActive && <ChevronRight size={14} className="text-white/60" />}
              </Link>
            );
          })}

          {/* Agencies section */}
          <div className="text-white/40 text-[10px] uppercase tracking-widest px-2 mt-5 mb-2 font-semibold">Agencies</div>
          {agencies.map((ag) => {
            const Icon = ag.icon;
            return (
              <div key={ag.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 text-white/55 hover:text-white hover:bg-white/10 cursor-pointer transition-all group">
                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
                  <Icon size={13} className="text-green-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold">{ag.name}</div>
                  <div className="text-[9px] text-white/30 truncate">{ag.full}</div>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 opacity-70" />
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="text-white/30 text-[9px] text-center uppercase tracking-widest">
            Federal Republic of Nigeria
          </div>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/40 text-[9px]">Live Regulatory Feed</span>
          </div>
        </div>
      </aside>
    </>
  );
}
