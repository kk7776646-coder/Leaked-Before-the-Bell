import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  uploadToSupabaseStorage,
  downloadFromSupabaseStorage,
  deleteFromSupabaseStorage,
  SUPABASE_BUCKET,
} from './supabase';

export const STORAGE_ROOT = path.resolve(process.cwd(), 'storage');

export const LIMITS = {
  maxUploadSizeBytes: parseInt(process.env.MAX_UPLOAD_SIZE_BYTES || '', 10) || 150 * 1024 * 1024, // 150 MB
  maxArchiveSizeBytes: parseInt(process.env.MAX_ARCHIVE_SIZE_BYTES || '', 10) || 100 * 1024 * 1024, // 100 MB
  maxExtractedSizeBytes: parseInt(process.env.MAX_ZIP_UNCOMPRESSED_SIZE || '', 10) || 250 * 1024 * 1024, // 250 MB
  maxFilesPerArchive: parseInt(process.env.MAX_ZIP_FILES || '', 10) || 150,
  maxRecursionDepth: parseInt(process.env.MAX_NESTING_DEPTH || '', 10) || 5,
  maxPagesPerDocument: 200,
};

export const DIRS = {
  uploads: path.join(STORAGE_ROOT, 'uploads'),
  extracted: path.join(STORAGE_ROOT, 'extracted'),
  processed: path.join(STORAGE_ROOT, 'processed'),
  candidatesRaw: path.join(STORAGE_ROOT, 'candidates', 'raw'),
  candidatesProcessed: path.join(STORAGE_ROOT, 'candidates', 'processed'),
  historicalRaw: path.join(STORAGE_ROOT, 'historical', 'raw'),
  realPapersRaw: path.join(STORAGE_ROOT, 'real_papers', 'raw'),
  renderedPages: path.join(STORAGE_ROOT, 'rendered_pages'),
  ocr: path.join(STORAGE_ROOT, 'ocr'),
  data: STORAGE_ROOT,
};

// Ensure all directories exist
export function initStorage(): void {
  Object.values(DIRS).forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Compute SHA-256 hash of a buffer or file
export function computeSha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function computeFileSha256(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return computeSha256(fileBuffer);
}

// Safe path validation to prevent path traversal
export function isSafePath(targetPath: string): boolean {
  const resolved = path.resolve(targetPath);
  return resolved.startsWith(STORAGE_ROOT);
}

export function isSafeZipEntryPath(entryName: string, destDir: string): boolean {
  // Prevent path traversal like ../ or absolute / or windows drive
  const sanitizedEntry = entryName.replace(/^[\/\\]+/, '');
  const targetPath = path.resolve(destDir, sanitizedEntry);
  const resolvedDest = path.resolve(destDir);
  return targetPath.startsWith(resolvedDest);
}

// Supported MIME types and extensions
export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/zip',
  'application/x-zip-compressed',
  'multipart/x-zip',
]);

export const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.zip',
]);

export const ALLOWED_DOC_EXTENSIONS = new Set([
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
]);

export function validateFileType(originalFilename: string, mimeType?: string): { valid: boolean; error?: string } {
  const ext = path.extname(originalFilename).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Unsupported file type '${ext}'. Supported formats: PDF, PNG, JPG, JPEG, WEBP, ZIP.`,
    };
  }

  if (mimeType && !ALLOWED_MIME_TYPES.has(mimeType)) {
    // If extension is valid, be slightly permissive if client mime-type is generic octet-stream
    if (mimeType !== 'application/octet-stream') {
      return {
        valid: false,
        error: `Unsupported MIME type '${mimeType}'. Supported formats: PDF, PNG, JPG, JPEG, WEBP, ZIP.`,
      };
    }
  }

  return { valid: true };
}

// Sanitize filename to avoid weird directory characters
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// Magic bytes signature inspection
export function detectFileTypeFromBuffer(buffer: Buffer): {
  detectedType: 'PDF' | 'PNG' | 'JPEG' | 'WEBP' | 'ZIP' | 'UNKNOWN';
  mimeType: string;
  isZip: boolean;
  isValid: boolean;
} {
  if (!buffer || buffer.length < 4) {
    return { detectedType: 'UNKNOWN', mimeType: 'application/octet-stream', isZip: false, isValid: false };
  }

  // PDF: %PDF- (0x25 0x50 0x44 0x46 0x2D)
  if (
    buffer.length >= 5 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    return { detectedType: 'PDF', mimeType: 'application/pdf', isZip: false, isValid: true };
  }

  // PNG: \x89PNG\r\n\x1a\n (0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A)
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { detectedType: 'PNG', mimeType: 'image/png', isZip: false, isValid: true };
  }

  // JPEG: \xFF\xD8\xFF (0xFF 0xD8 0xFF)
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return { detectedType: 'JPEG', mimeType: 'image/jpeg', isZip: false, isValid: true };
  }

  // WEBP: RIFF....WEBP (0x52 0x49 0x46 0x46 ... 0x57 0x45 0x42 0x50)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { detectedType: 'WEBP', mimeType: 'image/webp', isZip: false, isValid: true };
  }

  // ZIP: PK\x03\x04 (0x50 0x4B 0x03 0x04) or PK\x05\x06 (empty) or PK\x07\x08 (spanned)
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07) &&
    (buffer[3] === 0x04 || buffer[3] === 0x06 || buffer[3] === 0x08)
  ) {
    return { detectedType: 'ZIP', mimeType: 'application/zip', isZip: true, isValid: true };
  }

  return { detectedType: 'UNKNOWN', mimeType: 'application/octet-stream', isZip: false, isValid: false };
}

// Complete validation of uploaded file buffer, filename, MIME and magic bytes
export function validateUploadedFileBuffer(
  buffer: Buffer,
  originalFilename: string,
  declaredMimeType?: string,
  maxSizeBytes: number = 150 * 1024 * 1024
): {
  valid: boolean;
  detectedType?: 'PDF' | 'PNG' | 'JPEG' | 'WEBP' | 'ZIP';
  canonicalMimeType?: string;
  error?: string;
} {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'Uploaded file is empty (0 bytes).' };
  }

  if (buffer.length > maxSizeBytes) {
    return {
      valid: false,
      error: `File size (${(buffer.length / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed limit (${(maxSizeBytes / (1024 * 1024)).toFixed(0)} MB).`,
    };
  }

  const ext = path.extname(originalFilename).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Unsupported file extension '${ext}'. Supported formats: PDF, PNG, JPG, JPEG, WEBP, ZIP.`,
    };
  }

  const signature = detectFileTypeFromBuffer(buffer);

  // Mismatch detection: if file has .jpg/.jpeg extension but has PDF magic bytes or vice-versa
  if (ext === '.pdf' && signature.detectedType !== 'PDF') {
    return {
      valid: false,
      error: `File '${originalFilename}' has a .pdf extension but its binary signature does not match a valid PDF file.`,
    };
  }

  if ((ext === '.jpg' || ext === '.jpeg') && signature.detectedType !== 'JPEG') {
    // If it's PNG or PDF renamed to JPG, flag error
    return {
      valid: false,
      error: `File '${originalFilename}' has a .jpg/.jpeg extension but its binary signature indicates ${signature.detectedType || 'an invalid/corrupted format'}.`,
    };
  }

  if (ext === '.png' && signature.detectedType !== 'PNG') {
    return {
      valid: false,
      error: `File '${originalFilename}' has a .png extension but its binary signature indicates ${signature.detectedType || 'an invalid/corrupted format'}.`,
    };
  }

  if (ext === '.webp' && signature.detectedType !== 'WEBP') {
    return {
      valid: false,
      error: `File '${originalFilename}' has a .webp extension but its binary signature does not match WEBP.`,
    };
  }

  if (ext === '.zip' && signature.detectedType !== 'ZIP') {
    return {
      valid: false,
      error: `File '${originalFilename}' has a .zip extension but its binary signature is not a valid ZIP archive (missing PK header).`,
    };
  }

  if (signature.detectedType === 'UNKNOWN') {
    return {
      valid: false,
      error: `Invalid or corrupted file content for '${originalFilename}'.`,
    };
  }

  return {
    valid: true,
    detectedType: signature.detectedType as any,
    canonicalMimeType: signature.mimeType,
  };
}

// Persist uploaded file into storage/uploads/UP-XXXX/original.<ext> and Supabase Storage
export function saveUploadedFile(
  uploadId: string,
  originalFilename: string,
  fileBuffer: Buffer,
  mimeType?: string
): {
  storagePath: string;
  absolutePath: string;
  size: number;
  sha256: string;
  supabaseBucket: string;
  supabasePath: string;
} {
  const uploadDir = path.join(DIRS.uploads, uploadId);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const ext = path.extname(originalFilename).toLowerCase() || '.bin';
  const targetFilename = `original${ext}`;
  const targetAbsolutePath = path.join(uploadDir, targetFilename);

  fs.writeFileSync(targetAbsolutePath, fileBuffer);

  const sha256 = computeSha256(fileBuffer);
  const relativeStoragePath = path.join('uploads', uploadId, targetFilename);
  const supabasePath = `uploads/${uploadId}/${targetFilename}`;

  // Asynchronously or eagerly upload to Supabase Storage
  uploadToSupabaseStorage(supabasePath, fileBuffer, mimeType || 'application/octet-stream').catch(
    (err) => {
      console.warn(`[Storage] Background upload to Supabase Storage failed for ${supabasePath}:`, err);
    }
  );

  return {
    storagePath: relativeStoragePath,
    absolutePath: targetAbsolutePath,
    size: fileBuffer.length,
    sha256,
    supabaseBucket: SUPABASE_BUCKET,
    supabasePath,
  };
}

/**
 * Saves a document under a specific category (historical, real-papers, detected-content)
 * and mirrors it to Supabase Storage.
 */
export async function saveDocumentToCategory(
  category: 'historical' | 'real-papers' | 'detected-content' | 'rendered-pages',
  filename: string,
  buffer: Buffer,
  mimeType?: string
): Promise<{
  storagePath: string;
  absolutePath: string;
  supabaseBucket: string;
  supabasePath: string;
  size: number;
  sha256: string;
}> {
  let targetDir = DIRS.uploads;
  if (category === 'historical') targetDir = DIRS.historicalRaw;
  else if (category === 'real-papers') targetDir = DIRS.realPapersRaw;
  else if (category === 'detected-content') targetDir = DIRS.candidatesRaw;
  else if (category === 'rendered-pages') targetDir = DIRS.renderedPages;

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const safeName = sanitizeFilename(filename);
  const absolutePath = path.join(targetDir, safeName);
  fs.writeFileSync(absolutePath, buffer);

  const sha256 = computeSha256(buffer);
  const supabasePath = `${category}/${safeName}`;

  try {
    await uploadToSupabaseStorage(supabasePath, buffer, mimeType || 'application/octet-stream');
  } catch (err: any) {
    console.warn(`[Storage] Upload to Supabase Storage (${supabasePath}) failed:`, err.message);
  }

  return {
    storagePath: absolutePath,
    absolutePath,
    supabaseBucket: SUPABASE_BUCKET,
    supabasePath,
    size: buffer.length,
    sha256,
  };
}

/**
 * Retrieves a document Buffer from local disk or Supabase Storage.
 * Ensures that if local disk was wiped on Render redeploy, the file is fetched from Supabase Storage and cached locally.
 */
export async function getDocumentBuffer(
  localPath?: string,
  supabasePath?: string
): Promise<{ buffer: Buffer; source: 'local' | 'supabase' } | null> {
  // 1. Check local file
  if (localPath && fs.existsSync(localPath)) {
    try {
      const buf = fs.readFileSync(localPath);
      return { buffer: buf, source: 'local' };
    } catch (err) {
      console.warn('[Storage] Error reading local file:', localPath, err);
    }
  }

  // 2. Fall back to Supabase Storage
  if (supabasePath) {
    const result = await downloadFromSupabaseStorage(supabasePath);
    if (result.success && result.data) {
      // Re-cache locally if localPath is safe
      if (localPath) {
        try {
          const dir = path.dirname(localPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(localPath, result.data);
        } catch (cacheErr) {
          // Ignore cache write error
        }
      }
      return { buffer: result.data, source: 'supabase' };
    }
  }

  // 3. Try deriving supabase path from localPath if not explicitly provided
  if (localPath) {
    const normalized = localPath.replace(/\\/g, '/');
    let derivedPath = '';
    if (normalized.includes('/storage/historical/')) {
      derivedPath = `historical/${path.basename(localPath)}`;
    } else if (normalized.includes('/storage/real_papers/')) {
      derivedPath = `real-papers/${path.basename(localPath)}`;
    } else if (normalized.includes('/storage/candidates/')) {
      derivedPath = `detected-content/${path.basename(localPath)}`;
    } else if (normalized.includes('/storage/uploads/')) {
      const parts = normalized.split('/storage/uploads/');
      if (parts[1]) derivedPath = `uploads/${parts[1]}`;
    } else if (normalized.includes('/storage/rendered_pages/')) {
      derivedPath = `rendered-pages/${path.basename(localPath)}`;
    }

    if (derivedPath) {
      const res = await downloadFromSupabaseStorage(derivedPath);
      if (res.success && res.data) {
        return { buffer: res.data, source: 'supabase' };
      }
    }
  }

  return null;
}


