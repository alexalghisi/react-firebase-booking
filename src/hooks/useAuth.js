import { useState, useEffect } from 'react';
import { auth, provider } from '../firebase/config';            // import firebase auth & provider
import { onAuthStateChanged, signInWithRedirect, signOut } from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState(); // undefined means loading
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth,
        (u) => setUser(u),
        (err) => setError(err)
    );
    return unsubscribe;
  }, []);

  const login = () => signInWithRedirect(auth, provider);
  const logoutUser = () => signOut(auth);

  return { user, loading: user === undefined, error, login, logout: logoutUser };
};
