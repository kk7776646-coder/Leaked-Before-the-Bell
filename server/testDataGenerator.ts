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
  const historical1 = await generateTrialHistoricalPaperFixture({
    subject: 'Compiler Design',
    subjectCode: 'CS-801',
    year: 2024,
  });

  const historical2 = await generateTrialHistoricalPaperFixture({
    subject: 'Operating Systems',
    subjectCode: 'CS-502',
    year: 2024,
  });

  const susp1 = await generateFakeSuspiciousPaperFixture({
    subject: 'Compiler Design',
    subjectCode: 'CS-801',
    platform: 'Telegram',
    source: '@exam_leaks_tg (Channel)',
  });

  const susp2 = await generateFakeSuspiciousPaperFixture({
    subject: 'Operating Systems',
    subjectCode: 'CS-502',
    platform: 'WhatsApp',
    source: '+1-800-STUDY-BROADCAST',
  });

  const norm1 = await generateFakeNormalPaperFixture({
    subject: 'Environmental Studies',
    subjectCode: 'ENV-201',
    platform: 'Reddit',
    source: 'r/environmental_studies',
  });

  const norm2 = await generateFakeNormalPaperFixture({
    subject: 'Organic Chemistry',
    subjectCode: 'CHM-102',
    platform: 'Instagram',
    source: '@chemistry_notes_hub',
  });

  const alerts: AlertRecord[] = [];
  if (susp1.alert) alerts.push(susp1.alert);
  if (susp2.alert) alerts.push(susp2.alert);

  const reviews: ReviewItemRecord[] = [];
  if (susp1.review) reviews.push(susp1.review);
  if (susp2.review) reviews.push(susp2.review);

  return {
    success: true,
    message: 'Generated comprehensive test dataset with historical baselines, suspicious captures, and benign study documents.',
    historicalPapers: [historical1, historical2],
    verifiedPapers: [],
    suspiciousCandidates: [susp1.candidate, susp2.candidate],
    normalCandidates: [norm1.candidate, norm2.candidate],
    alertsGenerated: alerts,
    reviewsGenerated: reviews,
  };
}
