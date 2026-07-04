import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, useAuth } from '../App';
import { supabase } from '../db/supabase';

export default function Profile() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user, signOut } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    avatar_url: '',
    phone: '',
    bio: '',
    company: '',
    website: '',
    location: '',
  });

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      const p = data || {};
      setProfile(p);
      setForm({
        full_name: p.full_name || '',
        avatar_url: p.avatar_url || '',
        phone: p.phone || '',
        bio: p.bio || '',
        company: p.company || '',
        website: p.website || '',
        location: p.location || '',
      });
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Could not load profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    try {
      setSaving(true);
      setError(null);

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          updated_at: new Date().toISOString(),
          ...form,
        }, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      setEditMode(false);
      setProfile((prev) => ({ ...prev, ...form }));
      alert('Profile updated!');
    } catch (err) {
      setError(err?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }, [user, form]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, [signOut, navigate]);

  const bg = darkMode ? '#09090b' : '#fafafa';
  const textColor = darkMode ? '#fafafa' : '#09090b';
  const cardBg = darkMode ? '#18181b' : '#ffffff';
  const inputBg = darkMode ? '#27272a' : '#f4f4f5';
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: bg }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, color: textColor, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{
        padding: '16px 20px', borderBottom: `1px solid ${borderColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: textColor, cursor: 'pointer', fontSize: '20px' }}>←</button>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Profile</h1>
        </div>
        <button
          onClick={() => editMode ? setEditMode(false) : setEditMode(true)}
          style={{
            padding: '8px 16px', borderRadius: '10px', border: `1px solid ${borderColor}`,
            background: editMode ? '#7c3aed' : 'transparent',
            color: editMode ? '#fff' : textColor, cursor: 'pointer', fontSize: '14px',
          }}
        >
          {editMode ? 'Cancel' : '✏️ Edit'}
        </button>
      </header>

      <main style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        {error && (
          <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Avatar section */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 12px',
            background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', color: '#fff', overflow: 'hidden',
          }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.email?.[0]?.toUpperCase() || '👤'
            )}
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 4px' }}>
            {profile?.full_name || user?.email?.split('@')[0] || 'User'}
          </h2>
          <p style={{ fontSize: '14px', opacity: 0.5, margin: 0 }}>{user?.email}</p>
          {profile?.location && <p style={{ fontSize: '13px', opacity: 0.4, margin: '4px 0 0' }}>📍 {profile.location}</p>}
        </div>

        {/* Profile fields */}
        {editMode ? (
          <div style={{
            background: cardBg, borderRadius: '16px', padding: '20px',
            border: `1px solid ${borderColor}`,
          }}>
            <EditField label="Full Name" value={form.full_name} onChange={(v) => setForm((f) => ({ ...f, full_name: v }))} inputBg={inputBg} borderColor={borderColor} textColor={textColor} />
            <EditField label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} type="tel" inputBg={inputBg} borderColor={borderColor} textColor={textColor} />
            <EditField label="Company" value={form.company} onChange={(v) => setForm((f) => ({ ...f, company: v }))} inputBg={inputBg} borderColor={borderColor} textColor={textColor} />
            <EditField label="Website" value={form.website} onChange={(v) => setForm((f) => ({ ...f, website: v }))} type="url" inputBg={inputBg} borderColor={borderColor} textColor={textColor} />
            <EditField label="Location" value={form.location} onChange={(v) => setForm((f) => ({ ...f, location: v }))} inputBg={inputBg} borderColor={borderColor} textColor={textColor} />
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                rows={3}
                placeholder="Tell us about yourself"
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '12px',
                  border: `1px solid ${borderColor}`, background: inputBg,
                  color: textColor, fontSize: '14px', outline: 'none',
                  resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit',
                }}
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: saving ? '#5b21b6' : '#7c3aed', color: '#fff',
                fontSize: '16px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        ) : (
          <div style={{
            background: cardBg, borderRadius: '16px',
            border: `1px solid ${borderColor}`, overflow: 'hidden',
          }}>
            <ProfileField label="Email" value={user?.email} />
            {profile?.phone && <ProfileField label="Phone" value={profile.phone} />}
            {profile?.company && <ProfileField label="Company" value={profile.company} />}
            {profile?.website && <ProfileField label="Website" value={profile.website} />}
            {profile?.location && <ProfileField label="Location" value={profile.location} />}
            {profile?.bio && <ProfileField label="Bio" value={profile.bio} multiline />}
            {profile?.created_at && <ProfileField label="Member Since" value={new Date(profile.created_at).toLocaleDateString()} />}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '14px', borderRadius: '12px', marginTop: '20px',
            border: '1px solid rgba(239,68,68,0.3)',
            background: 'transparent', color: '#ef4444', fontSize: '15px', fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🚪 Sign Out
        </button>
      </main>

      <style>{`
        .spinner {
          width: 36px; height: 36px;
          border: 3px solid rgba(124,58,237,0.2);
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function ProfileField({ label, value, multiline }) {
  return (
    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.4, margin: '0 0 4px' }}>
        {label}
      </p>
      <p style={{ fontSize: '14px', margin: 0, lineHeight: multiline ? 1.5 : 1 }}>
        {value || <span style={{ opacity: 0.3, fontStyle: 'italic' }}>Not set</span>}
      </p>
    </div>
  );
}

function EditField({ label, value, onChange, type = 'text', inputBg, borderColor, textColor }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Your ${label.toLowerCase()}`}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: '12px',
          border: `1px solid ${borderColor}`, background: inputBg,
          color: textColor, fontSize: '14px', outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}
