import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { googleAuth } from '../firebase/config';

export const useAuth = () => {
  const [user, setUser] = useState();             // undefined while loading
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  return { user, loading: user === undefined };
};

export const login  = () => signInWithPopup(auth, googleAuth);
export const logout = () => signOut(auth);
