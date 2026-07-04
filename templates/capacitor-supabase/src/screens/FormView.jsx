import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../App';
import { supabase } from '../db/supabase';

export default function FormView() {
  const navigate = useNavigate();
  const { table, id } = useParams();
  const { darkMode } = useTheme();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [columns, setColumns] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchSchema = useCallback(async () => {
    try {
      const { data: cols, error: schemaError } = await supabase
        .rpc('get_table_columns', { table_name: table });
      if (schemaError) throw schemaError;
      // Filter out auto-generated columns
      const editableCols = (cols || []).filter(
        (c) => !['id', 'created_at', 'updated_at', 'user_id'].includes(c.column_name)
      );
      setColumns(editableCols);
    } catch {
      // Used fixed field list if table introspection is unavailable
      setColumns([
        { column_name: 'title', data_type: 'text', is_nullable: 'NO' },
        { column_name: 'description', data_type: 'text', is_nullable: 'YES' },
        { column_name: 'status', data_type: 'text', is_nullable: 'YES' },
        { column_name: 'image_url', data_type: 'text', is_nullable: 'YES' },
      ]);
    }
  }, [table]);

  const fetchRecord = useCallback(async () => {
    if (!isEdit) return;
    try {
      setLoading(true);
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
      setFormData(data);
      setOriginalData(data);
    } catch (err) {
      console.error('Fetch record error:', err);
      setError(err?.message || 'Failed to load record');
    } finally {
      setLoading(false);
    }
  }, [table, id, isEdit]);

  useEffect(() => {
    fetchSchema();
  }, [fetchSchema]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const validate = useCallback(() => {
    const errors = {};
    for (const col of columns) {
      const value = formData[col.column_name];
      if (col.is_nullable === 'NO' || col.is_nullable === false) {
        if (!value || (typeof value === 'string' && !value.trim())) {
          errors[col.column_name] = `${col.column_name.replace(/_/g, ' ')} is required`;
        }
      }
      // Email validation
      if (col.column_name.includes('email') && value && typeof value === 'string') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[col.column_name] = 'Invalid email format';
        }
      }
      // URL validation for image fields
      if (col.column_name.includes('url') && value && typeof value === 'string') {
        try { new URL(value); } catch {
          errors[col.column_name] = 'Invalid URL format';
        }
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [columns, formData]);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    setFieldErrors((prev) => {
      if (prev[field]) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setFieldErrors((prev) => ({ ...prev, image_url: 'Image must be under 5MB' }));
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setFieldErrors((prev) => ({ ...prev, image_url: 'Only JPEG, PNG, WebP, and GIF allowed' }));
      return;
    }

    try {
      setImageUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${table}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      handleChange('image_url', publicUrl);
    } catch (err) {
      console.error('Image upload error:', err);
      setFieldErrors((prev) => ({ ...prev, image_url: 'Image upload failed: ' + (err?.message || 'Unknown error') }));
    } finally {
      setImageUploading(false);
    }
  }, [table, handleChange]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setSaving(true);

    try {
      const dataToSave = { ...formData };

      // Remove read-only fields
      delete dataToSave.id;
      delete dataToSave.created_at;
      delete dataToSave.updated_at;
      delete dataToSave.user_id;

      if (isEdit) {
        const { error: updateError } = await supabase
          .from(table)
          .update(dataToSave)
          .eq('id', id);
        if (updateError) throw updateError;
        alert('Record updated successfully!');
      } else {
        const { error: insertError } = await supabase
          .from(table)
          .insert([dataToSave]);
        if (insertError) throw insertError;
        alert('Record created successfully!');
      }

      navigate(`/list/${table}`);
    } catch (err) {
      console.error('Save error:', err);
      setError(err?.message || 'Failed to save record');
    } finally {
      setSaving(false);
    }
  }, [formData, table, id, isEdit, validate, navigate]);

  const handleCancel = useCallback(() => {
    if (isEdit) {
      navigate(`/detail/${table}/${id}`);
    } else {
      navigate(`/list/${table}`);
    }
  }, [navigate, table, id, isEdit]);

  const bg = darkMode ? '#09090b' : '#fafafa';
  const textColor = darkMode ? '#fafafa' : '#09090b';
  const cardBg = darkMode ? '#18181b' : '#ffffff';
  const inputBg = darkMode ? '#27272a' : '#f4f4f5';
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const renderField = (col) => {
    const isImage = col.column_name.includes('image') || col.column_name.includes('photo') || col.column_name.includes('avatar');
    const isLongText = col.data_type === 'text' && !col.column_name.includes('url') && !col.column_name.includes('email');
    const isEmail = col.column_name.includes('email');
    const isNumber = col.data_type === 'integer' || col.data_type === 'bigint' || col.data_type === 'real' || col.data_type === 'double precision';
    const isDate = col.data_type === 'date' || col.data_type === 'timestamp' || col.data_type === 'timestamptz';
    const isUrl = col.column_name.includes('url') || col.column_name.includes('link');

    const value = formData[col.column_name] || '';
    const fieldError = fieldErrors[col.column_name];

    return (
      <div key={col.column_name} style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px', display: 'block', textTransform: 'capitalize' }}>
          {col.column_name.replace(/_/g, ' ')}
          {col.is_nullable === 'NO' && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
        </label>

        {isImage ? (
          <div>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%', height: '120px', borderRadius: '12px',
                border: `2px dashed ${borderColor}`, background: inputBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden', position: 'relative',
              }}
            >
              {value ? (
                <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', opacity: 0.5 }}>
                  <div style={{ fontSize: '24px' }}>📷</div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>
                    {imageUploading ? 'Uploading...' : 'Tap to upload image'}
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            {value && (
              <button
                type="button"
                onClick={() => handleChange(col.column_name, '')}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', marginTop: '4px', padding: '4px' }}
              >
                Remove image
              </button>
            )}
          </div>
        ) : isLongText ? (
          <textarea
            value={value}
            onChange={(e) => handleChange(col.column_name, e.target.value)}
            placeholder={`Enter ${col.column_name.replace(/_/g, ' ')}`}
            rows={4}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '12px',
              border: `1px solid ${fieldError ? '#ef4444' : borderColor}`,
              background: inputBg, color: textColor, fontSize: '14px',
              outline: 'none', resize: 'vertical', boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        ) : isEmail ? (
          <input
            type="email"
            value={value}
            onChange={(e) => handleChange(col.column_name, e.target.value)}
            placeholder="user@example.com"
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '12px',
              border: `1px solid ${fieldError ? '#ef4444' : borderColor}`,
              background: inputBg, color: textColor, fontSize: '14px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        ) : isNumber ? (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(col.column_name, e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '12px',
              border: `1px solid ${fieldError ? '#ef4444' : borderColor}`,
              background: inputBg, color: textColor, fontSize: '14px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        ) : isDate ? (
          <input
            type="datetime-local"
            value={value ? value.slice(0, 16) : ''}
            onChange={(e) => handleChange(col.column_name, e.target.value ? new Date(e.target.value).toISOString() : '')}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '12px',
              border: `1px solid ${fieldError ? '#ef4444' : borderColor}`,
              background: inputBg, color: textColor, fontSize: '14px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        ) : isUrl ? (
          <input
            type="url"
            value={value}
            onChange={(e) => handleChange(col.column_name, e.target.value)}
            placeholder="https://example.com"
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '12px',
              border: `1px solid ${fieldError ? '#ef4444' : borderColor}`,
              background: inputBg, color: textColor, fontSize: '14px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(col.column_name, e.target.value)}
            placeholder={`Enter ${col.column_name.replace(/_/g, ' ')}`}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '12px',
              border: `1px solid ${fieldError ? '#ef4444' : borderColor}`,
              background: inputBg, color: textColor, fontSize: '14px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        )}

        {fieldError && (
          <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{fieldError}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: bg }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, color: textColor, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{
        padding: '16px 20px', borderBottom: `1px solid ${borderColor}`,
        position: 'sticky', top: 0, background: bg, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={handleCancel} style={{ background: 'transparent', border: 'none', color: textColor, cursor: 'pointer', fontSize: '20px' }}>←</button>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
            {isEdit ? 'Edit' : 'New'} {table?.replace(/_/g, ' ')}
          </h1>
        </div>
      </header>

      <main style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px',
            background: 'rgba(239,68,68,0.1)', color: '#ef4444',
            fontSize: '14px', marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{
            background: cardBg, borderRadius: '16px', padding: '20px',
            border: `1px solid ${borderColor}`,
          }}>
            {columns.map(renderField)}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="submit"
              disabled={saving || imageUploading}
              style={{
                flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
                background: saving ? '#5b21b6' : '#7c3aed', color: '#fff',
                fontSize: '16px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '14px 24px', borderRadius: '12px',
                border: `1px solid ${borderColor}`, background: 'transparent',
                color: textColor, fontSize: '15px', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
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
