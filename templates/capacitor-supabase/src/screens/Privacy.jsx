import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../App';

export default function Privacy() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

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
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Privacy Policy</h1>
      </header>

      <main style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7, fontSize: '14px', opacity: 0.8 }}>
        <div style={{
          background: cardBg, borderRadius: '16px', padding: '24px',
          border: `1px solid ${borderColor}`,
        }}>
          <p style={{ marginTop: 0 }}><strong>Last Updated:</strong> June 2025</p>

          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 12px' }}>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including:</p>
          <ul>
            <li>Account information (email address, name) when you register</li>
            <li>Profile information you choose to add (avatar, phone, bio)</li>
            <li>Content you create through the application</li>
            <li>Device information for push notifications (with your consent)</li>
          </ul>

          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 12px' }}>2. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Protect against fraud and abuse</li>
          </ul>

          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 12px' }}>3. Data Storage & Security</h2>
          <p>Your data is stored securely using Supabase's infrastructure with:</p>
          <ul>
            <li>Encryption at rest and in transit</li>
            <li>Row-Level Security (RLS) policies on all tables</li>
            <li>Regular security audits and updates</li>
          </ul>

          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 12px' }}>4. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>Supabase</strong> — Database, authentication, and storage</li>
            <li><strong>Capacitor</strong> — Native device feature access</li>
            <li><strong>Map providers</strong> (Google Maps, OpenStreetMap) — Location features</li>
          </ul>

          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 12px' }}>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and associated data</li>
            <li>Export your data</li>
            <li>Withdraw consent for notifications at any time</li>
          </ul>

          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 12px' }}>6. Contact</h2>
          <p>If you have questions about this privacy policy, please contact us through the app's Contact page or email support@appfullstack.dev.</p>

          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 12px' }}>7. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.</p>
        </div>
      </main>
    </div>
  );
}
