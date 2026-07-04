import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../App';
import { supabase } from '../db/supabase';

const contactTopics = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Technical Support' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'billing', label: 'Billing Question' },
  { value: 'other', label: 'Other' },
];

export default function Contact() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [form, setForm] = useState({
    name: '',
    email: '',
    topic: 'general',
    subject: '',
    message: '',
    attach_logs: false,
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const validate = useCallback(() => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Valid email is required';
    if (!form.subject.trim()) return 'Subject is required';
    if (!form.message.trim()) return 'Message is required';
    if (form.message.trim().length < 10) return 'Message must be at least 10 characters';
    return null;
  }, [form]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSending(true);

    try {
      const { error: insertError } = await supabase
        .from('contacts')
        .insert([{
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          topic: form.topic,
          subject: form.subject.trim(),
          message: form.message.trim(),
          attach_logs: form.attach_logs,
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString(),
        }]);

      if (insertError) throw insertError;

      setSuccess(true);
      setForm({
        name: '', email: '', topic: 'general',
        subject: '', message: '', attach_logs: false,
      });
    } catch (err) {
      console.error('Contact submit error:', err);
      setError(err?.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }, [form, validate]);

  const bg = darkMode ? '#09090b' : '#fafafa';
  const textColor = darkMode ? '#fafafa' : '#09090b';
  const cardBg = darkMode ? '#18181b' : '#ffffff';
  const inputBg = darkMode ? '#27272a' : '#f4f4f5';
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <div style={{ minHeight: '100vh', background: bg, color: textColor, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{
        padding: '16px 20px', borderBottom: `1px solid ${borderColor}`,
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: textColor, cursor: 'pointer', fontSize: '20px' }}>←</button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Contact Us</h1>
      </header>

      <main style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        {success ? (
          <div style={{
            background: cardBg, borderRadius: '16px', padding: '32px 20px',
            border: `1px solid ${borderColor}`, textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 8px' }}>Message Sent!</h2>
            <p style={{ fontSize: '14px', opacity: 0.6, margin: '0 0 20px' }}>
              Thank you for reaching out. We'll get back to you within 24 hours.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setSuccess(false)}
                style={{
                  padding: '10px 20px', borderRadius: '10px', border: 'none',
                  background: '#7c3aed', color: '#fff', fontSize: '14px', cursor: 'pointer',
                }}
              >
                Send Another
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '10px 20px', borderRadius: '10px',
                  border: `1px solid ${borderColor}`, background: 'transparent',
                  color: textColor, fontSize: '14px', cursor: 'pointer',
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{
              background: cardBg, borderRadius: '16px', padding: '20px',
              border: `1px solid ${borderColor}`,
            }}>
              {error && (
                <div style={{
                  padding: '12px 16px', borderRadius: '10px',
                  background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                  fontSize: '14px', marginBottom: '16px',
                }}>
                  {error}
                </div>
              )}

              <ContactField label="Name" required>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  style={inputStyle(inputBg, borderColor, textColor)}
                />
              </ContactField>

              <ContactField label="Email" required>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  style={inputStyle(inputBg, borderColor, textColor)}
                />
              </ContactField>

              <ContactField label="Topic">
                <select
                  value={form.topic}
                  onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                  style={{
                    ...inputStyle(inputBg, borderColor, textColor),
                    cursor: 'pointer',
                  }}
                >
                  {contactTopics.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </ContactField>

              <ContactField label="Subject" required>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="Brief subject line"
                  style={inputStyle(inputBg, borderColor, textColor)}
                />
              </ContactField>

              <ContactField label="Message" required>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Describe your question, feedback, or issue..."
                  rows={5}
                  style={{
                    ...inputStyle(inputBg, borderColor, textColor),
                    resize: 'vertical', fontFamily: 'inherit',
                  }}
                />
              </ContactField>

              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="attach_logs"
                  checked={form.attach_logs}
                  onChange={(e) => setForm((f) => ({ ...f, attach_logs: e.target.checked }))}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="attach_logs" style={{ fontSize: '13px', cursor: 'pointer', opacity: 0.7 }}>
                  Include diagnostic logs to help debug
                </label>
              </div>

              <button
                type="submit"
                disabled={sending}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                  background: sending ? '#5b21b6' : '#7c3aed', color: '#fff',
                  fontSize: '16px', fontWeight: 600, cursor: sending ? 'not-allowed' : 'pointer',
                  opacity: sending ? 0.7 : 1,
                }}
              >
                {sending ? 'Sending...' : '📩 Send Message'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

function ContactField({ label, required, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function inputStyle(inputBg, borderColor, textColor) {
  return {
    width: '100%', padding: '12px 14px', borderRadius: '12px',
    border: `1px solid ${borderColor}`, background: inputBg,
    color: textColor, fontSize: '14px', outline: 'none',
    boxSizing: 'border-box',
  };
}
