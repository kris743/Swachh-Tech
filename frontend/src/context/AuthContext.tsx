'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'CITIZEN' | 'WORKER' | 'ADMIN';
  citizenProfile?: {
    id: string;
    rewardPoints: number;
    rewardLevel: string;
    householdId?: string;
  };
  workerProfile?: {
    id: string;
    employeeId: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/auth/me');
      // Handle wrapped responses from NestJS TransformInterceptor
      const userData = res.data?.data ? res.data.data : res.data;
      setUser(userData);
    } catch (err) {
      // Fallback to Supabase session if backend JWT validation fails
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          firstName: session.user.user_metadata?.first_name || 'User',
          lastName: session.user.user_metadata?.last_name || '',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'CITIZEN'
        } as any);
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUser();
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          fetchUser();
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = () => {
    fetchUser();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
