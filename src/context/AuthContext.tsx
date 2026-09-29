import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  switchDemoRole: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check localStorage first, then sessionStorage
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        return JSON.parse(localUser);
      } catch {
        // ignore
      }
    }
    const sessionUser = sessionStorage.getItem('user');
    if (sessionUser) {
      try {
        return JSON.parse(sessionUser);
      } catch {
        // ignore
      }
    }
    // Return null so unauthenticated users see the login page first
    return null;
  });

  const login = async (email: string, password?: string, rememberMe: boolean = true) => {
    const result = await api.login(email, password);
    if (rememberMe) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    } else {
      sessionStorage.setItem('token', result.token);
      sessionStorage.setItem('user', JSON.stringify(result.user));
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setUser(result.user);
  };

  const switchDemoRole = async (email: string) => {
    const isRemembered = !!localStorage.getItem('token');
    await login(email, 'sih2026', isRemembered);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
