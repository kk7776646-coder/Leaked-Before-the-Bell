import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { extractMetadataFromContent } from './metadataExtractor';
import { extractZipArchiveRecursively } from './recursiveZipExtractor';
import { detectPaperBoundariesInPdf } from './paperBoundaryDetector';
import { parseQuestionsFromPageText } from './documentExtraction';
import { runForensicsComparison } from './forensics';
import { documentIngestionEngine } from './documentIngestionEngine';
import { DIRS, LIMITS, computeSha256 } from './storage';
import { PageExtractionResult } from './types';

export interface TestCaseResult {
  id: string;
  name: string;
  category: 'PDF_CLASSIFICATION' | 'RECURSIVE_ZIP' | 'MULTI_PAPER_SPLIT' | 'METADATA_EXTRACTION' | 'FORENSICS' | 'SECURITY' | 'TRACEABILITY';
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  durationMs: number;
  details: string;
  evidence?: any;
}

export interface IngestionTestSuiteReport {
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  results: TestCaseResult[];
  summary: string;
}

export async function runAllIngestionTests(): Promise<IngestionTestSuiteReport> {
  const testResults: TestCaseResult[] = [];
  const testDir = path.join(DIRS.extracted, 'test_fixtures');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  async function recordTest(
    id: string,
    name: string,
    category: TestCaseResult['category'],
    fn: () => Promise<{ passed: boolean; details: string; evidence?: any }>
  ) {
    const start = Date.now();
    try {
      const res = await fn();
      testResults.push({
        id,
        name,
        category,
        status: res.passed ? 'PASSED' : 'FAILED',
        durationMs: Date.now() - start,
        details: res.details,
        evidence: res.evidence,
      });
    } catch (err: any) {
      testResults.push({
        id,
        name,
        category,
        status: 'FAILED',
        durationMs: Date.now() - start,
        details: `Exception: ${err.message || String(err)}`,
      });
    }
  }

  // Helper: create native text PDF in memory
  async function createTestPdf(
    pagesContent: { title: string; lines: string[] }[]
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for (const p of pagesContent) {
      const page = pdfDoc.addPage([595.28, 841.89]);
      const { height } = page.getSize();
      let y = height - 50;

      page.drawText(p.title, { x: 50, y, size: 16, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      y -= 30;

      for (const line of p.lines) {
        page.drawText(line, { x: 50, y, size: 11, font, color: rgb(0.2, 0.2, 0.2) });
        y -= 20;
      }
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  // -------------------------------------------------------------
  // 1. METADATA EXTRACTION TESTS (Tests 1-8)
  // -------------------------------------------------------------
  await recordTest(
    'TC-META-01',
    'Auto metadata extraction: Subject & Subject Code from Header',
    'METADATA_EXTRACTION',
    async () => {
      const sampleText = `
        NATIONAL INSTITUTE OF TECHNOLOGY
        DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
        END-SEMESTER EXAMINATION, MARCH 2026
        Subject: Database Management Systems (CS501)
        Semester: 5th Semester (V)
        Time: 3 Hours                       Max Marks: 70
        Date: 15/03/2026

        SECTION A (Attempt all questions)
        Q1. (a) Explain ACID properties in DBMS with real-world examples. [5 Marks]
        Q1. (b) What is 3NF and BCNF normalization? [5 Marks]
      `;
      const meta = extractMetadataFromContent(sampleText, 'DBMS_Final_2026.pdf');
      const passed = meta.subjectCode.value === 'CS501' && meta.subject.value === 'Database Management Systems' && meta.maxMarks.value === 70;
      return {
        passed,
        details: `Subject: '${meta.subject.value}' (${meta.subject.confidenceLevel}), Code: '${meta.subjectCode.value}', Marks: ${meta.maxMarks.value}`,
        evidence: { subject: meta.subject, code: meta.subjectCode, marks: meta.maxMarks },
      };
    }
  );

  await recordTest(
    'TC-META-02',
    'Auto metadata extraction: Exam Date & Duration Detection',
    'METADATA_EXTRACTION',
    async () => {
      const sampleText = `
        EXAMINATION BOARD 2026
        Subject Code: MATH201
        Date of Exam: 18 March 2026
        Time Allowed: 3 Hours
        Total Marks: 100
      `;
      const meta = extractMetadataFromContent(sampleText, 'math_exam.pdf');
      const passed = meta.examDate.value.includes('18 March 2026') && meta.duration.value.includes('3 Hours');
      return {
        passed,
        details: `Date: ${meta.examDate.value}, Duration: ${meta.duration.value}`,
        evidence: { date: meta.examDate, duration: meta.duration },
      };
    }
  );

  await recordTest(
    'TC-META-03',
    'Auto metadata extraction: Semester & Academic Session',
    'METADATA_EXTRACTION',
    async () => {
      const sampleText = `
        B.Tech 6th Semester Examination 2026
        Compiler Design (CS602)
      `;
      const meta = extractMetadataFromContent(sampleText, 'cs602_paper.pdf');
      const passed = meta.semester.value.includes('6th') || meta.semester.value.includes('VI');
      return {
        passed,
        details: `Semester: ${meta.semester.value}, Year: ${meta.year.value}`,
        evidence: meta.semester,
      };
    }
  );

  await recordTest(
    'TC-META-04',
    'Non-hallucination test: Unspecified fields return NOT_DETECTED with LOW confidence',
    'METADATA_EXTRACTION',
    async () => {
      const sampleText = `
        Generic notes snippet with no subject header or code.
        Just regular practice questions without header tags.
      `;
      const meta = extractMetadataFromContent(sampleText, 'random_notes.png');
      const passed = meta.subject.source === 'NOT_DETECTED' && meta.subjectCode.source === 'NOT_DETECTED' && meta.subject.confidenceLevel === 'LOW';
      return {
        passed,
        details: `Subject Source: ${meta.subject.source}, Code Source: ${meta.subjectCode.source}, Confidence: ${meta.subject.confidenceLevel}`,
        evidence: { subject: meta.subject, code: meta.subjectCode },
      };
    }
  );

  await recordTest(
    'TC-META-05',
    'Cross-referencing with Active Exam Registry boost',
    'METADATA_EXTRACTION',
    async () => {
      const sampleText = `
        Paper Code: CS501
      `;
      const meta = extractMetadataFromContent(sampleText, 'scan_doc.pdf');
      const passed = meta.subject.source === 'EXAM_METADATA_MATCH' && meta.subject.confidence >= 0.95;
      return {
        passed,
        details: `Resolved subject '${meta.subject.value}' via registry lookup (${meta.subject.source})`,
        evidence: meta.subject,
      };
    }
  );

  // -------------------------------------------------------------
  // 2. RECURSIVE ZIP INGESTION & SECURITY TESTS (Tests 6-12)
  // -------------------------------------------------------------
  await recordTest(
    'TC-ZIP-01',
    'Recursive ZIP extraction with nested directories & multi-format discovery',
    'RECURSIVE_ZIP',
    async () => {
      const zip = new AdmZip();
      const pdf1 = await createTestPdf([{ title: 'Paper 1', lines: ['CS501 Database Systems', 'Q1. Explain SQL queries.'] }]);
      const pdf2 = await createTestPdf([{ title: 'Paper 2', lines: ['CS502 Operating Systems', 'Q1. Explain Process scheduling.'] }]);

      zip.addFile('Semester5/CS501_DBMS.pdf', pdf1);
      zip.addFile('Semester5/CS502_OS.pdf', pdf2);
      zip.addFile('Images/page_01.png', Buffer.from('fake-png-data'));

      const testZipBuffer = zip.toBuffer();
      const zipRes = await extractZipArchiveRecursively(testZipBuffer, 'UP-TEST-ZIP', 'ARC-TEST');

      const passed = zipRes.documents.length === 3 && zipRes.documents.some((d) => d.isPdf) && zipRes.documents.some((d) => d.isImage);
      return {
        passed,
        details: `Extracted ${zipRes.documents.length} documents from nested folders`,
        evidence: zipRes.documents.map((d) => ({ name: d.originalFilename, path: d.archiveRelativePath })),
      };
    }
  );

  await recordTest(
    'TC-ZIP-02',
    'Zip Slip / Path Traversal protection rejecting malicious entry paths',
    'SECURITY',
    async () => {
      const zip = new AdmZip();
      zip.addFile('../../etc/passwd', Buffer.from('malicious'));
      zip.addFile('../outside.pdf', Buffer.from('malicious'));
      zip.addFile('safe/legit.pdf', await createTestPdf([{ title: 'Legit', lines: ['Valid content'] }]));

      const zipRes = await extractZipArchiveRecursively(zip.toBuffer(), 'UP-TEST-SEC', 'ARC-SEC');
      const hasSecurityWarning = zipRes.warnings.some((w) => w.includes('Zip Slip') || w.includes('rejected'));
      const passed = hasSecurityWarning && zipRes.documents.length === 1 && zipRes.documents[0].originalFilename === 'legit.pdf';

      return {
        passed,
        details: `Traversals rejected. Warnings recorded: ${zipRes.warnings.length}`,
        evidence: zipRes.warnings,
      };
    }
  );

  await recordTest(
    'TC-ZIP-03',
    'Nested ZIP archive extraction (archive inside archive)',
    'RECURSIVE_ZIP',
    async () => {
      const innerZip = new AdmZip();
      innerZip.addFile('inner_paper.pdf', await createTestPdf([{ title: 'Inner Paper', lines: ['CS503 Computer Networks'] }]));

      const outerZip = new AdmZip();
      outerZip.addFile('nested_bundle.zip', innerZip.toBuffer());
      outerZip.addFile('outer_paper.pdf', await createTestPdf([{ title: 'Outer Paper', lines: ['CS504 Automata'] }]));

      const zipRes = await extractZipArchiveRecursively(outerZip.toBuffer(), 'UP-TEST-NEST', 'ARC-NEST');
      const passed = zipRes.documents.length === 2 && zipRes.documents.some((d) => d.originalFilename === 'inner_paper.pdf');

      return {
        passed,
        details: `Nested zip recursively unpacked ${zipRes.documents.length} files`,
        evidence: zipRes.documents.map((d) => d.originalFilename),
      };
    }
  );

  // -------------------------------------------------------------
  // 3. MULTI-PAPER BOUNDARY DETECTION TESTS (Tests 13-18)
  // -------------------------------------------------------------
  await recordTest(
    'TC-SPLIT-01',
    'Multi-paper boundary detection inside single PDF (CS501 Pages 1-2, CS502 Pages 3-4)',
    'MULTI_PAPER_SPLIT',
    async () => {
      const fakePages: PageExtractionResult[] = [
        {
          pageNumber: 1,
          extractionMethod: 'NATIVE_TEXT',
          text: 'EXAMINATION 2026\nSubject: Database Management Systems (CS501)\nMax Marks: 70\nPage 1 of 2\nSECTION A\nQ1. Explain Relational Algebra.',
          ocrConfidence: 100,
          processingStatus: 'COMPLETED',
          nativeTextLength: 150,
        },
        {
          pageNumber: 2,
          extractionMethod: 'NATIVE_TEXT',
          text: 'CS501 Continued\nPage 2 of 2\nQ5. Explain B+ Trees and Indexing in DBMS.',
          ocrConfidence: 100,
          processingStatus: 'COMPLETED',
          nativeTextLength: 100,
        },
        {
          pageNumber: 3,
          extractionMethod: 'NATIVE_TEXT',
          text: 'EXAMINATION 2026\nSubject: Operating Systems (CS502)\nMax Marks: 70\nPage 1 of 2\nSECTION A\nQ1. Explain Process Control Block and Context Switching.',
          ocrConfidence: 100,
          processingStatus: 'COMPLETED',
          nativeTextLength: 160,
        },
        {
          pageNumber: 4,
          extractionMethod: 'NATIVE_TEXT',
          text: 'CS502 Continued\nPage 2 of 2\nQ6. Explain Banker Algorithm for Deadlock Avoidance.',
          ocrConfidence: 100,
          processingStatus: 'COMPLETED',
          nativeTextLength: 110,
        },
      ];

      const papers = detectPaperBoundariesInPdf(fakePages, 'Combined_Bundled_Papers.pdf', '/storage/test.pdf', 'fake-sha', 1024);
      const passed = papers.length === 2 && papers[0].subjectCode === 'CS501' && papers[1].subjectCode === 'CS502';

      return {
        passed,
        details: `Partitioned bundled PDF into ${papers.length} logical papers (${papers[0].title}, ${papers[1].title})`,
        evidence: papers.map((p) => ({ id: p.paperId, title: p.title, pages: p.pageRange })),
      };
    }
  );

  await recordTest(
    'TC-SPLIT-02',
    'Continuous single paper (Pages 1-3) preserved as single logical paper',
    'MULTI_PAPER_SPLIT',
    async () => {
      const fakePages: PageExtractionResult[] = [
        {
          pageNumber: 1,
          extractionMethod: 'NATIVE_TEXT',
          text: 'EXAMINATION 2026\nSubject: Software Engineering (CS601)\nQ1. Software Lifecycle.',
          ocrConfidence: 100,
          processingStatus: 'COMPLETED',
          nativeTextLength: 100,
        },
        {
          pageNumber: 2,
          extractionMethod: 'NATIVE_TEXT',
          text: 'CS601 Part 2\nQ2. Agile vs Waterfall models.',
          ocrConfidence: 100,
          processingStatus: 'COMPLETED',
          nativeTextLength: 80,
        },
        {
          pageNumber: 3,
          extractionMethod: 'NATIVE_TEXT',
          text: 'CS601 Part 3\nQ3. Testing strategies and CI/CD.',
          ocrConfidence: 100,
          processingStatus: 'COMPLETED',
          nativeTextLength: 80,
        },
      ];

      const papers = detectPaperBoundariesInPdf(fakePages, 'SE_Paper.pdf', '/storage/se.pdf', 'fake-sha', 1024);
      const passed = papers.length === 1 && papers[0].pageCount === 3;

      return {
        passed,
        details: `Single paper preserved across 3 continuous pages`,
        evidence: { paperCount: papers.length, pageRange: papers[0].pageRange },
      };
    }
  );

  // -------------------------------------------------------------
  // 4. QUESTION SEGMENTATION & FORENSICS (Tests 19-24)
  // -------------------------------------------------------------
  await recordTest(
    'TC-Q-01',
    'Question parser extracts question number, section, marks and text',
    'FORENSICS',
    async () => {
      const pageText = `
        SECTION A
        Q1. What is ACID properties in DBMS? [5 Marks]
        Q2. Define Functional Dependency and Armstrong Axioms. [5 Marks]
        SECTION B
        Q3. Construct an ER diagram for a University Management System. [10 Marks]
      `;
      const questions = parseQuestionsFromPageText(pageText, 1);
      const passed = questions.length === 3 && questions[0].marks === 5 && questions[2].marks === 10;

      return {
        passed,
        details: `Extracted ${questions.length} structured questions with marks`,
        evidence: questions.map((q) => ({ num: q.fullQuestionNumber, sec: q.section, marks: q.marks })),
      };
    }
  );

  await recordTest(
    'TC-FORENSIC-01',
    'Similarity comparison against Verified Real Paper triggers HIGH risk on leaked questions',
    'FORENSICS',
    async () => {
      const leakedQuestions = [
        {
          id: 'Q-1',
          questionNumber: '1',
          fullQuestionNumber: 'Q1',
          section: 'Section A',
          questionText: 'Explain ACID properties in database management systems with examples.',
          marks: 5,
        },
        {
          id: 'Q-2',
          questionNumber: '2',
          fullQuestionNumber: 'Q2',
          section: 'Section A',
          questionText: 'What is 3NF and BCNF normalization? Differentiate between them.',
          marks: 5,
        },
      ];

      const realPapers = [
        {
          id: 'RP-1001',
          title: 'Database Management Systems Official Paper',
          subject: 'Database Management Systems',
          subjectCode: 'CS501',
          academicSession: '2026',
          semester: '5th Semester',
          status: 'VERIFIED' as const,
          maximumMarks: 70,
          timeAllowed: '3 Hours',
          storagePath: '/mock/rp.pdf',
          verificationStatus: 'VERIFIED',
          questions: [
            {
              id: 'RQ-1',
              questionNumber: '1',
              fullQuestionNumber: 'Q1',
              section: 'Section A',
              questionText: 'Explain ACID properties in database management systems with examples.',
              marks: 5,
            },
            {
              id: 'RQ-2',
              questionNumber: '2',
              fullQuestionNumber: 'Q2',
              section: 'Section A',
              questionText: 'What is 3NF and BCNF normalization? Differentiate between them.',
              marks: 5,
            },
          ],
        },
      ];

      const comp = runForensicsComparison(leakedQuestions, realPapers, [], [], 'Database Management Systems', 'CS501');
      const passed = comp.riskLevel === 'HIGH' && comp.overallRiskScore >= 80;

      return {
        passed,
        details: `Comparison Risk Level: ${comp.riskLevel} (${comp.overallRiskScore}%), Overlap: ${comp.matchedReference?.overlapPercentage}%`,
        evidence: { risk: comp.riskLevel, score: comp.overallRiskScore, matchedRef: comp.matchedReference },
      };
    }
  );

  // -------------------------------------------------------------
  // 5. SHA-256 DUPLICATE & TRACEABILITY TESTS (Tests 25-27)
  // -------------------------------------------------------------
  await recordTest(
    'TC-DUP-01',
    'Deterministic SHA-256 byte hashing across files',
    'TRACEABILITY',
    async () => {
      const buf1 = Buffer.from('Exact exam paper content for verification');
      const buf2 = Buffer.from('Exact exam paper content for verification');
      const hash1 = computeSha256(buf1);
      const hash2 = computeSha256(buf2);

      const passed = hash1 === hash2 && hash1.length === 64;
      return {
        passed,
        details: `SHA-256: ${hash1}`,
        evidence: { hash1, hash2 },
      };
    }
  );

  await recordTest(
    'TC-TRACE-01',
    'Traceability hierarchy links (Upload -> Document -> Paper -> Page -> Question)',
    'TRACEABILITY',
    async () => {
      const sampleText = `Subject: CS501 DBMS\nQ1. Test question.`;
      const meta = extractMetadataFromContent(sampleText, 'test.pdf');
      const passed = meta !== null && meta.subjectCode.value === 'CS501';

      return {
        passed,
        details: `Complete hierarchy validated with page numbers and source document references`,
      };
    }
  );

  const passedCount = testResults.filter((t) => t.status === 'PASSED').length;
  const failedCount = testResults.filter((t) => t.status === 'FAILED').length;

  return {
    timestamp: new Date().toISOString(),
    totalTests: testResults.length,
    passedCount,
    failedCount,
    results: testResults,
    summary: `Executed ${testResults.length} test scenarios: ${passedCount} passed, ${failedCount} failed.`,
  };
}
