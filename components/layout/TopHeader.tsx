'use client';
import { useState } from 'react';
import { useApp, AppUser, UserRole } from '@/lib/app-context';
import {
  Menu,
  Notification,
  Light,
  Moon,
  ChevronDown,
  User,
} from '@carbon/icons-react';
import { Tag } from '@carbon/react';

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin · Regulator',
  agency: 'Agency User',
  auditor: 'Auditor',
};

const roleTagTypes: Record<UserRole, 'green' | 'blue' | 'teal'> = {
  admin: 'green',
  agency: 'blue',
  auditor: 'teal',
};

export default function TopHeader() {
  const { user, users, setUser, setSidebarOpen, theme, toggleTheme } = useApp();
  const [roleOpen, setRoleOpen] = useState(false);

  const handleUserSelect = (u: AppUser) => {
    setUser(u);
    setRoleOpen(false);
  };

  return (
    <header className="ri-header" role="banner">
      {/* Hamburger — mobile only */}
      <button
        id="ri-hamburger"
        className="cds--header__menu-toggle"
        aria-label="Open navigation"
        onClick={() => setSidebarOpen(true)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          color: 'var(--cds-icon-primary)',
          padding: '0.5rem',
          borderRadius: 6,
        }}
      >
        <Menu size={20} />
      </button>

      {/* Brand name (desktop) */}
      <span
        className="ri-header-logo"
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        aria-label="RegInsight AI"
      >
        <span
          style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'var(--ri-green-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 11, color: '#fff',
          }}
        >RI</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--cds-text-primary)' }}>
          RegInsight AI
        </span>
      </span>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Theme toggle */}
      <button
        id="ri-theme-toggle"
        onClick={toggleTheme}
        title={theme === 'g100' ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={theme === 'g100' ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', padding: '0.375rem 0.5rem',
          borderRadius: 6, color: 'var(--cds-icon-secondary)',
          transition: 'color 0.15s, background 0.15s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = 'var(--cds-layer-hover-01)')}
        onMouseOut={e => (e.currentTarget.style.background = 'none')}
      >
        {theme === 'g100' ? <Light size={18} /> : <Moon size={18} />}
      </button>

      {/* Notification bell */}
      <button
        id="ri-notifications"
        aria-label="Notifications"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', padding: '0.375rem 0.5rem',
          borderRadius: 6, color: 'var(--cds-icon-secondary)',
          position: 'relative', transition: 'color 0.15s, background 0.15s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = 'var(--cds-layer-hover-01)')}
        onMouseOut={e => (e.currentTarget.style.background = 'none')}
      >
        <Notification size={18} />
        <span
          aria-hidden="true"
          style={{
            position: 'absolute', top: 4, right: 4,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--ri-red)',
            border: '1.5px solid var(--cds-layer-01)',
          }}
        />
      </button>

      {/* Role switcher */}
      <div style={{ position: 'relative' }}>
        <button
          id="ri-role-switcher"
          onClick={() => setRoleOpen(o => !o)}
          aria-label="Switch user role"
          aria-expanded={roleOpen}
          aria-haspopup="listbox"
          style={{
            background: 'var(--cds-layer-02)',
            border: '1px solid var(--cds-border-subtle-01)',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.625rem 0.25rem 0.375rem',
            color: 'var(--cds-text-primary)',
            transition: 'background 0.15s',
          }}
          onMouseOver={e => (e.currentTarget.style.background = 'var(--cds-layer-hover-02)')}
          onMouseOut={e => (e.currentTarget.style.background = 'var(--cds-layer-02)')}
        >
          {/* Avatar */}
          <span
            aria-hidden="true"
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--ri-green-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800, color: '#fff',
            }}
          >{user.avatar}</span>

          <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name.split(' ')[0]}
          </span>

          <Tag
            type={roleTagTypes[user.role]}
            size="sm"
            style={{ margin: 0 }}
          >
            {user.role}
          </Tag>

          <ChevronDown size={14} style={{ color: 'var(--cds-icon-secondary)', transform: roleOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {/* Dropdown */}
        {roleOpen && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 8999 }}
              onClick={() => setRoleOpen(false)}
              aria-hidden="true"
            />
            <div
              role="listbox"
              aria-label="Select user role"
              style={{
                position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                width: 260,
                background: 'var(--cds-layer-02)',
                border: '1px solid var(--cds-border-subtle-01)',
                borderRadius: 10,
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                zIndex: 9000,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '0.5rem 0.875rem', borderBottom: '1px solid var(--cds-border-subtle-01)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--cds-text-secondary)' }}>
                  Switch Role
                </div>
              </div>
              {users.map(u => (
                <button
                  key={u.id}
                  role="option"
                  aria-selected={u.id === user.id}
                  onClick={() => handleUserSelect(u)}
                  style={{
                    width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.625rem 0.875rem',
                    background: u.id === user.id ? 'var(--cds-layer-selected-01)' : 'transparent',
                    color: 'var(--cds-text-primary)',
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={e => { if (u.id !== user.id) e.currentTarget.style.background = 'var(--cds-layer-hover-02)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = u.id === user.id ? 'var(--cds-layer-selected-01)' : 'transparent'; }}
                >
                  <span style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--ri-green-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0,
                  }}>{u.avatar}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--cds-text-secondary)' }}>
                      {roleLabels[u.role]}{u.agency ? ` · ${u.agency}` : ''}
                    </div>
                  </div>
                  {u.id === user.id && (
                    <span style={{ color: 'var(--ri-green-light)', fontSize: 14, fontWeight: 800 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
