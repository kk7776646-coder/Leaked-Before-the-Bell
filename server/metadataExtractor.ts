import path from 'path';
import { AutoExtractedMetadata, ExtractedMetadataField } from './types';
import { db } from './db';

// High-frequency known subject dictionary for regex normalization
const KNOWN_SUBJECTS: { code: string; name: string; aliases: string[] }[] = [
  {
    code: 'CS501',
    name: 'Database Management Systems',
    aliases: ['DBMS', 'Database Systems', 'Database Management', 'RDBMS'],
  },
  {
    code: 'CS502',
    name: 'Operating Systems',
    aliases: ['OS', 'Operating System', 'System Programming'],
  },
  {
    code: 'CS503',
    name: 'Computer Networks',
    aliases: ['Networks', 'Data Communications and Networking', 'CN'],
  },
  {
    code: 'CS504',
    name: 'Theory of Computation',
    aliases: ['Automata Theory', 'TOC', 'Formal Languages and Automata'],
  },
  {
    code: 'CS601',
    name: 'Software Engineering',
    aliases: ['Software Design & Architecture', 'SE'],
  },
  {
    code: 'CS602',
    name: 'Compiler Design',
    aliases: ['Compilers', 'Compiler Construction', 'CD'],
  },
  {
    code: 'CS603',
    name: 'Artificial Intelligence',
    aliases: ['AI', 'Machine Intelligence', 'Intro to AI'],
  },
  {
    code: 'CS604',
    name: 'Computer Graphics',
    aliases: ['Graphics and Visualization', 'CG'],
  },
  {
    code: 'MATH201',
    name: 'Advanced Engineering Mathematics',
    aliases: ['Engineering Mathematics II', 'Adv Math', 'Applied Mathematics'],
  },
  {
    code: 'MATH101',
    name: 'Calculus and Linear Algebra',
    aliases: ['Engineering Mathematics I', 'Calculus'],
  },
  {
    code: 'PHY101',
    name: 'Engineering Physics',
    aliases: ['Physics', 'Applied Physics'],
  },
  {
    code: 'CHEM101',
    name: 'Engineering Chemistry',
    aliases: ['Chemistry', 'Applied Chemistry'],
  },
  {
    code: 'EE201',
    name: 'Basic Electrical & Electronics Engineering',
    aliases: ['BEEE', 'Electrical Engineering', 'Basic Electricals'],
  },
  {
    code: 'EC302',
    name: 'Digital Electronics & Logic Design',
    aliases: ['Digital Logic', 'Digital Circuits', 'DELD'],
  },
];

function createNotDetectedField<T>(fallbackValue: T, notes = 'Not detected in document content or metadata.'): ExtractedMetadataField<T> {
  return {
    value: fallbackValue,
    confidence: 0.0,
    confidenceLevel: 'LOW',
    source: 'NOT_DETECTED',
    notes,
  };
}

export function extractMetadataFromContent(
  text: string,
  filename: string,
  options?: {
    firstPageText?: string;
    folderPath?: string;
    pdfMetadata?: Record<string, any>;
  }
): AutoExtractedMetadata {
  const headerText = (options?.firstPageText || text.slice(0, 1500) || '').trim();
  const cleanFilename = path.basename(filename || '', path.extname(filename || ''));
  const folderContext = options?.folderPath || '';

  // Get active exam metadata for cross-referencing & ground truth boosting
  const activeExams = db.getExamMetadata({ status: 'ACTIVE' });
  const realPapers = db.getRealPapers({ status: 'VERIFIED' });

  // 1. EXTRACT SUBJECT CODE
  let detectedSubjectCode: ExtractedMetadataField<string> | null = null;

  // Patterns like CS501, CS-501, MATH201, EC-302, CS 501, EX-2026-CS501
  const codeRegexes = [
    /\b([A-Z]{2,5})\s*[-_]?\s*([0-9]{3,4}[A-Z]?)\b/i,
    /(?:Paper Code|Subject Code|Course Code|Code)\s*[:=-]?\s*([A-Z0-9\-_]{4,10})/i,
  ];

  // First search in header text
  for (const regex of codeRegexes) {
    const match = headerText.match(regex);
    if (match) {
      const rawCode = (match[1] && match[2] ? `${match[1].toUpperCase()}${match[2].toUpperCase()}` : match[1]).replace(/[\s_-]/g, '');
      if (rawCode.length >= 4 && rawCode.length <= 10) {
        detectedSubjectCode = {
          value: rawCode,
          confidence: 0.94,
          confidenceLevel: 'HIGH',
          source: 'DOCUMENT_HEADER',
          notes: `Detected from document header: '${match[0]}'`,
        };
        break;
      }
    }
  }

  // Next search full text if not found
  if (!detectedSubjectCode && text) {
    for (const regex of codeRegexes) {
      const match = text.slice(0, 3000).match(regex);
      if (match) {
        const rawCode = (match[1] && match[2] ? `${match[1].toUpperCase()}${match[2].toUpperCase()}` : match[1]).replace(/[\s_-]/g, '');
        if (rawCode.length >= 4 && rawCode.length <= 10) {
          detectedSubjectCode = {
            value: rawCode,
            confidence: 0.86,
            confidenceLevel: 'HIGH',
            source: 'OCR_TEXT',
            notes: `Extracted from document body text.`,
          };
          break;
        }
      }
    }
  }

  // Supporting evidence from filename / folder
  if (!detectedSubjectCode && (cleanFilename || folderContext)) {
    const combinedPath = `${cleanFilename} ${folderContext}`;
    for (const regex of codeRegexes) {
      const match = combinedPath.match(regex);
      if (match) {
        const rawCode = (match[1] && match[2] ? `${match[1].toUpperCase()}${match[2].toUpperCase()}` : match[1]).replace(/[\s_-]/g, '');
        detectedSubjectCode = {
          value: rawCode,
          confidence: 0.65,
          confidenceLevel: 'MEDIUM',
          source: 'FILENAME',
          notes: `Inferred from filename structure '${cleanFilename}' (Supporting evidence)`,
        };
        break;
      }
    }
  }

  // 2. EXTRACT SUBJECT NAME
  let detectedSubject: ExtractedMetadataField<string> | null = null;
  let matchedExamId: string | undefined;

  // Cross-reference detected code with known exams or real papers
  if (detectedSubjectCode) {
    const code = detectedSubjectCode.value.toUpperCase();
    const matchedExam = activeExams.find(
      (e) => e.subjectCode.replace(/[\s_-]/g, '').toUpperCase() === code
    );
    if (matchedExam) {
      matchedExamId = matchedExam.id;
      detectedSubject = {
        value: matchedExam.subject,
        confidence: 0.98,
        confidenceLevel: 'HIGH',
        source: 'EXAM_METADATA_MATCH',
        notes: `Verified match against Active Examination Registry (${matchedExam.subjectCode})`,
      };
    } else {
      const matchedRP = realPapers.find(
        (rp) => rp.subjectCode.replace(/[\s_-]/g, '').toUpperCase() === code
      );
      if (matchedRP) {
        detectedSubject = {
          value: matchedRP.subject,
          confidence: 0.95,
          confidenceLevel: 'HIGH',
          source: 'HISTORICAL_MATCH',
          notes: `Matched against Verified Reference Paper Baseline`,
        };
      } else {
        const dictionaryMatch = KNOWN_SUBJECTS.find(
          (s) => s.code.replace(/[\s_-]/g, '').toUpperCase() === code
        );
        if (dictionaryMatch) {
          detectedSubject = {
            value: dictionaryMatch.name,
            confidence: 0.92,
            confidenceLevel: 'HIGH',
            source: 'DOCUMENT_HEADER',
            notes: `Resolved from standard academic subject catalog (${dictionaryMatch.code})`,
          };
        }
      }
    }
  }

  // If subject name still not found, search text patterns like "Subject: ...", "Course: ..."
  if (!detectedSubject) {
    const subjectPatterns = [
      /(?:Subject|Course|Paper Title|Title)\s*[:=-]\s*([A-Za-z0-9\s&,/-]{4,40})(?:\n|\r|Time|Max|Date|Semester)/i,
      /\b(?:B\.?Tech|B\.?E|B\.?Sc|M\.?Tech)\s+([A-Za-z0-9\s&]{4,35})\s+(?:Examination|Semester)/i,
    ];

    for (const pat of subjectPatterns) {
      const match = headerText.match(pat);
      if (match && match[1]) {
        const cleanedSub = match[1].trim().replace(/\s{2,}/g, ' ');
        if (cleanedSub.length >= 4 && !/^(General|Exam|Time|Date|Marks|Semester)$/i.test(cleanedSub)) {
          detectedSubject = {
            value: cleanedSub,
            confidence: 0.85,
            confidenceLevel: 'HIGH',
            source: 'DOCUMENT_HEADER',
            notes: `Extracted from header title line.`,
          };
          break;
        }
      }
    }

    // Match dictionary aliases in text
    if (!detectedSubject) {
      for (const known of KNOWN_SUBJECTS) {
        if (new RegExp(`\\b${known.name}\\b`, 'i').test(text.slice(0, 2000))) {
          detectedSubject = {
            value: known.name,
            confidence: 0.88,
            confidenceLevel: 'HIGH',
            source: 'OCR_TEXT',
            notes: `Identified subject title '${known.name}' in document text`,
          };
          if (!detectedSubjectCode) {
            detectedSubjectCode = {
              value: known.code,
              confidence: 0.82,
              confidenceLevel: 'MEDIUM',
              source: 'OCR_TEXT',
              notes: `Inferred standard subject code for ${known.name}`,
            };
          }
          break;
        }
        for (const alias of known.aliases) {
          if (new RegExp(`\\b${alias}\\b`, 'i').test(headerText)) {
            detectedSubject = {
              value: known.name,
              confidence: 0.78,
              confidenceLevel: 'MEDIUM',
              source: 'OCR_TEXT',
              notes: `Identified subject alias '${alias}' in header`,
            };
            break;
          }
        }
        if (detectedSubject) break;
      }
    }
  }

  // 3. EXTRACT MAXIMUM MARKS
  let detectedMaxMarks: ExtractedMetadataField<number> | null = null;
  const marksRegexes = [
    /(?:Max(?:imum)?\.?\s*Marks?|Total\s*Marks?|M\.?M\.?)\s*[:=-]?\s*([0-9]{2,3})/i,
    /\[\s*Max\.?\s*Marks?\s*:\s*([0-9]{2,3})\s*\]/i,
    /(?:Marks?|Pts?)\s*[:=-]?\s*([0-9]{2,3})/i,
  ];

  for (const regex of marksRegexes) {
    const match = headerText.match(regex);
    if (match && match[1]) {
      const marksVal = parseInt(match[1], 10);
      if (marksVal >= 20 && marksVal <= 300) {
        detectedMaxMarks = {
          value: marksVal,
          confidence: 0.94,
          confidenceLevel: 'HIGH',
          source: 'DOCUMENT_HEADER',
          notes: `Explicit maximum marks header '${match[0]}'`,
        };
        break;
      }
    }
  }

  // 4. EXTRACT DURATION
  let detectedDuration: ExtractedMetadataField<string> | null = null;
  const durationRegexes = [
    /(?:Time(?:\s*Allowed)?|Duration)\s*[:=-]?\s*([0-9]+(?:\.[0-9]+)?\s*(?:Hours?|Hrs?|Minutes?|Mins?))/i,
    /([0-9]+(?:\.[0-9]+)?\s*(?:Hours?|Hrs?))\s*(?:Duration|Time)/i,
    /([0-9]{2,3}\s*Minutes?)/i,
  ];

  for (const regex of durationRegexes) {
    const match = headerText.match(regex);
    if (match && match[1]) {
      let durStr = match[1].trim();
      if (/hrs?$/i.test(durStr)) durStr = durStr.replace(/hrs?$/i, 'Hours');
      detectedDuration = {
        value: durStr,
        confidence: 0.92,
        confidenceLevel: 'HIGH',
        source: 'DOCUMENT_HEADER',
        notes: `Detected examination time allowance '${match[0]}'`,
      };
      break;
    }
  }

  // 5. EXTRACT SEMESTER
  let detectedSemester: ExtractedMetadataField<string> | null = null;
  const semRegexes = [
    /(?:Semester|Sem\.?)\s*[-:]?\s*([0-9IVX]+(?:st|nd|rd|th)?|\b[IVX]{1,4}\b)/i,
    /([0-9](?:st|nd|rd|th))\s+Semester/i,
    /(?:Fall|Spring|Summer|Autumn)\s+([0-9]{4})/i,
  ];

  for (const regex of semRegexes) {
    const match = headerText.match(regex);
    if (match) {
      let semVal = match[1].trim();
      // Normalize Roman/digit semester
      if (/^5th?$/i.test(semVal) || semVal.toUpperCase() === 'V') semVal = 'Semester V (5th)';
      else if (/^6th?$/i.test(semVal) || semVal.toUpperCase() === 'VI') semVal = 'Semester VI (6th)';
      else if (/^7th?$/i.test(semVal) || semVal.toUpperCase() === 'VII') semVal = 'Semester VII (7th)';
      else if (/^8th?$/i.test(semVal) || semVal.toUpperCase() === 'VIII') semVal = 'Semester VIII (8th)';
      else if (/^3rd?$/i.test(semVal) || semVal.toUpperCase() === 'III') semVal = 'Semester III (3rd)';
      else if (/^4th?$/i.test(semVal) || semVal.toUpperCase() === 'IV') semVal = 'Semester IV (4th)';
      else if (/^1st?$/i.test(semVal) || semVal.toUpperCase() === 'I') semVal = 'Semester I (1st)';
      else if (/^2nd?$/i.test(semVal) || semVal.toUpperCase() === 'II') semVal = 'Semester II (2nd)';
      else if (!semVal.toLowerCase().includes('semester')) semVal = `Semester ${semVal}`;

      detectedSemester = {
        value: semVal,
        confidence: 0.93,
        confidenceLevel: 'HIGH',
        source: 'DOCUMENT_HEADER',
        notes: `Extracted academic semester '${match[0]}'`,
      };
      break;
    }
  }

  // 6. EXTRACT EXAM DATE
  let detectedExamDate: ExtractedMetadataField<string> | null = null;
  const dateRegexes = [
    /(?:Date(?:\s*of\s*Exam)?|Examination\s*Date|Date)\s*[:=-]?\s*([0-9]{1,2}[-/.][0-9]{1,2}[-/.][0-9]{2,4})/i,
    /(?:Date|Dated)\s*[:=-]?\s*([0-9]{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+[0-9]{2,4})/i,
    /([0-9]{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+202[0-9])/i,
    /\b(202[0-9]-[0-9]{2}-[0-9]{2})\b/,
  ];

  for (const regex of dateRegexes) {
    const match = headerText.match(regex);
    if (match && match[1]) {
      detectedExamDate = {
        value: match[1].trim(),
        confidence: 0.89,
        confidenceLevel: 'HIGH',
        source: 'DOCUMENT_HEADER',
        notes: `Explicit examination date stamp '${match[0]}'`,
      };
      break;
    }
  }

  // 7. EXTRACT YEAR
  let detectedYear: ExtractedMetadataField<number | string> | null = null;
  const yearMatch = headerText.match(/\b(202[3-9]|203[0-5])\b/);
  if (yearMatch) {
    detectedYear = {
      value: parseInt(yearMatch[1], 10),
      confidence: 0.95,
      confidenceLevel: 'HIGH',
      source: 'DOCUMENT_HEADER',
      notes: `Extracted calendar examination year ${yearMatch[1]}`,
    };
  } else if (cleanFilename.match(/\b(202[3-9]|203[0-5])\b/)) {
    const fnYearMatch = cleanFilename.match(/\b(202[3-9]|203[0-5])\b/)!;
    detectedYear = {
      value: parseInt(fnYearMatch[1], 10),
      confidence: 0.70,
      confidenceLevel: 'MEDIUM',
      source: 'FILENAME',
      notes: `Inferred from filename ${cleanFilename}`,
    };
  }

  // 8. EXTRACT EXAM TYPE
  let detectedExamType: ExtractedMetadataField<string> | null = null;
  if (/Mid[- ]?Term|Mid[- ]?Semester|Continuous Evaluation|Sessional|Quiz/i.test(headerText)) {
    detectedExamType = {
      value: 'Midterm Examination',
      confidence: 0.93,
      confidenceLevel: 'HIGH',
      source: 'DOCUMENT_HEADER',
    };
  } else if (/End[- ]?Term|End[- ]?Semester|Final Examination|Regular End-Term|University Examination/i.test(headerText)) {
    detectedExamType = {
      value: 'End-Semester Final Examination',
      confidence: 0.95,
      confidenceLevel: 'HIGH',
      source: 'DOCUMENT_HEADER',
    };
  } else if (/Supplementary|Backlog|Improvement|Special/i.test(headerText)) {
    detectedExamType = {
      value: 'Supplementary / Backlog Examination',
      confidence: 0.90,
      confidenceLevel: 'HIGH',
      source: 'DOCUMENT_HEADER',
    };
  }

  // 9. EXTRACT PAPER TYPE & SECTION COUNT
  let sectionCount = 0;
  const sectionMatches = text.match(/\b(?:SECTION|PART)\s+([A-Z0-9IVX]+)\b/gi);
  if (sectionMatches) {
    const uniqueSections = new Set(sectionMatches.map((s) => s.toUpperCase().trim()));
    sectionCount = uniqueSections.size;
  }

  // 10. EXTRACT SET / VARIANT (Set A, Set B, Variant 1, etc.)
  let detectedSet: ExtractedMetadataField<string> | null = null;
  const setMatch = headerText.match(/\b(?:SET|CODE|SERIES|VARIANT)\s*[:=-]?\s*([A-D0-9IVX]{1,3})\b/i);
  if (setMatch) {
    detectedSet = {
      value: `Set ${setMatch[1].toUpperCase()}`,
      confidence: 0.91,
      confidenceLevel: 'HIGH',
      source: 'DOCUMENT_HEADER',
    };
  }

  // 11. QUESTION COUNT
  const qMatches = text.match(/(?:Question|Q\.?|Q)\s*[0-9]+[.:)]/gi);
  const detectedQCount = qMatches ? Math.min(60, qMatches.length) : 0;

  // Cross-fill missing fields from matched active exam metadata if available
  if (matchedExamId) {
    const activeExam = activeExams.find((e) => e.id === matchedExamId);
    if (activeExam) {
      if (!detectedMaxMarks) {
        detectedMaxMarks = {
          value: activeExam.maxMarks,
          confidence: 0.92,
          confidenceLevel: 'HIGH',
          source: 'EXAM_METADATA_MATCH',
          notes: `Auto-filled from matched exam schedule (${activeExam.maxMarks} Marks)`,
        };
      }
      if (!detectedDuration) {
        detectedDuration = {
          value: activeExam.duration,
          confidence: 0.90,
          confidenceLevel: 'HIGH',
          source: 'EXAM_METADATA_MATCH',
          notes: `Auto-filled from matched exam schedule (${activeExam.duration})`,
        };
      }
      if (!detectedExamDate) {
        detectedExamDate = {
          value: activeExam.examDate,
          confidence: 0.88,
          confidenceLevel: 'HIGH',
          source: 'EXAM_METADATA_MATCH',
          notes: `Scheduled date from active exam metadata: ${activeExam.examDate}`,
        };
      }
      if (!detectedSemester && activeExam.semester) {
        detectedSemester = {
          value: activeExam.semester,
          confidence: 0.90,
          confidenceLevel: 'HIGH',
          source: 'EXAM_METADATA_MATCH',
        };
      }
    }
  }

  // Fallbacks with explicit NOT_DETECTED representation
  return {
    subject: detectedSubject || createNotDetectedField('Not detected', 'Subject could not be reliably determined from document header or text.'),
    subjectCode: detectedSubjectCode || createNotDetectedField('Not detected', 'Subject code not found.'),
    examDate: detectedExamDate || createNotDetectedField('Not detected', 'Examination date stamp not detected.'),
    semester: detectedSemester || createNotDetectedField('Not detected', 'Academic semester not detected.'),
    year: detectedYear || createNotDetectedField(new Date().getFullYear(), 'Calendar year not detected; defaulting to current session.'),
    examType: detectedExamType || {
      value: 'Question Paper',
      confidence: 0.75,
      confidenceLevel: 'MEDIUM',
      source: 'DOCUMENT_HEADER',
    },
    paperType: {
      value: 'Question Paper',
      confidence: 0.95,
      confidenceLevel: 'HIGH',
      source: 'DOCUMENT_HEADER',
    },
    courseOrProgram: {
      value: headerText.includes('B.Tech') ? 'B.Tech / Undergraduate' : 'General Degree Program',
      confidence: headerText.includes('B.Tech') ? 0.88 : 0.60,
      confidenceLevel: headerText.includes('B.Tech') ? 'HIGH' : 'MEDIUM',
      source: 'DOCUMENT_HEADER',
    },
    maxMarks: detectedMaxMarks || createNotDetectedField(100, 'Max marks not explicitly printed.'),
    duration: detectedDuration || createNotDetectedField('3 Hours', 'Duration not explicitly printed.'),
    sectionCount: {
      value: sectionCount || 1,
      confidence: sectionCount > 0 ? 0.90 : 0.60,
      confidenceLevel: sectionCount > 0 ? 'HIGH' : 'LOW',
      source: 'OCR_TEXT',
    },
    questionCount: {
      value: detectedQCount,
      confidence: detectedQCount > 0 ? 0.85 : 0.40,
      confidenceLevel: detectedQCount > 0 ? 'HIGH' : 'LOW',
      source: 'OCR_TEXT',
    },
    academicSession: {
      value: detectedYear ? `${detectedYear.value}-${Number(detectedYear.value) + 1}` : '2026-2027',
      confidence: 0.80,
      confidenceLevel: 'MEDIUM',
      source: 'DOCUMENT_HEADER',
    },
    paperNumber: {
      value: 'Paper I',
      confidence: 0.70,
      confidenceLevel: 'MEDIUM',
      source: 'DOCUMENT_HEADER',
    },
    setVariant: detectedSet || createNotDetectedField('Standard', 'Set/Variant not specified.'),
    chiefExaminer: matchedExamId ? {
      value: activeExams.find((e) => e.id === matchedExamId)?.chiefExaminer || 'Chief Examiner',
      confidence: 0.95,
      confidenceLevel: 'HIGH',
      source: 'EXAM_METADATA_MATCH',
    } : undefined,
    matchedExamId,
  };
}
