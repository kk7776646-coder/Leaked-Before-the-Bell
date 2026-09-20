import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import {
  DIRS,
  LIMITS,
  computeFileSha256,
  isSafeZipEntryPath,
  ALLOWED_DOC_EXTENSIONS,
  sanitizeFilename,
} from './storage';

export interface ExtractedDocumentEntry {
  originalFilename: string;
  archiveRelativePath: string;
  storagePath: string;
  fileSize: number;
  sha256: string;
  mimeType: string;
  isImage: boolean;
  isPdf: boolean;
  folderCategory?: string;
  sortOrder: number;
}

export interface RecursiveZipExtractionResult {
  uploadId: string;
  archiveId: string;
  totalEntriesCount: number;
  supportedDocumentsCount: number;
  extractedSizeBytes: number;
  documents: ExtractedDocumentEntry[];
  warnings: string[];
  errors: string[];
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.pdf':
      return 'application/pdf';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Safely extracts a ZIP archive recursively into an isolated directory with strict security limits.
 */
export async function extractZipArchiveRecursively(
  zipBufferOrPath: Buffer | string,
  uploadId: string,
  archiveId: string
): Promise<RecursiveZipExtractionResult> {
  const destDir = path.join(DIRS.extracted, uploadId);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const warnings: string[] = [];
  const errors: string[] = [];
  const documents: ExtractedDocumentEntry[] = [];
  let totalExtractedSize = 0;
  let totalFilesCount = 0;

  async function processArchive(
    zipInput: Buffer | string,
    currentArchiveName: string,
    depth: number,
    baseRelativePath: string
  ): Promise<void> {
    if (depth > LIMITS.maxRecursionDepth) {
      warnings.push(`Max archive recursion depth (${LIMITS.maxRecursionDepth}) reached for ${currentArchiveName}.`);
      return;
    }

    let zip: AdmZip;
    try {
      zip = new AdmZip(zipInput);
    } catch (err: any) {
      errors.push(`Failed to read ZIP archive '${currentArchiveName}': ${err.message || String(err)}`);
      return;
    }

    const zipEntries = zip.getEntries();

    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;

      totalFilesCount++;
      if (totalFilesCount > LIMITS.maxFilesPerArchive) {
        warnings.push(`Archive file count limit (${LIMITS.maxFilesPerArchive}) reached. Remaining entries skipped.`);
        break;
      }

      // Check for Zip Slip / Path Traversal
      const entryName = entry.entryName;
      if (!isSafeZipEntryPath(entryName, destDir) || entryName.includes('..') || entryName.startsWith('/') || /^[a-zA-Z]:/.test(entryName)) {
        warnings.push(`Security warning: Suspicious Zip Slip entry path rejected: '${entryName}'`);
        continue;
      }

      const uncompressedSize = entry.header.size;
      if (totalExtractedSize + uncompressedSize > LIMITS.maxExtractedSizeBytes) {
        warnings.push(`Decompression size limit (${LIMITS.maxExtractedSizeBytes / (1024 * 1024)}MB) exceeded. Skipping further files.`);
        break;
      }

      const ext = path.extname(entryName).toLowerCase();

      // Check if entry is a nested ZIP
      if (ext === '.zip') {
        const nestedBuffer = entry.getData();
        totalExtractedSize += nestedBuffer.length;
        await processArchive(
          nestedBuffer,
          entry.name,
          depth + 1,
          path.join(baseRelativePath, path.dirname(entryName))
        );
        continue;
      }

      // Check if entry is a supported document or image
      if (!ALLOWED_DOC_EXTENSIONS.has(ext)) {
        // Skip unsupported or potentially unsafe files silently or record notice
        continue;
      }

      // Extract file to destination
      const safeRelativePath = entryName.replace(/^[\\\/]+/, '');
      const targetFilePath = path.join(destDir, safeRelativePath);
      const targetSubDir = path.dirname(targetFilePath);

      if (!fs.existsSync(targetSubDir)) {
        fs.mkdirSync(targetSubDir, { recursive: true });
      }

      const fileData = entry.getData();
      fs.writeFileSync(targetFilePath, fileData);
      totalExtractedSize += fileData.length;

      const sha256 = computeFileSha256(targetFilePath);
      const folderCategory = path.dirname(safeRelativePath);

      // Natural sort index based on numbers in filename (e.g. page1.jpg, page2.jpg)
      const numMatch = entry.name.match(/([0-9]+)/);
      const sortOrder = numMatch ? parseInt(numMatch[1], 10) : 999;

      documents.push({
        originalFilename: entry.name,
        archiveRelativePath: path.join(baseRelativePath, safeRelativePath),
        storagePath: targetFilePath,
        fileSize: fileData.length,
        sha256,
        mimeType: getMimeType(targetFilePath),
        isImage: ['.png', '.jpg', '.jpeg', '.webp'].includes(ext),
        isPdf: ext === '.pdf',
        folderCategory: folderCategory === '.' ? undefined : folderCategory,
        sortOrder,
      });
    }
  }

  await processArchive(zipBufferOrPath, 'root.zip', 0, '');

  // Sort documents by folder category and natural sort order
  documents.sort((a, b) => {
    if (a.folderCategory && b.folderCategory && a.folderCategory !== b.folderCategory) {
      return a.folderCategory.localeCompare(b.folderCategory);
    }
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.originalFilename.localeCompare(b.originalFilename, undefined, { numeric: true });
  });

  return {
    uploadId,
    archiveId,
    totalEntriesCount: totalFilesCount,
    supportedDocumentsCount: documents.length,
    extractedSizeBytes: totalExtractedSize,
    documents,
    warnings,
    errors,
  };
}
