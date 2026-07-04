import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../App';
import { supabase } from '../db/supabase';

export default function DetailView() {
  const navigate = useNavigate();
  const { table, id } = useParams();
  const { darkMode } = useTheme();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      if (fetchError) throw fetchError;
      if (!data) {
        setError('Record not found');
        return;
      }
      setItem(data);
    } catch (err) {
      console.error('Detail fetch error:', err);
      setError(err?.message || 'Failed to load record');
    } finally {
      setLoading(false);
    }
  }, [table, id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const handleEdit = useCallback(() => {
    navigate(`/form/${table}/${id}`);
  }, [navigate, table, id]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Are you sure you want to permanently delete this record?')) return;

    try {
      setDeleting(true);
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      navigate(`/list/${table}`, { replace: true });
    } catch (err) {
      alert('Delete failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setDeleting(false);
    }
  }, [table, id, navigate]);

  const renderValue = (key, value) => {
    if (value === null || value === undefined) return <span style={{ opacity: 0.3, fontStyle: 'italic' }}>Not set</span>;

    // Images
    if ((key.includes('image') || key.includes('photo') || key.includes('avatar')) && typeof value === 'string' && (value.startsWith('http') || value.startsWith('data:'))) {
      return (
        <img
          src={value}
          alt={key}
          style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '12px', objectFit: 'cover' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      );
    }

    // URLs
    if ((key.includes('url') || key.includes('link')) && typeof value === 'string' && value.startsWith('http')) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#7c3aed', textDecoration: 'underline', wordBreak: 'break-all' }}
        >
          {value}
        </a>
      );
    }

    // Booleans
    if (typeof value === 'boolean') {
      return (
        <span style={{
          padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
          background: value ? 'rgba(5,150,105,0.15)' : 'rgba(239,68,68,0.1)',
          color: value ? '#059669' : '#ef4444',
        }}>
          {value ? 'Yes' : 'No'}
        </span>
      );
    }

    // Objects / Arrays
    if (typeof value === 'object') {
      return <pre style={{ background: darkMode ? '#27272a' : '#f4f4f5', padding: '12px', borderRadius: '8px', fontSize: '12px', overflow: 'auto', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {JSON.stringify(value, null, 2)}
      </pre>;
    }

    // Dates
    if (typeof value === 'string' && (key.includes('date') || key.includes('time') || key === 'created_at' || key === 'updated_at')) {
      try {
        return new Date(value).toLocaleString();
      } catch {
        return value;
      }
    }

    return String(value);
  };

  const bg = darkMode ? '#09090b' : '#fafafa';
  const textColor = darkMode ? '#fafafa' : '#09090b';
  const cardBg = darkMode ? '#18181b' : '#ffffff';
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: bg }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error && !item) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: bg, color: textColor, padding: '24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 8px' }}>Record not found</h2>
        <p style={{ fontSize: '14px', opacity: 0.5, margin: '0 0 24px' }}>{error}</p>
        <button onClick={() => navigate(`/list/${table}`)} style={{
          padding: '12px 24px', borderRadius: '12px', border: 'none',
          background: '#7c3aed', color: '#fff', fontSize: '15px', cursor: 'pointer',
        }}>
          Go Back
        </button>
      </div>
    );
  }

  const keys = item ? Object.keys(item) : [];
  const imageKey = keys.find((k) => k.includes('image') || k.includes('photo') || k.includes('avatar'));

  return (
    <div style={{ minHeight: '100vh', background: bg, color: textColor, fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: '100px' }}>
      {/* Header */}
      <header style={{
        padding: '16px 20px', borderBottom: `1px solid ${borderColor}`,
        position: 'sticky', top: 0, background: bg, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(`/list/${table}`)} style={{ background: 'transparent', border: 'none', color: textColor, cursor: 'pointer', fontSize: '20px' }}>←</button>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, textTransform: 'capitalize' }}>
              {table?.replace(/_/g, ' ')}
            </h1>
            <p style={{ fontSize: '12px', opacity: 0.4, margin: '2px 0 0' }}>ID: {id?.slice(0, 8)}...</p>
          </div>
        </div>
      </header>

      <main style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        {/* Image hero */}
        {imageKey && item[imageKey] && (
          <div style={{
            marginBottom: '20px', borderRadius: '16px', overflow: 'hidden',
            border: `1px solid ${borderColor}`,
          }}>
            <img
              src={item[imageKey]}
              alt=""
              style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', display: 'block' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Fields */}
        <div style={{
          background: cardBg, borderRadius: '16px',
          border: `1px solid ${borderColor}`, overflow: 'hidden',
        }}>
          {keys
            .filter((k) => !['id'].includes(k))
            .map((key, i) => {
              const isLast = i === keys.filter((k) => k !== 'id').length - 1;
              return (
                <div
                  key={key}
                  style={{
                    padding: '14px 16px',
                    borderBottom: isLast ? 'none' : `1px solid ${borderColor}`,
                  }}
                >
                  <p style={{
                    fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.5px', opacity: 0.4, margin: '0 0 4px',
                  }}>
                    {key.replace(/_/g, ' ')}
                  </p>
                  <div style={{ fontSize: '14px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                    {renderValue(key, item[key])}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            onClick={handleEdit}
            style={{
              flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
              background: '#7c3aed', color: '#fff', fontSize: '15px', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              flex: 1, padding: '14px', borderRadius: '12px',
              border: '1px solid rgba(239,68,68,0.3)',
              background: 'transparent', color: '#ef4444', fontSize: '15px', fontWeight: 600,
              cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            🗑️ {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
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
