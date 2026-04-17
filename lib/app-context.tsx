'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'agency' | 'auditor';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  agency?: string;
  avatar: string;
}

const USERS: AppUser[] = [
  { id: 'adm.okonkwo', name: 'Emeka Okonkwo', role: 'admin', avatar: 'EO' },
  { id: 'usr.ibrahim', name: 'Fatima Ibrahim', role: 'agency', agency: 'Ministry of Works', avatar: 'FI' },
  { id: 'aud.adeyemi', name: 'Tunde Adeyemi', role: 'auditor', avatar: 'TA' },
];

interface AppContextType {
  user: AppUser;
  setUser: (user: AppUser) => void;
  users: AppUser[];
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser>(USERS[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AppContext.Provider value={{ user, setUser, users: USERS, sidebarOpen, setSidebarOpen }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
