import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../App';

export default function Terms() {
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
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Terms of Service</h1>
      </header>

      <main style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7, fontSize: '14px', opacity: 0.8 }}>
        <div style={{
          background: cardBg, borderRadius: '16px', padding: '24px',
          border: `1px solid ${borderColor}`,
        }}>
          <p style={{ marginTop: 0 }}><strong>Last Updated:</strong> June 2025</p>

          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 12px' }}>1. Acceptance of Terms</h2>
          <p>By accessing or using AppFullStack, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.</p>

          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 12px' }}>2. Description of Service</h2>
          <p>AppFullStack provides a full-stack mobile application platform that enables users to create, manage, and interact with data through a user-friendly interface. The service includes:</p>
          <ul>
            <li>User authentication and account management</li>
            <li>Data creation, reading, updating, and deletion (CRUD)</li>
            <li>Real-time data synchronization</li>
            <li>File storage and sharing</li>
            <li>Push notifications (opt-in)</li>
          </ul>

          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 12px' }}>3. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul>
            <li>Provide accurate and complete registration information</li>
            <li>Maintain the confidentiality of your account credentials</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Not use the service for any unlawful purpose</li>
            <li>Not attempt to disrupt or compromise the service</li>
          </ul>

          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 12px' }}>4. Data Ownership</h2>
          <p>You retain full ownership of the data you create and store in the application. We do not claim any intellectual property rights over your content. You grant us a limited license to store, process, and transmit your data solely for the purpose of providing the service.</p>

          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 12px' }}>5. Limitation of Liability</h2>
          <p>AppFullStack is provided "as is" without warranty of any kind. We shall not be liable for any damages arising from the use or inability to use the service. In no event shall our liability exceed the amount you paid for the service.</p>

          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 12px' }}>6. Termination</h2>
          <p>We reserve the right to suspend or terminate your account at any time for violations of these terms. You may delete your account at any time through the app settings, which will remove your data from our systems.</p>

          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 12px' }}>7. Changes to Terms</h2>
          <p>We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms. We will notify you of material changes via email or in-app notification.</p>

          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 12px' }}>8. Governing Law</h2>
          <p>These terms shall be governed by and construed in accordance with the laws of Bangladesh, without regard to its conflict of law provisions.</p>

          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 12px' }}>9. Contact</h2>
          <p>For questions about these terms, please contact us at support@appfullstack.dev or through the Contact page in the app.</p>
        </div>
      </main>
    </div>
  );
}
