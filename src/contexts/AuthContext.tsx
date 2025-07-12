
"use client";

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User as FirebaseAuthUser, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseAuthUser | null;
  login: (email: string, password: string) => Promise<{ user: User | null; error: any | null }>;
  signup: (name: string, email: string, password: string) => Promise<{ user: User | null; error: any | null }>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserData = useCallback(async (auth_user: FirebaseAuthUser | null) => {
    if (auth_user) {
      const userDocRef = doc(db, 'users', auth_user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as User;
        setUser({ ...userData, id: auth_user.uid });
      } else {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setFirebaseUser(auth_user);
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      await fetchUserData(user);
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  const refreshUser = useCallback(async () => {
    if (firebaseUser) {
      setLoading(true);
      await fetchUserData(firebaseUser);
    }
  }, [firebaseUser, fetchUserData]);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const authUser = userCredential.user;
      const userDocRef = doc(db, 'users', authUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as User;
        const finalUser = { ...userData, id: authUser.uid };
        setUser(finalUser);
        return { user: finalUser, error: null };
      }
      return { user: null, error: { message: "User data not found." } };
    } catch (error: any) {
      return { user: null, error };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const authUser = userCredential.user;
      
      const newUser: User = {
        id: authUser.uid,
        name,
        email,
        points: 500,
        role: email === 'admin@rewear.com' ? 'admin' : 'user',
        avatarUrl: `https://placehold.co/100x100.png`,
      };
      
      await setDoc(doc(db, 'users', authUser.uid), { ...newUser, createdAt: serverTimestamp() });
      setUser(newUser);
      
      return { user: newUser, error: null };
    } catch (error: any) {
      return { user: null, error };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, login, signup, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
