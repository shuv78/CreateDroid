import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../App';

export default function Settings() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, language, setLanguage } = useTheme();
  const [clearDataLoading, setClearDataLoading] = useState(false);

  const handleClearCache = useCallback(async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      alert('Cache cleared successfully');
    } catch (err) {
      console.error('Clear cache error:', err);
      alert('Failed to clear cache');
    }
  }, []);

  const handleClearLocalData = useCallback(async () => {
    setClearDataLoading(true);
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      alert('All local data cleared. App will reload.');
      window.location.reload();
    } catch (err) {
      console.error('Clear data error:', err);
      alert('Failed to clear data');
    } finally {
      setClearDataLoading(false);
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
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Settings</h1>
      </header>

      <main style={{ padding: '16px 20px', maxWidth: '500px', margin: '0 auto' }}>
        {/* Appearance */}
        <Section title="Appearance" cardBg={cardBg} borderColor={borderColor}>
          <SettingRow label="Dark Mode" borderColor={borderColor}>
            <ToggleSwitch checked={darkMode} onChange={toggleDarkMode} />
          </SettingRow>
          <SettingRow label="Language" borderColor={borderColor} isLast>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: '8px',
                border: `1px solid ${borderColor}`,
                background: darkMode ? '#27272a' : '#f4f4f5',
                color: textColor, fontSize: '14px', cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
            </select>
          </SettingRow>
        </Section>

        {/* App Info */}
        <Section title="App Info" cardBg={cardBg} borderColor={borderColor}>
          <SettingRow label="About" onClick={() => navigate('/about')} borderColor={borderColor} clickable>
            <span style={{ opacity: 0.4 }}>→</span>
          </SettingRow>
          <SettingRow label="Privacy Policy" onClick={() => navigate('/privacy')} borderColor={borderColor} clickable>
            <span style={{ opacity: 0.4 }}>→</span>
          </SettingRow>
          <SettingRow label="Terms of Service" onClick={() => navigate('/terms')} borderColor={borderColor} clickable>
            <span style={{ opacity: 0.4 }}>→</span>
          </SettingRow>
          <SettingRow label="Contact Us" onClick={() => navigate('/contact')} borderColor={borderColor} clickable isLast>
            <span style={{ opacity: 0.4 }}>→</span>
          </SettingRow>
        </Section>

        {/* Actions */}
        <Section title="Data & Storage" cardBg={cardBg} borderColor={borderColor}>
          <SettingRow label="Clear Cache" onClick={handleClearCache} borderColor={borderColor} clickable>
            <span style={{ opacity: 0.4, fontSize: '13px' }}>Clear</span>
          </SettingRow>
          <SettingRow label="Clear All Local Data" onClick={handleClearLocalData} borderColor={borderColor} clickable isLast>
            <span style={{ opacity: 0.4, fontSize: '13px' }}>
              {clearDataLoading ? '...' : 'Clear'}
            </span>
          </SettingRow>
        </Section>

        {/* Version */}
        <div style={{ textAlign: 'center', padding: '20px', opacity: 0.3, fontSize: '13px' }}>
          <p style={{ margin: '0 0 4px' }}>AppFullStack v1.0.0</p>
          <p style={{ margin: 0 }}>
            Built with Capacitor 6 + Supabase
          </p>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children, cardBg, borderColor }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h2 style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.5, margin: '0 0 8px 4px' }}>
        {title}
      </h2>
      <div style={{
        background: cardBg, borderRadius: '16px',
        border: `1px solid ${borderColor}`, overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, children, onClick, borderColor, isLast, clickable }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px',
        borderBottom: isLast ? 'none' : `1px solid ${borderColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'opacity 0.15s',
      }}
    >
      <span style={{ fontSize: '15px', fontWeight: 500 }}>{label}</span>
      <div>{children}</div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      style={{
        width: '48px', height: '26px', borderRadius: '13px',
        border: 'none', padding: '2px', cursor: 'pointer',
        background: checked ? '#7c3aed' : 'rgba(255,255,255,0.15)',
        position: 'relative', transition: 'background 0.2s',
      }}
    >
      <div style={{
        width: '22px', height: '22px', borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        position: 'absolute', top: '2px',
        left: checked ? '24px' : '2px',
        transition: 'left 0.2s',
      }} />
    </button>
  );
}
