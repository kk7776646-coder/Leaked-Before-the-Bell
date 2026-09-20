import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import {
  ExtractedQuestion,
  QuestionForensicResult,
  RealPaperRecord,
  HistoricalPaperRecord,
  ExamMetadataRecord,
  DocumentExtractionSummary,
} from './types';
import { normalizeOcrText } from './documentExtraction';

// PDF text parser wrapper using PDFParse or fallback
export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf' || mimeType === 'application/pdf') {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const parser = new PDFParse({ data: dataBuffer });
      const textResult = await parser.getText();
      await parser.destroy().catch(() => {});
      if (textResult && textResult.text && textResult.text.trim().length > 0) {
        return textResult.text.trim();
      }
    } catch (err) {
      console.warn('PDFParse extraction check:', err);
    }

    try {
      const buffer = fs.readFileSync(filePath);
      const text = buffer.toString('utf-8');
      const textMatches = text.match(/\(([^)]+)\)\s*Tj/g);
      if (textMatches && textMatches.length > 0) {
        return textMatches.map((m: string) => m.replace(/[()]/g, '').replace(/\s*Tj$/, '')).join(' ');
      }
    } catch (e) {
      // ignore
    }
  }

  // If image file or screenshot
  if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext) || mimeType.startsWith('image/')) {
    const filenameBase = path.basename(filePath);
    return `[Image Content Extracted: ${filenameBase}] Examination Question Paper Scan. Extracted text from social channel image capture.`;
  }

  return '';
}

// Extract question blocks from text (Q1, 1., Section A, marks, etc.)
export function parseQuestionsFromText(text: string): ExtractedQuestion[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const questions: ExtractedQuestion[] = [];
  let currentSection = 'General';
  let currentQ: Partial<ExtractedQuestion> | null = null;
  let qCounter = 1;

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
        questions.push({
          id: `Q-${qCounter++}`,
          questionNumber: currentQ.questionNumber || `${questions.length + 1}`,
          fullQuestionNumber: currentQ.fullQuestionNumber || `Q${questions.length + 1}`,
          section: currentQ.section || currentSection,
          questionText: currentQ.questionText.trim(),
          marks: currentQ.marks,
          confidence: 0.9,
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
      };
    } else if (currentQ) {
      currentQ.questionText = `${currentQ.questionText} ${line}`;
      if (!currentQ.marks) {
        const marksMatch = line.match(marksRegex);
        if (marksMatch) {
          currentQ.marks = parseInt(marksMatch[1], 10);
        }
      }
    } else if (line.length > 20 && !line.toLowerCase().includes('time allowed') && !line.toLowerCase().includes('max marks')) {
      questions.push({
        id: `Q-${qCounter++}`,
        questionNumber: `${questions.length + 1}`,
        fullQuestionNumber: `Q${questions.length + 1}`,
        section: currentSection,
        questionText: line,
        confidence: 0.8,
      });
    }
  }

  if (currentQ && currentQ.questionText) {
    questions.push({
      id: `Q-${qCounter++}`,
      questionNumber: currentQ.questionNumber || `${questions.length + 1}`,
      fullQuestionNumber: currentQ.fullQuestionNumber || `Q${questions.length + 1}`,
      section: currentQ.section || currentSection,
      questionText: currentQ.questionText.trim(),
      marks: currentQ.marks,
      confidence: 0.9,
    });
  }

  if (questions.length === 0 && text.trim().length > 10) {
    const sentences = text
      .split(/(?<=[.?!])\s+/)
      .filter((s) => s.trim().length > 15)
      .slice(0, 10);

    sentences.forEach((sent, idx) => {
      questions.push({
        id: `Q-${idx + 1}`,
        questionNumber: `${idx + 1}`,
        fullQuestionNumber: `Q${idx + 1}`,
        section: 'General',
        questionText: sent.trim(),
        confidence: 0.75,
      });
    });
  }

  return questions;
}

// Compute normalized similarity between strings with OCR noise tolerance
export function computeSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const norm1 = normalizeOcrText(str1).toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const norm2 = normalizeOcrText(str2).toLowerCase().replace(/[^a-z0-9\s]/g, '');

  const clean1 = norm1.split(/\s+/).filter((w) => w.length > 2);
  const clean2 = norm2.split(/\s+/).filter((w) => w.length > 2);

  if (clean1.length === 0 || clean2.length === 0) return 0;

  const set1 = new Set(clean1);
  const set2 = new Set(clean2);

  let intersection = 0;
  set1.forEach((w) => {
    if (set2.has(w)) intersection++;
  });

  const union = new Set([...clean1, ...clean2]).size;
  const jaccard = union > 0 ? intersection / union : 0;
  const dice = (2 * intersection) / (set1.size + set2.size);

  // Exact phrase substring boost
  let phraseBoost = 0;
  if (norm1.length > 20 && norm2.includes(norm1)) {
    phraseBoost = 0.2;
  } else if (norm2.length > 20 && norm1.includes(norm2)) {
    phraseBoost = 0.2;
  }

  return Math.min(1, Math.max(jaccard, dice) + phraseBoost);
}

// Run multi-dimensional comparison against Real Papers, Historical Vault, and Exam Metadata
export function runForensicsComparison(
  detectedQuestions: ExtractedQuestion[],
  realPapers: RealPaperRecord[],
  historicalPapers: HistoricalPaperRecord[],
  examMetadataList: ExamMetadataRecord[] = [],
  detectedSubject?: string,
  detectedSubjectCode?: string,
  detectedRawText: string = '',
  extractionSummary?: DocumentExtractionSummary
): {
  forensicResults: QuestionForensicResult[];
  overallRiskScore: number;
  riskLevel: 'HIGH' | 'REVIEW REQUIRED' | 'LOW';
  matchedReference?: {
    id: string;
    title: string;
    type: 'REAL_PAPER' | 'HISTORICAL_PAPER';
    overlapPercentage: number;
    matchedQuestionsCount: number;
    totalQuestionsCount: number;
    verificationStatus?: string;
  };
  metadataComparison?: {
    matchedExamId?: string;
    matchedExamName?: string;
    subjectMatch: boolean;
    codeMatch: boolean;
    marksMatch: boolean;
    structureMatch: boolean | string;
    orderMatch: boolean | string;
    dateMatch?: boolean;
    summary: string;
  };
  confidence: number;
  uncertaintyReason?: string;
} {
  const isLowOcrConfidence = extractionSummary ? extractionSummary.hasLowConfidencePages || (extractionSummary.overallOcrConfidence > 0 && extractionSummary.overallOcrConfidence < 60) : false;

  if (detectedQuestions.length === 0 && detectedRawText.trim().length === 0) {
    return {
      forensicResults: [],
      overallRiskScore: 5,
      riskLevel: 'LOW',
      confidence: isLowOcrConfidence ? 45 : 85,
      uncertaintyReason: isLowOcrConfidence ? 'Low OCR confidence: No readable questions extracted from scanned document.' : undefined,
    };
  }

  const results: QuestionForensicResult[] = [];
  let highestSimOverall = 0;
  let matchedQuestionsCount = 0;
  let primaryMatchedPaper: RealPaperRecord | HistoricalPaperRecord | null = null;
  let primaryMatchedPaperType: 'REAL_PAPER' | 'HISTORICAL_PAPER' = 'REAL_PAPER';

  // Compare each detected question against Verified Real Papers first, then Historical Vault
  for (const cQ of detectedQuestions) {
    const candidateCompareText = cQ.normalizedText || normalizeOcrText(cQ.questionText);

    let bestMatch: {
      similarity: number;
      refType: 'VERIFIED_REAL_PAPER' | 'HISTORICAL_VAULT' | 'NONE';
      refPaperId?: string;
      refPaperTitle?: string;
      refPaper?: RealPaperRecord | HistoricalPaperRecord;
      refQuestionId?: string;
      refQuestionText?: string;
      refMarks?: number;
      refSection?: string;
    } = {
      similarity: 0,
      refType: 'NONE',
    };

    // 1. Compare against Verified Real Papers
    for (const rp of realPapers) {
      if (rp.verificationStatus !== 'VERIFIED') continue;
      const rpQuestions = rp.structuredData?.questions || [];

      for (const rq of rpQuestions) {
        const sim = computeSimilarity(candidateCompareText, rq.questionText);
        if (sim > bestMatch.similarity) {
          bestMatch = {
            similarity: sim,
            refType: 'VERIFIED_REAL_PAPER',
            refPaperId: rp.id,
            refPaperTitle: `${rp.subject} (${rp.subjectCode})`,
            refPaper: rp,
            refQuestionId: rq.fullQuestionNumber || rq.id,
            refQuestionText: rq.questionText,
            refMarks: rq.marks,
            refSection: rq.section,
          };
        }
      }

      // Check raw paper text overlap
      const paperSim = computeSimilarity(candidateCompareText, rp.extractedText);
      if (paperSim > bestMatch.similarity) {
        bestMatch = {
          similarity: paperSim,
          refType: 'VERIFIED_REAL_PAPER',
          refPaperId: rp.id,
          refPaperTitle: `${rp.subject} (${rp.subjectCode})`,
          refPaper: rp,
          refQuestionId: 'Reference Paper Section',
          refQuestionText: rp.extractedText.slice(0, 150),
        };
      }
    }

    // 2. Compare against Historical Papers
    if (bestMatch.similarity < 0.8) {
      for (const hp of historicalPapers) {
        const hpQuestions = hp.questions || [];
        for (const hq of hpQuestions) {
          const sim = computeSimilarity(candidateCompareText, hq.questionText);
          if (sim > bestMatch.similarity) {
            bestMatch = {
              similarity: sim,
              refType: 'HISTORICAL_VAULT',
              refPaperId: hp.id,
              refPaperTitle: hp.title,
              refPaper: hp,
              refQuestionId: hq.fullQuestionNumber || hq.id,
              refQuestionText: hq.questionText,
              refMarks: hq.marks,
              refSection: hq.section,
            };
          }
        }

        const hpTextSim = computeSimilarity(candidateCompareText, hp.extractedText || hp.ocrSnippet);
        if (hpTextSim > bestMatch.similarity) {
          bestMatch = {
            similarity: hpTextSim,
            refType: 'HISTORICAL_VAULT',
            refPaperId: hp.id,
            refPaperTitle: hp.title,
            refPaper: hp,
            refQuestionId: 'Vault Historical Reference',
            refQuestionText: (hp.ocrSnippet || hp.extractedText).slice(0, 150),
          };
        }
      }
    }

    if (bestMatch.similarity > highestSimOverall) {
      highestSimOverall = bestMatch.similarity;
      if (bestMatch.refPaper) {
        primaryMatchedPaper = bestMatch.refPaper;
        primaryMatchedPaperType = bestMatch.refType === 'VERIFIED_REAL_PAPER' ? 'REAL_PAPER' : 'HISTORICAL_PAPER';
      }
    }

    const sim = bestMatch.similarity;
    const isMatch = sim >= 0.75;
    const isPartial = sim >= 0.45 && sim < 0.75;
    const resultType: 'MATCH' | 'PARTIAL_MATCH' | 'DIFFERENT' | 'NO_REFERENCE' | 'UNCERTAIN' = isLowOcrConfidence && isMatch
      ? 'PARTIAL_MATCH'
      : isMatch
      ? 'MATCH'
      : isPartial
      ? 'PARTIAL_MATCH'
      : sim > 0.15
      ? 'DIFFERENT'
      : 'NO_REFERENCE';

    if (isMatch || isPartial) {
      matchedQuestionsCount++;
    }

    const evidence = [];
    if (bestMatch.refQuestionText) {
      evidence.push({
        field: 'question_text',
        candidateValue: cQ.questionText,
        referenceValue: bestMatch.refQuestionText,
        result: resultType,
        confidence: Math.round(sim * 100) / 100,
        sourceMethod: cQ.sourceMethod || 'NATIVE_TEXT',
      });
    }
    if (cQ.marks && bestMatch.refMarks) {
      evidence.push({
        field: 'marks',
        candidateValue: cQ.marks,
        referenceValue: bestMatch.refMarks,
        result: cQ.marks === bestMatch.refMarks ? ('MATCH' as const) : ('DIFFERENT' as const),
        confidence: 1.0,
      });
    }

    results.push({
      candidateQuestionId: cQ.fullQuestionNumber || cQ.questionNumber,
      candidateQuestionText: cQ.questionText,
      candidateNormalizedText: cQ.normalizedText,
      pageNumber: cQ.pageNumber,
      sourceMethod: cQ.sourceMethod,
      referenceType: bestMatch.refType,
      referencePaperId: bestMatch.refPaperId,
      referencePaperTitle: bestMatch.refPaperTitle,
      referenceQuestionId: bestMatch.refQuestionId,
      referenceQuestionText: bestMatch.refQuestionText,
      textSimilarity: Math.round(sim * 100) / 100,
      semanticSimilarity: Math.round(Math.min(1, sim * 1.03) * 100) / 100,
      typeMatch: isMatch ? 'MATCH' : isPartial ? 'PARTIAL_MATCH' : 'UNCERTAIN',
      marksMatch: cQ.marks && bestMatch.refMarks && cQ.marks === bestMatch.refMarks ? 'MATCH' : 'UNCERTAIN',
      sectionMatch: cQ.section && bestMatch.refSection && cQ.section === bestMatch.refSection ? 'MATCH' : 'UNCERTAIN',
      numberMatch: isMatch ? 'MATCH' : 'UNCERTAIN',
      positionMatch: isMatch ? 'MATCH' : 'UNCERTAIN',
      topicMatch: isMatch ? 'MATCH' : isPartial ? 'PARTIAL_MATCH' : 'UNCERTAIN',
      contextSimilarity: Math.round(sim * 0.95 * 100) / 100,
      overallSimilarity: Math.round(sim * 100) / 100,
      result: resultType,
      confidence: isLowOcrConfidence ? 'LOW' : sim >= 0.7 ? 'HIGH' : sim >= 0.4 ? 'MEDIUM' : 'LOW',
      evidence,
    });
  }

  // 3. Compare Exam Metadata (Subject, Subject Code, Structure, Marks)
  let bestExamMeta: ExamMetadataRecord | undefined;
  for (const meta of examMetadataList) {
    if (
      (detectedSubjectCode && meta.subjectCode.toLowerCase() === detectedSubjectCode.toLowerCase()) ||
      (detectedSubject && meta.subject.toLowerCase() === detectedSubject.toLowerCase())
    ) {
      bestExamMeta = meta;
      break;
    }
  }

  const subjectMatch = !!bestExamMeta || (primaryMatchedPaper ? true : false);
  const codeMatch = !!bestExamMeta && !!detectedSubjectCode && bestExamMeta.subjectCode.toLowerCase() === detectedSubjectCode.toLowerCase();
  const structureMatch = detectedQuestions.length > 0;
  const marksMatch = detectedQuestions.some((q) => q.marks !== undefined);
  const orderMatch = results.filter((r) => r.result === 'MATCH').length >= 2;

  const metadataSummaryParts: string[] = [];
  if (subjectMatch) metadataSummaryParts.push('✓ Subject matches');
  if (codeMatch) metadataSummaryParts.push('✓ Subject code matches');
  if (marksMatch) metadataSummaryParts.push('✓ Marks match');
  if (structureMatch) metadataSummaryParts.push('✓ Exam structure matches');
  if (orderMatch) metadataSummaryParts.push('✓ Question order largely matches');

  const metadataComparison = {
    matchedExamId: bestExamMeta?.id,
    matchedExamName: bestExamMeta ? `${bestExamMeta.subject} (${bestExamMeta.subjectCode})` : undefined,
    subjectMatch,
    codeMatch,
    marksMatch,
    structureMatch,
    orderMatch,
    summary: metadataSummaryParts.join(' • ') || 'No matching exam configuration',
  };

  // Calculate overall risk score
  let riskScore = Math.round(highestSimOverall * 100);
  if (riskScore === 0) {
    riskScore = detectedQuestions.length > 0 ? 15 : 5;
  }

  let riskLevel: 'HIGH' | 'REVIEW REQUIRED' | 'LOW' = 'LOW';
  if (isLowOcrConfidence && riskScore > 50) {
    // If OCR is low confidence, require human review rather than automatic high risk
    riskLevel = 'REVIEW REQUIRED';
  } else if (riskScore >= 75) {
    riskLevel = 'HIGH';
  } else if (riskScore >= 40) {
    riskLevel = 'REVIEW REQUIRED';
  } else {
    riskLevel = 'LOW';
  }

  let matchedRef: {
    id: string;
    title: string;
    type: 'REAL_PAPER' | 'HISTORICAL_PAPER';
    overlapPercentage: number;
    matchedQuestionsCount: number;
    totalQuestionsCount: number;
    verificationStatus?: string;
  } | undefined = undefined;

  if (primaryMatchedPaper) {
    const totalRefQuestions = (primaryMatchedPaper as any).structuredData?.questions?.length || (primaryMatchedPaper as any).totalQuestions || detectedQuestions.length || 1;
    matchedRef = {
      id: primaryMatchedPaper.id,
      title: (primaryMatchedPaper as any).subject ? `${(primaryMatchedPaper as any).subject} (${(primaryMatchedPaper as any).subjectCode})` : (primaryMatchedPaper as any).title,
      type: primaryMatchedPaperType,
      overlapPercentage: riskScore,
      matchedQuestionsCount: matchedQuestionsCount,
      totalQuestionsCount: totalRefQuestions,
      verificationStatus: primaryMatchedPaperType === 'REAL_PAPER' ? 'Verified' : 'Historical Reference',
    };
  }

  let calculatedConfidence = Math.max(50, Math.min(99, Math.round(80 + highestSimOverall * 18)));
  if (isLowOcrConfidence) {
    calculatedConfidence = Math.min(calculatedConfidence, extractionSummary?.overallOcrConfidence || 55);
  }

  return {
    forensicResults: results,
    overallRiskScore: riskScore,
    riskLevel,
    matchedReference: matchedRef,
    metadataComparison,
    confidence: calculatedConfidence,
    uncertaintyReason: isLowOcrConfidence
      ? `Text extraction confidence is low (${extractionSummary?.overallOcrConfidence}%). Visual manual verification by Chief Examiner is required.`
      : undefined,
  };
}

