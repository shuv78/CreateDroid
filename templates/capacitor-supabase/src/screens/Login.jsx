import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../App';
import { supabase } from '../db/supabase';

export default function Login() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState('login'); // login | signup | forgot

  const validateForm = useCallback(() => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    if (mode !== 'forgot' && !password.trim()) return 'Password is required';
    if (mode === 'signup' && password.length < 6) return 'Password must be at least 6 characters';
    return null;
  }, [email, password, mode]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (authError) throw authError;
        if (data?.user) {
          navigate('/dashboard', { replace: true });
        }
      } else if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: window.location.origin + '/login',
          },
        });
        if (signUpError) throw signUpError;
        if (data?.user?.identities?.length === 0) {
          setError('An account with this email already exists. Please sign in.');
        } else {
          setError(null);
          setMode('login');
          alert('Check your email for a confirmation link before signing in.');
        }
      } else if (mode === 'forgot') {
        const { error: forgotError } = await supabase.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
          { redirectTo: window.location.origin + '/login' }
        );
        if (forgotError) throw forgotError;
        alert('Password reset link has been sent to your email.');
        setMode('login');
      }
    } catch (err) {
      const message = err?.message || 'An unexpected error occurred';
      if (message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (message.includes('Email not confirmed')) {
        setError('Please confirm your email address before signing in.');
      } else if (message.includes('rate limit')) {
        setError('Too many attempts. Please wait a moment and try again.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [email, password, mode, navigate, validateForm]);

  const handleSocialLogin = useCallback(async (provider) => {
    try {
      setLoading(true);
      setError(null);
      const { error: socialError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/dashboard',
        },
      });
      if (socialError) throw socialError;
    } catch (err) {
      setError(err?.message || `${provider} login failed`);
    } finally {
      setLoading(false);
    }
  }, []);

  const bg = darkMode ? '#09090b' : '#fafafa';
  const textColor = darkMode ? '#fafafa' : '#09090b';
  const cardBg = darkMode ? '#18181b' : '#ffffff';
  const inputBg = darkMode ? '#27272a' : '#f4f4f5';
  const borderColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: bg,
        color: textColor,
        padding: '24px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: cardBg,
          borderRadius: '20px',
          padding: '32px 24px',
          boxShadow: darkMode
            ? '0 4px 24px rgba(0,0,0,0.4)'
            : '0 4px 24px rgba(0,0,0,0.06)',
        }}
      >
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚡</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>AppFullStack</h1>
          <p style={{ fontSize: '14px', opacity: 0.5, margin: '4px 0 0' }}>
            {mode === 'login' ? 'Welcome back!' : mode === 'signup' ? 'Create your account' : 'Reset password'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              fontSize: '14px',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoCapitalize="off"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: `1px solid ${borderColor}`,
                background: inputBg,
                color: textColor,
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#7c3aed')}
              onBlur={(e) => (e.target.style.borderColor = borderColor)}
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 16px',
                    borderRadius: '12px',
                    border: `1px solid ${borderColor}`,
                    background: inputBg,
                    color: textColor,
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#7c3aed')}
                  onBlur={(e) => (e.target.style.borderColor = borderColor)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: textColor,
                    opacity: 0.5,
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '4px',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: loading ? '#5b21b6' : '#7c3aed',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: '8px',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="spinner-small" />
                {mode === 'login' ? 'Signing in...' : mode === 'signup' ? 'Creating account...' : 'Sending reset link...'}
              </span>
            ) : (
              mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'
            )}
          </button>
        </form>

        {/* Social login buttons */}
        {mode === 'login' && (
          <div style={{ marginTop: '24px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px',
            }}>
              <div style={{ flex: 1, height: '1px', background: borderColor }} />
              <span style={{ fontSize: '13px', opacity: 0.4 }}>or continue with</span>
              <div style={{ flex: 1, height: '1px', background: borderColor }} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: `1px solid ${borderColor}`,
                  background: 'transparent',
                  color: textColor,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>Google</span>
              </button>
              <button
                onClick={() => handleSocialLogin('facebook')}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: `1px solid ${borderColor}`,
                  background: 'transparent',
                  color: textColor,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>Facebook</span>
              </button>
            </div>
          </div>
        )}

        {/* Mode toggles */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          {mode === 'login' && (
            <>
              <button
                onClick={() => setMode('forgot')}
                style={{ background: 'transparent', border: 'none', color: '#7c3aed', cursor: 'pointer', padding: '4px', fontSize: '14px' }}
              >
                Forgot password?
              </button>
              <div style={{ marginTop: '12px', opacity: 0.5 }}>
                Don't have an account?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(null); }}
                  style={{ background: 'transparent', border: 'none', color: '#7c3aed', cursor: 'pointer', padding: '4px', fontSize: '14px' }}
                >
                  Sign up
                </button>
              </div>
            </>
          )}
          {mode === 'signup' && (
            <div style={{ opacity: 0.5 }}>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError(null); }}
                style={{ background: 'transparent', border: 'none', color: '#7c3aed', cursor: 'pointer', padding: '4px', fontSize: '14px' }}
              >
                Sign in
              </button>
            </div>
          )}
          {mode === 'forgot' && (
            <button
              onClick={() => { setMode('login'); setError(null); }}
              style={{ background: 'transparent', border: 'none', color: '#7c3aed', cursor: 'pointer', padding: '4px', fontSize: '14px' }}
            >
              Back to sign in
            </button>
          )}
        </div>

        {/* Version badge */}
        <div style={{ textAlign: 'center', marginTop: '20px', opacity: 0.3, fontSize: '12px' }}>
          v1.0.0 • Capacitor + Supabase
        </div>
      </div>

      <style>{`
        .spinner-small {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
