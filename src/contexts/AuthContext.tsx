
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

  const fetchUserData = useCallback(async (auth_user: FirebaseAuthUser) => {
    const userDocRef = doc(db, 'users', auth_user.uid);
    try {
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as User;
        setUser({ ...userData, id: auth_user.uid });
      } else {
        // This case might happen if user record in auth exists but not in firestore.
        // For robustness, we can log out the user or create a firestore record.
        // For now, we'll treat them as not fully logged in.
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // If fetching fails (e.g., offline), we might want to keep the user logged out in the state
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setFirebaseUser(user);
        await fetchUserData(user);
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  const refreshUser = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setLoading(true);
      setFirebaseUser(currentUser);
      await fetchUserData(currentUser);
      setLoading(false);
    }
  }, [fetchUserData]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user state.
      // We can refetch here if we want to return the user data immediately.
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as User;
        const finalUser = { ...userData, id: userCredential.user.uid };
        setLoading(false);
        return { user: finalUser, error: null };
      }
      setLoading(false);
      return { user: null, error: { message: "User data not found." } };
    } catch (error: any) {
      setLoading(false);
      return { user: null, error };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
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
      // onAuthStateChanged will handle setting the user state.
      setLoading(false);
      return { user: newUser, error: null };
    } catch (error: any) {
      setLoading(false);
      return { user: null, error };
    }
  };

  const logout = async () => {
    await signOut(auth);
    // onAuthStateChanged will clear user state.
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, login, signup, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
