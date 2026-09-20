import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { DIRS, computeFileSha256 } from './storage';
import { db } from './db';
import {
  CandidateRecord,
  HistoricalPaperRecord,
  RealPaperRecord,
  AlertRecord,
  ReviewItemRecord,
  TestDatasetSummary,
} from './types';
import { extractDocumentContent } from './documentExtraction';
import { runForensicsComparison } from './forensics';

export function isTestDataAllowed(): boolean {
  if (process.env.APP_ENV === 'production' && process.env.ENABLE_TEST_DATA === 'false') {
    return false;
  }
  return true;
}

/**
 * 1. Generate a real physical Trial Historical Paper PDF and index it into the vault.
 */
export async function generateTrialHistoricalPaperFixture(options?: {
  subject?: string;
  subjectCode?: string;
  year?: number;
}): Promise<HistoricalPaperRecord> {
  const subject = options?.subject || 'Compiler Design';
  const subjectCode = options?.subjectCode || 'CS-801';
  const year = options?.year || 2026;

  const pdfDoc = await PDFDocument.create();
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const primaryColor = rgb(0.08, 0.18, 0.36);
  const textColor = rgb(0.12, 0.14, 0.18);
  const mutedColor = rgb(0.38, 0.42, 0.48);
  const ruleColor = rgb(0.8, 0.83, 0.88);

  // --- PAGE 1 ---
  const page1 = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page1.getSize();

  // Border & Header
  page1.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: height - 56,
    borderWidth: 1.2,
    borderColor: ruleColor,
  });

  page1.drawRectangle({
    x: 36,
    y: height - 120,
    width: width - 72,
    height: 76,
    color: rgb(0.96, 0.97, 0.99),
    borderWidth: 0.8,
    borderColor: ruleColor,
  });

  page1.drawText('STATE BOARD OF TECHNICAL & HIGHER EDUCATION', {
    x: 105,
    y: height - 64,
    size: 13,
    font: fontBold,
    color: primaryColor,
  });

  page1.drawText(`ANNUAL DEGREE EXAMINATION — ${year}`, {
    x: 175,
    y: height - 80,
    size: 10,
    font: fontBold,
    color: rgb(0.2, 0.25, 0.35),
  });

  page1.drawText('OFFICIAL BASELINE TRIAL PAPER • FOR VERIFICATION & FORENSICS', {
    x: 118,
    y: height - 98,
    size: 8,
    font: fontOblique,
    color: mutedColor,
  });

  // Metadata Box
  const metaY = height - 175;
  page1.drawRectangle({
    x: 36,
    y: metaY,
    width: width - 72,
    height: 46,
    borderWidth: 0.8,
    borderColor: ruleColor,
  });

  page1.drawText(`Subject: ${subject.toUpperCase()}`, {
    x: 48,
    y: metaY + 30,
    size: 9.5,
    font: fontBold,
    color: textColor,
  });
  page1.drawText(`Subject Code: ${subjectCode}`, {
    x: 360,
    y: metaY + 30,
    size: 9.5,
    font: fontBold,
    color: textColor,
  });

  page1.drawText('Time Allowed: 3 Hours', {
    x: 48,
    y: metaY + 12,
    size: 9,
    font: fontHelvetica,
    color: mutedColor,
  });
  page1.drawText('Maximum Marks: 50', {
    x: 360,
    y: metaY + 12,
    size: 9,
    font: fontHelvetica,
    color: mutedColor,
  });

  let curY = metaY - 30;
  page1.drawText('SECTION A — CONCEPTUAL FOUNDATIONS (Answer all questions)', {
    x: 40,
    y: curY,
    size: 9,
    font: fontBold,
    color: primaryColor,
  });

  curY -= 28;
  page1.drawText('Q1. Explain the phases of a modern compiler in detail with a block diagram. Differentiate', {
    x: 40,
    y: curY,
    size: 8.5,
    font: fontBold,
    color: textColor,
  });
  curY -= 14;
  page1.drawText('     between front-end lexical/syntax analysis and back-end code generation.', {
    x: 40,
    y: curY,
    size: 8.5,
    font: fontHelvetica,
    color: textColor,
  });
  page1.drawText('[10 Marks]', {
    x: 500,
    y: curY,
    size: 8.5,
    font: fontBold,
    color: primaryColor,
  });

  curY -= 28;
  page1.drawText("Q2. Construct the LL(1) parsing table for the grammar: E -> T E', E' -> + T E' | e,", {
    x: 40,
    y: curY,
    size: 8.5,
    font: fontBold,
    color: textColor,
  });
  curY -= 14;
  page1.drawText("     T -> F T', T' -> * F T' | e, F -> ( E ) | id. Check if the grammar is LL(1).", {
    x: 40,
    y: curY,
    size: 8.5,
    font: fontHelvetica,
    color: textColor,
  });
  page1.drawText('[10 Marks]', {
    x: 500,
    y: curY,
    size: 8.5,
    font: fontBold,
    color: primaryColor,
  });

  curY -= 28;
  page1.drawText('Q3. Explain LR(0) and SLR(1) parsing algorithms with canonical collection of LR items.', {
    x: 40,
    y: curY,
    size: 8.5,
    font: fontBold,
    color: textColor,
  });
  curY -= 14;
  page1.drawText('     Show how shift-reduce and reduce-reduce conflicts are detected and resolved.', {
    x: 40,
    y: curY,
    size: 8.5,
    font: fontHelvetica,
    color: textColor,
  });
  page1.drawText('[10 Marks]', {
    x: 500,
    y: curY,
    size: 8.5,
    font: fontBold,
    color: primaryColor,
  });

  // --- PAGE 2 ---
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  page2.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: height - 56,
    borderWidth: 1.2,
    borderColor: ruleColor,
  });

  let p2Y = height - 60;
  page2.drawText('SECTION B — INTERMEDIATE CODE & OPTIMIZATION', {
    x: 40,
    y: p2Y,
    size: 9,
    font: fontBold,
    color: primaryColor,
  });

  p2Y -= 30;
  page2.drawText('Q4. Generate Three Address Code (TAC) and Quadruple representations for the statement:', {
    x: 40,
    y: p2Y,
    size: 8.5,
    font: fontBold,
    color: textColor,
  });
  p2Y -= 14;
  page2.drawText('     x = a * b + c / d - e and construct the corresponding Directed Acyclic Graph (DAG).', {
    x: 40,
    y: p2Y,
    size: 8.5,
    font: fontHelvetica,
    color: textColor,
  });
  page2.drawText('[10 Marks]', {
    x: 500,
    y: p2Y,
    size: 8.5,
    font: fontBold,
    color: primaryColor,
  });

  p2Y -= 30;
  page2.drawText('Q5. Describe the principal sources of code optimization: Common Subexpression Elimination,', {
    x: 40,
    y: p2Y,
    size: 8.5,
    font: fontBold,
    color: textColor,
  });
  p2Y -= 14;
  page2.drawText('     Loop Invariant Code Motion, Dead Code Elimination, and Strength Reduction.', {
    x: 40,
    y: p2Y,
    size: 8.5,
    font: fontHelvetica,
    color: textColor,
  });
  page2.drawText('[10 Marks]', {
    x: 500,
    y: p2Y,
    size: 8.5,
    font: fontBold,
    color: primaryColor,
  });

  // Stamp
  page2.drawRectangle({
    x: 40,
    y: 120,
    width: width - 80,
    height: 70,
    color: rgb(0.97, 0.98, 1.0),
    borderWidth: 0.8,
    borderColor: rgb(0.7, 0.8, 0.95),
  });

  page2.drawText('LEAKLENS TEST FIXTURE • HISTORICAL BASELINE', {
    x: 165,
    y: 165,
    size: 9,
    font: fontBold,
    color: rgb(0.15, 0.35, 0.75),
  });
  page2.drawText('Physically stored binary test PDF for indexing and cross-comparison verification.', {
    x: 110,
    y: 145,
    size: 8,
    font: fontHelvetica,
    color: mutedColor,
  });

  const pdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(pdfBytes);

  const storageDir = DIRS.historicalRaw;
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  const uniqueSuffix = Date.now();
  const rawFilename = `TRIAL-${subject.replace(/\s+/g, '-')}-${year}.pdf`;
  const storedFilename = `hp_trial_${uniqueSuffix}_${rawFilename}`;
  const filePath = path.join(storageDir, storedFilename);

  fs.writeFileSync(filePath, buffer);

  const sha256 = computeFileSha256(filePath);
  const id = `HP-${year}-TEST-${uniqueSuffix.toString().slice(-4)}`;

  const extracted = await extractDocumentContent(filePath, 'application/pdf', rawFilename);

  const paperRecord: HistoricalPaperRecord = {
    id,
    title: `[TRIAL] ${subject} (${year})`,
    paperTitle: `${subject} — Baseline Examination ${year}`,
    subject,
    subjectCode,
    year,
    dateIndexed: new Date().toISOString().substring(0, 10),
    totalQuestions: extracted.questions.length > 0 ? extracted.questions.length : 5,
    status: 'Vectorized & Active',
    fileFormat: 'PDF',
    filename: storedFilename,
    originalFilename: rawFilename,
    storagePath: filePath,
    fileSize: buffer.length,
    sha256,
    vectorEmbeddingsCount: 140,
    ocrSnippet: extracted.extractedText.slice(0, 300) || 'Official baseline examination questions.',
    extractedText: extracted.extractedText,
    createdAt: new Date().toISOString(),
    questions: extracted.questions,
    isTestData: true,
    sourceType: 'TEST_FIXTURE',
  };

  db.addHistoricalPaper(paperRecord);
  return paperRecord;
}

/**
 * 2. Generate a real physical Fake Suspicious Paper PDF that intentionally overlaps
 * with the active baseline, runs through the forensic pipeline, and generates alerts.
 */
export async function generateFakeSuspiciousPaperFixture(options?: {
  subject?: string;
  subjectCode?: string;
  platform?: string;
  source?: string;
}): Promise<{
  candidate: CandidateRecord;
  alert?: AlertRecord;
  review?: ReviewItemRecord;
}> {
  const subject = options?.subject || 'Compiler Design';
  const subjectCode = options?.subjectCode || 'CS-801';
  const platform = (options?.platform as any) || 'Telegram';
  const source = options?.source || '@university_leaks_2026 (Channel)';

  // Ensure there is at least one baseline paper in the vault for comparison
  let historicalPapers = db.getHistoricalPapers();
  let realPapers = db.getRealPapers();
  if (historicalPapers.length === 0 && realPapers.length === 0) {
    await generateTrialHistoricalPaperFixture({ subject, subjectCode });
    historicalPapers = db.getHistoricalPapers();
    realPapers = db.getRealPapers();
  }

  const pdfDoc = await PDFDocument.create();
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const textColor = rgb(0.12, 0.14, 0.18);
  const mutedColor = rgb(0.4, 0.44, 0.5);
  const leakColor = rgb(0.7, 0.15, 0.15); // Deep Red Accent

  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  // Draw photo-copy style border
  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderWidth: 1.0,
    borderColor: rgb(0.65, 0.68, 0.72),
  });

  // Leaked Channel Header
  page.drawRectangle({
    x: 40,
    y: height - 110,
    width: width - 80,
    height: 65,
    color: rgb(0.98, 0.95, 0.95),
    borderWidth: 1.0,
    borderColor: leakColor,
  });

  page.drawText('CONFIDENTIAL • LEAKED UPCOMING EXAM PAPER', {
    x: 135,
    y: height - 65,
    size: 11,
    font: fontBold,
    color: leakColor,
  });

  page.drawText(`SUBJECT: ${subject.toUpperCase()} (${subjectCode}) • B.TECH VII SEMESTER`, {
    x: 115,
    y: height - 82,
    size: 9,
    font: fontBold,
    color: textColor,
  });

  page.drawText(`Source Capture: ${platform} (${source})`, {
    x: 175,
    y: height - 98,
    size: 8,
    font: fontHelvetica,
    color: mutedColor,
  });

  // Questions that match the exam questions
  let qY = height - 145;

  page.drawText('Q1. Explain the phases of a modern compiler in detail with a block diagram. Differentiate', {
    x: 45,
    y: qY,
    size: 8.5,
    font: fontBold,
    color: textColor,
  });
  qY -= 14;
  page.drawText('     between front-end lexical/syntax analysis and back-end code generation.', {
    x: 45,
    y: qY,
    size: 8.5,
    font: fontHelvetica,
    color: textColor,
  });
  page.drawText('[10 Marks]', {
    x: 500,
    y: qY,
    size: 8.5,
    font: fontBold,
    color: leakColor,
  });

  qY -= 28;
  page.drawText("Q2. Construct the LL(1) parsing table for the grammar: E -> T E', E' -> + T E' | e,", {
    x: 45,
    y: qY,
    size: 8.5,
    font: fontBold,
    color: textColor,
  });
  qY -= 14;
  page.drawText("     T -> F T', T' -> * F T' | e, F -> ( E ) | id. Check if the grammar is LL(1).", {
    x: 45,
    y: qY,
    size: 8.5,
    font: fontHelvetica,
    color: textColor,
  });
  page.drawText('[10 Marks]', {
    x: 500,
    y: qY,
    size: 8.5,
    font: fontBold,
    color: leakColor,
  });

  qY -= 28;
  page.drawText('Q3. Explain LR(0) and SLR(1) parsing algorithms with canonical collection of LR items.', {
    x: 45,
    y: qY,
    size: 8.5,
    font: fontBold,
    color: textColor,
  });
  qY -= 14;
  page.drawText('     Show how shift-reduce and reduce-reduce conflicts are detected and resolved.', {
    x: 45,
    y: qY,
    size: 8.5,
    font: fontHelvetica,
    color: textColor,
  });
  page.drawText('[10 Marks]', {
    x: 500,
    y: qY,
    size: 8.5,
    font: fontBold,
    color: leakColor,
  });

  qY -= 28;
  page.drawText('Q4. Generate Three Address Code (TAC) and Quadruple representations for the statement:', {
    x: 45,
    y: qY,
    size: 8.5,
    font: fontBold,
    color: textColor,
  });
  qY -= 14;
  page.drawText('     x = a * b + c / d - e and construct the corresponding Directed Acyclic Graph (DAG).', {
    x: 45,
    y: qY,
    size: 8.5,
    font: fontHelvetica,
    color: textColor,
  });
  page.drawText('[10 Marks]', {
    x: 500,
    y: qY,
    size: 8.5,
    font: fontBold,
    color: leakColor,
  });

  qY -= 28;
  page.drawText('Q5. Describe the principal sources of code optimization: Common Subexpression Elimination,', {
    x: 45,
    y: qY,
    size: 8.5,
    font: fontBold,
    color: textColor,
  });
  qY -= 14;
  page.drawText('     Loop Invariant Code Motion, Dead Code Elimination, and Strength Reduction.', {
    x: 45,
    y: qY,
    size: 8.5,
    font: fontHelvetica,
    color: textColor,
  });
  page.drawText('[10 Marks]', {
    x: 500,
    y: qY,
    size: 8.5,
    font: fontBold,
    color: leakColor,
  });

  // Footer stamp
  page.drawRectangle({
    x: 45,
    y: 45,
    width: width - 90,
    height: 45,
    color: rgb(0.96, 0.96, 0.97),
    borderWidth: 0.8,
    borderColor: rgb(0.8, 0.82, 0.85),
  });

  page.drawText('TEST DATA FIXTURE • SIMULATED HIGH-RISK LEAK SPECIMEN', {
    x: 135,
    y: 72,
    size: 8.5,
    font: fontBold,
    color: rgb(0.3, 0.35, 0.45),
  });
  page.drawText('This file is physically stored and evaluated through the live forensic comparison engine.', {
    x: 100,
    y: 56,
    size: 7.5,
    font: fontHelvetica,
    color: mutedColor,
  });

  const pdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(pdfBytes);

  const storageDir = DIRS.candidatesRaw;
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  const uniqueSuffix = Date.now();
  const rawFilename = `TEST_SUSP_${subject.replace(/\s+/g, '_')}_Leak.pdf`;
  const storedFilename = `cand_test_susp_${uniqueSuffix}_${rawFilename}`;
  const filePath = path.join(storageDir, storedFilename);

  fs.writeFileSync(filePath, buffer);

  const sha256 = computeFileSha256(filePath);
  const id = `DC-TEST-SUSP-${uniqueSuffix.toString().slice(-4)}`;

  // Run full extraction pipeline
  const extracted = await extractDocumentContent(filePath, 'application/pdf', rawFilename);

  // Run full forensic comparison pipeline against vault
  const examMetadataList = db.getExamMetadata();
  const forensics = runForensicsComparison(
    extracted.questions,
    realPapers,
    historicalPapers,
    examMetadataList,
    subject,
    subjectCode,
    extracted.extractedText,
    extracted.extractionSummary
  );

  const candidateRecord: CandidateRecord = {
    id,
    name: `[TEST] Leaked Paper - ${subject} (${subjectCode})`,
    filename: storedFilename,
    contentType: 'PDF',
    mimeType: 'application/pdf',
    size: buffer.length,
    sha256,
    subject,
    subjectCode,
    platform,
    source,
    risk: forensics.riskLevel,
    riskScore: forensics.overallRiskScore,
    confidence: forensics.confidence,
    processing: 'Completed',
    review: forensics.riskLevel === 'HIGH' ? 'Needs Verification' : 'Pending',
    detectedTime: new Date().toISOString(),
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE',
    storagePath: filePath,
    extractedText: extracted.extractedText,
    extractionSummary: extracted.extractionSummary,
    extractionMethod: 'NATIVE_TEXT',
    ocrConfidence: 96,
    pagesCount: 1,
    hasAssociatedAlert: forensics.riskLevel === 'HIGH',
    hasAssociatedReview: true,
    questions: extracted.questions,
    forensicResults: forensics.forensicResults,
    metadataComparison: forensics.metadataComparison,
    matchedReferencePaper: forensics.matchedReference,
    isTestData: true,
    sourceType: 'TEST_FIXTURE',
  };

  db.addCandidate(candidateRecord);

  let createdAlert: AlertRecord | undefined;
  if (forensics.riskLevel === 'HIGH') {
    createdAlert = {
      id: `AL-TEST-${uniqueSuffix.toString().slice(-4)}`,
      candidateId: candidateRecord.id,
      candidateName: candidateRecord.name,
      subject,
      subjectCode,
      severity: 'CRITICAL',
      title: `[TEST DATA] High Risk Leak Detected: ${subject} (${subjectCode})`,
      description: `Test suspicious document matches active reference paper with ${forensics.overallRiskScore}% question similarity score.`,
      similarityScore: forensics.overallRiskScore,
      status: 'ACTIVE',
      detectedTime: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      platform,
      matchedReferenceId: forensics.matchedReference?.id,
      matchedReferenceTitle: forensics.matchedReference?.title,
      evidenceSummary: `${forensics.forensicResults.filter((r) => r.result === 'MATCH').length} exact question matches identified in forensic comparison.`,
      isTestData: true,
      sourceType: 'TEST_FIXTURE',
    };
    db.addAlert(createdAlert);
  }

  const createdReview: ReviewItemRecord = {
    id: `REV-TEST-${uniqueSuffix.toString().slice(-4)}`,
    candidateId: candidateRecord.id,
    subject,
    subjectCode,
    riskScore: forensics.overallRiskScore,
    riskLevel: forensics.riskLevel,
    evidenceCount: forensics.forensicResults.filter((r) => r.result === 'MATCH' || r.result === 'PARTIAL_MATCH').length,
    detectedTime: new Date().toISOString(),
    reviewerStatus: 'Needs Verification',
    priority: forensics.riskLevel === 'HIGH' ? 'High Priority' : 'Standard Priority',
    isTestData: true,
    sourceType: 'TEST_FIXTURE',
  };
  db.addReview(createdReview);

  return {
    candidate: candidateRecord,
    alert: createdAlert,
    review: createdReview,
  };
}

/**
 * 3. Generate a real physical Fake Normal Paper PDF that contains benign,
 * non-overlapping content, runs through the pipeline, and verifies low risk.
 */
export async function generateFakeNormalPaperFixture(options?: {
  subject?: string;
  subjectCode?: string;
  platform?: string;
  source?: string;
}): Promise<{
  candidate: CandidateRecord;
}> {
  const subject = options?.subject || 'Environmental Studies';
  const subjectCode = options?.subjectCode || 'ENV-201';
  const platform = (options?.platform as any) || 'Reddit';
  const source = options?.source || 'r/student_study_notes';

  const pdfDoc = await PDFDocument.create();
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const primaryColor = rgb(0.1, 0.4, 0.25);
  const textColor = rgb(0.12, 0.14, 0.18);
  const mutedColor = rgb(0.4, 0.44, 0.5);

  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  // Outer Border
  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderWidth: 1.0,
    borderColor: rgb(0.8, 0.85, 0.82),
  });

  // Header
  page.drawRectangle({
    x: 40,
    y: height - 110,
    width: width - 80,
    height: 65,
    color: rgb(0.96, 0.99, 0.97),
    borderWidth: 1.0,
    borderColor: primaryColor,
  });

  page.drawText('ACADEMIC REVISION NOTES & GENERAL PRACTICE QUIZ', {
    x: 130,
    y: height - 65,
    size: 11,
    font: fontBold,
    color: primaryColor,
  });

  page.drawText(`SUBJECT: ${subject.toUpperCase()} (${subjectCode}) • GENERAL SCIENCE`, {
    x: 135,
    y: height - 82,
    size: 9,
    font: fontBold,
    color: textColor,
  });

  page.drawText(`Public Community Share: ${platform} (${source})`, {
    x: 185,
    y: height - 98,
    size: 8,
    font: fontHelvetica,
    color: mutedColor,
  });

  // Benign Questions (Non-overlapping)
  let qY = height - 145;

  page.drawText('Q1. Explain the ecological pyramid of numbers and biomass in terrestrial ecosystems.', {
    x: 45,
    y: qY,
    size: 8.5,
    font: fontBold,
    color: textColor,
  });
  qY -= 14;
  page.drawText('     Discuss the 10 percent energy transfer law proposed by Raymond Lindeman.', {
    x: 45,
    y: qY,
    size: 8.5,
    font: fontHelvetica,
    color: textColor,
  });
  page.drawText('[10 Marks]', {
    x: 500,
    y: qY,
    size: 8.5,
    font: fontBold,
    color: primaryColor,
  });

  qY -= 28;
  page.drawText('Q2. Describe the working mechanism and efficiency factors of photovoltaic solar cells.', {
    x: 45,
    y: qY,
    size: 8.5,
    font: fontBold,
    color: textColor,
  });
  qY -= 14;
  page.drawText('     Compare monocrystalline and polycrystalline silicon solar panel performances.', {
    x: 45,
    y: qY,
    size: 8.5,
    font: fontHelvetica,
    color: textColor,
  });
  page.drawText('[10 Marks]', {
    x: 500,
    y: qY,
    size: 8.5,
    font: fontBold,
    color: primaryColor,
  });

  qY -= 28;
  page.drawText('Q3. Analyze the biogeochemical nitrogen cycle with special emphasis on nitrification,', {
    x: 45,
    y: qY,
    size: 8.5,
    font: fontBold,
    color: textColor,
  });
  qY -= 14;
  page.drawText('     ammonification, and biological nitrogen fixation by Rhizobium bacteria.', {
    x: 45,
    y: qY,
    size: 8.5,
    font: fontHelvetica,
    color: textColor,
  });
  page.drawText('[10 Marks]', {
    x: 500,
    y: qY,
    size: 8.5,
    font: fontBold,
    color: primaryColor,
  });

  qY -= 28;
  page.drawText('Q4. Explain primary and secondary air pollutants and the photochemical smog formation.', {
    x: 45,
    y: qY,
    size: 8.5,
    font: fontBold,
    color: textColor,
  });
  qY -= 14;
  page.drawText('     Discuss control measures including electrostatic precipitators and scrubbers.', {
    x: 45,
    y: qY,
    size: 8.5,
    font: fontHelvetica,
    color: textColor,
  });
  page.drawText('[10 Marks]', {
    x: 500,
    y: qY,
    size: 8.5,
    font: fontBold,
    color: primaryColor,
  });

  // Stamp
  page.drawRectangle({
    x: 45,
    y: 45,
    width: width - 90,
    height: 45,
    color: rgb(0.97, 0.98, 0.97),
    borderWidth: 0.8,
    borderColor: rgb(0.8, 0.85, 0.82),
  });

  page.drawText('TEST DATA FIXTURE • BENIGN NON-MATCHING STUDY MATERIAL', {
    x: 130,
    y: 72,
    size: 8.5,
    font: fontBold,
    color: rgb(0.2, 0.45, 0.3),
  });
  page.drawText('This file is physically stored and evaluated through the live forensic comparison engine.', {
    x: 100,
    y: 56,
    size: 7.5,
    font: fontHelvetica,
    color: mutedColor,
  });

  const pdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(pdfBytes);

  const storageDir = DIRS.candidatesRaw;
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  const uniqueSuffix = Date.now();
  const rawFilename = `TEST_NORM_${subject.replace(/\s+/g, '_')}_Notes.pdf`;
  const storedFilename = `cand_test_norm_${uniqueSuffix}_${rawFilename}`;
  const filePath = path.join(storageDir, storedFilename);

  fs.writeFileSync(filePath, buffer);

  const sha256 = computeFileSha256(filePath);
  const id = `DC-TEST-NORM-${uniqueSuffix.toString().slice(-4)}`;

  const extracted = await extractDocumentContent(filePath, 'application/pdf', rawFilename);

  const realPapers = db.getRealPapers();
  const historicalPapers = db.getHistoricalPapers();
  const examMetadataList = db.getExamMetadata();

  const forensics = runForensicsComparison(
    extracted.questions,
    realPapers,
    historicalPapers,
    examMetadataList,
    subject,
    subjectCode,
    extracted.extractedText,
    extracted.extractionSummary
  );

  const candidateRecord: CandidateRecord = {
    id,
    name: `[TEST] Practice Notes - ${subject} (${subjectCode})`,
    filename: storedFilename,
    contentType: 'PDF',
    mimeType: 'application/pdf',
    size: buffer.length,
    sha256,
    subject,
    subjectCode,
    platform,
    source,
    risk: forensics.riskLevel,
    riskScore: forensics.overallRiskScore,
    confidence: forensics.confidence,
    processing: 'Completed',
    review: 'Reviewed',
    detectedTime: new Date().toISOString(),
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE',
    storagePath: filePath,
    extractedText: extracted.extractedText,
    extractionSummary: extracted.extractionSummary,
    extractionMethod: 'NATIVE_TEXT',
    ocrConfidence: 98,
    pagesCount: 1,
    hasAssociatedAlert: false,
    hasAssociatedReview: false,
    questions: extracted.questions,
    forensicResults: forensics.forensicResults,
    metadataComparison: forensics.metadataComparison,
    matchedReferencePaper: forensics.matchedReference,
    isTestData: true,
    sourceType: 'TEST_FIXTURE',
  };

  db.addCandidate(candidateRecord);

  return {
    candidate: candidateRecord,
  };
}

/**
 * 4. Generate a comprehensive, multi-document test dataset.
 */
export async function generateTestDatasetFixture(): Promise<TestDatasetSummary> {
  // Clear previous test data first to ensure clean isolation and no duplicates
  db.clearTestData();

  const now = new Date().toISOString();
  const uniqueSuffix = Date.now().toString().slice(-4);

  // =========================================================================
  // SCENARIO A: Verified Real Paper (DBMS CS501)
  // =========================================================================
  const dbmsQuestions = [
    {
      id: "Q1",
      questionNumber: "1",
      fullQuestionNumber: "Q1",
      section: "Section A",
      questionText: "Differentiate between physical and logical data independence. Why is logical data independence harder to achieve?",
      normalizedText: "differentiate physical logical data independence why logical data independence harder achieve",
      marks: 10,
      confidence: 100,
      pageNumber: 1
    },
    {
      id: "Q2",
      questionNumber: "2",
      fullQuestionNumber: "Q2",
      section: "Section A",
      questionText: "Construct an Entity-Relationship (ER) diagram for a university enrollment system. Map it into relational tables.",
      normalizedText: "construct entity relationship er diagram university enrollment system map relational tables",
      marks: 15,
      confidence: 100,
      pageNumber: 1
    },
    {
      id: "Q3",
      questionNumber: "3",
      fullQuestionNumber: "Q3",
      section: "Section B",
      questionText: "Explain 3NF and BCNF with concrete examples. Show a decomposition that is dependency preserving.",
      normalizedText: "explain 3nf bcnf concrete examples show decomposition dependency preserving",
      marks: 15,
      confidence: 100,
      pageNumber: 2
    },
    {
      id: "Q4",
      questionNumber: "4",
      fullQuestionNumber: "Q4",
      section: "Section B",
      questionText: "Describe the ACID properties of transactions. How does Two-Phase Locking (2PL) ensure serializability?",
      normalizedText: "describe acid properties transactions how two phase locking 2pl ensure serializability",
      marks: 10,
      confidence: 100,
      pageNumber: 2
    }
  ];

  const historicalDBMS: HistoricalPaperRecord = {
    id: `HP-TEST-DBMS-01`,
    title: `[TEST DATA — FICTIONAL EXAMPLE] Verified Reference Paper for DBMS (CS501)`,
    subject: "Database Management Systems",
    subjectCode: "CS501",
    year: 2026,
    dateIndexed: now,
    totalQuestions: 4,
    status: "Vectorized & Active",
    fileFormat: "PDF",
    filename: "TEST_REF_DBMS_CS501.pdf",
    originalFilename: "TEST_REF_DBMS_CS501.pdf",
    storagePath: "/fictional/storage/TEST_REF_DBMS_CS501.pdf",
    fileSize: 10240,
    sha256: "dbms_reference_fictional_sha256_hash",
    vectorEmbeddingsCount: 12,
    ocrSnippet: "DBMS CS501. Differentiate physical and logical data independence...",
    extractedText: "Verified Reference Paper for CS501 Database Management Systems. Section A contains Q1 and Q2. Section B contains Q3 and Q4. Fictional exam of 2026.",
    createdAt: now,
    questions: dbmsQuestions.map(q => ({
      id: q.id,
      questionNumber: q.questionNumber,
      fullQuestionNumber: q.fullQuestionNumber,
      section: q.section,
      questionText: q.questionText,
      marks: q.marks,
      confidence: q.confidence,
      pageNumber: q.pageNumber
    })),
    isTestData: true,
    sourceType: "TEST_FIXTURE"
  };

  const realDBMS: RealPaperRecord = {
    id: `RP-TEST-DBMS-01`,
    documentId: `DOC-TEST-DBMS-01`,
    filename: "TEST_REF_DBMS_CS501.pdf",
    originalFilename: "TEST_REF_DBMS_CS501.pdf",
    storagePath: "/fictional/storage/TEST_REF_DBMS_CS501.pdf",
    fileSize: 10240,
    sha256: "dbms_reference_fictional_sha256_hash",
    subject: "Database Management Systems",
    subjectCode: "CS501",
    exam: "Semester Final Examination",
    examType: "B.Tech VII Semester",
    year: 2026,
    semester: "Semester VII",
    session: "Morning",
    examDate: "2026-12-05",
    duration: "3 Hours",
    maximumMarks: 100,
    pageCount: 2,
    verificationStatus: "VERIFIED",
    verifiedBy: "Controller of Exams",
    verifiedAt: now,
    extractedText: historicalDBMS.extractedText,
    structuredData: {
      sections: 2,
      questions: dbmsQuestions.map((q, idx) => ({
        id: `RP-DBMS-Q-${idx + 1}`,
        paperId: "RP-TEST-DBMS-01",
        questionNumber: q.questionNumber,
        fullQuestionNumber: q.fullQuestionNumber,
        questionText: q.questionText,
        normalizedText: q.normalizedText,
        questionType: "Subjective",
        topic: q.id === "Q1" || q.id === "Q2" ? "Data Models" : "Normalization & Transactions",
        difficulty: "MEDIUM",
        marks: q.marks,
        required: true,
        section: q.section,
        position: idx + 1,
        pageNumber: q.pageNumber,
        extractionConfidence: 1.0
      }))
    },
    createdAt: now,
    updatedAt: now,
    isTestData: true,
    sourceType: "TEST_FIXTURE"
  };

  db.addHistoricalPaper(historicalDBMS);
  db.addRealPaper(realDBMS);

  // =========================================================================
  // SCENARIO B: High-Risk Suspected Leak (Circulation of DBMS CS501 on TG)
  // =========================================================================
  const suspDBMSId = `DC-TEST-LEAK-DBMS-${uniqueSuffix}`;
  const suspCandidate: DetectedContentRecord = {
    id: suspDBMSId,
    name: `[SIMULATED HIGH-RISK SCENARIO] Suspected CS501 Paper Circulation`,
    filename: "test_telegram_dbms_screenshot.jpg",
    contentType: "Screenshot",
    mimeType: "image/jpeg",
    size: 254000,
    sha256: "test_telegram_leak_sha256_hash",
    subject: "Database Management Systems",
    subjectCode: "CS501",
    platform: "Telegram",
    source: "@exam_leaks_tg (Channel)",
    risk: "HIGH",
    riskScore: 94,
    confidence: 98,
    processing: "Completed",
    review: "Needs Verification",
    detectedTime: now,
    uploadedAt: now,
    status: "ACTIVE",
    storagePath: "/fictional/storage/test_telegram_dbms_screenshot.jpg",
    extractedText: "CONFIDENTIAL DATABASE MANAGEMENT SYSTEMS CS501\nQ1. Differentiate physical and logical data independence. Why is logical data independence harder to achieve?\nQ2. Construct an ER diagram for enrollment system.\nQ3. Explain 3NF and BCNF with examples.",
    pagesCount: 1,
    hasAssociatedAlert: true,
    hasAssociatedReview: true,
    alertId: `AL-TEST-LEAK-DBMS-${uniqueSuffix}`,
    reviewId: `REV-TEST-LEAK-DBMS-${uniqueSuffix}`,
    questions: [
      {
        id: "CQ1",
        questionNumber: "1",
        fullQuestionNumber: "Q1",
        section: "Section A",
        questionText: "Differentiate physical and logical data independence. Why is logical data independence harder to achieve?",
        confidence: 98,
        pageNumber: 1
      },
      {
        id: "CQ2",
        questionNumber: "2",
        fullQuestionNumber: "Q2",
        section: "Section A",
        questionText: "Construct an ER diagram for enrollment system.",
        confidence: 96,
        pageNumber: 1
      },
      {
        id: "CQ3",
        questionNumber: "3",
        fullQuestionNumber: "Q3",
        section: "Section B",
        questionText: "Explain 3NF and BCNF with examples.",
        confidence: 97,
        pageNumber: 1
      }
    ],
    forensicResults: [
      {
        candidateQuestionId: "CQ1",
        referenceType: "VERIFIED_REAL_PAPER",
        referencePaperId: "RP-TEST-DBMS-01",
        referencePaperTitle: "[TEST DATA — FICTIONAL EXAMPLE] Verified Reference Paper for DBMS (CS501)",
        referenceQuestionId: "RP-DBMS-Q-1",
        textSimilarity: 92,
        semanticSimilarity: 95,
        typeMatch: "MATCH",
        marksMatch: "MATCH",
        sectionMatch: "MATCH",
        numberMatch: "MATCH",
        positionMatch: "MATCH",
        topicMatch: "MATCH",
        contextSimilarity: 90,
        overallSimilarity: 94,
        result: "MATCH",
        confidence: "HIGH",
        evidence: []
      }
    ],
    metadataComparison: {
      matchedExamId: "EX-DBMS-01",
      matchedExamName: "Database Management Systems (CS501)",
      subjectMatch: true,
      codeMatch: true,
      marksMatch: true,
      structureMatch: true,
      orderMatch: true,
      questionOverlapScore: 94,
      summary: "Critically high overlap (94%) detected in structural components and verbatim text of 3 questions with the verified CS501 reference paper."
    },
    matchedReferencePaper: {
      id: "RP-TEST-DBMS-01",
      title: "[TEST DATA — FICTIONAL EXAMPLE] Verified Reference Paper for DBMS (CS501)",
      type: "REAL_PAPER",
      overlapPercentage: 94,
      matchedQuestionsCount: 3,
      totalQuestionsCount: 4
    },
    isTestData: true,
    sourceType: "TEST_FIXTURE"
  };

  const suspAlert: AlertRecord = {
    id: `AL-TEST-LEAK-DBMS-${uniqueSuffix}`,
    candidateId: suspDBMSId,
    candidateName: `[SIMULATED HIGH-RISK SCENARIO] Suspected CS501 Paper Circulation`,
    subject: "Database Management Systems",
    subjectCode: "CS501",
    severity: "CRITICAL",
    title: "Critical Overlap with Verified DBMS Paper",
    description: "Telegram post matching verified questions for DBMS Semester Exam (CS501) with 94% confidence.",
    similarityScore: 94,
    status: "ACTIVE",
    detectedTime: now,
    timestamp: now,
    platform: "Telegram",
    matchedReferenceId: "RP-TEST-DBMS-01",
    matchedReferenceTitle: "[TEST DATA — FICTIONAL EXAMPLE] Verified Reference Paper for DBMS (CS501)",
    evidenceSummary: "Verbatim matching question structures found across sections. Urgently review source channel Telegram @exam_leaks_tg.",
    isTestData: true,
    sourceType: "TEST_FIXTURE"
  };

  const suspReview: ReviewItemRecord = {
    id: `REV-TEST-LEAK-DBMS-${uniqueSuffix}`,
    candidateId: suspDBMSId,
    subject: "Database Management Systems",
    subjectCode: "CS501",
    riskScore: 94,
    riskLevel: "HIGH",
    evidenceCount: 3,
    detectedTime: now,
    reviewerStatus: "Needs Verification",
    priority: "High Priority",
    isTestData: true,
    sourceType: "TEST_FIXTURE"
  };

  db.addCandidate(suspCandidate);
  db.addAlert(suspAlert);
  db.addReview(suspReview);

  // =========================================================================
  // SCENARIO C: Fake Leak / Marketing Gimmick (Instagram @coaching_pro_prep)
  // =========================================================================
  const fakeDBMSId = `DC-TEST-FAKE-LEAK-${uniqueSuffix}`;
  const fakeCandidate: DetectedContentRecord = {
    id: fakeDBMSId,
    name: `[SIMULATED FALSE-CLAIM SCENARIO] Coaching Centre 'Leaked Paper' Promotion`,
    filename: "instagram_promotional_gimmick.jpg",
    contentType: "Screenshot",
    mimeType: "image/jpeg",
    size: 198000,
    sha256: "test_instagram_gimmick_sha256_hash",
    subject: "Database Management Systems",
    subjectCode: "CS-MISMATCH",
    platform: "Instagram",
    source: "@coaching_pro_prep (Profile)",
    risk: "LOW",
    riskScore: 15,
    confidence: 95,
    processing: "Completed",
    review: "Reviewed",
    detectedTime: now,
    uploadedAt: now,
    status: "ACTIVE",
    storagePath: "/fictional/storage/instagram_promotional_gimmick.jpg",
    extractedText: "JOIN COACHING PRO PREP NOW! LEAKED PAPERS FOR FINAL EXAMS AVAILABLE!\nQ1. What is a DBMS? Explain its components.\nQ2. Explain Primary Key vs Foreign Key.\nQ3. Write SQL query to find second highest salary.",
    pagesCount: 1,
    hasAssociatedAlert: true,
    hasAssociatedReview: true,
    alertId: `AL-TEST-FAKE-LEAK-${uniqueSuffix}`,
    reviewId: `REV-TEST-FAKE-LEAK-${uniqueSuffix}`,
    questions: [
      { id: "FQ1", questionNumber: "1", fullQuestionNumber: "Q1", section: "Practice", questionText: "What is a DBMS? Explain its components.", confidence: 99 },
      { id: "FQ2", questionNumber: "2", fullQuestionNumber: "Q2", section: "Practice", questionText: "Explain Primary Key vs Foreign Key.", confidence: 99 },
      { id: "FQ3", questionNumber: "3", fullQuestionNumber: "Q3", section: "Practice", questionText: "Write SQL query to find second highest salary.", confidence: 99 }
    ],
    forensicResults: [],
    metadataComparison: {
      subjectMatch: true,
      codeMatch: false,
      marksMatch: false,
      structureMatch: false,
      orderMatch: false,
      questionOverlapScore: 0,
      summary: "Comparison reveals 0% question overlap. Contains generic textbook practice questions with promotional marketing keywords."
    },
    isTestData: true,
    sourceType: "TEST_FIXTURE"
  };

  const fakeAlert: AlertRecord = {
    id: `AL-TEST-FAKE-LEAK-${uniqueSuffix}`,
    candidateId: fakeDBMSId,
    candidateName: `[SIMULATED FALSE-CLAIM SCENARIO] Coaching Centre 'Leaked Paper' Promotion`,
    subject: "Database Management Systems",
    subjectCode: "CS-MISMATCH",
    severity: "LOW",
    title: "False Promotional Claim Detected",
    description: "Instagram post claiming 'Leaked Exams' resolved as standard textbook prep material (0% overlap).",
    similarityScore: 0,
    status: "RESOLVED",
    detectedTime: now,
    timestamp: now,
    platform: "Instagram",
    evidenceSummary: "Instagram marketing post from @coaching_pro_prep has zero structural overlap with verified CS501 exams.",
    isTestData: true,
    sourceType: "TEST_FIXTURE"
  };

  const fakeReview: ReviewItemRecord = {
    id: `REV-TEST-FAKE-LEAK-${uniqueSuffix}`,
    candidateId: fakeDBMSId,
    subject: "Database Management Systems",
    subjectCode: "CS-MISMATCH",
    riskScore: 15,
    riskLevel: "LOW",
    evidenceCount: 0,
    detectedTime: now,
    reviewerStatus: "Completed",
    priority: "Low Priority",
    decisionNotes: "Checked against CS501 exam paper. Falsified claim; contains general DBMS coaching questions. Dismissed.",
    isTestData: true,
    sourceType: "TEST_FIXTURE"
  };

  db.addCandidate(fakeCandidate);
  db.addAlert(fakeAlert);
  db.addReview(fakeReview);

  // =========================================================================
  // SCENARIO D: Ambiguous Case (Blurry Screenshot on WhatsApp)
  // =========================================================================
  const ambDBMSId = `DC-TEST-AMBIGUOUS-${uniqueSuffix}`;
  const ambCandidate: DetectedContentRecord = {
    id: ambDBMSId,
    name: `[SIMULATED AMBIGUOUS SCENARIO] Blurry CS501 Screenshot — Insufficient Evidence`,
    filename: "blurry_whatsapp_capture.jpg",
    contentType: "Screenshot",
    mimeType: "image/jpeg",
    size: 112000,
    sha256: "test_blurry_amb_sha256_hash",
    subject: "Database Management Systems",
    subjectCode: "CS501",
    platform: "WhatsApp",
    source: "+1-202-555-0143",
    risk: "REVIEW REQUIRED",
    riskScore: 52,
    confidence: 48,
    processing: "Completed",
    review: "Needs Verification",
    detectedTime: now,
    uploadedAt: now,
    status: "ACTIVE",
    storagePath: "/fictional/storage/blurry_whatsapp_capture.jpg",
    extractedText: "DATABA... SYS... ...erence physical... ... logical data... ... diagram ... university...",
    pagesCount: 1,
    hasAssociatedAlert: true,
    hasAssociatedReview: true,
    alertId: `AL-TEST-AMBIGUOUS-${uniqueSuffix}`,
    reviewId: `REV-TEST-AMBIGUOUS-${uniqueSuffix}`,
    questions: [
      { id: "AQ1", questionNumber: "UNKNOWN", fullQuestionNumber: "UNKNOWN", section: "UNKNOWN", questionText: "...erence physical... ... logical data...", confidence: 42 }
    ],
    forensicResults: [],
    metadataComparison: {
      subjectMatch: true,
      codeMatch: true,
      marksMatch: false,
      structureMatch: "UNCERTAIN",
      orderMatch: "UNCERTAIN",
      questionOverlapScore: 40,
      summary: "Low confidence OCR detection of fragments. Matches keywords for CS501 questions, but evidence is insufficient for positive match."
    },
    isTestData: true,
    sourceType: "TEST_FIXTURE"
  };

  const ambAlert: AlertRecord = {
    id: `AL-TEST-AMBIGUOUS-${uniqueSuffix}`,
    candidateId: ambDBMSId,
    candidateName: `[SIMULATED AMBIGUOUS SCENARIO] Blurry CS501 Screenshot — Insufficient Evidence`,
    subject: "Database Management Systems",
    subjectCode: "CS501",
    severity: "MEDIUM",
    title: "Partial Match on Blurry Source Material",
    description: "Ambiguous WhatsApp image containing fragmented OCR text matching DBMS (CS501) concepts.",
    similarityScore: 40,
    status: "INVESTIGATING",
    detectedTime: now,
    timestamp: now,
    platform: "WhatsApp",
    evidenceSummary: "Low OCR quality (48% confidence). Contains key terms 'physical... logical data'. Manual audit recommended.",
    isTestData: true,
    sourceType: "TEST_FIXTURE"
  };

  const ambReview: ReviewItemRecord = {
    id: `REV-TEST-AMBIGUOUS-${uniqueSuffix}`,
    candidateId: ambDBMSId,
    subject: "Database Management Systems",
    subjectCode: "CS501",
    riskScore: 52,
    riskLevel: "REVIEW REQUIRED",
    evidenceCount: 1,
    detectedTime: now,
    reviewerStatus: "Assigned",
    assignedReviewer: "Senior Security Auditor",
    priority: "Standard Priority",
    isTestData: true,
    sourceType: "TEST_FIXTURE"
  };

  db.addCandidate(ambCandidate);
  db.addAlert(ambAlert);
  db.addReview(ambReview);

  // =========================================================================
  // SCENARIO E: Multi-page paper (Computer Networks CS402)
  // =========================================================================
  const multiId = `DC-TEST-MULTIPAGE-${uniqueSuffix}`;
  const multiCandidate: DetectedContentRecord = {
    id: multiId,
    name: `[SIMULATED MULTI-PAGE SCENARIO] Computer Networks Examination (CS402)`,
    filename: "test_telegram_cn_4pages.pdf",
    contentType: "PDF",
    mimeType: "application/pdf",
    size: 489000,
    sha256: "test_multipage_cn_sha256_hash",
    subject: "Computer Networks",
    subjectCode: "CS402",
    platform: "Telegram",
    source: "@cn_study_hub",
    risk: "REVIEW REQUIRED",
    riskScore: 65,
    confidence: 92,
    processing: "Completed",
    review: "Pending",
    detectedTime: now,
    uploadedAt: now,
    status: "ACTIVE",
    storagePath: "/fictional/storage/test_telegram_cn_4pages.pdf",
    extractedText: "Computer Networks CS402 exam paper. Page 1: Q1. Explain OSI reference model. Page 2: Q2. Differentiate IPv4 and IPv6. Page 3: Q3. Explain distance vector routing. Page 4: Q4. Describe TCP 3-way handshake.",
    pagesCount: 4,
    hasAssociatedAlert: false,
    hasAssociatedReview: true,
    reviewId: `REV-TEST-MULTIPAGE-${uniqueSuffix}`,
    questions: [
      { id: "MQ1", questionNumber: "1", fullQuestionNumber: "Q1", section: "Page 1", questionText: "Explain OSI reference model in detail. What are the roles of transport layer vs network layer?", confidence: 98, pageNumber: 1 },
      { id: "MQ2", questionNumber: "2", fullQuestionNumber: "Q2", section: "Page 2", questionText: "Differentiate IPv4 and IPv6 headers with a neat schematic representation.", confidence: 97, pageNumber: 2 },
      { id: "MQ3", questionNumber: "3", fullQuestionNumber: "Q3", section: "Page 3", questionText: "Explain distance vector routing algorithm and count-to-infinity loop resolution.", confidence: 96, pageNumber: 3 },
      { id: "MQ4", questionNumber: "4", fullQuestionNumber: "Q4", section: "Page 4", questionText: "Describe TCP 3-way handshake connection establishment and graceful connection teardown.", confidence: 99, pageNumber: 4 }
    ],
    forensicResults: [],
    metadataComparison: {
      subjectMatch: true,
      codeMatch: true,
      marksMatch: false,
      structureMatch: "PARTIAL",
      orderMatch: "UNCERTAIN",
      questionOverlapScore: 50,
      summary: "Multi-page PDF contains extensive Computer Networks (CS402) curriculum. Structurally organized over 4 logical pages."
    },
    extractionSummary: {
      documentType: "TEXT_PDF",
      totalPages: 4,
      nativeTextPagesCount: 4,
      ocrPagesCount: 0,
      overallExtractionMethod: "NATIVE_TEXT",
      overallOcrConfidence: 100,
      hasLowConfidencePages: false,
      pages: [
        { pageNumber: 1, extractionMethod: "NATIVE_TEXT", text: "Page 1 Content: Q1. Explain OSI reference model in detail.", ocrConfidence: 100, processingStatus: "COMPLETED", nativeTextLength: 120 },
        { pageNumber: 2, extractionMethod: "NATIVE_TEXT", text: "Page 2 Content: Q2. Differentiate IPv4 and IPv6 headers.", ocrConfidence: 100, processingStatus: "COMPLETED", nativeTextLength: 110 },
        { pageNumber: 3, extractionMethod: "NATIVE_TEXT", text: "Page 3 Content: Q3. Explain distance vector routing algorithm.", ocrConfidence: 100, processingStatus: "COMPLETED", nativeTextLength: 130 },
        { pageNumber: 4, extractionMethod: "NATIVE_TEXT", text: "Page 4 Content: Q4. Describe TCP 3-way handshake process.", ocrConfidence: 100, processingStatus: "COMPLETED", nativeTextLength: 140 }
      ],
      rawTextLength: 500,
      extractedAt: now
    },
    extractionMethod: "MIXED",
    isTestData: true,
    sourceType: "TEST_FIXTURE"
  };

  const multiReview: ReviewItemRecord = {
    id: `REV-TEST-MULTIPAGE-${uniqueSuffix}`,
    candidateId: multiId,
    subject: "Computer Networks",
    subjectCode: "CS402",
    riskScore: 65,
    riskLevel: "REVIEW REQUIRED",
    evidenceCount: 4,
    detectedTime: now,
    reviewerStatus: "Assigned",
    assignedReviewer: "Analyst Beta",
    priority: "Standard Priority",
    isTestData: true,
    sourceType: "TEST_FIXTURE"
  };

  db.addCandidate(multiCandidate);
  db.addReview(multiReview);

  // =========================================================================
  // SCENARIO F: OCR / Blurry Document (Applied Physics PH101 on WA)
  // =========================================================================
  const blurId = `DC-TEST-BLURRY-${uniqueSuffix}`;
  const blurCandidate: DetectedContentRecord = {
    id: blurId,
    name: `[SIMULATED BLURRY OCR SCENARIO] OCR / Blurry Physics Document (PH101)`,
    filename: "blurry_physics_scan.jpg",
    contentType: "Screenshot",
    mimeType: "image/jpeg",
    size: 154000,
    sha256: "test_blurry_physics_sha256_hash",
    subject: "Applied Physics",
    subjectCode: "PH101",
    platform: "WhatsApp",
    source: "+1-305-555-0199",
    risk: "REVIEW REQUIRED",
    riskScore: 40,
    confidence: 45, // OCR confidence is 45%
    processing: "Completed",
    review: "Pending",
    detectedTime: now,
    uploadedAt: now,
    status: "ACTIVE",
    storagePath: "/fictional/storage/blurry_physics_scan.jpg",
    extractedText: "PH1... Ap... Ph...sics. Q1. State ... Schrodinger ... eq...ation. Q2. ... Heis...nberg uncertainty ...",
    pagesCount: 1,
    hasAssociatedAlert: false,
    hasAssociatedReview: true,
    reviewId: `REV-TEST-BLURRY-${uniqueSuffix}`,
    questions: [
      { id: "BQ1", questionNumber: "1", fullQuestionNumber: "Q1", section: "Group A", questionText: "State Schrodinger wave equation for a free particle and solve.", confidence: 45 },
      { id: "BQ2", questionNumber: "2", fullQuestionNumber: "Q2", section: "Group A", questionText: "Explain Heisenberg uncertainty principle in quantum physics.", confidence: 41 }
    ],
    forensicResults: [],
    metadataComparison: {
      subjectMatch: true,
      codeMatch: true,
      marksMatch: false,
      structureMatch: "UNCERTAIN",
      orderMatch: "UNCERTAIN",
      questionOverlapScore: 35,
      summary: "Poor image quality led to mixed-confidence OCR (45%). Key concepts detected but structural fidelity is low."
    },
    extractionMethod: "OCR",
    ocrConfidence: 45,
    isTestData: true,
    sourceType: "TEST_FIXTURE"
  };

  const blurReview: ReviewItemRecord = {
    id: `REV-TEST-BLURRY-${uniqueSuffix}`,
    candidateId: blurId,
    subject: "Applied Physics",
    subjectCode: "PH101",
    riskScore: 40,
    riskLevel: "REVIEW REQUIRED",
    evidenceCount: 2,
    detectedTime: now,
    reviewerStatus: "Needs Verification",
    priority: "Low Priority",
    isTestData: true,
    sourceType: "TEST_FIXTURE"
  };

  db.addCandidate(blurCandidate);
  db.addReview(blurReview);

  // =========================================================================
  // SCENARIO G: Structural Match Without Exact Text Match (Mathematics MA201)
  // =========================================================================
  const structId = `DC-TEST-STRUCT-${uniqueSuffix}`;
  const structCandidate: DetectedContentRecord = {
    id: structId,
    name: `[SIMULATED STRUCTURAL MATCH SCENARIO] Paraphrased Mathematics Structural Match`,
    filename: "math_reconstructed_paraphrased.txt",
    contentType: "Document",
    mimeType: "text/plain",
    size: 25000,
    sha256: "test_struct_math_sha256_hash",
    subject: "Engineering Mathematics",
    subjectCode: "MA201",
    platform: "Telegram",
    source: "@math_tutors_inc",
    risk: "REVIEW REQUIRED",
    riskScore: 70,
    confidence: 88,
    processing: "Completed",
    review: "Needs Verification",
    detectedTime: now,
    uploadedAt: now,
    status: "ACTIVE",
    storagePath: "/fictional/storage/math_reconstructed_paraphrased.txt",
    extractedText: "MA201 Mathematics II. Section A contains 10 short questions of 2 marks each. Section B contains 5 long questions of 5 marks each. Section C contains 2 essay questions of 15 marks.",
    pagesCount: 1,
    hasAssociatedAlert: true,
    hasAssociatedReview: true,
    alertId: `AL-TEST-STRUCT-${uniqueSuffix}`,
    reviewId: `REV-TEST-STRUCT-${uniqueSuffix}`,
    questions: [
      { id: "SQ1", questionNumber: "Section A", fullQuestionNumber: "Structure Match", section: "Header", questionText: "10 short questions of 2 marks each. 5 long questions of 5 marks each. 2 essay questions of 15 marks.", confidence: 90 }
    ],
    forensicResults: [],
    metadataComparison: {
      matchedExamId: "EX-MA-201",
      matchedExamName: "Engineering Mathematics II (MA201)",
      subjectMatch: true,
      codeMatch: true,
      marksMatch: true,
      structureMatch: "MATCH",
      orderMatch: "MATCH",
      questionOverlapScore: 75,
      summary: "Exam structure (10x2, 5x5, 2x15) matches MA201 reference perfectly. Text has been heavily paraphrased or replaced. Manual inspection recommended for structural plagiarism."
    },
    isTestData: true,
    sourceType: "TEST_FIXTURE"
  };

  const structAlert: AlertRecord = {
    id: `AL-TEST-STRUCT-${uniqueSuffix}`,
    candidateId: structId,
    candidateName: `[SIMULATED STRUCTURAL MATCH SCENARIO] Paraphrased Mathematics Structural Match`,
    subject: "Engineering Mathematics",
    subjectCode: "MA201",
    severity: "HIGH",
    title: "Structural Plagiarism/Overlap Detected",
    description: "Mathematics document matching the exact schema structure of MA201 final exam (Section A: 10x2, Section B: 5x5, Section C: 2x15).",
    similarityScore: 75,
    status: "INVESTIGATING",
    detectedTime: now,
    timestamp: now,
    platform: "Telegram",
    evidenceSummary: "Structural match score is 100%, though textual overlap is low due to dynamic paraphrasing. Indicates highly structured leak reconstruction.",
    isTestData: true,
    sourceType: "TEST_FIXTURE"
  };

  const structReview: ReviewItemRecord = {
    id: `REV-TEST-STRUCT-${uniqueSuffix}`,
    candidateId: structId,
    subject: "Engineering Mathematics",
    subjectCode: "MA201",
    riskScore: 70,
    riskLevel: "REVIEW REQUIRED",
    evidenceCount: 1,
    detectedTime: now,
    reviewerStatus: "Needs Verification",
    priority: "Standard Priority",
    isTestData: true,
    sourceType: "TEST_FIXTURE"
  };

  db.addCandidate(structCandidate);
  db.addAlert(structAlert);
  db.addReview(structReview);

  // Compile full lists of generated records
  const historicalPapers = [historicalDBMS];
  const verifiedPapers = [realDBMS];
  const suspiciousCandidates = [suspCandidate, multiCandidate, structCandidate];
  const normalCandidates = [fakeCandidate, ambCandidate, blurCandidate];
  const alertsGenerated = [suspAlert, fakeAlert, ambAlert, structAlert];
  const reviewsGenerated = [suspReview, fakeReview, ambReview, multiReview, blurReview, structReview];

  return {
    success: true,
    message: "Generated 7 high-fidelity, realistic test scenarios for examination security audits.",
    historicalPapers,
    verifiedPapers,
    suspiciousCandidates,
    normalCandidates,
    alertsGenerated,
    reviewsGenerated
  };
}
