import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function claimLegacyData() {
    const result = await supabase.rpc('claim_legacy_edubia_data');
    if (result.error && !['PGRST202', '42883'].includes(result.error.code)) {
      throw result.error;
    }
  }

  async function loadProfile(user) {
    if (!user || !supabase) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, share_token')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      const fallback = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Instructor',
        email: user.email,
      };
      const result = await supabase.from('profiles').upsert(fallback).select().single();
      if (result.error) throw result.error;
      setProfile(result.data);
      await claimLegacyData();
      return;
    }

    setProfile(data);
    await claimLegacyData();
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      try {
        await loadProfile(data.session?.user);
      } finally {
        if (active) setLoading(false);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      window.setTimeout(async () => {
        try {
          await loadProfile(nextSession?.user);
        } finally {
          setLoading(false);
        }
      }, 0);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      refreshProfile: () => loadProfile(session?.user),
      signOut: () => supabase.auth.signOut(),
    }),
    [session, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
