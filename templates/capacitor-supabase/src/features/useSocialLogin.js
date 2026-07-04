import { useState } from 'react';
export function useSocialLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loginWithGoogle = async () => {
    setLoading(true); setError(null);
    try {
      const { supabase } = await import('../db/supabase');
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
      return data;
    } catch (e) { setError(e.message); return null; }
    finally { setLoading(false); }
  };
  const loginWithFacebook = async () => {
    setLoading(true); setError(null);
    try {
      const { supabase } = await import('../db/supabase');
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'facebook' });
      if (error) throw error;
      return data;
    } catch (e) { setError(e.message); return null; }
    finally { setLoading(false); }
  };
  return { loading, error, loginWithGoogle, loginWithFacebook };
}