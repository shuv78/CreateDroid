import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './db/supabase';
import ErrorBoundary from './screens/ErrorBoundary';
import { useDarkMode } from './features/useDarkMode';

// Auth context
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Theme context
export const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
      } catch (err) {
        console.error('Auth session init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

function ThemeProvider({ children }) {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [direction, setDirection] = useState('ltr');
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('app-language') || 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('app-language', language);
    } catch { /* ignore quota errors */ }
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'bn' ? 'rtl' : 'ltr';
    setDirection(language === 'bn' ? 'rtl' : 'ltr');
  }, [language]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, language, setLanguage, direction }}>
      {children}
    </ThemeContext.Provider>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { darkMode, direction, language } = useTheme();

  // Lazy imports for route-level code splitting
  const [screens, setScreens] = useState(null);

  useEffect(() => {
    const loadScreens = async () => {
      try {
        const modules = await Promise.all([
          import('./screens/Login'),
          import('./screens/Dashboard'),
          import('./screens/Onboarding'),
          import('./screens/ListView'),
          import('./screens/FormView'),
          import('./screens/DetailView'),
          import('./screens/Profile'),
          import('./screens/Settings'),
          import('./screens/About'),
          import('./screens/Privacy'),
          import('./screens/Terms'),
          import('./screens/Contact'),
          import('./screens/RateShare'),
        ]);
        setScreens({
          Login: modules[0].default,
          Dashboard: modules[1].default,
          Onboarding: modules[2].default,
          ListView: modules[3].default,
          FormView: modules[4].default,
          DetailView: modules[5].default,
          Profile: modules[6].default,
          Settings: modules[7].default,
          About: modules[8].default,
          Privacy: modules[9].default,
          Terms: modules[10].default,
          Contact: modules[11].default,
          RateShare: modules[12].default,
        });
      } catch (err) {
        console.error('Failed to load screens:', err);
      }
    };
    loadScreens();
  }, []);

  if (!screens) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: darkMode ? '#09090b' : '#fafafa', color: darkMode ? '#fafafa' : '#09090b'
      }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div
      dir={direction}
      lang={language}
      style={{
        background: darkMode ? '#09090b' : '#fafafa',
        color: darkMode ? '#fafafa' : '#09090b',
        minHeight: '100vh',
        transition: 'background 0.3s, color 0.3s',
      }}
    >
      <Routes>
        {/* Guest routes */}
        <Route path="/" element={<GuestRoute><screens.Onboarding /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><screens.Login /></GuestRoute>} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><screens.Dashboard /></ProtectedRoute>} />
        <Route path="/list/:table" element={<ProtectedRoute><screens.ListView /></ProtectedRoute>} />
        <Route path="/form/:table" element={<ProtectedRoute><screens.FormView /></ProtectedRoute>} />
        <Route path="/form/:table/:id" element={<ProtectedRoute><screens.FormView /></ProtectedRoute>} />
        <Route path="/detail/:table/:id" element={<ProtectedRoute><screens.DetailView /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><screens.Profile /></ProtectedRoute>} />

        {/* Public routes */}
        <Route path="/settings" element={<screens.Settings />} />
        <Route path="/about" element={<screens.About />} />
        <Route path="/privacy" element={<screens.Privacy />} />
        <Route path="/terms" element={<screens.Terms />} />
        <Route path="/contact" element={<screens.Contact />} />
        <Route path="/rate-share" element={<screens.RateShare />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
