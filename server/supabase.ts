import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = (
  process.env.SUPABASE_URL || 'https://wnemytwacfsekuwfqadr.supabase.co'
).trim();

// A valid Supabase service role key is either a legacy JWT (Compact JWS) with 3 segments separated by dots,
// or a newer server-side secret API key starting with 'sb_secret_'.
const RAW_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

export function isValidCompactJws(token?: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const trimmed = token.trim();
  
  // Support newer server-side secret API keys starting with 'sb_secret_'
  if (trimmed.startsWith('sb_secret_')) {
    return trimmed.length > 'sb_secret_'.length;
  }
  
  // Support legacy JWT / Compact JWS format
  const parts = trimmed.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

export const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'documents';

let supabaseClient: SupabaseClient | null = null;
let bucketEnsured = false;
let loggedConfigStatus = false;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && isValidCompactJws(RAW_SERVICE_ROLE_KEY));
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    if (!loggedConfigStatus) {
      console.log(
        '[Supabase] Cloud storage sync inactive (valid SUPABASE_SERVICE_ROLE_KEY not set in environment; operating in resilient local storage mode).'
      );
      loggedConfigStatus = true;
    }
    return null;
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(SUPABASE_URL, RAW_SERVICE_ROLE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log('[Supabase] Initialized cloud client for', SUPABASE_URL);
    } catch (err) {
      console.error('[Supabase] Initialization error:', err);
      return null;
    }
  }
  return supabaseClient;
}

/**
 * Ensures that the documents storage bucket exists in Supabase.
 */
export async function ensureSupabaseBucket(): Promise<boolean> {
  if (bucketEnsured) return true;
  if (!isSupabaseConfigured()) return false;
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { data: buckets, error } = await client.storage.listBuckets();
    if (error) {
      console.warn('[Supabase Storage] listBuckets warning:', error.message);
      return false;
    }

    const exists = buckets?.some((b) => b.id === SUPABASE_BUCKET || b.name === SUPABASE_BUCKET);
    if (!exists) {
      const { data, error: createError } = await client.storage.createBucket(SUPABASE_BUCKET, {
        public: false,
      });
      if (createError) {
        console.warn('[Supabase Storage] createBucket warning:', createError.message);
        return false;
      }
      console.log('[Supabase Storage] Created bucket:', SUPABASE_BUCKET);
    }

    bucketEnsured = true;
    return true;
  } catch (err: any) {
    console.warn('[Supabase Storage] ensureBucket exception:', err.message);
    return false;
  }
}

/**
 * Uploads a file buffer to Supabase Storage.
 * @param relativePath e.g. "historical/doc-123.pdf", "real-papers/rp-456.png"
 * @param buffer file Buffer
 * @param mimeType content type
 */
export async function uploadToSupabaseStorage(
  relativePath: string,
  buffer: Buffer,
  mimeType: string = 'application/octet-stream'
): Promise<{ success: boolean; path: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, path: relativePath, error: 'Supabase client not configured' };
  }
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, path: relativePath, error: 'Supabase client not configured' };
  }

  // Normalize path (no leading slash)
  const normalizedPath = relativePath.replace(/^[\/\\]+/, '').replace(/\\/g, '/');

  try {
    const bucketReady = await ensureSupabaseBucket();
    if (!bucketReady) {
      return { success: false, path: normalizedPath, error: 'Supabase storage bucket unreachable' };
    }

    const { data, error } = await client.storage
      .from(SUPABASE_BUCKET)
      .upload(normalizedPath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.warn(`[Supabase Storage] Upload warning for ${normalizedPath}:`, error.message);
      return { success: false, path: normalizedPath, error: error.message };
    }

    return { success: true, path: normalizedPath };
  } catch (err: any) {
    console.warn(`[Supabase Storage] Upload exception for ${normalizedPath}:`, err.message);
    return { success: false, path: normalizedPath, error: err.message };
  }
}

/**
 * Downloads a file buffer from Supabase Storage.
 */
export async function downloadFromSupabaseStorage(
  relativePath: string
): Promise<{ success: boolean; data?: Buffer; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase client not configured' };
  }
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client not configured' };
  }

  const normalizedPath = relativePath.replace(/^[\/\\]+/, '').replace(/\\/g, '/');

  try {
    const { data, error } = await client.storage
      .from(SUPABASE_BUCKET)
      .download(normalizedPath);

    if (error || !data) {
      return { success: false, error: error?.message || 'File not found in Supabase Storage' };
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return { success: true, data: buffer };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a file or files from Supabase Storage.
 */
export async function deleteFromSupabaseStorage(paths: string[]): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const client = getSupabaseClient();
  if (!client || paths.length === 0) return false;

  const normalizedPaths = paths.map((p) => p.replace(/^[\/\\]+/, '').replace(/\\/g, '/'));

  try {
    const { error } = await client.storage.from(SUPABASE_BUCKET).remove(normalizedPaths);
    if (error) {
      console.warn('[Supabase Storage] remove warning:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[Supabase Storage] remove exception:', err.message);
    return false;
  }
}

/**
 * Persists the complete system database state to Supabase Storage as a cloud backup.
 */
export async function backupDatabaseToSupabase(dbData: any): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const jsonStr = JSON.stringify(dbData, null, 2);
    const buffer = Buffer.from(jsonStr, 'utf-8');
    const result = await uploadToSupabaseStorage('system/db.json', buffer, 'application/json');
    return result.success;
  } catch (err: any) {
    console.warn('[Supabase] Database backup exception:', err.message);
    return false;
  }
}

/**
 * Restores the system database state from Supabase Storage if available.
 */
export async function restoreDatabaseFromSupabase(): Promise<any | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const result = await downloadFromSupabaseStorage('system/db.json');
    if (result.success && result.data) {
      const jsonStr = result.data.toString('utf-8');
      return JSON.parse(jsonStr);
    }
  } catch (err: any) {
    console.warn('[Supabase] Database restore exception (using local cache):', err.message);
  }
  return null;
}

/**
 * Check Supabase connectivity and health.
 */
export async function testSupabaseHealth(): Promise<{
  ok: boolean;
  bucketExists: boolean;
  projectUrl: string;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      ok: false,
      bucketExists: false,
      projectUrl: SUPABASE_URL,
      error: 'Supabase credentials not configured',
    };
  }

  try {
    const { data: buckets, error } = await client.storage.listBuckets();
    if (error) {
      return {
        ok: false,
        bucketExists: false,
        projectUrl: SUPABASE_URL,
        error: error.message,
      };
    }

    const bucketExists = Boolean(
      buckets?.some((b) => b.id === SUPABASE_BUCKET || b.name === SUPABASE_BUCKET)
    );

    return {
      ok: true,
      bucketExists,
      projectUrl: SUPABASE_URL,
    };
  } catch (err: any) {
    return {
      ok: false,
      bucketExists: false,
      projectUrl: SUPABASE_URL,
      error: err.message,
    };
  }
}
