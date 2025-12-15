'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { refreshToken } from '@/lib/api';

interface UserState {
  id: string | null;
  firstName: string;
  lastName: string;
  clinicalInfoId: string | null;
  role: string;
}

interface UserContextType {
  user: UserState;
  setUser: (user: UserState | ((prev: UserState) => UserState)) => void;
  clearUser: () => void;
  isLoggedOut: boolean;
  setLoggedOut: (value: boolean) => void;
}

const defaultUser: UserState = {
  id: null,
  firstName: '',
  lastName: '',
  clinicalInfoId: null,
  role: '',
};

const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUser: () => {},
  clearUser: () => {},
  isLoggedOut: false,
  setLoggedOut: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserState>(defaultUser);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      const stored = sessionStorage.getItem('user');
      if (stored) {
        setUserState(JSON.parse(stored));
        setIsMounted(true);
        return;
      }

      // Tenta refresh token do servidor
      try {
        const session = await refreshToken();
        if (session?.id && mounted) {
          const newUser = {
            id: session.id,
            firstName: session.firstName ?? '',
            lastName: session.lastName ?? '',
            clinicalInfoId: session.clinicalInfoId ?? null,
            role: session.role ?? '',
          };
          setUserState(newUser);
          sessionStorage.setItem('user', JSON.stringify(newUser));
          setIsLoggedOut(false);
        }
      } catch (err) {
        console.warn('Não foi possível restaurar a sessão:', err);
      } finally {
        if (mounted) setIsMounted(true);
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const setUser = (newUser: UserState | ((prev: UserState) => UserState)) => {
    setUserState(prev => {
      const updated = typeof newUser === 'function' ? (newUser as Function)(prev) : newUser;
      sessionStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
    setIsLoggedOut(false);
  };

  const clearUser = () => {
    setUserState(defaultUser);
    setIsLoggedOut(true);
    sessionStorage.removeItem('user');
  };

  const setLoggedOut = (value: boolean) => setIsLoggedOut(value);

  return (
    <UserContext.Provider value={{ user, setUser, clearUser, isLoggedOut, setLoggedOut }}>
      {/* Renderiza os filhos SOMENTE após a montagem e tentativa de restaurar sessão */}
      {isMounted ? children : null}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
