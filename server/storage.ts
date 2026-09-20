import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const STORAGE_ROOT = path.resolve(process.cwd(), 'storage');

export const DIRS = {
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

// Supported MIME types and extensions
export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

export const ALLOWED_EXTENSIONS = new Set([
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
      error: `Unsupported file type '${ext}'. Supported formats: PDF, PNG, JPG, JPEG, WEBP.`,
    };
  }

  if (mimeType && !ALLOWED_MIME_TYPES.has(mimeType)) {
    // If extension is valid, be slightly permissive if client mime-type is generic octet-stream
    if (mimeType !== 'application/octet-stream') {
      return {
        valid: false,
        error: `Unsupported MIME type '${mimeType}'. Supported formats: PDF, PNG, JPG, JPEG, WEBP.`,
      };
    }
  }

  return { valid: true };
}

// Sanitize filename to avoid weird directory characters
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}
