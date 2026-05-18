import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged, signInWithPopup, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendPasswordResetEmail, updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { createUserProfile, getUserProfile } from './db';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const prof = await getUserProfile(firebaseUser.uid);
        setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserProfile(result.user.uid, {
      displayName: result.user.displayName,
      email: result.user.email,
      photoURL: result.user.photoURL,
    });
    const prof = await getUserProfile(result.user.uid);
    setProfile(prof);
    return result;
  };

  const signUpWithEmail = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await createUserProfile(result.user.uid, { displayName, email, photoURL: null });
    const prof = await getUserProfile(result.user.uid);
    setProfile(prof);
    return result;
  };

  const signInWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const prof = await getUserProfile(result.user.uid);
    setProfile(prof);
    return result;
  };

  const logout = () => signOut(auth);
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);
  const refreshProfile = async () => {
    if (user) { const prof = await getUserProfile(user.uid); setProfile(prof); }
  };

  const isAdmin = profile?.isAdmin === true;

  return (
    <AuthContext.Provider value={{
      user, profile, loading, isAdmin,
      signInWithGoogle, signUpWithEmail, signInWithEmail,
      logout, resetPassword, refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
