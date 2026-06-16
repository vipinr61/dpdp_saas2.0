'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildFallbackUser(session: Session): User {
  const email = session.user.email ?? '';
  return {
    id: session.user.id,
    tenant_id: '',
    email,
    name: email.split('@')[0],
    role: 'ConsultantAdmin',
    created_at: session.user.created_at,
  };
}

async function resolveUser(session: Session): Promise<User> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('email', session.user.email)
    .maybeSingle();
  return data ?? buildFallbackUser(session);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setUser(await resolveUser(session));
      }
      setLoading(false);
    });

    // Keep in sync with auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          setUser(null);
          setLoading(false);
          return;
        }
        // Defer DB call out of the auth callback to avoid deadlock
        setTimeout(async () => {
          setUser(await resolveUser(session));
          setLoading(false);
        }, 0);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.session) throw new Error('No session returned');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
