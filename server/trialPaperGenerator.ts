import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { DIRS, computeFileSha256 } from './storage';
import { db } from './db';
import { HistoricalPaperRecord } from './types';
import { extractDocumentContent } from './documentExtraction';

/**
 * Generates a real, physically valid binary examination PDF file for development and testing.
 * The generated PDF is saved into storage and registered into the database via the standard pipeline.
 */
export async function generateTrialExaminationPaper(): Promise<HistoricalPaperRecord> {
  const pdfDoc = await PDFDocument.create();

  // Standard fonts
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const primaryColor = rgb(0.08, 0.18, 0.36); // Deep Navy
  const textColor = rgb(0.12, 0.14, 0.18);
  const mutedColor = rgb(0.38, 0.42, 0.48);
  const ruleColor = rgb(0.8, 0.83, 0.88);

  // --- PAGE 1 ---
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4 in points
  const { width, height } = page1.getSize();

  // Outer border
  page1.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: height - 56,
    borderWidth: 1.2,
    borderColor: ruleColor,
  });

  // Header banner box
  page1.drawRectangle({
    x: 36,
    y: height - 120,
    width: width - 72,
    height: 76,
    color: rgb(0.96, 0.97, 0.99),
    borderWidth: 0.8,
    borderColor: ruleColor,
  });

  // Institution & Exam Title
  page1.drawText('STATE BOARD OF TECHNICAL & HIGHER EDUCATION', {
    x: 105,
    y: height - 64,
    size: 13,
    font: fontBold,
    color: primaryColor,
  });

  page1.drawText('ANNUAL DEGREE EXAMINATION — 2026', {
    x: 165,
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

  // Metadata Table Box
  const metaY = height - 175;
  page1.drawRectangle({
    x: 36,
    y: metaY,
    width: width - 72,
    height: 46,
    borderWidth: 0.8,
    borderColor: ruleColor,
  });

  page1.drawText('Subject: COMPILER DESIGN', {
    x: 48,
    y: metaY + 30,
    size: 9.5,
    font: fontBold,
    color: textColor,
  });
  page1.drawText('Subject Code: CS-801', {
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

  // Instructions
  let curY = metaY - 24;
  page1.drawText('INSTRUCTIONS TO CANDIDATES:', {
    x: 40,
    y: curY,
    size: 9,
    font: fontBold,
    color: primaryColor,
  });
  curY -= 14;
  page1.drawText('1. Answer all questions from Section A and any three questions from Section B.', {
    x: 40,
    y: curY,
    size: 8.5,
    font: fontHelvetica,
    color: textColor,
  });
  curY -= 12;
  page1.drawText('2. Draw neat flow diagrams and state transition graphs where required.', {
    x: 40,
    y: curY,
    size: 8.5,
    font: fontHelvetica,
    color: textColor,
  });
  curY -= 12;
  page1.drawText('3. Assume suitable data if necessary and state the assumptions clearly.', {
    x: 40,
    y: curY,
    size: 8.5,
    font: fontHelvetica,
    color: textColor,
  });

  // Section A Header
  curY -= 24;
  page1.drawRectangle({
    x: 36,
    y: curY,
    width: width - 72,
    height: 20,
    color: rgb(0.93, 0.95, 0.98),
  });
  page1.drawText('SECTION A  (Short Answer Questions — 15 Marks)', {
    x: 44,
    y: curY + 6,
    size: 9.5,
    font: fontBold,
    color: primaryColor,
  });

  // Questions in Section A
  const sectionAQuestions = [
    {
      num: 'Q1.',
      text: 'Explain the role of lexical analysis in modern compiler architecture. Describe how tokens, lexemes, and patterns relate to regular expressions and transition diagrams.',
      marks: '[5 Marks]',
    },
    {
      num: 'Q2.',
      text: 'Differentiate between top-down LL(1) parsing and bottom-up LR(1) parsing. State the primary advantages of canonical LR parsers over simple SLR(1) parsers.',
      marks: '[5 Marks]',
    },
    {
      num: 'Q3.',
      text: 'What is an Intermediate Representation (IR)? Explain three-address code representation using quadruples, triples, and indirect triples with concrete examples.',
      marks: '[5 Marks]',
    },
  ];

  curY -= 20;
  for (const q of sectionAQuestions) {
    page1.drawText(q.num, {
      x: 44,
      y: curY,
      size: 9,
      font: fontBold,
      color: primaryColor,
    });
    page1.drawText(q.marks, {
      x: width - 95,
      y: curY,
      size: 8.5,
      font: fontBold,
      color: mutedColor,
    });

    // Multi-line text wrap for question
    const words = q.text.split(' ');
    let line = '';
    let lineY = curY;
    for (const w of words) {
      if ((line + w).length > 76) {
        page1.drawText(line, {
          x: 70,
          y: lineY,
          size: 8.5,
          font: fontHelvetica,
          color: textColor,
        });
        lineY -= 12;
        line = w + ' ';
      } else {
        line += w + ' ';
      }
    }
    if (line) {
      page1.drawText(line, {
        x: 70,
        y: lineY,
        size: 8.5,
        font: fontHelvetica,
        color: textColor,
      });
      lineY -= 12;
    }
    curY = lineY - 10;
  }

  // Section B Header
  curY -= 10;
  page1.drawRectangle({
    x: 36,
    y: curY,
    width: width - 72,
    height: 20,
    color: rgb(0.93, 0.95, 0.98),
  });
  page1.drawText('SECTION B  (Long Answer & Analytical Questions — 35 Marks)', {
    x: 44,
    y: curY + 6,
    size: 9.5,
    font: fontBold,
    color: primaryColor,
  });

  const sectionBQuestions = [
    {
      num: 'Q4.',
      text: 'Explain syntax-directed translation schemes (SDTS). Formulate synthesized and inherited attribute definitions for evaluating arithmetic expressions with type checking.',
      marks: '[10 Marks]',
    },
    {
      num: 'Q5.',
      text: 'Detail the primary techniques in loop optimization and data flow analysis. Discuss dead code elimination, constant propagation, loop invariant code motion, and register allocation graph coloring.',
      marks: '[10 Marks]',
    },
  ];

  curY -= 20;
  for (const q of sectionBQuestions) {
    page1.drawText(q.num, {
      x: 44,
      y: curY,
      size: 9,
      font: fontBold,
      color: primaryColor,
    });
    page1.drawText(q.marks, {
      x: width - 95,
      y: curY,
      size: 8.5,
      font: fontBold,
      color: mutedColor,
    });

    const words = q.text.split(' ');
    let line = '';
    let lineY = curY;
    for (const w of words) {
      if ((line + w).length > 76) {
        page1.drawText(line, {
          x: 70,
          y: lineY,
          size: 8.5,
          font: fontHelvetica,
          color: textColor,
        });
        lineY -= 12;
        line = w + ' ';
      } else {
        line += w + ' ';
      }
    }
    if (line) {
      page1.drawText(line, {
        x: 70,
        y: lineY,
        size: 8.5,
        font: fontHelvetica,
        color: textColor,
      });
      lineY -= 12;
    }
    curY = lineY - 10;
  }

  // Page 1 Footer
  page1.drawLine({
    start: { x: 36, y: 46 },
    end: { x: width - 36, y: 46 },
    thickness: 0.6,
    color: ruleColor,
  });
  page1.drawText('LeakLens Document Intelligence • Baseline Trial Fixture • Page 1 of 2', {
    x: 160,
    y: 34,
    size: 7.5,
    font: fontHelvetica,
    color: mutedColor,
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

  page2.drawText('COMPILER DESIGN (CS-801) — TRIAL EXAMINATION 2026', {
    x: 36,
    y: height - 52,
    size: 9,
    font: fontBold,
    color: primaryColor,
  });
  page2.drawLine({
    start: { x: 36, y: height - 58 },
    end: { x: width - 36, y: height - 58 },
    thickness: 0.8,
    color: ruleColor,
  });

  let p2Y = height - 90;
  page2.drawText('SECTION B (Continued)', {
    x: 36,
    y: p2Y,
    size: 10,
    font: fontBold,
    color: primaryColor,
  });

  p2Y -= 24;
  page2.drawText('Q6.', {
    x: 44,
    y: p2Y,
    size: 9,
    font: fontBold,
    color: primaryColor,
  });
  page2.drawText('[15 Marks]', {
    x: width - 95,
    y: p2Y,
    size: 8.5,
    font: fontBold,
    color: mutedColor,
  });

  const q6Lines = [
    'Construct the canonical collection of LR(0) items and build the complete SLR(1) parsing table',
    'for the following augmented context-free grammar:',
    '',
    '    E -> E + T | T',
    '    T -> T * F | F',
    '    F -> ( E ) | id',
    '',
    'Demonstrate step-by-step stack actions for recognizing the input token sequence: id + id * id',
  ];

  let q6Y = p2Y;
  for (const l of q6Lines) {
    page2.drawText(l, {
      x: 70,
      y: q6Y,
      size: 8.5,
      font: l.startsWith('    ') ? fontBold : fontHelvetica,
      color: textColor,
    });
    q6Y -= 13;
  }

  // Security Verification Watermark Box
  p2Y = 180;
  page2.drawRectangle({
    x: 40,
    y: p2Y,
    width: width - 80,
    height: 100,
    color: rgb(0.97, 0.98, 1.0),
    borderWidth: 0.8,
    borderColor: rgb(0.7, 0.8, 0.95),
  });

  page2.drawText('LEAKLENS FORENSIC VERIFICATION STAMP', {
    x: 180,
    y: p2Y + 80,
    size: 9.5,
    font: fontBold,
    color: rgb(0.15, 0.35, 0.75),
  });
  page2.drawText('Status: PHYSICALLY GENERATED SYSTEM TRIAL FIXTURE', {
    x: 140,
    y: p2Y + 62,
    size: 8.5,
    font: fontBold,
    color: rgb(0.1, 0.5, 0.3),
  });
  page2.drawText('This document is a physically stored binary PDF generated for testing', {
    x: 145,
    y: p2Y + 44,
    size: 8,
    font: fontHelvetica,
    color: mutedColor,
  });
  page2.drawText('the document viewer, page extraction, and similarity matching engine.', {
    x: 155,
    y: p2Y + 30,
    size: 8,
    font: fontHelvetica,
    color: mutedColor,
  });

  page2.drawLine({
    start: { x: 36, y: 46 },
    end: { x: width - 36, y: 46 },
    thickness: 0.6,
    color: ruleColor,
  });
  page2.drawText('LeakLens Document Intelligence • Baseline Trial Fixture • Page 2 of 2', {
    x: 160,
    y: 34,
    size: 7.5,
    font: fontHelvetica,
    color: mutedColor,
  });

  // Serialize to PDF bytes
  const pdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(pdfBytes);

  // Save to storage directory
  const filename = `TRIAL-Compiler-Design-2026.pdf`;
  const storageDir = DIRS.historicalRaw;
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  const uniqueSuffix = Date.now();
  const storedFilename = `hp_trial_${uniqueSuffix}_${filename}`;
  const filePath = path.join(storageDir, storedFilename);

  fs.writeFileSync(filePath, buffer);

  const sha256 = computeFileSha256(filePath);
  const id = `HP-2026-TRIAL-${uniqueSuffix.toString().slice(-4)}`;

  // Run extraction to extract real questions
  const extracted = await extractDocumentContent(filePath, 'application/pdf', filename);

  const paperRecord: HistoricalPaperRecord = {
    id,
    title: '[TRIAL] Compiler Design (2026)',
    paperTitle: 'Compiler Design — Degree Examination 2026',
    subject: 'Compiler Design',
    subjectCode: 'CS-801',
    year: 2026,
    dateIndexed: new Date().toISOString().substring(0, 10),
    totalQuestions: extracted.questions.length > 0 ? extracted.questions.length : 6,
    status: 'Vectorized & Active',
    fileFormat: 'PDF',
    filename: storedFilename,
    originalFilename: filename,
    storagePath: filePath,
    fileSize: buffer.length,
    sha256,
    vectorEmbeddingsCount: 140,
    ocrSnippet: 'Q1. Explain the role of lexical analysis in modern compiler architecture...',
    extractedText: extracted.extractedText,
    createdAt: new Date().toISOString(),
    questions: extracted.questions,
  };

  db.addHistoricalPaper(paperRecord);
  return paperRecord;
}
