import { ReactNode, createContext, useCallback, useEffect, useState } from 'react';

import { api } from '@services/api';
import { UserDTO } from '@dtos/UserDTO';
import {
  storageAuthTokenSave,
  storageAuthTokenGet,
  storageAuthTokenRemove,
} from '@storage/storageAuthToken';
import { storageUserSave, storageUserGet, storageUserRemove } from '@storage/storageUser';

export type AuthContextDataProps = {
  user: UserDTO;
  updateUserProfile: (userUpdated: UserDTO) => Promise<void>;
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

  function userAndTokenUpdate(userData: UserDTO, token: string) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  }

  async function storageUserAndTokenSave(userData: UserDTO, token: string, refresh_token: string) {
    try {
      setIsLoadingStorageUser(true);

      await storageUserSave(userData);
      await storageAuthTokenSave({ token, refresh_token });
    } finally {
      setIsLoadingStorageUser(false);
    }
  }

  async function signIn(email: string, password: string) {
    type ResponseType = {
      token: string;
      refresh_token: string;
      user: UserDTO;
    };
    try {
      const { data } = await api.post<ResponseType>('/sessions', { email, password });

      if (data.user && data.token && data.refresh_token) {
        await storageUserAndTokenSave(data.user, data.token, data.refresh_token);
        userAndTokenUpdate(data.user, data.token);
      }
    } catch (error) {
      console.log('Erro');
      throw error;
    }
  }

  const signOut = useCallback(async() => {
    try {
      setIsLoadingStorageUser(true);
      setUser({} as UserDTO);

      await storageUserRemove();
      await storageAuthTokenRemove();
    } finally {
      setIsLoadingStorageUser(false);
    }
  }, []);

  async function updateUserProfile(userUpdated: UserDTO) {
    try {
      setUser(userUpdated);
      await storageUserSave(userUpdated);
    } catch (error) {
      console.log('Error');
      throw error;
    }
  }

  const loadUserData = useCallback(async() => {
    try {
      setIsLoadingStorageUser(true);

      const userLogged = await storageUserGet();
      const { token } = await storageAuthTokenGet();

      if (userLogged && token) {
        userAndTokenUpdate(userLogged, token);
      }
    } finally {
      setIsLoadingStorageUser(false);
    }
  }, []);

  useEffect(() => {
    void loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    const subscribe = api.registerInterceptTokenManager(() => signOut);

    return () => {
      subscribe();
    };
  }, [signOut]);

  return (
    <AuthContext.Provider
      value={{ user, updateUserProfile, signIn, signOut, isLoadingStorageUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
