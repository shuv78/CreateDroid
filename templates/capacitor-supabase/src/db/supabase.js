import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration
 * 
 * IMPORTANT: Configure environment variables:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anon/public key
 * 
 * Create a .env file or set these in your deployment environment.
 */

// Fallback for demo / local dev — REPLACE with your real values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'app-supabase-auth',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-app-name': 'app-fullstack-roles',
    },
  },
  db: {
    schema: 'public',
  },
});

/**
 * Generic CRUD helpers
 */

/**
 * Fetch all records from a table with optional filters
 * @param {string} table - Table name
 * @param {object} [options]
 * @param {string} [options.orderBy='created_at']
 * @param {boolean} [options.ascending=false]
 * @param {number} [options.limit=100]
 * @param {number} [options.offset=0]
 * @param {object} [options.filters] - { field: value } equality filters
 * @param {string} [options.search] - Full-text search term
 * @param {string[]} [options.select] - Columns to select
 * @returns {Promise<{data: Array|null, count: number|null, error: Error|null}>}
 */
export async function getAll(table, options = {}) {
  try {
    const {
      orderBy = 'created_at',
      ascending = false,
      limit = 100,
      offset = 0,
      filters = {},
      search,
      select,
    } = options;

    let query = supabase
      .from(table)
      .select(select || '*', { count: 'exact' });

    // Apply filters
    for (const [field, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined) {
        query = query.eq(field, value);
      }
    }

    // Search
    if (search) {
      query = query.or(
        Object.keys(filters).length > 0
          ? Object.keys(filters)
              .filter((k) => typeof filters[k] === 'string')
              .map((k) => `${k}.ilike.%${search}%`)
              .join(',')
          : `id.ilike.%${search}%`
      );
    }

    // Order, range
    query = query
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;
    return { data, count, error: null };
  } catch (err) {
    console.error(`getAll(${table}) error:`, err);
    return { data: null, count: 0, error: err };
  }
}

/**
 * Fetch a single record by ID
 * @param {string} table - Table name
 * @param {string|number} id - Record ID
 * @param {string} [select] - Columns to select
 * @returns {Promise<{data: object|null, error: Error|null}>}
 */
export async function getById(table, id, select = '*') {
  try {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error(`getById(${table}, ${id}) error:`, err);
    return { data: null, error: err };
  }
}

/**
 * Create a record
 * @param {string} table - Table name
 * @param {object} record - Data to insert
 * @param {object} [options]
 * @param {boolean} [options.returnRecord=true] - Return the created record
 * @returns {Promise<{data: object|null, error: Error|null}>}
 */
export async function create(table, record, options = {}) {
  const { returnRecord = true } = options;
  try {
    const { data, error } = await supabase
      .from(table)
      .insert([record])
      .select(returnRecord ? '*' : undefined)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error(`create(${table}) error:`, err);
    return { data: null, error: err };
  }
}

/**
 * Update a record by ID
 * @param {string} table - Table name
 * @param {string|number} id - Record ID
 * @param {object} updates - Fields to update
 * @returns {Promise<{data: object|null, error: Error|null}>}
 */
export async function update(table, id, updates) {
  try {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error(`update(${table}, ${id}) error:`, err);
    return { data: null, error: err };
  }
}

/**
 * Remove a record by ID
 * @param {string} table - Table name
 * @param {string|number} id - Record ID
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function remove(table, id) {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err) {
    console.error(`remove(${table}, ${id}) error:`, err);
    return { success: false, error: err };
  }
}

/**
 * Subscribe to realtime changes on a table
 * @param {string} table - Table name
 * @param {object} callbacks
 * @param {Function} [callbacks.onInsert] - Called when a row is inserted
 * @param {Function} [callbacks.onUpdate] - Called when a row is updated
 * @param {Function} [callbacks.onDelete] - Called when a row is deleted
 * @param {string} [filter] - Optional filter expression (e.g., 'id=eq.123')
 * @returns {{ unsubscribe: Function }}
 */
export function subscribe(table, callbacks, filter = undefined) {
  const { onInsert, onUpdate, onDelete } = callbacks;

  const channel = supabase
    .channel(`realtime:${table}:${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table,
        filter,
      },
      (payload) => {
        if (onInsert) onInsert(payload.new, payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table,
        filter,
      },
      (payload) => {
        if (onUpdate) onUpdate(payload.new, payload.old, payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table,
        filter,
      },
      (payload) => {
        if (onDelete) onDelete(payload.old, payload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

export default supabase;
