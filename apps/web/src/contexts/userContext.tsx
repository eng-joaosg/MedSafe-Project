'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface UserState {
  id: string | null;
  firstName: string;
  lastName: string;
  clinicalInfoId: string | null;
}

interface UserContextType {
  user: UserState;
  setUser: (user: UserState | ((prev: UserState) => UserState)) => void; // ✅ aceita função
  clearUser: () => void;
}

const defaultUser: UserState = {
  id: null,
  firstName: '',
  lastName: '',
  clinicalInfoId: null,
};

const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUser: () => {},
  clearUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserState>(defaultUser);

  const setUser = (newUser: UserState | ((prev: UserState) => UserState)) => {
    setUserState(prev => (typeof newUser === 'function' ? (newUser as Function)(prev) : newUser));
  };

  const clearUser = () => setUserState(defaultUser);

  return (
    <UserContext.Provider value={{ user, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
