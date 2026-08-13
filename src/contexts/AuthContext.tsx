import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Gym = Database['public']['Tables']['gyms']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  gym: Gym | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [gym, setGym] = useState<Gym | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData(session: Session | null) {
      if (!session) {
        if (mounted) {
          setUser(null);
          setProfile(null);
          setGym(null);
          setIsLoading(false);
        }
        return;
      }

      if (mounted) {
        setUser(session.user);
        setIsLoading(true);
        setError(null);
      }

      try {
        // Fetch Profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (profileError) throw profileError;
        
        if (mounted) {
          setProfile(profileData as Profile);
        }

        // Fetch Gym if profile is attached to one
        if ((profileData as Profile)?.gym_id) {
          const { data: gymData, error: gymError } = await supabase
            .from('gyms')
            .select('*')
            .eq('id', (profileData as Profile).gym_id!)
            .single();

          if (gymError) throw gymError;

          if (mounted) {
            setGym(gymData as Gym);
          }
        }
      } catch (err: any) {
        console.error('Error loading auth data:', err);
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    // Initial session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      loadData(session);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      loadData(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, gym, session, isLoading, error, signOut }}>
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
