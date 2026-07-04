import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, useAuth } from '../App';
import { supabase } from '../db/supabase';

const statsConfig = [
  { key: 'total_users', label: 'Total Users', icon: '👥', color: '#7c3aed', table: 'profiles' },
  { key: 'active_items', label: 'Active Items', icon: '📦', color: '#0891b2', table: null },
  { key: 'pending_tasks', label: 'Pending Tasks', icon: '📋', color: '#d97706', table: null },
  { key: 'completed', label: 'Completed', icon: '✅', color: '#059669', table: null },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user, signOut, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    total_users: 0,
    active_items: 0,
    pending_tasks: 0,
    completed: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch total profiles (users)
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (userError && !userError.message?.includes('does not exist')) throw userError;

      // Fetch recent activity from the last 10 items
      const { data: activity, error: activityError } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (activityError && !activityError.message?.includes('does not exist')) throw activityError;

      setStats((prev) => ({
        ...prev,
        total_users: userCount ?? 0,
      }));

      setRecentActivity(activity || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Could not load all dashboard data. Some features may be limited.');
      // Set fallback data
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [authLoading, user, fetchDashboardData]);

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
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: bg }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: bg,
        color: textColor,
        fontFamily: 'Inter, system-ui, sans-serif',
        paddingBottom: '80px',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${borderColor}`,
          position: 'sticky',
          top: 0,
          background: bg,
          zIndex: 10,
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: '13px', opacity: 0.5, margin: '2px 0 0' }}>
            Welcome, {user?.email?.split('@')[0] || 'User'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate('/settings')}
            style={{
              background: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: '12px',
              padding: '10px',
              cursor: 'pointer',
              fontSize: '18px',
              color: textColor,
            }}
            aria-label="Settings"
          >
            ⚙️
          </button>
          <button
            onClick={() => navigate('/profile')}
            style={{
              background: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: '12px',
              padding: '10px',
              cursor: 'pointer',
              fontSize: '18px',
              color: textColor,
            }}
            aria-label="Profile"
          >
            👤
          </button>
        </div>
      </header>

      <main style={{ padding: '16px 20px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Error banner */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              fontSize: '14px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        {/* Stats grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  background: cardBg,
                  borderRadius: '16px',
                  padding: '20px',
                  border: `1px solid ${borderColor}`,
                  opacity: 0.5,
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: borderColor, marginBottom: '12px' }} />
                <div style={{ width: '60%', height: '14px', borderRadius: '4px', background: borderColor, marginBottom: '6px' }} />
                <div style={{ width: '40%', height: '24px', borderRadius: '4px', background: borderColor }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            {statsConfig.map((stat) => (
              <div
                key={stat.key}
                style={{
                  background: cardBg,
                  borderRadius: '16px',
                  padding: '20px',
                  border: `1px solid ${borderColor}`,
                  transition: 'transform 0.2s',
                  cursor: 'pointer',
                }}
                onClick={() => stat.table && navigate(`/list/${stat.table}`)}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
                <p style={{ fontSize: '13px', opacity: 0.5, margin: '0 0 4px' }}>{stat.label}</p>
                <p style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: stat.color }}>
                  {stats[stat.key] ?? 0}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 12px' }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <ActionButton icon="➕" label="New Item" onClick={() => navigate('/form/items')} cardBg={cardBg} borderColor={borderColor} />
            <ActionButton icon="📋" label="View Items" onClick={() => navigate('/list/items')} cardBg={cardBg} borderColor={borderColor} />
            <ActionButton icon="📞" label="Contact" onClick={() => navigate('/contact')} cardBg={cardBg} borderColor={borderColor} />
            <ActionButton icon="⭐" label="Rate App" onClick={() => navigate('/rate-share')} cardBg={cardBg} borderColor={borderColor} />
          </div>
        </section>

        {/* Recent activity */}
        <section>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 12px' }}>Recent Activity</h2>
          {loading ? (
            <div style={{ background: cardBg, borderRadius: '16px', padding: '20px', border: `1px solid ${borderColor}`, opacity: 0.5 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ marginBottom: '16px' }}>
                  <div style={{ width: '50%', height: '14px', borderRadius: '4px', background: borderColor, marginBottom: '4px' }} />
                  <div style={{ width: '30%', height: '12px', borderRadius: '4px', background: borderColor }} />
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div
              style={{
                background: cardBg,
                borderRadius: '16px',
                padding: '32px 20px',
                textAlign: 'center',
                border: `1px solid ${borderColor}`,
                opacity: 0.6,
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
              <p style={{ margin: 0, fontSize: '14px' }}>No recent activity yet</p>
            </div>
          ) : (
            <div
              style={{
                background: cardBg,
                borderRadius: '16px',
                border: `1px solid ${borderColor}`,
                overflow: 'hidden',
              }}
            >
              {recentActivity.map((item, i) => (
                <div
                  key={item.id || i}
                  style={{
                    padding: '14px 16px',
                    borderBottom: i < recentActivity.length - 1 ? `1px solid ${borderColor}` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{ fontSize: '20px' }}>{item.icon || '📌'}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, margin: '0 0 2px' }}>
                      {item.title || item.action || 'Activity entry'}
                    </p>
                    <p style={{ fontSize: '12px', opacity: 0.4, margin: 0 }}>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Bottom nav */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: cardBg,
          borderTop: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 0',
          paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
          zIndex: 10,
        }}
      >
        <NavButton icon="🏠" label="Home" active onClick={() => navigate('/dashboard')} />
        <NavButton icon="📋" label="Items" onClick={() => navigate('/list/items')} />
        <NavButton icon="➕" label="Add" onClick={() => navigate('/form/items')} />
        <NavButton icon="👤" label="Profile" onClick={() => navigate('/profile')} />
        <NavButton icon="🚪" label="Logout" onClick={handleLogout} />
      </nav>

      <style>{`
        .spinner {
          width: 36px;
          height: 36px;
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

function ActionButton({ icon, label, onClick, cardBg, borderColor }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        borderRadius: '12px',
        border: `1px solid ${borderColor}`,
        background: cardBg,
        color: 'inherit',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500,
        transition: 'transform 0.2s',
        flex: '1 1 calc(50% - 5px)',
        minWidth: 0,
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        color: active ? '#7c3aed' : 'inherit',
        opacity: active ? 1 : 0.5,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        padding: '4px 12px',
        fontSize: '20px',
        transition: 'opacity 0.2s',
      }}
    >
      <span>{icon}</span>
      <span style={{ fontSize: '10px', fontWeight: 500 }}>{label}</span>
    </button>
  );
}
