import { createClient } from '@supabase/supabase-js';

const runtimeConfig = typeof window !== 'undefined' ? window.__EDUBIA_CONFIG__ || {} : {};
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || runtimeConfig.url;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  runtimeConfig.publishableKey ||
  runtimeConfig.anonKey;

export const hasSupabaseConfig = Boolean(
  supabaseUrl &&
    supabasePublishableKey &&
    !String(supabaseUrl).includes('PASTE_') &&
    !String(supabasePublishableKey).includes('PASTE_'),
);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
