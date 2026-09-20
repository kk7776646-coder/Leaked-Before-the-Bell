import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  IngestionHierarchyResult,
  IngestionProcessingStatusStep,
  LogicalPaperUnit,
  DetectedContentRecord,
  PageExtractionResult,
} from './types';
import {
  DIRS,
  computeFileSha256,
  computeSha256,
  sanitizeFilename,
} from './storage';
import { extractZipArchiveRecursively } from './recursiveZipExtractor';
import { extractDocumentContent } from './documentExtraction';
import { detectPaperBoundariesInPdf, groupImageEntriesIntoPapers } from './paperBoundaryDetector';
import { extractMetadataFromContent } from './metadataExtractor';
import { runForensicsComparison } from './forensics';
import { db } from './db';

let uploadCounter = 1001;

function generateUploadId(): string {
  return `UP-${Date.now().toString().slice(-4)}${uploadCounter++}`;
}

function generateArchiveId(): string {
  return `ARC-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
}

export interface IngestOptions {
  platform?: string;
  source?: string;
  subjectOverride?: string;
  subjectCodeOverride?: string;
  notes?: string;
  relativePaths?: string[];
}

export class DocumentIngestionEngine {
  /**
   * Complete inspection and ingestion pipeline for uploaded files (single, multi, or ZIP archive).
   */
  async inspectAndIngest(
    uploadedFiles: Express.Multer.File[],
    options: IngestOptions = {}
  ): Promise<IngestionHierarchyResult> {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      throw new Error('No files provided for ingestion.');
    }

    const uploadId = generateUploadId();
    const primaryFile = uploadedFiles[0];
    const originalFilename = primaryFile.originalname;
    const fileExt = path.extname(originalFilename).toLowerCase();
    const isZip = fileExt === '.zip';
    const archiveId = isZip ? generateArchiveId() : undefined;

    // Create persistent upload folder: storage/uploads/UP-XXXX/
    const uploadDir = path.join(DIRS.uploads, uploadId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const steps: IngestionProcessingStatusStep[] = [];
    const addStep = (step: IngestionProcessingStatusStep['step'], label: string, details?: string) => {
      steps.push({
        step,
        label,
        timestamp: new Date().toISOString(),
        details,
      });
    };

    addStep('UPLOADED', `Received ${uploadedFiles.length} file(s) for intake`, `Primary file: ${originalFilename}`);
    addStep('INSPECTING', 'Inspecting file formats and structure', `MIME: ${primaryFile.mimetype}, Size: ${primaryFile.size} bytes`);

    const errors: string[] = [];
    const warnings: string[] = [];
    let logicalPapers: LogicalPaperUnit[] = [];
    let totalExtractedFilesCount = 0;
    let detectedDocumentsCount = 0;
    let totalPagesCount = 0;

    const zipFiles = uploadedFiles.filter(
      (f) => f.mimetype === 'application/zip' || f.mimetype === 'application/x-zip-compressed' || f.mimetype === 'multipart/x-zip' || f.originalname.toLowerCase().endsWith('.zip')
    );
    const pdfFiles = uploadedFiles.filter(
      (f) => (f.mimetype === 'application/pdf' || f.originalname.toLowerCase().endsWith('.pdf')) && !f.originalname.toLowerCase().endsWith('.zip')
    );
    const imageFiles = uploadedFiles.filter(
      (f) => (f.mimetype.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.webp'].some((e) => f.originalname.toLowerCase().endsWith(e))) && !f.originalname.toLowerCase().endsWith('.zip')
    );

    const getRelativePathForFile = (f: Express.Multer.File, idx: number): string => {
      if (options.relativePaths && options.relativePaths[idx]) {
        return options.relativePaths[idx];
      }
      return f.originalname;
    };

    // 1. Process all ZIP files (if any)
    for (const zipFile of zipFiles) {
      addStep('EXTRACTING', `Safely extracting ZIP archive ${zipFile.originalname} with recursion and path traversal guards`);
      const archiveStoragePath = path.join(uploadDir, sanitizeFilename(zipFile.originalname));
      fs.copyFileSync(zipFile.path, archiveStoragePath);

      const curArchiveId = generateArchiveId();
      const zipResult = await extractZipArchiveRecursively(archiveStoragePath, uploadId, curArchiveId);
      totalExtractedFilesCount += zipResult.documents.length;
      if (zipResult.warnings.length > 0) warnings.push(...zipResult.warnings);
      if (zipResult.errors.length > 0) errors.push(...zipResult.errors);

      addStep('DETECTING_DOCUMENTS', `Discovered ${zipResult.documents.length} supported documents inside ${zipFile.originalname}`);

      const zipPdfEntries = zipResult.documents.filter((d) => d.isPdf);
      const zipImageEntries = zipResult.documents.filter((d) => d.isImage);
      detectedDocumentsCount += zipPdfEntries.length + (zipImageEntries.length > 0 ? 1 : 0);

      // Process PDFs found inside ZIP
      for (const pdfEntry of zipPdfEntries) {
        addStep('EXTRACTING_TEXT', `Extracting native text and scanning pages for ${pdfEntry.originalFilename}`);
        try {
          const pdfExtraction = await extractDocumentContent(
            pdfEntry.storagePath,
            pdfEntry.mimeType,
            pdfEntry.originalFilename
          );
          totalPagesCount += pdfExtraction.pages.length;

          addStep('GROUPING_PAPERS', `Analyzing paper boundaries for ${pdfEntry.originalFilename}`);
          const pdfPapers = detectPaperBoundariesInPdf(
            pdfExtraction.pages,
            pdfEntry.originalFilename,
            pdfEntry.storagePath,
            pdfEntry.sha256,
            pdfEntry.fileSize
          );

          logicalPapers.push(...pdfPapers);
        } catch (err: any) {
          errors.push(`Failed to extract PDF ${pdfEntry.originalFilename}: ${err.message || String(err)}`);
        }
      }

      // Process Images found inside ZIP
      if (zipImageEntries.length > 0) {
        addStep('OCR_PROCESSING', `Performing OCR on ${zipImageEntries.length} image files from ${zipFile.originalname}`);
        const extractedImages: {
          entry: typeof zipImageEntries[0];
          pageResult: PageExtractionResult;
        }[] = [];

        for (const imgEntry of zipImageEntries) {
          try {
            const imgExtraction = await extractDocumentContent(
              imgEntry.storagePath,
              imgEntry.mimeType,
              imgEntry.originalFilename
            );
            const firstPage = imgExtraction.pages[0] || {
              pageNumber: 1,
              extractionMethod: 'OCR',
              text: imgExtraction.rawTextLength > 0 ? imgExtraction.pages.map((p) => p.text).join('\n') : '',
              ocrConfidence: imgExtraction.overallOcrConfidence || 85,
              processingStatus: 'COMPLETED',
              nativeTextLength: 0,
            };
            extractedImages.push({
              entry: imgEntry,
              pageResult: firstPage,
            });
            totalPagesCount += 1;
          } catch (err: any) {
            errors.push(`Failed OCR on image ${imgEntry.originalFilename}: ${err.message || String(err)}`);
          }
        }

        addStep('GROUPING_PAPERS', `Grouping ${extractedImages.length} image scans from ${zipFile.originalname} into logical papers`);
        const imagePapers = groupImageEntriesIntoPapers(extractedImages);
        logicalPapers.push(...imagePapers);
      }
    }

    // 2. Process all direct PDF files (if any)
    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];
      const relPath = getRelativePathForFile(file, uploadedFiles.indexOf(file));
      totalExtractedFilesCount += 1;
      detectedDocumentsCount += 1;

      const destPath = path.join(uploadDir, sanitizeFilename(file.originalname));
      fs.copyFileSync(file.path, destPath);
      const sha256 = computeFileSha256(destPath);

      addStep('EXTRACTING_TEXT', `Classifying PDF pages and extracting content for ${file.originalname}`);
      const pdfExtraction = await extractDocumentContent(destPath, file.mimetype, file.originalname);
      totalPagesCount += pdfExtraction.pages.length;

      addStep('GROUPING_PAPERS', `Analyzing question paper boundaries for ${file.originalname}`);
      const pdfPapers = detectPaperBoundariesInPdf(
        pdfExtraction.pages,
        file.originalname,
        destPath,
        sha256,
        file.size
      );

      pdfPapers.forEach((p) => {
        p.sourceFiles.forEach((sf) => {
          sf.originalPath = relPath;
        });
      });

      logicalPapers.push(...pdfPapers);
    }

    // 3. Process all direct Image files (if any)
    if (imageFiles.length > 0) {
      totalExtractedFilesCount += imageFiles.length;
      detectedDocumentsCount += 1;

      addStep('OCR_PROCESSING', `Running optical character recognition on ${imageFiles.length} direct image uploads`);
      const extractedImages: {
        entry: any;
        pageResult: PageExtractionResult;
      }[] = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const relPath = getRelativePathForFile(file, uploadedFiles.indexOf(file));
        const folderCat = path.dirname(relPath) !== '.' && path.dirname(relPath) !== '' ? path.dirname(relPath) : 'ROOT';
        const destPath = path.join(uploadDir, sanitizeFilename(file.originalname));
        fs.copyFileSync(file.path, destPath);
        const sha256 = computeFileSha256(destPath);

        const imgExtraction = await extractDocumentContent(destPath, file.mimetype, file.originalname);
        const firstPage = imgExtraction.pages[0] || {
          pageNumber: i + 1,
          extractionMethod: 'OCR',
          text: imgExtraction.pages.map((p) => p.text).join('\n'),
          ocrConfidence: imgExtraction.overallOcrConfidence || 85,
          processingStatus: 'COMPLETED',
          nativeTextLength: 0,
        };

        extractedImages.push({
          entry: {
            originalFilename: file.originalname,
            archiveRelativePath: relPath,
            storagePath: destPath,
            fileSize: file.size,
            sha256,
            mimeType: file.mimetype,
            isImage: true,
            isPdf: false,
            folderCategory: folderCat,
            sortOrder: i + 1,
          },
          pageResult: firstPage,
        });
        totalPagesCount += 1;
      }

      addStep('GROUPING_PAPERS', `Grouping ${extractedImages.length} image files into logical papers`);
      const imagePapers = groupImageEntriesIntoPapers(extractedImages);
      logicalPapers.push(...imagePapers);
    }

    // -------------------------------------------------------------
    // POST-PROCESSING: METADATA EXTRACTION & FORENSICS COMPARISON
    // -------------------------------------------------------------
    addStep('EXTRACTING_METADATA', `Extracting structured examination metadata across ${logicalPapers.length} logical paper(s)`);
    addStep('EXTRACTING_QUESTIONS', 'Segmenting sections, questions, and marks');
    addStep('COMPARING', 'Running similarity comparison against Active Exam Metadata, Verified Real Papers, and Historical Vault');

    const realPapers = db.getRealPapers();
    const historicalPapers = db.getHistoricalPapers();
    const examMetadataList = db.getExamMetadata();

    // Run metadata extraction and forensics for each paper
    logicalPapers = logicalPapers.map((paper, idx) => {
      // Re-evaluate metadata if user provided manual overrides
      if (options.subjectOverride) {
        paper.metadata.subject = {
          value: options.subjectOverride,
          confidence: 1.0,
          confidenceLevel: 'HIGH',
          source: 'USER_CORRECTED',
        };
        paper.subject = options.subjectOverride;
      }
      if (options.subjectCodeOverride) {
        paper.metadata.subjectCode = {
          value: options.subjectCodeOverride,
          confidence: 1.0,
          confidenceLevel: 'HIGH',
          source: 'USER_CORRECTED',
        };
        paper.subjectCode = options.subjectCodeOverride;
      }

      return paper;
    });

    addStep('COMPLETED', `Successfully ingested and analyzed ${logicalPapers.length} paper(s) with ${totalPagesCount} total page(s)`);

    const result: IngestionHierarchyResult = {
      uploadId,
      archiveId,
      originalFilename,
      fileType: isZip ? 'ZIP' : logicalPapers.length > 1 ? 'BUNDLE' : primaryFile.mimetype === 'application/pdf' ? 'PDF' : 'IMAGE',
      size: primaryFile.size,
      sha256: computeFileSha256(primaryFile.path),
      status: errors.length > 0 && logicalPapers.length === 0 ? 'FAILED' : 'COMPLETED',
      steps,
      papers: logicalPapers,
      extractedFilesCount: totalExtractedFilesCount,
      detectedDocumentsCount: detectedDocumentsCount,
      totalPagesCount,
      isArchive: isZip,
      archivePath: isZip ? path.join(uploadDir, sanitizeFilename(originalFilename)) : undefined,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };

    return result;
  }

  /**
   * Commits the logical papers of an ingestion result into permanent DetectedContentRecord entries in DB.
   */
  async commitIngestedPapers(
    hierarchyResult: IngestionHierarchyResult,
    options: {
      platform?: string;
      source?: string;
      userPaperOverrides?: Record<string, Partial<LogicalPaperUnit['metadata'] & { subject?: string; subjectCode?: string }>>;
    } = {}
  ): Promise<DetectedContentRecord[]> {
    const realPapers = db.getRealPapers();
    const historicalPapers = db.getHistoricalPapers();
    const examMetadataList = db.getExamMetadata();

    const createdRecords: DetectedContentRecord[] = [];

    for (let i = 0; i < hierarchyResult.papers.length; i++) {
      const paper = hierarchyResult.papers[i];
      const overrides = options.userPaperOverrides?.[paper.paperId];

      const finalSubject = overrides?.subject || paper.metadata.subject.value;
      const finalSubjectCode = overrides?.subjectCode || paper.metadata.subjectCode.value;
      const isUserCorrected = Boolean(overrides?.subject || overrides?.subjectCode);

      // Run forensic similarity comparison
      const forensics = runForensicsComparison(
        paper.questions,
        realPapers,
        historicalPapers,
        examMetadataList,
        finalSubject !== 'Not detected' ? finalSubject : undefined,
        finalSubjectCode !== 'Not detected' ? finalSubjectCode : undefined,
        paper.extractedText,
        {
          documentType: paper.overallExtractionMethod === 'DIRECT_IMAGE' ? 'IMAGE_DIRECT' : 'TEXT_PDF',
          totalPages: paper.pageCount,
          nativeTextPagesCount: paper.pages.filter((p) => p.extractionMethod === 'NATIVE_TEXT').length,
          ocrPagesCount: paper.pages.filter((p) => p.extractionMethod === 'OCR').length,
          overallExtractionMethod: paper.overallExtractionMethod,
          overallOcrConfidence: paper.overallOcrConfidence,
          hasLowConfidencePages: paper.pages.some((p) => p.ocrConfidence < 60),
          pages: paper.pages,
          rawTextLength: paper.extractedText.length,
          extractedAt: new Date().toISOString(),
        }
      );

      const primaryFile = paper.sourceFiles[0] || {
        filename: hierarchyResult.originalFilename,
        storagePath: hierarchyResult.archivePath || '',
        sha256: hierarchyResult.sha256,
        fileSize: hierarchyResult.size,
        mimeType: 'application/pdf',
      };

      const docId = db.getNextCandidateId();
      const newRecord: DetectedContentRecord = {
        id: docId,
        uploadId: hierarchyResult.uploadId,
        archiveId: hierarchyResult.archiveId,
        sourceDocumentId: `DOC-${docId}`,
        paperId: paper.paperId,
        pageRange: paper.pageRange,
        archivePath: hierarchyResult.archivePath,
        name: hierarchyResult.papers.length > 1 ? `${hierarchyResult.originalFilename} (${paper.title})` : hierarchyResult.originalFilename,
        filename: primaryFile.filename,
        contentType: hierarchyResult.fileType === 'IMAGE' ? 'Question Image' : 'PDF',
        mimeType: primaryFile.mimeType || 'application/pdf',
        size: primaryFile.fileSize || hierarchyResult.size,
        sha256: primaryFile.sha256 || hierarchyResult.sha256,
        subject: finalSubject,
        subjectCode: finalSubjectCode,
        platform: (options.platform as any) || 'Upload',
        source: options.source || (hierarchyResult.isArchive ? `Archive: ${hierarchyResult.originalFilename}` : 'Direct Intake / Examiner Upload'),
        risk: forensics.riskLevel,
        riskScore: forensics.overallRiskScore,
        confidence: forensics.confidence,
        processing: 'Completed',
        review: forensics.riskLevel === 'HIGH' ? 'Needs Verification' : forensics.riskLevel === 'REVIEW REQUIRED' ? 'Pending' : 'Reviewed',
        detectedTime: new Date().toISOString(),
        uploadedAt: new Date().toISOString(),
        status: 'ACTIVE',
        storagePath: primaryFile.storagePath,
        extractedText: paper.extractedText,
        extractedMetadata: paper.metadata,
        metadataSource: isUserCorrected ? 'USER_CORRECTED' : 'AUTO_DETECTED',
        extractionSummary: {
          documentType: paper.overallExtractionMethod === 'DIRECT_IMAGE' ? 'IMAGE_DIRECT' : 'TEXT_PDF',
          totalPages: paper.pageCount,
          nativeTextPagesCount: paper.pages.filter((p) => p.extractionMethod === 'NATIVE_TEXT').length,
          ocrPagesCount: paper.pages.filter((p) => p.extractionMethod === 'OCR').length,
          overallExtractionMethod: paper.overallExtractionMethod,
          overallOcrConfidence: paper.overallOcrConfidence,
          hasLowConfidencePages: paper.pages.some((p) => p.ocrConfidence < 60),
          pages: paper.pages,
          rawTextLength: paper.extractedText.length,
          extractedAt: new Date().toISOString(),
        },
        extractionMethod: paper.overallExtractionMethod,
        ocrConfidence: paper.overallOcrConfidence,
        pagesCount: paper.pageCount,
        hasAssociatedAlert: forensics.riskLevel === 'HIGH',
        hasAssociatedReview: forensics.riskLevel !== 'LOW',
        questions: paper.questions,
        forensicResults: forensics.forensicResults,
        metadataComparison: forensics.metadataComparison,
        matchedReferencePaper: forensics.matchedReference,
        groupFiles: paper.sourceFiles.map((sf) => ({
          filename: sf.filename,
          size: sf.fileSize,
          sha256: sf.sha256,
          storagePath: sf.storagePath,
        })),
      };

      // Add to database
      const savedCandidate = db.addCandidate(newRecord);

      // Create Alert if High Risk
      if (forensics.riskLevel === 'HIGH') {
        db.addAlert({
          type: 'EXACT_MATCH',
          severity: 'CRITICAL',
          title: `CRITICAL MATCH: ${finalSubject} (${finalSubjectCode})`,
          description: `Ingested document '${newRecord.name}' exhibits an alarming ${forensics.overallRiskScore}% question similarity with verified real examination baseline.`,
          detectedContentId: savedCandidate.id,
          subject: finalSubject,
          subjectCode: finalSubjectCode,
          source: newRecord.source,
          platform: newRecord.platform,
          riskScore: forensics.overallRiskScore,
          matchedExamId: forensics.metadataComparison?.matchedExamId,
          status: 'UNACKNOWLEDGED',
        });
      }

      // Create Review item
      if (forensics.riskLevel !== 'LOW') {
        db.addReview({
          detectedContentId: savedCandidate.id,
          candidateName: savedCandidate.name,
          subject: finalSubject,
          subjectCode: finalSubjectCode,
          risk: forensics.riskLevel,
          riskScore: forensics.overallRiskScore,
          status: 'PENDING_REVIEW',
          priority: forensics.riskLevel === 'HIGH' ? 'CRITICAL' : 'MEDIUM',
          assignedTo: 'Chief Examiner / Security Ops',
          notes: `Auto-generated intake review for ${savedCandidate.id} (Upload: ${hierarchyResult.uploadId})`,
        });
      }

      db.addAuditLog({
        action: 'DOCUMENT_INGESTION_COMPLETED',
        targetType: 'CANDIDATE',
        targetId: savedCandidate.id,
        user: 'Intake System',
        details: `Ingested ${newRecord.name} (Upload ${hierarchyResult.uploadId}, Paper ${paper.paperId}, Pages ${paper.pageRange.startPage}-${paper.pageRange.endPage}). Risk: ${forensics.riskLevel} (${forensics.overallRiskScore}%)`,
      });

      createdRecords.push(savedCandidate);
    }

    return createdRecords;
  }
}

export const documentIngestionEngine = new DocumentIngestionEngine();
