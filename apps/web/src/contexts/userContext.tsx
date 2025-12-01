'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  const [user, setUserState] = useState<UserState>(() => {
    // tenta ler do sessionStorage
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('user');
      return stored ? JSON.parse(stored) : defaultUser;
    }
    return defaultUser;
  });
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const setUser = (newUser: UserState | ((prev: UserState) => UserState)) => {
    setUserState(prev => {
      const updated = typeof newUser === 'function' ? (newUser as Function)(prev) : newUser;
      if (typeof window !== 'undefined') sessionStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
    setIsLoggedOut(false);
  };

  const clearUser = () => {
    setUserState(defaultUser);
    setIsLoggedOut(true);
    if (typeof window !== 'undefined') sessionStorage.removeItem('user');
  };

  const setLoggedOut = (value: boolean) => setIsLoggedOut(value);

  return (
    <UserContext.Provider value={{ user, setUser, clearUser, isLoggedOut, setLoggedOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
