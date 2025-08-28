'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await createClient().auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      const { error } = await createClient().auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Authentication</h2>
      {error && <p className="error">{error}</p>}
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      
      <button onClick={handleSignIn} disabled={loading}>
        {loading ? 'Loading...' : 'Sign In'}
      </button>
      
      <button onClick={handleSignUp} disabled={loading}>
        {loading ? 'Loading...' : 'Sign Up'}
      </button>
    </div>
  );
}