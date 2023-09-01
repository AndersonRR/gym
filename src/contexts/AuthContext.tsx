import { ReactNode, createContext, useEffect, useState } from 'react';

import { api } from '@services/api';
import { UserDTO } from '@dtos/UserDTO';
import { storageUserSave, storageUserGet, storageUserRemove } from '@storage/storageUser';

export type AuthContextDataProps = {
  user: UserDTO;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoadingStorageUser: boolean;
};

type AuthContextProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<UserDTO>({} as UserDTO);
  const [isLoadingStorageUser, setIsLoadingStorageUser] = useState(true);

  async function signIn(email: string, password: string) {
    try {
      const { data } = await api.post('/sessions', { email, password });

      if (data.user) {
        setUser(data.user);
        storageUserSave(data.user);
      }
    } catch (error) {
      throw error;
    }
  }

  async function signOut() {
    try {
      setIsLoadingStorageUser(true);
      setUser({} as UserDTO);
      storageUserRemove();
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingStorageUser(false);
    }
  }

  async function loadUserData() {
    try {
      const userLogged = await storageUserGet();

      if (userLogged) {
        setUser(userLogged);
        setIsLoadingStorageUser(false);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingStorageUser(false);
    }
  }

  useEffect(() => {
    loadUserData();
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isLoadingStorageUser }}>
      {children}
    </AuthContext.Provider>
  );
}
