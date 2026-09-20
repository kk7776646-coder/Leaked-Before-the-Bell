import { PageExtractionResult, LogicalPaperUnit, ExtractedQuestion } from './types';
import { extractMetadataFromContent } from './metadataExtractor';
import { parseQuestionsFromPageText } from './documentExtraction';
import { ExtractedDocumentEntry } from './recursiveZipExtractor';

interface PageBoundaryFeature {
  pageNumber: number;
  subjectCode?: string;
  subject?: string;
  hasHeaderBlock: boolean;
  hasQuestion1Reset: boolean;
  hasPage1Reset: boolean;
  maxMarks?: number;
  extractedText: string;
}

/**
 * Analyzes extracted pages of a single PDF to identify if it contains multiple bundled question papers.
 */
export function detectPaperBoundariesInPdf(
  pages: PageExtractionResult[],
  sourceFilename: string,
  sourceStoragePath: string,
  sourceSha256: string,
  sourceFileSize: number
): LogicalPaperUnit[] {
  if (pages.length === 0) {
    return [];
  }

  // If only 1-3 pages and no strong indicator of separate papers, treat as single paper
  if (pages.length <= 2) {
    return [createSingleLogicalPaper(pages, 1, 'PAPER-01', sourceFilename, [{
      filename: sourceFilename,
      originalPath: sourceFilename,
      sha256: sourceSha256,
      storagePath: sourceStoragePath,
      fileSize: sourceFileSize,
      mimeType: 'application/pdf',
    }], 'HIGH', 'Single document paper unit')];
  }

  // Extract features for each page
  const pageFeatures: PageBoundaryFeature[] = pages.map((p) => {
    const headerSnippet = p.text.slice(0, 800);
    const codeMatch = headerSnippet.match(/\b([A-Z]{2,5})\s*[-_]?\s*([0-9]{3,4}[A-Z]?)\b/i);
    const hasHeaderBlock = /(?:Examination|University|Institute|College|Department|Max\s*Marks|Duration)/i.test(headerSnippet);
    const hasQuestion1Reset = /^(?:Q(?:uestion)?\.?\s*1[.:)]|SECTION\s+[A-Z0-9IVX]+\s*[-:\n]+\s*Q(?:uestion)?\.?\s*1[.:)])/im.test(headerSnippet);
    const hasPage1Reset = /(?:Page\s*1\s*of\s*[0-9]+|Page\s*1\s*\/\s*[0-9]+)/i.test(headerSnippet);
    const marksMatch = headerSnippet.match(/(?:Max(?:imum)?\s*Marks?|M\.M\.)\s*[:=-]?\s*([0-9]{2,3})/i);

    return {
      pageNumber: p.pageNumber,
      subjectCode: codeMatch ? `${codeMatch[1].toUpperCase()}${codeMatch[2].toUpperCase()}`.replace(/[\s_-]/g, '') : undefined,
      hasHeaderBlock,
      hasQuestion1Reset,
      hasPage1Reset,
      maxMarks: marksMatch ? parseInt(marksMatch[1], 10) : undefined,
      extractedText: p.text,
    };
  });

  // Find partition cut points
  const boundaryIndices: number[] = [0]; // Starting page index of each paper
  let uncertainBoundary = false;

  for (let i = 1; i < pageFeatures.length; i++) {
    const curr = pageFeatures[i];
    const prev = pageFeatures[i - 1];

    let boundaryScore = 0;
    let reason = '';

    // Strong indicator 1: Subject Code Change
    if (curr.subjectCode && prev.subjectCode && curr.subjectCode !== prev.subjectCode) {
      boundaryScore += 4;
      reason += `Subject code changed from ${prev.subjectCode} to ${curr.subjectCode}; `;
    }

    // Strong indicator 2: Page 1 Reset
    if (curr.hasPage1Reset) {
      boundaryScore += 3;
      reason += 'Page number explicitly reset to Page 1; ';
    }

    // Strong indicator 3: Header block + Q1 reset
    if (curr.hasHeaderBlock && curr.hasQuestion1Reset) {
      boundaryScore += 3;
      reason += 'New exam header and Section/Question 1 restarted; ';
    }

    // Medium indicator: Question 1 reset after high question numbers on previous page
    if (curr.hasQuestion1Reset && !prev.hasQuestion1Reset) {
      const prevHasLateQ = /Q(?:uestion)?\.?\s*[4-9][.:)]/i.test(prev.extractedText);
      if (prevHasLateQ) {
        boundaryScore += 2;
        reason += 'Question numbering reset to Q1 after late questions on previous page; ';
      }
    }

    if (boundaryScore >= 3) {
      boundaryIndices.push(i);
    } else if (boundaryScore === 2) {
      // Possible boundary with low confidence
      boundaryIndices.push(i);
      uncertainBoundary = true;
    }
  }

  // If no split points found, return as single paper
  if (boundaryIndices.length === 1) {
    return [createSingleLogicalPaper(pages, 1, 'PAPER-01', sourceFilename, [{
      filename: sourceFilename,
      originalPath: sourceFilename,
      sha256: sourceSha256,
      storagePath: sourceStoragePath,
      fileSize: sourceFileSize,
      mimeType: 'application/pdf',
    }], 'HIGH', 'Single continuous question paper')];
  }

  // Build partitioned logical papers
  const papers: LogicalPaperUnit[] = [];
  for (let b = 0; b < boundaryIndices.length; b++) {
    const startIndex = boundaryIndices[b];
    const endIndex = b < boundaryIndices.length - 1 ? boundaryIndices[b + 1] : pages.length;
    const paperPages = pages.slice(startIndex, endIndex);
    const paperId = `PAPER-0${b + 1}`;
    const groupingConfidence = uncertainBoundary ? 'UNCERTAIN' : 'HIGH';
    const reason = `Pages ${paperPages[0].pageNumber}-${paperPages[paperPages.length - 1].pageNumber} grouped as logical paper boundary (${paperPages.length} pages)`;

    papers.push(createSingleLogicalPaper(
      paperPages,
      b + 1,
      paperId,
      `${sourceFilename} (Part ${b + 1})`,
      [{
        filename: sourceFilename,
        originalPath: sourceFilename,
        sha256: sourceSha256,
        storagePath: sourceStoragePath,
        fileSize: sourceFileSize,
        mimeType: 'application/pdf',
      }],
      groupingConfidence,
      reason
    ));
  }

  return papers;
}

/**
 * Groups a collection of image files from a ZIP or folder into logical papers.
 */
export function groupImageEntriesIntoPapers(
  images: {
    entry: ExtractedDocumentEntry;
    pageResult: PageExtractionResult;
  }[]
): LogicalPaperUnit[] {
  if (images.length === 0) return [];

  // Group by folder category first (e.g. Subfolder1/ vs Subfolder2/)
  const folderGroups = new Map<string, typeof images>();
  for (const item of images) {
    const folder = item.entry.folderCategory || 'ROOT';
    if (!folderGroups.has(folder)) {
      folderGroups.set(folder, []);
    }
    folderGroups.get(folder)!.push(item);
  }

  const papers: LogicalPaperUnit[] = [];
  let paperIndex = 1;

  for (const [folderName, items] of folderGroups.entries()) {
    // Sort items by sortOrder and filename
    items.sort((a, b) => a.entry.sortOrder - b.entry.sortOrder);

    // If items in folder look like sequence of pages (page1.jpg, page2.jpg) or share subject
    const combinedPages: PageExtractionResult[] = items.map((item, idx) => ({
      ...item.pageResult,
      pageNumber: idx + 1,
    }));

    const sourceFiles = items.map((it) => ({
      filename: it.entry.originalFilename,
      originalPath: it.entry.archiveRelativePath,
      sha256: it.entry.sha256,
      storagePath: it.entry.storagePath,
      fileSize: it.entry.fileSize,
      mimeType: it.entry.mimeType,
    }));

    const paperId = `PAPER-0${paperIndex++}`;
    const title = folderName === 'ROOT' ? `Ingested Exam Paper (${items.length} Images)` : `${folderName} Exam Paper`;

    // Check consistency of metadata across the images
    const firstPageText = combinedPages[0]?.text || '';
    const fullText = combinedPages.map((p) => p.text).join('\n\n');
    const metadata = extractMetadataFromContent(fullText, items[0].entry.originalFilename, {
      firstPageText,
      folderPath: folderName,
    });

    const questions: ExtractedQuestion[] = [];
    combinedPages.forEach((p) => {
      const pageQuestions = parseQuestionsFromPageText(p.text, p.pageNumber);
      questions.push(...pageQuestions);
    });

    const groupingConfidence = items.length > 1 ? 'HIGH' : 'HIGH';
    const overallOcr = Math.round(combinedPages.reduce((acc, p) => acc + p.ocrConfidence, 0) / (combinedPages.length || 1));

    papers.push({
      paperId,
      title,
      subject: metadata.subject.value,
      subjectCode: metadata.subjectCode.value,
      pageRange: { startPage: 1, endPage: combinedPages.length },
      pageCount: combinedPages.length,
      pages: combinedPages,
      questions,
      extractedText: fullText,
      metadata,
      groupingConfidence,
      groupingReason: `Sequential images (${items.length} page scans) grouped under ${folderName}`,
      sourceFiles,
      overallExtractionMethod: 'DIRECT_IMAGE',
      overallOcrConfidence: overallOcr,
    });
  }

  return papers;
}

function createSingleLogicalPaper(
  pages: PageExtractionResult[],
  index: number,
  paperId: string,
  title: string,
  sourceFiles: LogicalPaperUnit['sourceFiles'],
  groupingConfidence: 'HIGH' | 'MEDIUM' | 'UNCERTAIN',
  groupingReason: string
): LogicalPaperUnit {
  const fullText = pages.map((p) => p.text).join('\n\n');
  const firstPageText = pages[0]?.text || '';
  const metadata = extractMetadataFromContent(fullText, sourceFiles[0]?.filename || '', {
    firstPageText,
  });

  const questions: ExtractedQuestion[] = [];
  pages.forEach((p) => {
    const pageQuestions = parseQuestionsFromPageText(p.text, p.pageNumber);
    questions.push(...pageQuestions);
  });

  const nativeCount = pages.filter((p) => p.extractionMethod === 'NATIVE_TEXT').length;
  const ocrCount = pages.filter((p) => p.extractionMethod === 'OCR').length;
  let overallExtractionMethod: 'NATIVE_TEXT' | 'OCR' | 'MIXED' | 'DIRECT_IMAGE' = 'NATIVE_TEXT';
  if (nativeCount > 0 && ocrCount > 0) overallExtractionMethod = 'MIXED';
  else if (ocrCount > 0) overallExtractionMethod = 'OCR';

  const overallOcrConfidence = Math.round(
    pages.reduce((acc, p) => acc + p.ocrConfidence, 0) / (pages.length || 1)
  );

  return {
    paperId,
    title: metadata.subject.value !== 'Not detected' ? `${metadata.subject.value} (${metadata.subjectCode.value !== 'Not detected' ? metadata.subjectCode.value : 'Exam'})` : title,
    subject: metadata.subject.value,
    subjectCode: metadata.subjectCode.value,
    pageRange: {
      startPage: pages[0]?.pageNumber || 1,
      endPage: pages[pages.length - 1]?.pageNumber || 1,
    },
    pageCount: pages.length,
    pages,
    questions,
    extractedText: fullText,
    metadata,
    groupingConfidence,
    groupingReason,
    sourceFiles,
    overallExtractionMethod,
    overallOcrConfidence,
  };
}
