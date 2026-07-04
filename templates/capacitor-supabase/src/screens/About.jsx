import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../App';

const changelog = [
  { version: '1.0.0', date: '2025-06-01', changes: [
    'Initial release with Capacitor 6 + Supabase',
    'Authentication with email/password and OAuth',
    'CRUD operations with real-time sync',
    'Dark mode, i18n (English/Bengali), RTL support',
    'PWA with offline service worker',
    'Camera, scanner, maps, payment features',
    'Biometric authentication support',
    'Export to CSV/JSON and PDF generation',
  ]},
];

const currentVersion = '1.0.0';

export default function About() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const handleCheckUpdate = useCallback(async () => {
    setCheckingUpdate(true);
    try {
      // Simulate update check — replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert('You are up to date! Version ' + currentVersion + ' is the latest.');
    } catch (err) {
      console.error('Update check error:', err);
      alert('Failed to check for updates. Please try again.');
    } finally {
      setCheckingUpdate(false);
    }
  }, []);

  const bg = darkMode ? '#09090b' : '#fafafa';
  const textColor = darkMode ? '#fafafa' : '#09090b';
  const cardBg = darkMode ? '#18181b' : '#ffffff';
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <div style={{ minHeight: '100vh', background: bg, color: textColor, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{
        padding: '16px 20px', borderBottom: `1px solid ${borderColor}`,
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: textColor, cursor: 'pointer', fontSize: '20px' }}>←</button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>About</h1>
      </header>

      <main style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        {/* App info card */}
        <div style={{
          background: cardBg, borderRadius: '16px', padding: '32px 20px',
          border: `1px solid ${borderColor}`, textAlign: 'center', marginBottom: '24px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚡</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>AppFullStack</h2>
          <p style={{ fontSize: '14px', opacity: 0.5, margin: '0 0 16px' }}>
            Version {currentVersion}
          </p>
          <p style={{ fontSize: '14px', opacity: 0.6, margin: 0, lineHeight: 1.5 }}>
            Full-stack mobile application template built with Capacitor 6 and Supabase.
            Features real-time data, authentication, offline support, and a modern UI.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
            <button
              onClick={handleCheckUpdate}
              disabled={checkingUpdate}
              style={{
                padding: '10px 20px', borderRadius: '10px', border: 'none',
                background: '#7c3aed', color: '#fff', fontSize: '14px',
                cursor: checkingUpdate ? 'not-allowed' : 'pointer', opacity: checkingUpdate ? 0.7 : 1,
              }}
            >
              {checkingUpdate ? 'Checking...' : '🔍 Check for Update'}
            </button>
          </div>
        </div>

        {/* Developer info */}
        <div style={{
          background: cardBg, borderRadius: '16px', padding: '20px',
          border: `1px solid ${borderColor}`, marginBottom: '24px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 12px' }}>Developer</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', opacity: 0.7 }}>
            <p style={{ margin: 0 }}>Built with React 18, Capacitor 6, Vite</p>
            <p style={{ margin: 0 }}>Backend: Supabase (PostgreSQL + Realtime)</p>
            <p style={{ margin: 0 }}>JDK 21 (Zulu) for Android builds</p>
          </div>
        </div>

        {/* Changelog */}
        <div style={{
          background: cardBg, borderRadius: '16px', padding: '20px',
          border: `1px solid ${borderColor}`,
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px' }}>Changelog</h3>
          {changelog.map((release) => (
            <div key={release.version} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                <strong style={{ fontSize: '15px' }}>v{release.version}</strong>
                <span style={{ fontSize: '12px', opacity: 0.4 }}>{release.date}</span>
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '13px', opacity: 0.7, lineHeight: 1.8 }}>
                {release.changes.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div style={{ textAlign: 'center', padding: '24px 0', opacity: 0.3, fontSize: '12px', lineHeight: 1.6 }}>
          <p style={{ margin: 0 }}>Capacitor 6 · Supabase · React 18 · Vite</p>
          <p style={{ margin: '4px 0 0' }}>© 2025 AppFullStack. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
