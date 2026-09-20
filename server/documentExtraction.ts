import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PDFDocument } from 'pdf-lib';
import { createWorker } from 'tesseract.js';
import { DIRS } from './storage';
import {
  ExtractedQuestion,
  PageExtractionResult,
  DocumentExtractionSummary,
} from './types';

const execAsync = promisify(exec);

// Cache worker for fast incremental processing
let tesseractWorkerPromise: Promise<any> | null = null;

async function getTesseractWorker() {
  if (!tesseractWorkerPromise) {
    tesseractWorkerPromise = (async () => {
      const worker = await createWorker('eng');
      return worker;
    })();
  }
  return tesseractWorkerPromise;
}

// Common OCR Noise normalization dictionary & rules
export function normalizeOcrText(rawText: string): string {
  if (!rawText) return '';
  let text = rawText;

  // Specific high-frequency technical exam terms corrupted by OCR
  const termReplacements: [RegExp, string][] = [
    [/\bnorma1ization\b/gi, 'normalization'],
    [/\bnormalizat1on\b/gi, 'normalization'],
    [/\bquestlon\b/gi, 'question'],
    [/\bquestlons\b/gi, 'questions'],
    [/\bDBM5\b/gi, 'DBMS'],
    [/\b0CR\b/g, 'OCR'],
    [/\balgor1thm\b/gi, 'algorithm'],
    [/\balgor1thms\b/gi, 'algorithms'],
    [/\brelat1on\b/gi, 'relation'],
    [/\brelat1onal\b/gi, 'relational'],
    [/\bmach1ne\b/gi, 'machine'],
    [/\barch1tecture\b/gi, 'architecture'],
    [/\bc1ass\b/gi, 'class'],
    [/\bc1asses\b/gi, 'classes'],
    [/\bfunct1on\b/gi, 'function'],
    [/\bfunct1ons\b/gi, 'functions'],
    [/\btransact1on\b/gi, 'transaction'],
    [/\bdef1ne\b/gi, 'define'],
    [/\bexpla1n\b/gi, 'explain'],
    [/\bd1scuss\b/gi, 'discuss'],
    [/\bd1fference\b/gi, 'difference'],
    [/\bappl1cat1on\b/gi, 'application'],
    [/\benglneerlng\b/gi, 'engineering'],
    [/\bcomputat1on\b/gi, 'computation'],
  ];

  for (const [pattern, replacement] of termReplacements) {
    text = text.replace(pattern, replacement);
  }

  // Generalized regex: single '1' surrounded by letters (e.g. "l1ke" -> "like", "wr1te" -> "write")
  text = text.replace(/([a-zA-Z])1([a-zA-Z])/g, '$1i$2');
  // Generalized regex: single '0' surrounded by letters (e.g. "l0op" -> "loop")
  text = text.replace(/([a-zA-Z])0([a-zA-Z])/g, '$1o$2');
  // Generalized regex: single '5' surrounded by letters (e.g. "sy5tem" -> "system")
  text = text.replace(/([a-zA-Z])5([a-zA-Z])/g, '$1s$2');

  return text;
}

// Render a single PDF page to PNG using Ghostscript
export async function renderPdfPageToImage(
  pdfPath: string,
  pageNumber: number
): Promise<string> {
  if (!fs.existsSync(DIRS.renderedPages)) {
    fs.mkdirSync(DIRS.renderedPages, { recursive: true });
  }

  const uniqueId = `${path.basename(pdfPath, path.extname(pdfPath))}-p${pageNumber}-${Date.now()}`;
  const outImagePath = path.join(DIRS.renderedPages, `${uniqueId}.png`);

  try {
    // 200 DPI gives clean OCR balance without RAM strain
    const cmd = `gs -sDEVICE=png16m -dFirstPage=${pageNumber} -dLastPage=${pageNumber} -r200 -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -o "${outImagePath}" "${pdfPath}" -q`;
    await execAsync(cmd);
    if (fs.existsSync(outImagePath)) {
      return outImagePath;
    }
  } catch (err) {
    console.warn(`Ghostscript rendering failed for page ${pageNumber}:`, err);
  }

  return '';
}

// Perform OCR on an image file using Tesseract.js
export async function performOcrOnImage(imagePath: string): Promise<{
  text: string;
  confidence: number;
  status: 'COMPLETED' | 'FAILED' | 'UNCERTAIN';
  uncertainReason?: string;
}> {
  if (!fs.existsSync(imagePath)) {
    return {
      text: '',
      confidence: 0,
      status: 'FAILED',
      uncertainReason: 'Rendered image file was not found.',
    };
  }

  try {
    const worker = await getTesseractWorker();
    const ret = await worker.recognize(imagePath);
    const rawText = ret.data.text ? ret.data.text.trim() : '';
    const rawConfidence = typeof ret.data.confidence === 'number' ? ret.data.confidence : 0;
    const roundedConfidence = Math.round(rawConfidence);

    if (!rawText || rawText.length === 0) {
      return {
        text: '',
        confidence: 0,
        status: 'FAILED',
        uncertainReason: 'No readable text or characters detected by OCR engine.',
      };
    }

    if (roundedConfidence < 50 || rawText.length < 15) {
      return {
        text: rawText,
        confidence: roundedConfidence,
        status: 'UNCERTAIN',
        uncertainReason: `OCR confidence is low (${roundedConfidence}%). Document image may be blurry, low-resolution, or cropped.`,
      };
    }

    return {
      text: rawText,
      confidence: roundedConfidence,
      status: 'COMPLETED',
    };
  } catch (err: any) {
    console.error('OCR processing error:', err);
    return {
      text: '',
      confidence: 0,
      status: 'FAILED',
      uncertainReason: `OCR execution error: ${err?.message || 'Unknown error'}`,
    };
  }
}

// Extract native text per page from PDF using pdf-parse or buffer extraction
async function extractNativePdfPageTexts(pdfBuffer: Buffer, totalPages: number): Promise<string[]> {
  const pageTexts: string[] = [];

  try {
    const pdfParse = require('pdf-parse');
    let currentPageIndex = 0;
    const tempPages: string[] = [];

    const options = {
      pagerender: (pageData: any) => {
        return pageData.getTextContent().then((textContent: any) => {
          let lastY: any = null;
          let text = '';
          for (const item of textContent.items) {
            if (lastY === item.transform[5] || lastY === null) {
              text += item.str;
            } else {
              text += '\n' + item.str;
            }
            lastY = item.transform[5];
          }
          tempPages.push(text.trim());
          return text;
        });
      },
    };

    await pdfParse(pdfBuffer, options);
    if (tempPages.length > 0) {
      return tempPages;
    }
  } catch (err) {
    console.warn('pdf-parse page-level extraction fallback:', err);
  }

  // Fallback: whole buffer extraction
  try {
    const pdfParse = require('pdf-parse');
    const fullData = await pdfParse(pdfBuffer);
    const fullText = fullData.text ? fullData.text.trim() : '';
    if (fullText) {
      const splitByFormFeed = fullText.split(/\f/);
      if (splitByFormFeed.length >= totalPages) {
        return splitByFormFeed.map((t) => t.trim());
      }
      return [fullText];
    }
  } catch (e) {
    // ignore
  }

  return pageTexts;
}

// Inspect if native text on a page is meaningful and sufficient
function isMeaningfulNativeText(text: string): boolean {
  if (!text) return false;
  const clean = text.trim();
  if (clean.length < 35) return false;

  // Check word density: at least 5 meaningful words with alphabetic characters
  const words = clean.split(/\s+/).filter((w) => /[a-zA-Z]{3,}/.test(w));
  return words.length >= 6;
}

// Structured question parsing from text with page tracking
export function parseQuestionsFromPageText(
  text: string,
  pageNumber: number,
  sourceMethod: 'NATIVE_TEXT' | 'OCR',
  existingQuestionsCount: number = 0
): ExtractedQuestion[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const questions: ExtractedQuestion[] = [];
  let currentSection = 'General';
  let currentQ: Partial<ExtractedQuestion> | null = null;
  let qCounter = existingQuestionsCount + 1;

  const sectionRegex = /^(?:SECTION|PART)\s+([A-Z0-9IVX]+)/i;
  const qNumRegex = /^(?:Question|Q\.?|Q)?\s*([0-9]+|[0-9]+\([a-z]\)|\([a-z]\))\s*[:.)-]\s*(.*)$/i;
  const marksRegex = /\[?\s*([0-9]+)\s*(?:Marks?|Pts?|M)\s*\]?/i;

  for (const line of lines) {
    const secMatch = line.match(sectionRegex);
    if (secMatch) {
      currentSection = `Section ${secMatch[1]}`;
      continue;
    }

    const qMatch = line.match(qNumRegex);
    if (qMatch) {
      if (currentQ && currentQ.questionText) {
        const rawQText = currentQ.questionText.trim();
        questions.push({
          id: `Q-${qCounter++}`,
          questionNumber: currentQ.questionNumber || 'UNKNOWN',
          fullQuestionNumber: currentQ.fullQuestionNumber || `Q${questions.length + 1}`,
          section: currentQ.section || currentSection,
          questionText: rawQText,
          normalizedText: normalizeOcrText(rawQText),
          marks: currentQ.marks,
          confidence: currentQ.confidence || (sourceMethod === 'NATIVE_TEXT' ? 1.0 : 0.88),
          pageNumber,
          sourceMethod,
        });
      }

      const qNumberStr = qMatch[1];
      const initialText = qMatch[2] || '';
      const marksMatch = line.match(marksRegex);

      currentQ = {
        questionNumber: qNumberStr,
        fullQuestionNumber: qNumberStr.startsWith('Q') ? qNumberStr : `Q${qNumberStr}`,
        section: currentSection,
        questionText: initialText,
        marks: marksMatch ? parseInt(marksMatch[1], 10) : undefined,
        confidence: sourceMethod === 'NATIVE_TEXT' ? 1.0 : 0.88,
      };
    } else if (currentQ) {
      currentQ.questionText = `${currentQ.questionText} ${line}`;
      if (!currentQ.marks) {
        const marksMatch = line.match(marksRegex);
        if (marksMatch) {
          currentQ.marks = parseInt(marksMatch[1], 10);
        }
      }
    } else if (
      line.length > 20 &&
      !line.toLowerCase().includes('time allowed') &&
      !line.toLowerCase().includes('max marks') &&
      !line.toLowerCase().includes('roll no')
    ) {
      // Free-form question line without explicit question number
      const marksMatch = line.match(marksRegex);
      const rawQText = line.trim();
      questions.push({
        id: `Q-${qCounter++}`,
        questionNumber: 'UNKNOWN',
        fullQuestionNumber: `Q${questions.length + 1}`,
        section: currentSection,
        questionText: rawQText,
        normalizedText: normalizeOcrText(rawQText),
        marks: marksMatch ? parseInt(marksMatch[1], 10) : undefined,
        confidence: sourceMethod === 'NATIVE_TEXT' ? 0.9 : 0.8,
        pageNumber,
        sourceMethod,
      });
    }
  }

  if (currentQ && currentQ.questionText) {
    const rawQText = currentQ.questionText.trim();
    questions.push({
      id: `Q-${qCounter++}`,
      questionNumber: currentQ.questionNumber || 'UNKNOWN',
      fullQuestionNumber: currentQ.fullQuestionNumber || `Q${questions.length + 1}`,
      section: currentQ.section || currentSection,
      questionText: rawQText,
      normalizedText: normalizeOcrText(rawQText),
      marks: currentQ.marks,
      confidence: currentQ.confidence || (sourceMethod === 'NATIVE_TEXT' ? 1.0 : 0.88),
      pageNumber,
      sourceMethod,
    });
  }

  // Fallback: If no structured regex matched, extract sentence chunks
  if (questions.length === 0 && text.trim().length > 25) {
    const sentences = text
      .split(/(?<=[.?!])\s+/)
      .filter((s) => s.trim().length > 20)
      .slice(0, 10);

    sentences.forEach((sent) => {
      const rawQText = sent.trim();
      questions.push({
        id: `Q-${qCounter++}`,
        questionNumber: 'UNKNOWN',
        fullQuestionNumber: `Q${questions.length + 1}`,
        section: 'General',
        questionText: rawQText,
        normalizedText: normalizeOcrText(rawQText),
        confidence: sourceMethod === 'NATIVE_TEXT' ? 0.85 : 0.75,
        pageNumber,
        sourceMethod,
      });
    });
  }

  return questions;
}

// Master Document Extraction Function
export async function extractDocumentContent(
  filePath: string,
  mimeType: string,
  originalFilename: string
): Promise<{
  extractedText: string;
  questions: ExtractedQuestion[];
  summary: DocumentExtractionSummary;
  overallExtractionMethod: 'NATIVE_TEXT' | 'OCR' | 'MIXED' | 'DIRECT_IMAGE';
  overallOcrConfidence: number;
  uncertaintyReason?: string;
  processingStatus: 'Completed' | 'Failed';
}> {
  const ext = path.extname(originalFilename || filePath).toLowerCase();
  const isPdf = ext === '.pdf' || mimeType === 'application/pdf';
  const isImage = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) || mimeType.startsWith('image/');

  const pages: PageExtractionResult[] = [];
  const allQuestions: ExtractedQuestion[] = [];
  const combinedTextParts: string[] = [];

  if (isPdf) {
    let totalPages = 1;
    let pdfDoc: PDFDocument | null = null;
    let pdfBuffer: Buffer;

    try {
      pdfBuffer = fs.readFileSync(filePath);
      pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      totalPages = pdfDoc.getPageCount() || 1;
    } catch (err) {
      console.warn('PDFDocument count read failed:', err);
      pdfBuffer = fs.readFileSync(filePath);
    }

    // Try extracting native text page by page
    const nativePageTexts = await extractNativePdfPageTexts(pdfBuffer, totalPages);

    let nativePagesCount = 0;
    let ocrPagesCount = 0;
    let totalOcrConfidenceSum = 0;
    let hasLowConfidence = false;
    let uncertaintyReasons: string[] = [];

    // Inspect each page independently
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const rawNative = nativePageTexts[pageNum - 1] || '';
      const hasMeaningfulNative = isMeaningfulNativeText(rawNative);

      let pageDimensions: { width: number; height: number } | undefined;
      if (pdfDoc && pageNum <= pdfDoc.getPageCount()) {
        try {
          const p = pdfDoc.getPage(pageNum - 1);
          pageDimensions = { width: Math.round(p.getWidth()), height: Math.round(p.getHeight()) };
        } catch (e) {
          // ignore
        }
      }

      if (hasMeaningfulNative) {
        // Page has clean native text!
        nativePagesCount++;
        const pageText = rawNative.trim();
        pages.push({
          pageNumber: pageNum,
          extractionMethod: 'NATIVE_TEXT',
          text: pageText,
          ocrConfidence: 100,
          processingStatus: 'COMPLETED',
          nativeTextLength: pageText.length,
          dimensions: pageDimensions,
        });

        combinedTextParts.push(`--- Page ${pageNum} [Native Text] ---\n${pageText}`);

        // Parse questions from this page
        const pageQuestions = parseQuestionsFromPageText(
          pageText,
          pageNum,
          'NATIVE_TEXT',
          allQuestions.length
        );
        allQuestions.push(...pageQuestions);
      } else {
        // Scanned image or screenshot page! Render and OCR
        ocrPagesCount++;
        const renderedImagePath = await renderPdfPageToImage(filePath, pageNum);

        if (!renderedImagePath) {
          // Fallback if render failed
          pages.push({
            pageNumber: pageNum,
            extractionMethod: 'OCR',
            text: '',
            ocrConfidence: 0,
            processingStatus: 'FAILED',
            nativeTextLength: 0,
            uncertainReason: 'Failed to render PDF page image for OCR extraction.',
            dimensions: pageDimensions,
          });
          hasLowConfidence = true;
          uncertaintyReasons.push(`Page ${pageNum}: rendering failure.`);
          continue;
        }

        // Run OCR on rendered page
        const ocrResult = await performOcrOnImage(renderedImagePath);
        totalOcrConfidenceSum += ocrResult.confidence;

        if (ocrResult.status === 'UNCERTAIN' || ocrResult.confidence < 60) {
          hasLowConfidence = true;
          if (ocrResult.uncertainReason) {
            uncertaintyReasons.push(`Page ${pageNum}: ${ocrResult.uncertainReason}`);
          }
        }

        pages.push({
          pageNumber: pageNum,
          extractionMethod: 'OCR',
          text: ocrResult.text,
          ocrConfidence: ocrResult.confidence,
          processingStatus: ocrResult.status,
          nativeTextLength: rawNative.length,
          renderedImagePath,
          uncertainReason: ocrResult.uncertainReason,
          dimensions: pageDimensions,
        });

        if (ocrResult.text) {
          combinedTextParts.push(`--- Page ${pageNum} [OCR · ${ocrResult.confidence}%] ---\n${ocrResult.text}`);
          const pageQuestions = parseQuestionsFromPageText(
            ocrResult.text,
            pageNum,
            'OCR',
            allQuestions.length
          );
          allQuestions.push(...pageQuestions);
        }
      }
    }

    // Determine overall classification
    let overallMethod: 'NATIVE_TEXT' | 'OCR' | 'MIXED' = 'NATIVE_TEXT';
    let docType: DocumentExtractionSummary['documentType'] = 'TEXT_PDF';

    if (ocrPagesCount === 0) {
      overallMethod = 'NATIVE_TEXT';
      docType = 'TEXT_PDF';
    } else if (nativePagesCount === 0) {
      overallMethod = 'OCR';
      docType = 'IMAGE_SCANNED_PDF';
    } else {
      overallMethod = 'MIXED';
      docType = 'MIXED_PDF';
    }

    const avgOcrConf = ocrPagesCount > 0 ? Math.round(totalOcrConfidenceSum / ocrPagesCount) : 100;
    const fullCombinedText = combinedTextParts.join('\n\n').trim();

    const summary: DocumentExtractionSummary = {
      documentType: docType,
      totalPages,
      nativeTextPagesCount: nativePagesCount,
      ocrPagesCount: ocrPagesCount,
      overallExtractionMethod: overallMethod,
      overallOcrConfidence: avgOcrConf,
      hasLowConfidencePages: hasLowConfidence,
      pages,
      rawTextLength: fullCombinedText.length,
      extractedAt: new Date().toISOString(),
    };

    const isTotalFailure = fullCombinedText.length === 0 && allQuestions.length === 0;

    return {
      extractedText: fullCombinedText,
      questions: allQuestions,
      summary,
      overallExtractionMethod: overallMethod,
      overallOcrConfidence: avgOcrConf,
      uncertaintyReason: hasLowConfidence ? uncertaintyReasons.join(' ') : undefined,
      processingStatus: isTotalFailure ? 'Failed' : 'Completed',
    };
  }

  // Direct Image Document (PNG, JPG, JPEG, WEBP)
  if (isImage) {
    const ocrResult = await performOcrOnImage(filePath);
    const questions = parseQuestionsFromPageText(ocrResult.text, 1, 'OCR', 0);

    const pageResult: PageExtractionResult = {
      pageNumber: 1,
      extractionMethod: 'OCR',
      text: ocrResult.text,
      ocrConfidence: ocrResult.confidence,
      processingStatus: ocrResult.status,
      nativeTextLength: 0,
      renderedImagePath: filePath,
      uncertainReason: ocrResult.uncertainReason,
    };

    const summary: DocumentExtractionSummary = {
      documentType: 'IMAGE_DIRECT',
      totalPages: 1,
      nativeTextPagesCount: 0,
      ocrPagesCount: 1,
      overallExtractionMethod: 'DIRECT_IMAGE',
      overallOcrConfidence: ocrResult.confidence,
      hasLowConfidencePages: ocrResult.status === 'UNCERTAIN' || ocrResult.confidence < 60,
      pages: [pageResult],
      rawTextLength: ocrResult.text.length,
      extractedAt: new Date().toISOString(),
    };

    const isFailure = !ocrResult.text || ocrResult.status === 'FAILED';

    return {
      extractedText: ocrResult.text,
      questions,
      summary,
      overallExtractionMethod: 'DIRECT_IMAGE',
      overallOcrConfidence: ocrResult.confidence,
      uncertaintyReason: ocrResult.uncertainReason,
      processingStatus: isFailure ? 'Failed' : 'Completed',
    };
  }

  // Unsupported or other files
  const emptySummary: DocumentExtractionSummary = {
    documentType: 'UNKNOWN',
    totalPages: 1,
    nativeTextPagesCount: 0,
    ocrPagesCount: 0,
    overallExtractionMethod: 'NATIVE_TEXT',
    overallOcrConfidence: 0,
    hasLowConfidencePages: false,
    pages: [],
    rawTextLength: 0,
    extractedAt: new Date().toISOString(),
  };

  return {
    extractedText: '',
    questions: [],
    summary: emptySummary,
    overallExtractionMethod: 'NATIVE_TEXT',
    overallOcrConfidence: 0,
    uncertaintyReason: 'Unsupported document format.',
    processingStatus: 'Failed',
  };
}
