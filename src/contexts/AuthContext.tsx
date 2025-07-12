
"use client";

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/lib/types';
import * as api from '@/lib/mockApi';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseAuthUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ user: User | null; error: any | null }>;
  signup: (name: string, email: string, password: string) => Promise<{ user: User | null; error: any | null }>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseAuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserData = useCallback(async (auth_user: SupabaseAuthUser | null) => {
    if (auth_user) {
      setSupabaseUser(auth_user);
      const userDocRef = doc(db, 'users', auth_user.id);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as User;
        setUser({ ...userData, id: auth_user.id });
      } else {
        // This handles cases where a user might exist in Supabase auth but not Firestore
        // e.g., if Firestore document creation failed during signup.
        setUser(null);
      }
    } else {
      setSupabaseUser(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        await fetchUserData(session?.user ?? null);
        setLoading(false);
    }

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        await fetchUserData(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUserData]);


  const refreshUser = useCallback(async () => {
    if (supabaseUser) {
      setLoading(true);
      await fetchUserData(supabaseUser);
    }
  }, [supabaseUser, fetchUserData]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { user: null, error };
    }
    if (data.user) {
      const userDocRef = doc(db, 'users', data.user.id);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as User;
        const finalUser = { ...userData, id: data.user.id };
        setUser(finalUser);
        return { user: finalUser, error: null };
      }
    }
    return { user: null, error: { message: "User not found in database." } };
  };

  const signup = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      return { user: null, error };
    }

    if (data.user) {
      const newUser: User = {
        id: data.user.id,
        name,
        email,
        points: 500,
        role: email === 'admin@rewear.com' ? 'admin' : 'user',
        avatarUrl: `https://placehold.co/100x100.png`,
      };
      await setDoc(doc(db, 'users', data.user.id), { ...newUser, createdAt: serverTimestamp() });
      setUser(newUser);
      return { user: newUser, error: null };
    }
    return { user: null, error: { message: "Could not create user."} };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUser, session, login, signup, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
