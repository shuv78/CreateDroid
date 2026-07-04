import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../App';
import { supabase } from '../db/supabase';

export default function ListView() {
  const navigate = useNavigate();
  const { table } = useParams();
  const { darkMode } = useTheme();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [tableColumns, setTableColumns] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // list | grid
  const debounceRef = useRef(null);

  const fetchColumns = useCallback(async () => {
    try {
      const { data: cols, error: colsError } = await supabase
        .rpc('get_table_columns', { table_name: table });
      if (colsError) throw colsError;
      setTableColumns(cols || []);
    } catch {
      // Fallback: infer from first row
      setTableColumns([]);
    }
  }, [table]);

  const fetchData = useCallback(async (searchTerm = search) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from(table).select('*', { count: 'exact' });

      // Search filter
      if (searchTerm.trim()) {
        const searchCol = tableColumns.find((c) =>
          c.data_type === 'character varying' || c.data_type === 'text'
        );
        if (searchCol) {
          query = query.ilike(searchCol.column_name, `%${searchTerm}%`);
        } else {
          query = query.or(
            Object.keys(columns).length > 0
              ? Object.keys(columns)
                  .filter((k) => typeof columns[k] === 'string')
                  .map((k) => `${k}.ilike.%${searchTerm}%`)
                  .join(',')
              : `id.ilike.%${searchTerm}%`
          );
        }
      }

      // Sorting
      query = query.order(sortField || 'created_at', { ascending: sortAsc });

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: rows, count, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      setData(rows || []);
      setTotalCount(count ?? 0);
    } catch (err) {
      console.error('List fetch error:', err);
      setError(err?.message || 'Failed to load data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [table, search, sortField, sortAsc, page, pageSize, tableColumns]);

  useEffect(() => {
    fetchColumns();
  }, [fetchColumns]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = useCallback((value) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
    }, 400);
  }, []);

  const handleSort = useCallback((field) => {
    setSortField((prevField) => {
      if (prevField === field) {
        setSortAsc((prev) => !prev);
        return prevField;
      }
      setSortAsc(true);
      return field;
    });
    setPage(1);
  }, []);

  const handleRowClick = useCallback((id) => {
    navigate(`/detail/${table}/${id}`);
  }, [navigate, table]);

  const handleAdd = useCallback(() => {
    navigate(`/form/${table}`);
  }, [navigate, table]);

  const handleEdit = useCallback((e, id) => {
    e.stopPropagation();
    navigate(`/form/${table}/${id}`);
  }, [navigate, table]);

  const handleDelete = useCallback(async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      setData((prev) => prev.filter((item) => item.id !== id));
      setTotalCount((prev) => prev - 1);
    } catch (err) {
      alert('Delete failed: ' + (err?.message || 'Unknown error'));
    }
  }, [table]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const bg = darkMode ? '#09090b' : '#fafafa';
  const textColor = darkMode ? '#fafafa' : '#09090b';
  const cardBg = darkMode ? '#18181b' : '#ffffff';
  const inputBg = darkMode ? '#27272a' : '#f4f4f5';
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  // Infer display columns from data
  const keys = data.length > 0
    ? Object.keys(data[0]).filter((k) => !['id', 'created_at', 'updated_at', 'user_id'].includes(k)).slice(0, 5)
    : ['id'];

  return (
    <div style={{ minHeight: '100vh', background: bg, color: textColor, fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: '80px' }}>
      {/* Header */}
      <header style={{
        padding: '16px 20px', borderBottom: `1px solid ${borderColor}`,
        position: 'sticky', top: 0, background: bg, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: textColor, cursor: 'pointer', fontSize: '20px' }}>←</button>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, textTransform: 'capitalize' }}>{table?.replace(/_/g, ' ')}</h1>
          </div>
          <button
            onClick={handleAdd}
            style={{
              padding: '10px 16px', borderRadius: '12px', border: 'none',
              background: '#7c3aed', color: '#fff', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            ➕ Add
          </button>
        </div>

        {/* Search + View toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search..."
              style={{
                width: '100%', padding: '10px 14px 10px 36px',
                borderRadius: '10px', border: `1px solid ${borderColor}`,
                background: inputBg, color: textColor, fontSize: '14px',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
          </div>
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            style={{
              padding: '10px', borderRadius: '10px', border: `1px solid ${borderColor}`,
              background: inputBg, color: textColor, cursor: 'pointer', fontSize: '16px',
            }}
            aria-label="Toggle view"
          >
            {viewMode === 'list' ? '📐' : '📋'}
          </button>
        </div>
      </header>

      <main style={{ padding: '16px 20px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Error */}
        {error && (
          <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{
                background: cardBg, borderRadius: '12px', padding: '16px',
                border: `1px solid ${borderColor}`, opacity: 0.5,
              }}>
                <div style={{ width: '60%', height: '14px', borderRadius: '4px', background: borderColor, marginBottom: '8px' }} />
                <div style={{ width: '40%', height: '12px', borderRadius: '4px', background: borderColor }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && data.length === 0 && !error && (
          <div style={{
            textAlign: 'center', padding: '48px 20px',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📂</div>
            <p style={{ fontSize: '16px', fontWeight: 500, margin: '0 0 4px' }}>No data found</p>
            <p style={{ fontSize: '14px', opacity: 0.5, margin: '0 0 24px' }}>
              {search ? 'Try a different search term' : 'Click "Add" to create your first entry'}
            </p>
            {!search && (
              <button onClick={handleAdd} style={{
                padding: '12px 24px', borderRadius: '12px', border: 'none',
                background: '#7c3aed', color: '#fff', fontSize: '15px', fontWeight: 600,
                cursor: 'pointer',
              }}>
                ➕ Add Item
              </button>
            )}
          </div>
        )}

        {/* Data list */}
        {!loading && data.length > 0 && (
          <>
            {/* Sort indicators */}
            <div style={{ fontSize: '12px', opacity: 0.4, marginBottom: '8px', display: 'flex', gap: '8px' }}>
              <span>Sort by:</span>
              {keys.slice(0, 3).map((key) => (
                <button
                  key={key}
                  onClick={() => handleSort(key)}
                  style={{
                    background: 'transparent', border: 'none', color: sortField === key ? '#7c3aed' : 'inherit',
                    cursor: 'pointer', fontSize: '12px', fontWeight: sortField === key ? 600 : 400,
                    padding: '2px 4px',
                  }}
                >
                  {key} {sortField === key ? (sortAsc ? '↑' : '↓') : ''}
                </button>
              ))}
            </div>

            {viewMode === 'list' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleRowClick(item.id)}
                    style={{
                      background: cardBg, borderRadius: '12px', padding: '14px 16px',
                      border: `1px solid ${borderColor}`, cursor: 'pointer',
                      transition: 'transform 0.15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {keys.map((k) => item[k]).filter(Boolean).join(' – ') || item.id}
                      </p>
                      <p style={{ fontSize: '12px', opacity: 0.4, margin: 0 }}>
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button onClick={(e) => handleEdit(e, item.id)} style={{
                        padding: '6px 10px', borderRadius: '8px', border: `1px solid ${borderColor}`,
                        background: 'transparent', color: textColor, cursor: 'pointer', fontSize: '14px',
                      }}>✏️</button>
                      <button onClick={(e) => handleDelete(e, item.id)} style={{
                        padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)',
                        background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '14px',
                      }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {data.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleRowClick(item.id)}
                    style={{
                      background: cardBg, borderRadius: '12px', padding: '16px',
                      border: `1px solid ${borderColor}`, cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                      {item.icon || '📄'}
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {keys.map((k) => item[k]).filter(Boolean).join(' ') || item.id}
                    </p>
                    <p style={{ fontSize: '11px', opacity: 0.4, margin: 0 }}>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '12px', marginTop: '20px', padding: '12px', fontSize: '14px',
              }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '8px 16px', borderRadius: '10px', border: `1px solid ${borderColor}`,
                    background: cardBg, color: textColor, cursor: page === 1 ? 'not-allowed' : 'pointer',
                    opacity: page === 1 ? 0.4 : 1, fontSize: '14px',
                  }}
                >
                  ← Prev
                </button>
                <span style={{ opacity: 0.6 }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '8px 16px', borderRadius: '10px', border: `1px solid ${borderColor}`,
                    background: cardBg, color: textColor, cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    opacity: page === totalPages ? 0.4 : 1, fontSize: '14px',
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
