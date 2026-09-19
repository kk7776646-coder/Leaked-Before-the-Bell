import { Candidate } from '../types/candidate';

export const mockCandidates: Candidate[] = [
  {
    id: 'LB-1042',
    subject: 'Advanced Organic Chemistry II',
    subjectCode: 'CHEM-402',
    documentType: 'Mobile Photo',
    detectedTime: '12 mins ago (07:18 AM)',
    riskScore: 94,
    riskLevel: 'HIGH',
    reviewStatus: 'UNREVIEWED',
    source: 'Public Web Scan (Telegram Channel @EduExams_Archive)',
    ocrText: `NATIONAL EXAMINATION BOARD - SPRING 2026
COURSE: ADVANCED ORGANIC CHEMISTRY II (CHEM-402)
MAX MARKS: 100 | TIME ALLOWED: 3 HOURS
INSTRUCTIONS:
1. Answer all questions from Section A and any three from Section B.
2. Draw clear reaction mechanisms using standard curved arrows.

SECTION A (40 Marks)
Q1. (a) Predict the major stereochemical outcome of the Diels-Alder reaction between (2E,4E)-hexa-2,4-diene and maleic anhydride under thermal conditions. Detail endo vs exo selectivity. [8 Marks]
(b) Outline the mechanism for the Suzuki-Miyaura cross-coupling reaction using Pd(PPh3)4 as catalyst. Highlight transmetalation step. [8 Marks]
(c) Synthesize 4-nitrobenzoic acid starting from benzene in high yield. [8 Marks]

SECTION B (60 Marks)
Q2. Detail the total synthesis pathway of Erythromycin core using Woodward stereocontrol principles...`,
    metadata: {
      semester: 'Spring 2026',
      examDate: '2026-05-18',
      session: 'Morning (09:00 AM)',
      maxMarks: 100,
      duration: '3 Hours',
      pages: 4,
    },
    structure: {
      sections: 2,
      questionCount: 8,
      marksDistribution: '40 / 60',
      instructionPattern: 'Exact match with official Spring 2026 template v3.2',
    },
    riskBreakdown: [
      {
        category: 'Text & Terminology Similarity',
        name: 'Question Text Overlap',
        score: 98,
        level: 'High',
        description: '98% character-for-character match with master question repository file "CHEM402_Final_v2.docx".',
      },
      {
        category: 'Structural Alignment',
        name: 'Header & Section Layout',
        score: 92,
        level: 'High',
        description: 'Section distribution, mark allocations, and font margins match authentic paper layout grid.',
      },
      {
        category: 'Temporal Anomaly',
        name: 'Early Release Window',
        score: 95,
        level: 'High',
        description: 'Document indexed 1 hour 42 minutes before official distribution time (09:00 AM).',
      },
      {
        category: 'Metadata Footprint',
        name: 'EXIF / File Fingerprint',
        score: 85,
        level: 'High',
        description: 'Mobile photo captured via iOS camera with modified timestamp header.',
      },
    ],
    evidence: [
      {
        id: 'EV-8801',
        title: 'Verbatim Question Match',
        type: 'OCR Match',
        timestamp: '07:18:22 AM',
        detail: 'Q1(a) and Q1(b) contain identical phrasing to non-public Master Exam Repository draft #3.',
        confidence: 0.98,
      },
      {
        id: 'EV-8802',
        title: 'Timing Precedes Exam Session',
        type: 'Metadata Anomaly',
        timestamp: '07:19:05 AM',
        detail: 'Document surfaced on monitored external mirror 102 minutes before scheduled exam start.',
        confidence: 0.95,
      },
      {
        id: 'EV-8803',
        title: 'Watermark Pattern Variance',
        type: 'Structural Variance',
        timestamp: '07:20:11 AM',
        detail: 'Digital watermark ID "DEP-CENTRAL-09" matches printing facility dispatch bundle #4.',
        confidence: 0.89,
      },
    ],
    reviewerNotes: '',
    assignedReviewer: undefined,
  },
  {
    id: 'LB-1043',
    subject: 'Quantum Physics & Special Relativity',
    subjectCode: 'PHYS-301',
    documentType: 'PDF Document',
    detectedTime: '38 mins ago (06:52 AM)',
    riskScore: 88,
    riskLevel: 'HIGH',
    reviewStatus: 'UNDER_REVIEW',
    source: 'Monitored Cloud Storage Bucket (Mirror-Alpha-04)',
    ocrText: `DEPARTMENT OF PHYSICS - FINAL EXAMINATIONS
COURSE CODE: PHYS-301 | QUANTUM MECHANICS & RELATIVITY
SEMESTER: SPRING 2026 | TIME: 180 MINUTES

SECTION I: QUANTUM OPERATORS & WAVEFUNCTIONS
Q1. A particle of mass m is confined in a 1D infinite square well between x=0 and x=L.
(a) Derive the time-independent wavefunctions and normalized energy eigenvalues. [10 Marks]
(b) Calculate the probability of finding the particle in the interval [L/4, 3L/4] for n=2 state. [10 Marks]

SECTION II: SPECIAL RELATIVITY & FOUR-VECTORS
Q2. Two inertial reference frames S and S' move relative to each other along x-axis with constant velocity v.
(a) Derive the Lorentz transformation matrix for energy-momentum 4-vector (E/c, px, py, pz). [15 Marks]`,
    metadata: {
      semester: 'Spring 2026',
      examDate: '2026-05-18',
      session: 'Morning (09:00 AM)',
      maxMarks: 100,
      duration: '3 Hours',
      pages: 3,
    },
    structure: {
      sections: 2,
      questionCount: 6,
      marksDistribution: '50 / 50',
      instructionPattern: 'High visual similarity with Physics Dept Standard 2026',
    },
    riskBreakdown: [
      {
        category: 'Text & Terminology Similarity',
        name: 'Question Formulation Similarity',
        score: 91,
        level: 'High',
        description: 'Key physics equations and question structure match confidential 2026 exam set B.',
      },
      {
        category: 'Structural Alignment',
        name: 'Typographic Layout',
        score: 86,
        level: 'High',
        description: 'LaTeX font selection (Computer Modern) and line spacing align with official compiler.',
      },
      {
        category: 'Temporal Anomaly',
        name: 'Timestamp Lead',
        score: 87,
        level: 'High',
        description: 'Surfaced 2 hours prior to scheduled distribution.',
      },
    ],
    evidence: [
      {
        id: 'EV-8810',
        title: 'Formula String Match',
        type: 'OCR Match',
        timestamp: '06:53:10 AM',
        detail: 'LaTeX mathematical expression strings matched 91% with draft physics vault.',
        confidence: 0.91,
      },
      {
        id: 'EV-8811',
        title: 'File Creator Metadata',
        type: 'Metadata Anomaly',
        timestamp: '06:54:02 AM',
        detail: 'PDF Producer metadata indicates "pdftk / Ghostscript 9.54" matching internal print server.',
        confidence: 0.88,
      },
    ],
    reviewerNotes: 'Inspecting physics vault audit logs. Verification in progress.',
    assignedReviewer: 'Dr. Sarah Jenkins (Chief Security Analyst)',
  },
  {
    id: 'LB-1044',
    subject: 'Data Structures & Algorithms',
    subjectCode: 'CS-201',
    documentType: 'Scanned Image',
    detectedTime: '1 hour ago (06:30 AM)',
    riskScore: 62,
    riskLevel: 'REVIEW REQUIRED',
    reviewStatus: 'UNREVIEWED',
    source: 'Public Web Scanner (Forum Indexing)',
    ocrText: `COMPUTER SCIENCE DEPARTMENT - END TERM EXAM
CS-201: DATA STRUCTURES & ALGORITHMS
TIME: 2.5 HOURS | MARKS: 75

1. Implement an AVL Tree insertion algorithm with self-balancing rotation logic.
2. Explain Dijkstra vs Bellman-Ford algorithm complexity for graphs with negative weights.
3. Solve dynamic programming matrix chain multiplication problem for matrices A1(10x30), A2(30x5), A3(5x60).`,
    metadata: {
      semester: 'Spring 2026',
      examDate: '2026-05-18',
      session: 'Afternoon (02:00 PM)',
      maxMarks: 75,
      duration: '2.5 Hours',
      pages: 2,
    },
    structure: {
      sections: 1,
      questionCount: 5,
      marksDistribution: '75',
      instructionPattern: 'Partial match with standard practice paper collection',
    },
    riskBreakdown: [
      {
        category: 'Text & Terminology Similarity',
        name: 'Practice Problem Overlap',
        score: 64,
        level: 'Moderate',
        description: 'Substantial similarity with historical 2024 practice set; moderate similarity with current draft.',
      },
      {
        category: 'Structural Alignment',
        name: 'Page Geometry',
        score: 58,
        level: 'Moderate',
        description: 'Slight deviation in header margins and font sizes compared to official 2026 template.',
      },
      {
        category: 'Temporal Anomaly',
        name: 'Detection Lead',
        score: 65,
        level: 'Moderate',
        description: '7.5 hours prior to afternoon session.',
      },
    ],
    evidence: [
      {
        id: 'EV-8820',
        title: 'Historical Question Similarity',
        type: 'Historical Similarity',
        timestamp: '06:31:15 AM',
        detail: 'Dynamic programming matrix dimensions match 2024 Past Paper Q3.',
        confidence: 0.62,
      },
    ],
    reviewerNotes: '',
    assignedReviewer: undefined,
  },
  {
    id: 'LB-1045',
    subject: 'Microeconomics Theory III',
    subjectCode: 'ECON-305',
    documentType: 'Multi-page Scan',
    detectedTime: '2 hours ago (05:15 AM)',
    riskScore: 78,
    riskLevel: 'HIGH',
    reviewStatus: 'ESCALATED',
    source: 'Encrypted Media Vault Detection',
    ocrText: `SCHOOL OF ECONOMICS - SPRING 2026
COURSE: MICROECONOMICS III (ECON-305)
TOTAL MARKS: 100

PART I: GAME THEORY & NASH EQUILIBRIUM
Q1. Consider a two-player asymmetric game with incomplete information. Define the Bayesian Nash Equilibrium...
Q2. Calculate the Cournot duopoly equilibrium given inverse demand P(Q) = 200 - 2Q and cost C(q) = 20q...`,
    metadata: {
      semester: 'Spring 2026',
      examDate: '2026-05-18',
      session: 'Morning (09:00 AM)',
      maxMarks: 100,
      duration: '3 Hours',
      pages: 5,
    },
    structure: {
      sections: 3,
      questionCount: 9,
      marksDistribution: '30 / 40 / 30',
      instructionPattern: 'Exact structural match with sealed print room output',
    },
    riskBreakdown: [
      {
        category: 'Text & Terminology Similarity',
        name: 'Verbatim Match',
        score: 82,
        level: 'High',
        description: 'Numerical parameters in Q2 Cournot duopoly match final exam master copy.',
      },
      {
        category: 'Structural Alignment',
        name: 'Department Seal Watermark',
        score: 75,
        level: 'High',
        description: 'Official seal watermark visible on scanned page 1 background.',
      },
    ],
    evidence: [
      {
        id: 'EV-8830',
        title: 'Exact Numerical Values Match',
        type: 'OCR Match',
        timestamp: '05:16:00 AM',
        detail: 'Demand curve function P(Q) = 200 - 2Q is identical to locked exam master draft.',
        confidence: 0.88,
      },
    ],
    reviewerNotes: 'Escalated to Vice Chancellor Examination Security Committee for immediate embargo check.',
    assignedReviewer: 'Prof. Marcus Vance (Head Security Auditor)',
  },
  {
    id: 'LB-1046',
    subject: 'Digital Signal Processing',
    subjectCode: 'ECE-410',
    documentType: 'PDF Document',
    detectedTime: '3 hours ago (04:10 AM)',
    riskScore: 28,
    riskLevel: 'LOW',
    reviewStatus: 'DISMISSED',
    source: 'Student Portal Public Share (Drive)',
    ocrText: `DEPARTMENT OF ELECTRICAL ENGINEERING
PRACTICE SAMPLE PROBLEMS FOR DSP (ECE-410)
PROF. R. KUMAR - REVISION SHEET 2026

1. Compute N-point DFT of x[n] = a^n u[n] for 0 <= n < N.
2. Design a Butterworth low-pass filter with passband ripple <= 1 dB.`,
    metadata: {
      semester: 'Spring 2026',
      examDate: '2026-05-20',
      session: 'Morning (09:00 AM)',
      maxMarks: 50,
      duration: '2 Hours',
      pages: 2,
    },
    structure: {
      sections: 1,
      questionCount: 4,
      marksDistribution: '50',
      instructionPattern: 'Contains "PRACTICE SAMPLE PROBLEMS" header',
    },
    riskBreakdown: [
      {
        category: 'Text & Terminology Similarity',
        name: 'Public Practice Sheet',
        score: 25,
        level: 'Low',
        description: 'Verified public revision material distributed by course instructor 3 weeks ago.',
      },
    ],
    evidence: [
      {
        id: 'EV-8840',
        title: 'Public Assignment Match',
        type: 'Historical Similarity',
        timestamp: '04:11:00 AM',
        detail: 'Matched official syllabus homework #4 available on student portal.',
        confidence: 0.15,
      },
    ],
    reviewerNotes: 'Confirmed public practice paper distributed by professor. False alert dismissed.',
    assignedReviewer: 'System Auto-Evaluator',
  },
  {
    id: 'LB-1047',
    subject: 'Forensic Pathology & Toxicology',
    subjectCode: 'MED-502',
    documentType: 'Mobile Photo',
    detectedTime: '4 hours ago (03:22 AM)',
    riskScore: 91,
    riskLevel: 'HIGH',
    reviewStatus: 'VERIFIED',
    source: 'Encrypted Message Relay Monitor',
    ocrText: `FACULTY OF MEDICINE - FINAL BOARD EXAMINATIONS
MED-502: FORENSIC PATHOLOGY & TOXICOLOGY
CONFIDENTIAL - FOR PRINT ROOM USE ONLY

Q1. Describe asphyxial deaths in hanging vs strangulation with histopathological evidence...
Q2. Forensic analysis of organophosphate poisoning and post-mortem blood toxicological screening...`,
    metadata: {
      semester: 'Spring 2026',
      examDate: '2026-05-19',
      session: 'Morning (09:00 AM)',
      maxMarks: 100,
      duration: '3 Hours',
      pages: 3,
    },
    structure: {
      sections: 2,
      questionCount: 6,
      marksDistribution: '50 / 50',
      instructionPattern: 'Contains "CONFIDENTIAL - FOR PRINT ROOM USE ONLY" header text',
    },
    riskBreakdown: [
      {
        category: 'Text & Terminology Similarity',
        name: 'Header & Security Stamp Match',
        score: 96,
        level: 'High',
        description: 'Exact match with internal print-room watermark and security stamp code.',
      },
    ],
    evidence: [
      {
        id: 'EV-8850',
        title: 'Print Room Stamp Detection',
        type: 'Structural Variance',
        timestamp: '03:23:10 AM',
        detail: 'Security stamp #MED-PR-2026 identified in upper margin.',
        confidence: 0.96,
      },
    ],
    reviewerNotes: 'Verified potential leak of confidential medical board paper. Paper set replacement initiated.',
    assignedReviewer: 'Dr. Sarah Jenkins',
  },
];
