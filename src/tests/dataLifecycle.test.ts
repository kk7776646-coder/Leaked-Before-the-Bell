import { dataLifecycleService } from '../services/dataLifecycleService';

/**
 * Self-verifying automated test suite for Data Lifecycle Management:
 * Historical Papers, Real Papers, Exam Metadata, and Socially Detected Content.
 */
export async function runLifecycleVerificationTests(): Promise<{ passed: number; failed: number; results: string[] }> {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      passed++;
      results.push(`✓ PASS: ${testName}`);
    } else {
      failed++;
      results.push(`✗ FAIL: ${testName}`);
      console.error(`Test failed: ${testName}`);
    }
  };

  try {
    // 1. EXAM METADATA TESTS
    const newExamMeta = await dataLifecycleService.addExamMetadata({
      subjectCode: 'TEST-META-101',
      subject: 'Robotics Engineering',
      examName: 'Midterm Evaluation',
      examDate: '2026-11-15',
      session: 'Morning',
      semester: 'Fall 2026',
      maxMarks: 50,
      duration: '2 Hours',
      examType: 'Practical & Theory',
      chiefExaminer: 'Dr. Test Examiner',
    });
    assert(newExamMeta.status === 'ACTIVE', 'Exam Metadata: Newly created metadata defaults to ACTIVE');

    // Archive active metadata
    const archivedMeta = await dataLifecycleService.archiveExamMetadata(newExamMeta.id);
    assert(archivedMeta.status === 'ARCHIVED', 'Exam Metadata: Successfully archives active metadata');

    const activeMetaList = await dataLifecycleService.getExamMetadata({ status: 'ACTIVE' });
    const inActiveList = activeMetaList.some((m) => m.id === newExamMeta.id);
    assert(!inActiveList, 'Exam Metadata: Archived metadata is excluded from active comparison list');

    const archivedMetaList = await dataLifecycleService.getExamMetadata({ status: 'ARCHIVED' });
    const inArchivedList = archivedMetaList.some((m) => m.id === newExamMeta.id);
    assert(inArchivedList, 'Exam Metadata: Archived metadata appears under Archived filter');

    // Restore archived metadata
    const restoredMeta = await dataLifecycleService.restoreExamMetadata(newExamMeta.id);
    assert(restoredMeta.status === 'ACTIVE', 'Exam Metadata: Successfully restores archived metadata');

    // Delete restored/unused metadata
    const deleteMetaRes = await dataLifecycleService.deleteExamMetadata(newExamMeta.id);
    assert(deleteMetaRes.success === true, 'Exam Metadata: Permanently deletes unlinked exam metadata');

    // 2. DETECTED CONTENT TESTS
    const activeDetected = await dataLifecycleService.getDetectedContent({ status: 'ACTIVE' });
    assert(Array.isArray(activeDetected), 'Detected Content: Query active detected documents');

    // 3. REAL PAPERS TESTS
    const realPapers = await dataLifecycleService.getRealPapers();
    assert(Array.isArray(realPapers), 'Real Papers: Query verified reference papers');

    // 4. HISTORICAL PAPERS TESTS
    const historicalPapers = await dataLifecycleService.getHistoricalPapers();
    assert(Array.isArray(historicalPapers), 'Historical Papers: Query historical archive');
  } catch (err: any) {
    failed++;
    results.push(`✗ ERROR in test suite: ${err.message}`);
  }

  return { passed, failed, results };
}
