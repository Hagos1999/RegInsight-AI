'use client';
import { Menu, Bell, Search, LogOut, ChevronDown } from 'lucide-react';
import { useApp, UserRole } from '@/lib/app-context';
import { useState } from 'react';

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin (Regulator)',
  agency: 'Agency User',
  auditor: 'Auditor',
};

const roleColors: Record<UserRole, string> = {
  admin: 'role-admin',
  agency: 'role-agency',
  auditor: 'role-auditor',
};

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user, setUser, users, setSidebarOpen } = useApp();
  const [roleOpen, setRoleOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[var(--border)] px-6 py-3 flex items-center gap-4"
      style={{ boxShadow: '0 1px 8px rgba(0,135,81,0.08)' }}>
      {/* Mobile hamburger */}
      <button
        className="md:hidden btn btn-ghost p-2"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-[var(--text-primary)] leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs text-[var(--text-secondary)] truncate">{subtitle}</p>}
      </div>

      {/* Search (decorative on mobile) */}
      <div className="hidden sm:flex items-center gap-2 bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-3 py-2 w-48 lg:w-64">
        <Search size={14} className="text-[var(--text-secondary)]" />
        <input type="text" placeholder="Search..." className="bg-transparent text-sm outline-none text-[var(--text-secondary)] w-full" />
      </div>

      {/* Notification bell */}
      <button className="relative btn btn-ghost p-2">
        <Bell size={18} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
      </button>

      {/* Role switcher */}
      <div className="relative">
        <button
          className={`badge ${roleColors[user.role]} flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity`}
          onClick={() => setRoleOpen(!roleOpen)}
        >
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
            {user.avatar}
          </span>
          <span className="hidden sm:block">{user.name}</span>
          <span className="hidden lg:block text-[10px] opacity-75">· {roleLabels[user.role]}</span>
          <ChevronDown size={12} />
        </button>

        {roleOpen && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-[var(--border)] rounded-xl shadow-xl z-50 py-1 animate-fade-in">
            <div className="px-3 py-2 border-b border-[var(--border)]">
              <div className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-semibold">Switch Role</div>
            </div>
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => { setUser(u); setRoleOpen(false); }}
                className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-[var(--green-pale)] transition-colors text-sm
                  ${u.id === user.id ? 'bg-[var(--green-pale)]' : ''}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white badge ${roleColors[u.role]}`}>
                  {u.avatar}
                </span>
                <div>
                  <div className="font-semibold text-[var(--text-primary)] text-sm">{u.name}</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">{roleLabels[u.role]}{u.agency ? ` · ${u.agency}` : ''}</div>
                </div>
                {u.id === user.id && <span className="ml-auto text-[var(--green-primary)]">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
