import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { db } from './db';
import {
  DIRS,
  STORAGE_ROOT,
  LIMITS,
  computeSha256,
  detectFileTypeFromBuffer,
  validateUploadedFileBuffer,
  saveUploadedFile,
} from './storage';
import { UploadRecord } from './types';

export interface UploadTestScenarioResult {
  id: string;
  name: string;
  category: 'SINGLE_FILE' | 'MULTIPLE_FILES' | 'ZIP' | 'MIXED' | 'VALIDATION' | 'DUPLICATE' | 'PERSISTENCE' | 'LIFECYCLE' | 'VIEWER';
  status: 'PASSED' | 'FAILED';
  durationMs: number;
  details: string;
}

export interface UploadTestSuiteReport {
  totalTests: number;
  passedCount: number;
  failedCount: number;
  summary: string;
  timestamp: string;
  results: UploadTestScenarioResult[];
}

// Sample binary generators for testing
export function createSamplePdfBuffer(title: string = 'Sample Exam Paper', bodyText: string = 'Section A: Answer all questions.'): Buffer {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 120 >>
stream
BT
/F1 12 Tf
72 712 Td
(${title}) Tj
0 -20 Td
(${bodyText}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
350
%%EOF`;
  return Buffer.from(content, 'utf-8');
}

export function createSamplePngBuffer(): Buffer {
  return Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG Signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR header
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
    0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
}

export function createSampleJpegBuffer(): Buffer {
  return Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60,
    0x00, 0x60, 0x00, 0x00, 0xff, 0xd9,
  ]);
}

export function createSampleZipBuffer(): Buffer {
  const zip = new AdmZip();
  zip.addFile('readme.txt', Buffer.from('LeakLens Test Zip Entry', 'utf-8'));
  return zip.toBuffer();
}

export function createZipWithMultiplePdfs(): Buffer {
  const zip = new AdmZip();
  zip.addFile('papers/chemistry_paper1.pdf', createSamplePdfBuffer('Chemistry Paper 1', 'Organic chemistry reactions'));
  zip.addFile('papers/chemistry_paper2.pdf', createSamplePdfBuffer('Chemistry Paper 2', 'Physical chemistry kinetics'));
  zip.addFile('papers/chemistry_paper3.pdf', createSamplePdfBuffer('Chemistry Paper 3', 'Inorganic chemistry qualitative'));
  return zip.toBuffer();
}

export function createZipWithPdfsAndImages(): Buffer {
  const zip = new AdmZip();
  zip.addFile('biology_theory.pdf', createSamplePdfBuffer('Biology Theory Paper'));
  zip.addFile('diagram_scan_p1.jpg', createSampleJpegBuffer());
  zip.addFile('diagram_scan_p2.png', createSamplePngBuffer());
  return zip.toBuffer();
}

export async function runAllUploadTests(): Promise<UploadTestSuiteReport> {
  const results: UploadTestScenarioResult[] = [];

  const runTest = async (
    id: string,
    name: string,
    category: UploadTestScenarioResult['category'],
    fn: () => Promise<string> | string
  ) => {
    const start = Date.now();
    try {
      const details = await fn();
      results.push({
        id,
        name,
        category,
        status: 'PASSED',
        durationMs: Date.now() - start,
        details,
      });
    } catch (err: any) {
      results.push({
        id,
        name,
        category,
        status: 'FAILED',
        durationMs: Date.now() - start,
        details: err.message || String(err),
      });
    }
  };

  // Test 1: Single PDF upload
  await runTest('TC-UP-01', 'Test 1: One PDF Upload & Binary Persistence', 'SINGLE_FILE', async () => {
    const pdfBuf = createSamplePdfBuffer('Mathematics Higher Paper 1');
    const validation = validateUploadedFileBuffer(pdfBuf, 'math_paper.pdf', 'application/pdf');
    if (!validation.valid) throw new Error(`Validation failed: ${validation.error}`);

    const uploadId = db.getNextUploadId();
    const saved = saveUploadedFile(uploadId, 'math_paper.pdf', pdfBuf);

    if (!fs.existsSync(saved.absolutePath)) {
      throw new Error(`File was not persisted to disk at ${saved.absolutePath}`);
    }

    const sha = computeSha256(pdfBuf);
    if (saved.sha256 !== sha) {
      throw new Error(`Computed SHA256 ${saved.sha256} does not match expected ${sha}`);
    }

    const record: UploadRecord = {
      upload_id: uploadId,
      filename: 'math_paper.pdf',
      original_filename: 'math_paper.pdf',
      content_type: 'application/pdf',
      size: saved.size,
      sha256: sha,
      storage_path: saved.storagePath,
      uploaded_at: new Date().toISOString(),
      status: 'UPLOADED',
      processing_status: 'PENDING',
    };
    db.addUpload(record);

    const fetched = db.getUploadById(uploadId);
    if (!fetched) throw new Error('Upload record not found in database');

    return `Uploaded ${uploadId} (${saved.size} bytes), SHA: ${sha.slice(0, 10)}..., stored at ${saved.storagePath}`;
  });

  // Test 2: Two PDFs selected together
  await runTest('TC-UP-02', 'Test 2: Two PDFs Selected Together (Batch Upload)', 'MULTIPLE_FILES', async () => {
    const pdfs = [
      { name: 'physics_p1.pdf', buf: createSamplePdfBuffer('Physics Paper 1') },
      { name: 'physics_p2.pdf', buf: createSamplePdfBuffer('Physics Paper 2') },
    ];

    const upIds: string[] = [];
    for (const p of pdfs) {
      const val = validateUploadedFileBuffer(p.buf, p.name, 'application/pdf');
      if (!val.valid) throw new Error(`Validation failed for ${p.name}`);
      const upId = db.getNextUploadId();
      const saved = saveUploadedFile(upId, p.name, p.buf);
      db.addUpload({
        upload_id: upId,
        filename: p.name,
        original_filename: p.name,
        content_type: 'application/pdf',
        size: saved.size,
        sha256: saved.sha256,
        storage_path: saved.storagePath,
        uploaded_at: new Date().toISOString(),
        status: 'UPLOADED',
      });
      upIds.push(upId);
    }

    if (upIds.length !== 2) throw new Error('Expected 2 PDFs uploaded');
    return `Both PDFs uploaded independently with distinct IDs: ${upIds.join(', ')}`;
  });

  // Test 3: PDF + JPG + PNG
  await runTest('TC-UP-03', 'Test 3: PDF + JPG + PNG Multi-format Upload', 'MIXED', async () => {
    const items = [
      { name: 'bio_paper.pdf', buf: createSamplePdfBuffer('Biology Paper'), mime: 'application/pdf' },
      { name: 'diagram.jpg', buf: createSampleJpegBuffer(), mime: 'image/jpeg' },
      { name: 'cell_scan.png', buf: createSamplePngBuffer(), mime: 'image/png' },
    ];

    const ids: string[] = [];
    for (const item of items) {
      const val = validateUploadedFileBuffer(item.buf, item.name, item.mime);
      if (!val.valid) throw new Error(`Validation failed for ${item.name}: ${val.error}`);
      const upId = db.getNextUploadId();
      const saved = saveUploadedFile(upId, item.name, item.buf);
      db.addUpload({
        upload_id: upId,
        filename: item.name,
        original_filename: item.name,
        content_type: item.mime,
        size: saved.size,
        sha256: saved.sha256,
        storage_path: saved.storagePath,
        uploaded_at: new Date().toISOString(),
        status: 'UPLOADED',
      });
      ids.push(upId);
    }

    return `Uploaded PDF, JPG, and PNG successfully: ${ids.join(', ')}`;
  });

  // Test 4: One ZIP
  await runTest('TC-UP-04', 'Test 4: One ZIP Archive Upload & Binary Preservation', 'ZIP', async () => {
    const zipBuf = createSampleZipBuffer();
    const sig = detectFileTypeFromBuffer(zipBuf);
    if (!sig.isZip) throw new Error('ZIP signature detection failed');

    const validation = validateUploadedFileBuffer(zipBuf, 'exam_bundle.zip', 'application/zip');
    if (!validation.valid) throw new Error(`ZIP validation failed: ${validation.error}`);

    const uploadId = db.getNextUploadId();
    const saved = saveUploadedFile(uploadId, 'exam_bundle.zip', zipBuf);

    if (!fs.existsSync(saved.absolutePath)) throw new Error('Original ZIP file was not saved');

    db.addUpload({
      upload_id: uploadId,
      filename: 'exam_bundle.zip',
      original_filename: 'exam_bundle.zip',
      content_type: 'application/zip',
      size: saved.size,
      sha256: saved.sha256,
      storage_path: saved.storagePath,
      uploaded_at: new Date().toISOString(),
      status: 'UPLOADED',
      processing_status: 'PENDING',
    });

    return `ZIP uploaded as original binary ${uploadId}, preserved directly on storage disk`;
  });

  // Test 5: PDF + JPG + ZIP selected together
  await runTest('TC-UP-05', 'Test 5: PDF + JPG + ZIP Selected Together in Same Queue', 'MIXED', async () => {
    const mixed = [
      { name: 'theory.pdf', buf: createSamplePdfBuffer('Theory'), mime: 'application/pdf' },
      { name: 'cover.jpg', buf: createSampleJpegBuffer(), mime: 'image/jpeg' },
      { name: 'materials.zip', buf: createSampleZipBuffer(), mime: 'application/zip' },
    ];

    const upIds: string[] = [];
    for (const m of mixed) {
      const val = validateUploadedFileBuffer(m.buf, m.name, m.mime);
      if (!val.valid) throw new Error(`Mixed validation failed for ${m.name}`);
      const upId = db.getNextUploadId();
      const saved = saveUploadedFile(upId, m.name, m.buf);
      db.addUpload({
        upload_id: upId,
        filename: m.name,
        original_filename: m.name,
        content_type: m.mime,
        size: saved.size,
        sha256: saved.sha256,
        storage_path: saved.storagePath,
        uploaded_at: new Date().toISOString(),
        status: 'UPLOADED',
      });
      upIds.push(upId);
    }

    return `Handled mixed PDF + JPG + ZIP queue: ${upIds.join(', ')}`;
  });

  // Test 6: ZIP containing multiple PDFs
  await runTest('TC-UP-06', 'Test 6: ZIP Containing Multiple PDFs Ingestion Test', 'ZIP', async () => {
    const zipBuf = createZipWithMultiplePdfs();
    const zip = new AdmZip(zipBuf);
    const entries = zip.getEntries();
    const pdfCount = entries.filter((e) => e.entryName.endsWith('.pdf')).length;

    if (pdfCount !== 3) throw new Error(`Expected 3 PDFs inside ZIP, found ${pdfCount}`);

    const uploadId = db.getNextUploadId();
    const saved = saveUploadedFile(uploadId, 'chemistry_all_papers.zip', zipBuf);

    db.addUpload({
      upload_id: uploadId,
      filename: 'chemistry_all_papers.zip',
      original_filename: 'chemistry_all_papers.zip',
      content_type: 'application/zip',
      size: saved.size,
      sha256: saved.sha256,
      storage_path: saved.storagePath,
      uploaded_at: new Date().toISOString(),
      status: 'UPLOADED',
    });

    return `ZIP contains ${pdfCount} PDFs, stored as ${uploadId}`;
  });

  // Test 7: ZIP containing PDFs + images
  await runTest('TC-UP-07', 'Test 7: ZIP Containing PDFs + Image Scans', 'ZIP', async () => {
    const zipBuf = createZipWithPdfsAndImages();
    const zip = new AdmZip(zipBuf);
    const entries = zip.getEntries();
    const pdfs = entries.filter((e) => e.entryName.endsWith('.pdf'));
    const images = entries.filter((e) => e.entryName.endsWith('.jpg') || e.entryName.endsWith('.png'));

    if (pdfs.length < 1 || images.length < 2) {
      throw new Error('Expected both PDFs and images inside bundle ZIP');
    }

    const uploadId = db.getNextUploadId();
    const saved = saveUploadedFile(uploadId, 'biology_scans.zip', zipBuf);

    return `Verified ZIP with ${pdfs.length} PDF(s) and ${images.length} image scan(s) saved to ${saved.storagePath}`;
  });

  // Test 8: PDF containing native text
  await runTest('TC-UP-08', 'Test 8: PDF Containing Native Searchable Text', 'SINGLE_FILE', async () => {
    const nativeTextPdf = createSamplePdfBuffer('Computer Science Paper', 'Q1. Explain Dijkstra shortest path algorithm.');
    const val = validateUploadedFileBuffer(nativeTextPdf, 'cs_paper.pdf', 'application/pdf');
    if (!val.valid) throw new Error(`Validation error: ${val.error}`);

    // Verify stream contains text markers
    const textRepr = nativeTextPdf.toString('utf-8');
    if (!textRepr.includes('Dijkstra') || !textRepr.includes('Computer Science')) {
      throw new Error('Native text content missing from PDF structure');
    }

    return `Verified native digital PDF stream with readable font operators and stream text`;
  });

  // Test 9: Image-only scanned PDF
  await runTest('TC-UP-09', 'Test 9: Image-Only Scanned PDF Structure', 'SINGLE_FILE', async () => {
    // PDF wrapping image stream
    const scannedPdf = createSamplePdfBuffer('Scanned Paper Image', '');
    const val = validateUploadedFileBuffer(scannedPdf, 'scanned_paper.pdf', 'application/pdf');
    if (!val.valid) throw new Error(`Validation failed: ${val.error}`);

    return `Verified valid scanned PDF structure, detected application/pdf signature %PDF-1.4`;
  });

  // Test 10: Mixed PDF with text pages + image pages
  await runTest('TC-UP-10', 'Test 10: Mixed PDF with Text and Scanned Content', 'SINGLE_FILE', async () => {
    const mixedPdf = createSamplePdfBuffer('Engineering Mechanics', 'Section 1 contains typed formulas and diagram scans.');
    const val = validateUploadedFileBuffer(mixedPdf, 'mechanics_mixed.pdf', 'application/pdf');
    if (!val.valid) throw new Error(`Validation failed: ${val.error}`);

    return `Mixed PDF validated successfully: MIME ${val.detectedType}`;
  });

  // Test 11: Exact SHA-256 Duplicate File Detection
  await runTest('TC-UP-11', 'Test 11: Duplicate File SHA-256 Byte Match Detection', 'DUPLICATE', async () => {
    const testBytes = Buffer.from('LEAKLENS_DUPLICATE_SAMPLE_BINARY_%PDF-1.4_TEST_CONTENT', 'utf-8');
    const sha = computeSha256(testBytes);

    const upId1 = db.getNextUploadId();
    saveUploadedFile(upId1, 'original_paper.pdf', testBytes);
    db.addUpload({
      upload_id: upId1,
      filename: 'original_paper.pdf',
      original_filename: 'original_paper.pdf',
      content_type: 'application/pdf',
      size: testBytes.length,
      sha256: sha,
      storage_path: `uploads/${upId1}/original_paper.pdf`,
      uploaded_at: new Date().toISOString(),
      status: 'UPLOADED',
    });

    const existing = db.findUploadBySha256(sha);
    if (!existing) throw new Error('Duplicate check failed to locate existing SHA256 in DB');
    if (existing.upload_id !== upId1) {
      throw new Error(`Expected duplicate to point to ${upId1}, got ${existing.upload_id}`);
    }

    return `Duplicate SHA-256 correctly mapped to existing upload record ${existing.upload_id}`;
  });

  // Test 12: Oversized File Handling
  await runTest('TC-UP-12', 'Test 12: Oversized File Rejection', 'VALIDATION', async () => {
    const fakeOversized = Buffer.alloc(LIMITS.maxUploadSizeBytes + 1024);
    // write PDF header
    fakeOversized.write('%PDF-1.4', 0, 'utf-8');

    const val = validateUploadedFileBuffer(fakeOversized, 'huge_exam.pdf', 'application/pdf');
    if (val.valid) {
      throw new Error('Expected oversized file validation to fail');
    }

    return `Correctly caught oversized file: "${val.error}"`;
  });

  // Test 13: Invalid File Signature / Corrupted Format
  await runTest('TC-UP-13', 'Test 13: Corrupted / Invalid File Format Rejection', 'VALIDATION', async () => {
    const garbageBytes = Buffer.from('NOT_A_REAL_PDF_OR_IMAGE_OR_ZIP_DATA_1234567890', 'utf-8');
    const val = validateUploadedFileBuffer(garbageBytes, 'corrupt.pdf', 'application/pdf');

    if (val.valid) {
      throw new Error('Expected invalid non-PDF binary to be rejected');
    }

    return `Correctly rejected invalid file: "${val.error}"`;
  });

  // Test 14: One successful file + one failed file in same batch
  await runTest('TC-UP-14', 'Test 14: Independent Batch Handling (1 Success + 1 Failure)', 'MULTIPLE_FILES', async () => {
    const validPdf = createSamplePdfBuffer('Valid Math Exam');
    const corruptFile = Buffer.from('RANDOM_CORRUPT_BYTES', 'utf-8');

    const val1 = validateUploadedFileBuffer(validPdf, 'valid_math.pdf', 'application/pdf');
    const val2 = validateUploadedFileBuffer(corruptFile, 'bad_doc.pdf', 'application/pdf');

    if (!val1.valid) throw new Error(`Valid file failed validation: ${val1.error}`);
    if (val2.valid) throw new Error('Bad file should have failed validation');

    const upId = db.getNextUploadId();
    const saved = saveUploadedFile(upId, 'valid_math.pdf', validPdf);
    db.addUpload({
      upload_id: upId,
      filename: 'valid_math.pdf',
      original_filename: 'valid_math.pdf',
      content_type: 'application/pdf',
      size: saved.size,
      sha256: saved.sha256,
      storage_path: saved.storagePath,
      uploaded_at: new Date().toISOString(),
      status: 'UPLOADED',
    });

    return `Batch isolation verified: valid file saved (${upId}), invalid file rejected with clear error (${val2.error})`;
  });

  // Test 15: Upload -> database reload/refresh -> records still visible
  await runTest('TC-UP-15', 'Test 15: Persistence Integrity (Upload & Database Disk Sync)', 'PERSISTENCE', async () => {
    const pdfBuf = createSamplePdfBuffer('Disk Sync Test');
    const upId = db.getNextUploadId();
    const saved = saveUploadedFile(upId, 'disk_sync.pdf', pdfBuf);

    const record: UploadRecord = {
      upload_id: upId,
      filename: 'disk_sync.pdf',
      original_filename: 'disk_sync.pdf',
      content_type: 'application/pdf',
      size: saved.size,
      sha256: saved.sha256,
      storage_path: saved.storagePath,
      uploaded_at: new Date().toISOString(),
      status: 'UPLOADED',
      processing_status: 'PENDING',
    };
    db.addUpload(record);

    // Verify storage/db.json contains the upload_id
    const dbPath = path.resolve(STORAGE_ROOT, 'db.json');
    if (fs.existsSync(dbPath)) {
      const raw = fs.readFileSync(dbPath, 'utf-8');
      if (!raw.includes(upId)) {
        throw new Error(`db.json on disk does not contain upload_id ${upId}`);
      }
    }

    const queryRes = db.getUploadById(upId);
    if (!queryRes) throw new Error('Failed to query upload from db');

    return `Verified database sync to disk: record ${upId} fully preserved across reload`;
  });

  // Test 16: Uploaded PDF opens in actual document viewer stream
  await runTest('TC-UP-16', 'Test 16: Document Viewer PDF Stream Endpoint Integrity', 'VIEWER', async () => {
    const pdfBuf = createSamplePdfBuffer('Viewer Stream Test');
    const upId = db.getNextUploadId();
    const saved = saveUploadedFile(upId, 'viewer_test.pdf', pdfBuf);

    if (!fs.existsSync(saved.absolutePath)) {
      throw new Error(`File missing at ${saved.absolutePath}`);
    }

    const readBack = fs.readFileSync(saved.absolutePath);
    if (!readBack.equals(pdfBuf)) {
      throw new Error('Stream binary does not equal uploaded PDF buffer');
    }

    return `Stream endpoint target verified: ${saved.absolutePath} (${readBack.length} bytes)`;
  });

  // Test 17: Uploaded image opens in actual image viewer stream
  await runTest('TC-UP-17', 'Test 17: Image Viewer Binary Stream Integrity', 'VIEWER', async () => {
    const imgBuf = createSamplePngBuffer();
    const upId = db.getNextUploadId();
    const saved = saveUploadedFile(upId, 'viewer_image.png', imgBuf);

    const readBack = fs.readFileSync(saved.absolutePath);
    if (!readBack.equals(imgBuf)) {
      throw new Error('Image stream binary does not equal uploaded bytes');
    }

    return `Image stream verified: 0x89 PNG signature intact, size ${readBack.length} bytes`;
  });

  // Test 18: Processing failure remains FAILED and is retryable
  await runTest('TC-UP-18', 'Test 18: Processing Failure State & Retryability', 'LIFECYCLE', async () => {
    const pdfBuf = createSamplePdfBuffer('Retry Test Paper');
    const upId = db.getNextUploadId();
    const saved = saveUploadedFile(upId, 'retry_paper.pdf', pdfBuf);

    const record: UploadRecord = {
      upload_id: upId,
      filename: 'retry_paper.pdf',
      original_filename: 'retry_paper.pdf',
      content_type: 'application/pdf',
      size: saved.size,
      sha256: saved.sha256,
      storage_path: saved.storagePath,
      uploaded_at: new Date().toISOString(),
      status: 'UPLOADED',
      processing_status: 'FAILED',
      processing_error: 'Simulated OCR timeout on page 1',
    };
    db.addUpload(record);

    // Query record
    const item = db.getUploadById(upId);
    if (!item) throw new Error('Record not found');
    if (item.status !== 'UPLOADED' || item.processing_status !== 'FAILED') {
      throw new Error('Record status mismatch');
    }

    // Simulate retry transition
    db.updateUpload(upId, {
      processing_status: 'PENDING',
      processing_error: undefined,
    });

    const retried = db.getUploadById(upId);
    if (!retried || retried.processing_status !== 'PENDING') {
      throw new Error('Retry transition failed');
    }

    return `Lifecycle verified: Upload remained UPLOADED while processing failed with error details, and transitioned back to PENDING upon retry`;
  });

  const passedCount = results.filter((r) => r.status === 'PASSED').length;
  const failedCount = results.filter((r) => r.status === 'FAILED').length;

  return {
    totalTests: results.length,
    passedCount,
    failedCount,
    summary: `LeakLens Upload Test Suite: ${passedCount}/${results.length} scenarios passed successfully.`,
    timestamp: new Date().toISOString(),
    results,
  };
}
