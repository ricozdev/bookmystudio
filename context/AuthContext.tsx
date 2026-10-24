'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, AuthUser, AuthResponse } from '@/lib/api/auth';

export interface User extends AuthUser {
  user_metadata?: {
    full_name?: string;
  };
}

export interface Session {
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  isVendor: boolean;
  isStudioOwner: boolean;
  isProfessional: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isSupport: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<AuthResponse>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    role?: 'CUSTOMER' | 'STUDIO_OWNER' | 'PROFESSIONAL';
  }) => Promise<AuthResponse>;
  becomeVendor: (payload: {
    vendorTypes?: ('studio' | 'location' | 'crew' | 'equipment')[];
    role?: 'STUDIO_OWNER' | 'PROFESSIONAL';
    companyName?: string | null;
    phone?: string | null;
    bio?: string | null;
  }) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapAuthUser(authUser: AuthUser): User {
  return {
    ...authUser,
    user_metadata: {
      full_name: authUser.fullName,
    },
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      if (res?.success && res.user) {
        const mappedUser = mapAuthUser(res.user);
        setUser(mappedUser);
        setSession({ user: mappedUser });
      } else {
        setUser(null);
        setSession(null);
      }
    } catch {
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    authApi
      .getMe()
      .then((res) => {
        if (!active) return;
        if (res?.success && res.user) {
          const mappedUser = mapAuthUser(res.user);
          setUser(mappedUser);
          setSession({ user: mappedUser });
        } else {
          setUser(null);
          setSession(null);
        }
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setSession(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
      const res = await authApi.login(credentials);
      if (res.success && res.user) {
        const mappedUser = mapAuthUser(res.user);
        setUser(mappedUser);
        setSession({ user: mappedUser });
      }
      return res;
    },
    []
  );

  const register = useCallback(
    async (data: {
      fullName: string;
      email: string;
      password: string;
      role?: 'CUSTOMER' | 'STUDIO_OWNER' | 'PROFESSIONAL';
    }): Promise<AuthResponse> => {
      const res = await authApi.register(data);
      if (res.success && res.user) {
        const mappedUser = mapAuthUser(res.user);
        setUser(mappedUser);
        setSession({ user: mappedUser });
      }
      return res;
    },
    []
  );

  const becomeVendor = useCallback(
    async (payload: {
      vendorTypes?: ('studio' | 'location' | 'crew' | 'equipment')[];
      role?: 'STUDIO_OWNER' | 'PROFESSIONAL';
      companyName?: string | null;
      phone?: string | null;
      bio?: string | null;
    }): Promise<AuthResponse> => {
      const res = await authApi.becomeVendor(payload);
      if (res.success && res.user) {
        const mappedUser = mapAuthUser(res.user);
        setUser(mappedUser);
        setSession({ user: mappedUser });
      }
      return res;
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue client cleanup even if network fails
    } finally {
      setUser(null);
      setSession(null);
    }
  }, []);

  const isVendor = Boolean(
    user?.roles?.some(
      (role) =>
        role === 'STUDIO_OWNER' ||
        role === 'PROFESSIONAL' ||
        role === 'ADMIN' ||
        role === 'SUPER_ADMIN'
    )
  );
  const isStudioOwner = Boolean(
    user?.roles?.includes('STUDIO_OWNER') ||
      user?.roles?.includes('ADMIN') ||
      user?.roles?.includes('SUPER_ADMIN')
  );
  const isProfessional = Boolean(
    user?.roles?.includes('PROFESSIONAL') ||
      user?.roles?.includes('ADMIN') ||
      user?.roles?.includes('SUPER_ADMIN')
  );
  const isSuperAdmin = Boolean(user?.roles?.includes('SUPER_ADMIN'));
  const isAdmin = Boolean(
    user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN')
  );
  const isSupport = Boolean(user?.roles?.includes('SUPPORT'));

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isConfigured: true,
        isVendor,
        isStudioOwner,
        isProfessional,
        isAdmin,
        isSuperAdmin,
        isSupport,
        signOut,
        refreshUser,
        login,
        register,
        becomeVendor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
