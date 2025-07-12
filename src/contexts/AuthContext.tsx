"use client";

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import * as api from '@/lib/mockApi';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (name: string, email: string, password: string) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'rewear_session';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const sessionUser = JSON.parse(session) as User;
        const dbUser = api.getUserById(sessionUser.id);
        if (dbUser) {
          setUser(dbUser);
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('Failed to parse session data:', error);
      logout();
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    refreshUser();
    setLoading(false);
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<User | null> => {
    const foundUser = api.getUserByEmail(email);
    if (foundUser && foundUser.password === password) {
      setUser(foundUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(foundUser));
      return foundUser;
    }
    return null;
  };

  const signup = async (name: string, email: string, password: string): Promise<User | null> => {
    if (api.getUserByEmail(email)) {
      throw new Error("Email already exists");
    }
    const newUser = api.addUser({ name, email, password });
    setUser(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
