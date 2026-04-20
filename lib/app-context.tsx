'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'agency' | 'auditor';
export type AppTheme = 'g100' | 'g10';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  agency?: string;
  avatar: string;
}

export interface RolePermissions {
  canViewAllAgencies: boolean;
  canSeeAnomalyAlerts: boolean;
  canUploadDocuments: boolean;
  canMoveKanbanCards: boolean;
  canVerifyAuditBlocks: boolean;
  canExportAuditLog: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewAllAgencies: true,
    canSeeAnomalyAlerts: true,
    canUploadDocuments: true,
    canMoveKanbanCards: true,
    canVerifyAuditBlocks: true,
    canExportAuditLog: true,
  },
  agency: {
    canViewAllAgencies: false,
    canSeeAnomalyAlerts: false,
    canUploadDocuments: true,
    canMoveKanbanCards: true,
    canVerifyAuditBlocks: false,
    canExportAuditLog: false,
  },
  auditor: {
    canViewAllAgencies: true,
    canSeeAnomalyAlerts: true,
    canUploadDocuments: false,
    canMoveKanbanCards: false,
    canVerifyAuditBlocks: true,
    canExportAuditLog: true,
  },
};

const USERS: AppUser[] = [
  { id: 'adm.okonkwo', name: 'Emeka Okonkwo', role: 'admin', avatar: 'EO' },
  { id: 'usr.ibrahim', name: 'Fatima Ibrahim', role: 'agency', agency: 'Ministry of Works', avatar: 'FI' },
  { id: 'aud.adeyemi', name: 'Tunde Adeyemi', role: 'auditor', avatar: 'TA' },
];

interface AppContextType {
  user: AppUser;
  setUser: (user: AppUser) => void;
  users: AppUser[];
  permissions: RolePermissions;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  theme: AppTheme;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser>(USERS[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<AppTheme>('g100');

  const permissions = ROLE_PERMISSIONS[user.role];

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'g100' ? 'g10' : 'g100';
      document.documentElement.setAttribute('data-carbon-theme', next);
      return next;
    });
  };

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1056) setSidebarOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser, users: USERS, permissions, sidebarOpen, setSidebarOpen, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
