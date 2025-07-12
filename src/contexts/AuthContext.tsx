"use client";

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import * as api from '@/lib/mockApi';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (name: string, email: string, password: string) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'rewear_session';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const sessionUser = JSON.parse(session) as User;
        // Re-validate user from "DB"
        const dbUser = api.getUserById(sessionUser.id);
        if (dbUser) {
          setUser(dbUser);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to parse session data:', error);
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

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
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
