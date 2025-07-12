
"use client";

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type User as FirebaseAuthUser } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/lib/types';
import * as api from '@/lib/mockApi';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseAuthUser | null;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (name: string, email: string, password: string) => Promise<User | null>;
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

  const fetchUserData = useCallback(async (firebase_user: FirebaseAuthUser | null) => {
    if (firebase_user) {
      setFirebaseUser(firebase_user);
      const userDocRef = doc(db, 'users', firebase_user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as User;
        setUser({ ...userData, id: firebase_user.uid });
      } else {
        const mockUser = api.getUserByEmail(firebase_user.email!);
        if (mockUser) {
           const { id, ...mockData } = mockUser;
           const newUser: User = { ...mockData, id: firebase_user.uid, role: 'user' };
           await setDoc(userDocRef, { ...newUser, createdAt: serverTimestamp() });
           setUser(newUser);
        } else {
          setUser(null);
        }
      }
    } else {
      setFirebaseUser(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        fetchUserData(user);
    });
    return () => unsubscribe();
  }, [fetchUserData]);

  const refreshUser = useCallback(async () => {
    if (auth.currentUser) {
      setLoading(true);
      await fetchUserData(auth.currentUser);
    }
  }, [fetchUserData]);

  const login = async (email: string, password: string): Promise<User | null> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;
    if (fbUser) {
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as User;
        const finalUser = { ...userData, id: fbUser.uid };
        setUser(finalUser);
        setFirebaseUser(fbUser);
        return finalUser;
      }
    }
    return null;
  };

  const signup = async (name: string, email: string, password: string): Promise<User | null> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;
    if (fbUser) {
        const newUser: User = {
            id: fbUser.uid,
            name,
            email,
            points: 500,
            role: email === 'admin@rewear.com' ? 'admin' : 'user',
            avatarUrl: `https://placehold.co/100x100.png`,
        };
        await setDoc(doc(db, 'users', fbUser.uid), { ...newUser, createdAt: serverTimestamp() });
        setUser(newUser);
        setFirebaseUser(fbUser);
        return newUser;
    }
    return null;
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
