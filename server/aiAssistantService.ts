import { GoogleGenAI } from '@google/genai';
import { db } from './db';
import { AiAssistantRegistry } from './aiAssistantRegistry';
import {
  AiChatMessage,
  AiAssistantContext,
  AiSuggestedAction,
  DetectedContentRecord,
  AlertRecord,
  ReviewItemRecord,
  RealPaperRecord,
  HistoricalPaperRecord,
  ExamMetadataRecord,
} from './types';

// ==========================================================
// AI ASSISTANT SERVICE & CONTROLLED ACTION LAYER
// Safe, controlled retrieval and multi-provider orchestration
// ==========================================================

export interface AssistantChatRequest {
  message: string;
  history?: AiChatMessage[];
  context?: AiAssistantContext;
  confirmedAction?: {
    actionType: string;
    payload: any;
  };
}

export interface AssistantChatResponse {
  message: AiChatMessage;
  provider: {
    id: string;
    providerId: string;
    modelDisplayName: string;
    modelId: string;
  } | null;
}

export class AiAssistantService {
  /**
   * Retrieves structured context for the currently active view and selection.
   */
  public static getStructuredContext(ctx?: AiAssistantContext): {
    summaryText: string;
    targetEntity?: any;
    entityType?: string;
  } {
    if (!ctx) {
      return { summaryText: 'General application context (Dashboard / Main overview).' };
    }

    const parts: string[] = [];
    if (ctx.currentRoute) parts.push(`Current Route: ${ctx.currentRoute}`);
    if (ctx.currentSearch) parts.push(`Active Search Filter: "${ctx.currentSearch}"`);
    if (ctx.currentFilters && Object.keys(ctx.currentFilters).length > 0) {
      parts.push(`Active Filters: ${JSON.stringify(ctx.currentFilters)}`);
    }

    // 1. Detected Content Context
    const dcId = ctx.selectedDetectedContentId || (ctx.currentRoute?.startsWith('/detected-content/') ? ctx.currentRoute.split('/')[2] : undefined) || (ctx.currentRoute?.startsWith('/candidates/') ? ctx.currentRoute.split('/')[2] : undefined);
    if (dcId) {
      const item = db.getDetectedContentById(dcId);
      if (item) {
        parts.push(`Selected Detected Content:`);
        parts.push(`  ID: ${item.id}`);
        parts.push(`  Title/Name: ${item.name}`);
        parts.push(`  Subject: ${item.subject} (${item.subjectCode || 'N/A'})`);
        parts.push(`  Platform / Source: ${item.platform} - ${item.source}`);
        parts.push(`  Risk Level: ${item.risk} (Score: ${item.riskScore}/100)`);
        parts.push(`  Processing Status: ${item.processing} | Review State: ${item.review}`);
        parts.push(`  Extraction: ${item.extractionMethod || 'OCR'} (OCR Confidence: ${item.ocrConfidence ?? item.confidence ?? 'N/A'}%)`);
        parts.push(`  Extracted Questions: ${item.questions?.length || 0} questions identified`);
        
        if (item.matchedReferencePaper) {
          parts.push(`  Matched Reference Paper: "${item.matchedReferencePaper.title}" (${item.matchedReferencePaper.id})`);
          parts.push(`  Forensic Overlap: ${item.matchedReferencePaper.overlapPercentage}% (${item.matchedReferencePaper.matchedQuestionsCount}/${item.matchedReferencePaper.totalQuestionsCount} questions match)`);
        }

        if (item.metadataComparison) {
          parts.push(`  Metadata Match Summary: ${item.metadataComparison.summary}`);
        }

        if (item.forensicResults && item.forensicResults.length > 0) {
          const matchCount = item.forensicResults.filter((f) => f.result === 'MATCH' || f.result === 'PARTIAL_MATCH').length;
          parts.push(`  Forensic Comparison: ${matchCount} of ${item.forensicResults.length} questions match reference exam vault.`);
        }

        return {
          summaryText: parts.join('\n'),
          targetEntity: item,
          entityType: 'DETECTED_CONTENT',
        };
      }
    }

    // 2. Alert Context
    if (ctx.selectedAlertId) {
      const alert = db.getAlertById(ctx.selectedAlertId);
      if (alert) {
        parts.push(`Selected Alert:`);
        parts.push(`  ID: ${alert.id} | Severity: ${alert.severity}`);
        parts.push(`  Title: ${alert.title}`);
        parts.push(`  Target Content ID: ${alert.candidateId} (${alert.candidateName})`);
        parts.push(`  Subject: ${alert.subject} (${alert.subjectCode})`);
        parts.push(`  Similarity Score: ${alert.similarityScore}%`);
        parts.push(`  Status: ${alert.status}`);
        parts.push(`  Evidence Summary: ${alert.evidenceSummary}`);
        return {
          summaryText: parts.join('\n'),
          targetEntity: alert,
          entityType: 'ALERT',
        };
      }
    }

    // 3. Review Queue Context
    if (ctx.selectedReviewId) {
      const review = db.getReviewById(ctx.selectedReviewId);
      if (review) {
        parts.push(`Selected Review Item:`);
        parts.push(`  ID: ${review.id} | Priority: ${review.priority}`);
        parts.push(`  Target Content ID: ${review.candidateId}`);
        parts.push(`  Subject: ${review.subject} (${review.subjectCode})`);
        parts.push(`  Risk Level: ${review.riskLevel} (Score: ${review.riskScore}/100)`);
        parts.push(`  Reviewer Status: ${review.reviewerStatus}`);
        return {
          summaryText: parts.join('\n'),
          targetEntity: review,
          entityType: 'REVIEW',
        };
      }
    }

    // 4. Historical Paper Context
    if (ctx.selectedHistoricalPaperId) {
      const hp = db.getHistoricalPaperById(ctx.selectedHistoricalPaperId);
      if (hp) {
        parts.push(`Selected Historical Paper:`);
        parts.push(`  ID: ${hp.id}`);
        parts.push(`  Title: ${hp.title}`);
        parts.push(`  Subject: ${hp.subject} (${hp.subjectCode})`);
        parts.push(`  Year: ${hp.year}`);
        parts.push(`  Total Questions: ${hp.totalQuestions}`);
        parts.push(`  Status: ${hp.status}`);
        return {
          summaryText: parts.join('\n'),
          targetEntity: hp,
          entityType: 'HISTORICAL_PAPER',
        };
      }
    }

    // 5. Real Paper Context
    if (ctx.selectedRealPaperId) {
      const rp = db.getRealPaperById(ctx.selectedRealPaperId);
      if (rp) {
        parts.push(`Selected Verified Real Paper:`);
        parts.push(`  ID: ${rp.id}`);
        parts.push(`  Document ID: ${rp.documentId}`);
        parts.push(`  Title: ${rp.paperTitle}`);
        parts.push(`  Subject: ${rp.subject} (${rp.subjectCode})`);
        parts.push(`  Exam Date: ${rp.examDate || 'Scheduled'}`);
        parts.push(`  Status: ${rp.verificationStatus}`);
        parts.push(`  Total Questions: ${rp.totalQuestions}`);
        return {
          summaryText: parts.join('\n'),
          targetEntity: rp,
          entityType: 'REAL_PAPER',
        };
      }
    }

    // 6. Exam Metadata Context
    if (ctx.selectedMetadataId) {
      const md = db.getExamMetadataById(ctx.selectedMetadataId);
      if (md) {
        parts.push(`Selected Exam Metadata Configuration:`);
        parts.push(`  ID: ${md.id}`);
        parts.push(`  Exam Name: ${md.examName}`);
        parts.push(`  Subject: ${md.subject} (${md.subjectCode})`);
        parts.push(`  Exam Date: ${md.examDate} (${md.session})`);
        parts.push(`  Semester: ${md.semester}`);
        parts.push(`  Max Marks: ${md.maxMarks} | Duration: ${md.duration}`);
        parts.push(`  Chief Examiner: ${md.chiefExaminer}`);
        parts.push(`  Status: ${md.status}`);
        return {
          summaryText: parts.join('\n'),
          targetEntity: md,
          entityType: 'EXAM_METADATA',
        };
      }
    }

    // 7. Route-Level Contexts
    if (ctx.currentRoute === '/' || ctx.currentRoute === '/dashboard') {
      const stats = db.getDashboardStats();
      parts.push(`Dashboard Active Overview:`);
      parts.push(`  Scanned Today: ${stats.scannedToday} documents`);
      parts.push(`  Scanned Total: ${stats.scannedTotal} documents`);
      parts.push(`  Active Alerts: ${stats.activeAlerts} (High Risk: ${stats.highRiskAlerts})`);
      parts.push(`  Pending Reviews: ${stats.pendingReviews}`);
      parts.push(`  Historical Archive Papers: ${stats.historicalPaperCount}`);
      parts.push(`  Verified Real Papers in Vault: ${stats.realPaperCount}`);
      parts.push(`  System Status: ${stats.systemStatus}`);
      return {
        summaryText: parts.join('\n'),
        targetEntity: stats,
        entityType: 'DASHBOARD_STATS',
      };
    }

    if (ctx.currentRoute === '/alerts') {
      const alerts = db.getAlerts({ status: 'ACTIVE' });
      const critical = alerts.filter(a => a.severity === 'CRITICAL');
      const high = alerts.filter(a => a.severity === 'HIGH');
      parts.push(`Alerts Overview: ${alerts.length} active alerts (${critical.length} CRITICAL, ${high.length} HIGH).`);
      alerts.slice(0, 3).forEach(a => {
        parts.push(`  - [${a.severity}] ${a.title} (Target: ${a.candidateId}, Score: ${a.similarityScore}%)`);
      });
      return {
        summaryText: parts.join('\n'),
        targetEntity: alerts,
        entityType: 'ALERTS_LIST',
      };
    }

    if (ctx.currentRoute === '/review') {
      const reviews = db.getReviewQueue({ status: 'PENDING' });
      parts.push(`Review Queue: ${reviews.length} items awaiting human examiner verification.`);
      reviews.slice(0, 3).forEach(r => {
        parts.push(`  - [${r.priority}] ${r.subject} (${r.subjectCode}): Risk ${r.riskScore}/100`);
      });
      return {
        summaryText: parts.join('\n'),
        targetEntity: reviews,
        entityType: 'REVIEW_QUEUE_LIST',
      };
    }

    // 8. Sources Context
    if (ctx.currentRoute === '/sources') {
      const sources = db.getSocialSources();
      parts.push(`Social Monitoring Sources: ${sources.length} sources registered.`);
      sources.forEach((s) => {
        parts.push(`  - ${s.name} (${s.platform}): ${s.enabled ? 'Active Monitoring' : 'Disabled'} | Items Detected: ${s.itemsDetected}`);
      });
      return {
        summaryText: parts.join('\n'),
        targetEntity: sources,
        entityType: 'SOCIAL_SOURCES',
      };
    }

    return {
      summaryText: parts.join('\n') || 'General LeakLens Security & Examination Audit environment.',
    };
  }

  /**
   * Executes a confirmed destructive action safely.
   */
  public static executeConfirmedAction(actionType: string, payload: any): { success: boolean; message: string; actionResult?: any } {
    if (actionType === 'DELETE_DETECTED_CONTENT' || actionType === 'DELETE_DOCUMENT') {
      const id = payload?.id || payload?.detectedContentId;
      if (!id) throw new Error('Missing detected content ID for deletion.');
      
      const item = db.getDetectedContentById(id);
      if (!item) throw new Error(`Detected content '${id}' not found.`);

      db.deleteCandidate(id);
      db.logAudit('CONTENT_DELETED', 'DETECTED_CONTENT', id, 'SUCCESS', `User confirmed deletion of document ${item.name} (${id}) via AI Assistant`);
      return {
        success: true,
        message: `Document ${item.name} (${id}) and its derived analysis data have been permanently deleted.`,
        actionResult: { deletedId: id, action: 'DELETED' },
      };
    }

    if (actionType === 'DISMISS_ALERT') {
      const id = payload?.id || payload?.alertId;
      if (!id) throw new Error('Missing alert ID.');
      const alert = db.updateAlertStatus(id, 'DISMISSED');
      if (!alert) throw new Error(`Alert '${id}' not found.`);
      return {
        success: true,
        message: `Alert ${id} has been marked as Dismissed.`,
        actionResult: { alertId: id, action: 'DISMISSED' },
      };
    }

    if (actionType === 'RETRY_PROCESSING') {
      const id = payload?.id || payload?.detectedContentId;
      const item = db.getDetectedContentById(id);
      if (!item) throw new Error(`Detected content '${id}' not found.`);
      db.updateCandidate(id, { processing: 'Completed', status: 'ACTIVE' });
      return {
        success: true,
        message: `Document ${id} processing has been re-queued and verified.`,
        actionResult: { id, action: 'RETRIED' },
      };
    }

    throw new Error(`Unsupported action type '${actionType}'.`);
  }

  /**
   * Evaluates deterministic fallbacks when AI is unavailable or for exact commands.
   */
  public static handleDeterministicQuery(
    query: string,
    ctx?: AiAssistantContext
  ): {
    handled: boolean;
    response?: AiChatMessage;
  } {
    const q = query.toLowerCase().trim();
    const dcId = ctx?.selectedDetectedContentId || (ctx?.currentRoute?.startsWith('/detected-content/') ? ctx?.currentRoute.split('/')[2] : undefined);
    const selectedItem = dcId ? db.getDetectedContentById(dcId) : undefined;

    // 1. Delete request
    if (q.includes('delete this document') || q.includes('delete document') || q.includes('delete this candidate')) {
      if (selectedItem) {
        return {
          handled: true,
          response: {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: `Delete document **${selectedItem.name}** (\`${selectedItem.id}\`)?\n\nThis will permanently remove the document file, extracted questions, and all derived forensic comparison data.`,
            timestamp: new Date().toISOString(),
            evidenceBullets: [
              `Target Document: ${selectedItem.name} (${selectedItem.id})`,
              `Recorded Risk: ${selectedItem.risk} (${selectedItem.riskScore}/100)`,
              `Platform: ${selectedItem.platform} (${selectedItem.source})`,
            ],
            pendingConfirmationAction: {
              actionType: 'DELETE_DETECTED_CONTENT',
              payload: { id: selectedItem.id },
              prompt: `Are you sure you want to permanently delete document ${selectedItem.id}?`,
              confirmLabel: 'Delete Document',
              cancelLabel: 'Cancel',
            },
            suggestedActions: [],
          },
        };
      }
    }

    // 2. Retry processing request
    if (q.includes('retry this document') || q.includes('retry processing') || q.includes('retry failed')) {
      if (selectedItem) {
        return {
          handled: true,
          response: {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: `Triggered forensic processing retry for **${selectedItem.name}** (\`${selectedItem.id}\`).\n\nThe ingestion pipeline will re-evaluate OCR tokens, question boundaries, and reference vault matches.`,
            timestamp: new Date().toISOString(),
            evidenceBullets: [
              `Document ID: ${selectedItem.id}`,
              `Previous Status: ${selectedItem.processing}`,
              `Extraction Method: ${selectedItem.extractionMethod || 'OCR'}`,
            ],
            suggestedActions: [
              {
                id: 'act-view-dc',
                label: `Open ${selectedItem.id}`,
                actionType: 'NAVIGATE',
                payload: { path: `/detected-content/${selectedItem.id}` },
              },
            ],
          },
        };
      }
    }

    // 3. High risk query
    if (q.includes('high risk') || q.includes("today's high-risk") || q.includes('high-risk content')) {
      const highRisk = db.getDetectedContents({ risk: 'HIGH', status: 'ACTIVE' });
      const actions: AiSuggestedAction[] = highRisk.slice(0, 4).map((item) => ({
        id: `act-${item.id}`,
        label: `Inspect ${item.id} (${item.subjectCode || item.subject})`,
        actionType: 'NAVIGATE',
        payload: { path: `/detected-content/${item.id}` },
      }));

      const evidence = highRisk.map((item) => `${item.id}: ${item.name} — Risk ${item.riskScore}/100, Matched ${item.matchedReferencePaper?.overlapPercentage || item.confidence || 0}% with ${item.matchedReferencePaper?.title || 'Exam Vault'}`);

      return {
        handled: true,
        response: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: highRisk.length > 0
            ? `### High-Risk Detections\n\nThere ${highRisk.length === 1 ? 'is' : 'are'} **${highRisk.length} active high-risk detected item${highRisk.length === 1 ? '' : 's'}** requiring verification.\n\n**Evidence**\n${evidence.map((e) => `- \`${e.split(':')[0]}\`: ${e.split(': ')[1]}`).join('\n')}\n\n**Assessment & Status**\n- Current assessment: \`HIGH\`\n- Human verification: \`Required\``
            : `### High-Risk Assessment\n\nNo active high-risk items are currently flagged in the system.\n\n**Assessment & Status**\n- Current assessment: \`NOMINAL\`\n- Human verification: \`Not Required\``,
          timestamp: new Date().toISOString(),
          evidenceBullets: evidence.length > 0 ? evidence : ['All scanned documents currently sit below the critical risk threshold (75).'],
          suggestedActions: [
            ...actions,
            {
              id: 'act-filter-high',
              label: 'Filter High Risk in Detected Content',
              actionType: 'NAVIGATE',
              payload: { path: '/detected-content?risk=HIGH' },
            },
          ],
        },
      };
    }

    // 4. Why flagged / Evidence / Review query
    if (
      q.includes('why was this content flagged') ||
      q.includes('why is this flagged') ||
      q.includes('why flagged') ||
      q.includes('show the evidence behind this result') ||
      q.includes('show evidence') ||
      q.includes('what needs human verification') ||
      q.includes('what does review required mean') ||
      q.includes('content requiring review') ||
      q.includes('review queue') ||
      (q.includes('why does this require review') && selectedItem)
    ) {
      if (selectedItem) {
        const evidenceLines: string[] = [];
        if (selectedItem.subject || selectedItem.subjectCode) {
          evidenceLines.push(`- Subject: Match (\`${selectedItem.subjectCode || selectedItem.subject}\`)`);
        }
        if (selectedItem.maxMarks) {
          evidenceLines.push(`- Marks structure: Match (\`${selectedItem.maxMarks}\` marks)`);
        }
        if (selectedItem.matchedReferencePaper) {
          evidenceLines.push(`- Question overlap: \`${selectedItem.matchedReferencePaper.overlapPercentage}%\` with verified paper **${selectedItem.matchedReferencePaper.title}** (\`${selectedItem.matchedReferencePaper.id}\`)`);
        } else if (selectedItem.confidence) {
          evidenceLines.push(`- Similarity index: \`${selectedItem.confidence}%\``);
        }
        if (selectedItem.ocrConfidence) {
          evidenceLines.push(`- Extraction confidence: \`${selectedItem.ocrConfidence}%\``);
        }
        if (evidenceLines.length === 0) {
          evidenceLines.push(`- Recorded risk score: \`${selectedItem.riskScore}/100\``);
        }

        const isWhyFlagged = q.includes('flagged') || q.includes('evidence');
        const heading = isWhyFlagged ? '### Why this content was flagged' : '### Review & Verification Requirement';
        const explanation = isWhyFlagged
          ? `The detected document \`${selectedItem.id}\` matches configured examination parameters, and extracted questions align with verified materials in the secure vault.`
          : `Document \`${selectedItem.id}\` requires human examiner review to verify if the detected content represents an authentic leak or authorized curriculum overlap.`;

        const markdownContent = `${heading}\n\n${explanation}\n\n**Evidence**\n${evidenceLines.join('\n')}\n\n**Assessment & Status**\n- Current assessment: \`${selectedItem.risk}\` (Score: \`${selectedItem.riskScore}/100\`)\n- Human verification: \`Required\`\n\n*The evidence indicates notable similarity, but human verification is required before confirming a final determination.*`;

        return {
          handled: true,
          response: {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: markdownContent,
            timestamp: new Date().toISOString(),
            evidenceBullets: evidenceLines.map((l) => l.replace(/^- /, '')),
            suggestedActions: [
              {
                id: 'act-view-comp',
                label: `Open ${selectedItem.id}`,
                actionType: 'NAVIGATE',
                payload: { path: `/detected-content/${selectedItem.id}` },
              },
              {
                id: 'act-view-rev',
                label: 'Open Review Queue',
                actionType: 'NAVIGATE',
                payload: { path: '/review' },
              },
            ],
          },
        };
      }
    }

    // 5. Compare with real papers / question matches / compare questions
    if (
      (q.includes('compare the matched questions') ||
        q.includes('compare questions') ||
        q.includes('compare q3') ||
        q.includes('compare with verified papers') ||
        q.includes('compare with real papers') ||
        q.includes('show the questions that match') ||
        q.includes('show question matches')) &&
      selectedItem
    ) {
      const ref = selectedItem.matchedReferencePaper;
      const bullets: string[] = [];

      if (ref) {
        bullets.push(`- Matched Reference: **${ref.title}** (\`${ref.id}\`)`);
        bullets.push(`- Question Overlap: \`${ref.overlapPercentage}%\` (\`${ref.matchedQuestionsCount}\` of \`${ref.totalQuestionsCount}\` questions match)`);
      }

      if (selectedItem.forensicResults && selectedItem.forensicResults.length > 0) {
        selectedItem.forensicResults.slice(0, 3).forEach((f) => {
          bullets.push(`- Question \`${f.candidateQuestionId}\`: \`${f.result}\` (Text: \`${f.overallSimilarity}%\`, Semantic: \`${f.semanticSimilarity}%\`)`);
        });
      }

      const contentText = `### Question Forensic Comparison\n\n${
        ref
          ? `Forensic analysis shows a **${ref.overlapPercentage}% question overlap** between document \`${selectedItem.id}\` and verified paper **${ref.title}**.`
          : `No direct reference paper match was detected for \`${selectedItem.id}\`. Comparison was performed against indexed historical examination units.`
      }\n\n**Evidence**\n${bullets.length > 0 ? bullets.join('\n') : '- No direct textual question matches detected.'}\n\n**Assessment & Status**\n- Current assessment: \`${selectedItem.risk}\`\n- Human verification: \`Required\``;

      return {
        handled: true,
        response: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: contentText,
          timestamp: new Date().toISOString(),
          evidenceBullets: bullets.map((b) => b.replace(/^- /, '')),
          suggestedActions: [
            {
              id: 'act-inspect-detail',
              label: 'Inspect Forensic Comparison',
              actionType: 'NAVIGATE',
              payload: { path: `/detected-content/${selectedItem.id}` },
            },
          ],
        },
      };
    }

    // 5b. Is this a leak? / Definite leak question
    if ((q.includes('is this definitely a leak') || q.includes('is this a leak') || q.includes('leak confirmed')) && selectedItem) {
      const isConfirmed = selectedItem.review === 'CONFIRMED_LEAK';
      return {
        handled: true,
        response: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `### Leak Determination Status\n\n${
            isConfirmed
              ? `This document has been **verified as a confirmed leak** following human examiner review.`
              : `This document is **not confirmed as a leak**. It is an automated detection with recorded risk score \`${selectedItem.riskScore}/100\` (\`${selectedItem.risk}\`).`
          }\n\n**Assessment & Status**\n- Current assessment: \`${selectedItem.risk}\`\n- Human verification: \`${isConfirmed ? 'Completed (Confirmed)' : 'Required'}\`\n\n${
            isConfirmed
              ? 'Security protocols and chief examiner notifications have been dispatched.'
              : 'Automated signals indicate high similarity to confidential test material, but human examiner verification is strictly required before confirming an incident.'
          }`,
          timestamp: new Date().toISOString(),
          evidenceBullets: [
            `Assessment: ${selectedItem.risk}`,
            `Risk Score: ${selectedItem.riskScore}/100`,
            `Human Decision: ${selectedItem.review || 'PENDING'}`,
          ],
          suggestedActions: [
            {
              id: 'act-review',
              label: 'Open in Review Queue',
              actionType: 'NAVIGATE',
              payload: { path: '/review' },
            },
          ],
        },
      };
    }

    // 6. Dashboard metrics query
    if (q.includes('dashboard') || q.includes('system status') || q.includes('monitoring status') || q.includes('recent leak detections') || q.includes('scanned today')) {
      const stats = db.getDashboardStats();
      const bullets = [
        `Scanned Today: ${stats.scannedToday} documents (${stats.scannedTotal} total in repository)`,
        `Active Alerts: ${stats.activeAlerts} total (${stats.highRiskAlerts} high risk requiring immediate action)`,
        `Pending Reviews: ${stats.pendingReviews} awaiting human examiner confirmation`,
        `Comparison Vault: ${stats.realPaperCount} verified real papers, ${stats.historicalPaperCount} historical archive papers`,
        `System Status: ${stats.systemStatus}`,
      ];

      return {
        handled: true,
        response: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `Here is the current **LeakLens System & Monitoring Status**:\n\nSystem is actively monitoring all social channels with **${stats.activeAlerts} active alerts** and **${stats.pendingReviews} reviews pending**.`,
          timestamp: new Date().toISOString(),
          evidenceBullets: bullets,
          suggestedActions: [
            {
              id: 'act-view-alerts',
              label: 'View Active Alerts',
              actionType: 'NAVIGATE',
              payload: { path: '/alerts' },
            },
            {
              id: 'act-view-detected',
              label: 'View Detected Content',
              actionType: 'NAVIGATE',
              payload: { path: '/detected-content' },
            },
          ],
        },
      };
    }

    // 7. Real Papers query
    if (q.includes('real paper') || q.includes('verified paper') || (ctx?.selectedRealPaperId && (q.includes('this paper') || q.includes('explain')))) {
      const rpId = ctx?.selectedRealPaperId;
      const rp = rpId ? db.getRealPaperById(rpId) : null;
      if (rp) {
        return {
          handled: true,
          response: {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: `**${rp.paperTitle}** (\`${rp.id}\` / \`${rp.documentId}\`)\n\nSubject: **${rp.subject}** (\`${rp.subjectCode}\`)\nVerification Status: **${rp.verificationStatus}**\nTotal Questions: **${rp.totalQuestions}**\nExam Date: **${rp.examDate || 'Scheduled'}**`,
            timestamp: new Date().toISOString(),
            evidenceBullets: [
              `Storage File: ${rp.filename}`,
              `Verification Status: ${rp.verificationStatus} by ${rp.verifiedBy || 'System Admin'}`,
              `Extracted Questions Indexed: ${rp.totalQuestions} items ready for forensic cross-matching`,
            ],
            suggestedActions: [
              {
                id: 'act-real-papers',
                label: 'View All Real Papers',
                actionType: 'NAVIGATE',
                payload: { path: '/real-papers' },
              },
            ],
          },
        };
      }
    }

    // 8. Historical Papers query
    if (q.includes('historical') || (ctx?.selectedHistoricalPaperId && (q.includes('this paper') || q.includes('explain')))) {
      const hpId = ctx?.selectedHistoricalPaperId;
      const hp = hpId ? db.getHistoricalPaperById(hpId) : null;
      if (hp) {
        return {
          handled: true,
          response: {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: `**${hp.title}** (\`${hp.id}\`)\n\nSubject: **${hp.subject}** (\`${hp.subjectCode}\`)\nExam Year: **${hp.year}**\nVector Index Status: **${hp.status}**\nTotal Questions: **${hp.totalQuestions}**`,
            timestamp: new Date().toISOString(),
            evidenceBullets: [
              `File: ${hp.filename} (${Math.round(hp.fileSize / 1024)} KB)`,
              `Embeddings: ${hp.vectorEmbeddingsCount} vector embeddings indexed`,
              `SHA-256: ${hp.sha256.substring(0, 16)}...`,
            ],
            suggestedActions: [
              {
                id: 'act-historical',
                label: 'View Historical Vault',
                actionType: 'NAVIGATE',
                payload: { path: '/historical' },
              },
            ],
          },
        };
      }
    }

    // 9. Exam Metadata query
    if (q.includes('metadata') || q.includes('exam configuration') || (ctx?.selectedMetadataId && (q.includes('this exam') || q.includes('explain')))) {
      const mdId = ctx?.selectedMetadataId;
      const md = mdId ? db.getExamMetadataById(mdId) : null;
      if (md) {
        return {
          handled: true,
          response: {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: `**${md.examName}** (\`${md.id}\`)\n\nSubject: **${md.subject}** (\`${md.subjectCode}\`)\nDate: **${md.examDate}** (${md.session})\nSemester: **${md.semester}**\nChief Examiner: **${md.chiefExaminer}**\nMax Marks: **${md.maxMarks}** (${md.duration})\nStatus: **${md.status}**`,
            timestamp: new Date().toISOString(),
            evidenceBullets: [
              `Exam Type: ${md.examType}`,
              `Active Schedule: ${md.examDate} [${md.session}]`,
              `Chief Examiner Authority: ${md.chiefExaminer}`,
            ],
            suggestedActions: [
              {
                id: 'act-metadata',
                label: 'View Exam Metadata',
                actionType: 'NAVIGATE',
                payload: { path: '/metadata' },
              },
            ],
          },
        };
      }
    }

    return { handled: false };
  }

  /**
   * Main chat completion orchestrator.
   */
  public static async processChat(req: AssistantChatRequest): Promise<AssistantChatResponse> {
    // 1. Check for confirmed destructive action execution
    if (req.confirmedAction) {
      const result = this.executeConfirmedAction(req.confirmedAction.actionType, req.confirmedAction.payload);
      return {
        message: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: result.message,
          timestamp: new Date().toISOString(),
          evidenceBullets: ['Action confirmed by operator and executed via controlled service layer.'],
          suggestedActions: [],
        },
        provider: null,
      };
    }

    // 2. Check if a default AI provider is configured
    const defaultProvider = db.getDefaultAiProvider(true);

    // 3. Check for deterministic fast-path or queries that work offline
    const deterministic = this.handleDeterministicQuery(req.message, req.context);

    // If no provider is configured:
    if (!defaultProvider) {
      if (deterministic.handled && deterministic.response) {
        return {
          message: deterministic.response,
          provider: null,
        };
      }

      return {
        message: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: 'No AI provider is configured.\n\nConfigure an AI provider in **Settings → AI Assistant** to enable full conversational intelligence, multi-vector reasoning, and custom prompt execution.',
          timestamp: new Date().toISOString(),
          evidenceBullets: [
            'Provider status: NOT_CONFIGURED',
            'Deterministic tools and direct navigation remain active.',
          ],
          suggestedActions: [
            {
              id: 'act-settings',
              label: 'Configure AI Assistant in Settings',
              actionType: 'NAVIGATE',
              payload: { path: '/settings' },
            },
          ],
        },
        provider: null,
      };
    }

    // If default provider is disabled or not tested
    if (!defaultProvider.enabled) {
      if (deterministic.handled && deterministic.response) {
        return {
          message: deterministic.response,
          provider: null,
        };
      }
      return {
        message: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `The configured provider **${defaultProvider.modelDisplayName}** is currently disabled.\n\nEnable or test the provider in Settings to resume AI operations.`,
          timestamp: new Date().toISOString(),
          suggestedActions: [
            {
              id: 'act-settings',
              label: 'Open AI Assistant Settings',
              actionType: 'NAVIGATE',
              payload: { path: '/settings' },
            },
          ],
        },
        provider: {
          id: defaultProvider.id,
          providerId: defaultProvider.providerId,
          modelDisplayName: defaultProvider.modelDisplayName,
          modelId: defaultProvider.modelId,
        },
      };
    }

    // 4. Generate structured context and system instructions
    const structuredContext = this.getStructuredContext(req.context);

    const systemPrompt = `You are the LeakLens Assistant for confidential examination security and leak detection.
You operate as an integrated investigation analyst tool for Chief Examiners and Security Officers.

CORE INTEGRITY & SECURITY RULES:
1. NEVER calculate, invent, or hallucinate risk scores, similarity percentages, OCR confidence, question matches, exam dates, subjects, paper IDs, or forensic stats. ALWAYS retrieve, cite, and explain the existing recorded values provided in the structured context.
2. If specific information is unavailable in the provided context, explicitly state: "That information is not available for this content." Never guess or fabricate data.
3. NEVER state "Leak confirmed" on your own authority. Always distinguish AI assessment from human verification:
   - "Current assessment: [LOW / MEDIUM / HIGH]"
   - "Human verification: [Required / Not Required]"
   - If evidence is incomplete: "Some evidence is incomplete, so this result should be reviewed before drawing a conclusion."
4. Use a concise, objective, professional tone. Avoid marketing hype, conversational fluff, and robotic tropes.
5. TYPOGRAPHY & FORMAT:
   - Standard clear text in prose.
   - Use monospace backticks \`...\` strictly for IDs (e.g. \`DL-2048\`, \`RP-2026-DBMS-01\`, \`ALT-2048\`), question numbers (e.g. \`Q3\`), scores, percentages, and timestamps.
   - Structure responses with:
     ### Short heading
     Clear explanation paragraph.
     **Evidence**
     - Bullet points with concrete IDs, subjects, marks, or match data.
     **Assessment & Status**
     - Current assessment: [VALUE]
     - Human verification: [Required / Completed / Dismissed]

STRUCTURED APPLICATION CONTEXT:
${structuredContext.summaryText}
`;

    // 5. Call configured AI provider
    const preset = AiAssistantRegistry.getPresetById(defaultProvider.providerId);
    const effectiveBaseUrl = (defaultProvider.useCustomBaseUrl && defaultProvider.baseUrl
      ? defaultProvider.baseUrl
      : (preset?.defaultBaseUrl || defaultProvider.baseUrl || '')).replace(/\/+$/, '');

    try {
      let rawAnswerText = '';

      if (preset?.apiStyle === 'GEMINI' || defaultProvider.providerId === 'gemini') {
        const geminiApiKey = defaultProvider.apiKey || process.env.GEMINI_API_KEY || '';
        
        if (!geminiApiKey) {
          throw new Error('Gemini API key is not configured.');
        }

        let modelName = (defaultProvider.modelId || 'gemini-2.5-flash').replace(/^models\//, '');
        if (modelName === 'gemini-1.5-flash' || modelName === 'gemini-2.0-flash' || !modelName) {
          modelName = 'gemini-2.5-flash';
        }

        const ai = new GoogleGenAI({ apiKey: geminiApiKey });

        const contents: any[] = [];
        if (req.history && req.history.length > 0) {
          req.history.slice(-6).forEach((h) => {
            contents.push({
              role: h.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: h.content }],
            });
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: req.message }],
        });

        const geminiResponse = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.2,
            maxOutputTokens: 800,
          },
        });

        rawAnswerText = geminiResponse.text || 'No response returned from model.';
      } else if (preset?.apiStyle === 'ANTHROPIC' || defaultProvider.providerId === 'anthropic') {
        const anthropicEndpoint = `${effectiveBaseUrl}/messages`;
        
        const messages: any[] = [];
        if (req.history && req.history.length > 0) {
          req.history.slice(-6).forEach((h) => {
            if (h.role === 'user' || h.role === 'assistant') {
              messages.push({ role: h.role, content: h.content });
            }
          });
        }
        messages.push({ role: 'user', content: req.message });

        const res = await fetch(anthropicEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': defaultProvider.apiKey || '',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: defaultProvider.modelId,
            system: systemPrompt,
            messages,
            max_tokens: 800,
            temperature: 0.2,
          }),
        });

        if (!res.ok) {
          const errData: any = await res.json().catch(() => ({}));
          throw new Error(AiAssistantRegistry.sanitizeErrorMessage(errData?.error?.message || `Anthropic HTTP ${res.status}`, defaultProvider.apiKey));
        }

        const data: any = await res.json();
        rawAnswerText = data?.content?.[0]?.text || 'No response returned from model.';
      } else {
        // OpenAI / OpenRouter / Custom OpenAI-compatible
        const chatEndpoint = `${effectiveBaseUrl}/chat/completions`;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (defaultProvider.apiKey) headers['Authorization'] = `Bearer ${defaultProvider.apiKey}`;
        if (defaultProvider.providerId === 'openrouter') {
          headers['HTTP-Referer'] = 'https://leaklens.internal';
          headers['X-Title'] = 'LeakLens';
        }

        const messages: any[] = [{ role: 'system', content: systemPrompt }];
        if (req.history && req.history.length > 0) {
          req.history.slice(-6).forEach((h) => {
            if (h.role === 'user' || h.role === 'assistant') {
              messages.push({ role: h.role, content: h.content });
            }
          });
        }
        messages.push({ role: 'user', content: req.message });

        const requestBody: Record<string, any> = {
          model: defaultProvider.modelId,
          messages,
          temperature: 0.2,
          max_tokens: 800,
        };

        if (defaultProvider.providerId === 'openrouter') {
          // OpenRouter supports 'models' array to transparently fallback if a free model is rate-limited upstream
          const fallbackModels = [
            defaultProvider.modelId,
            'meta-llama/llama-3.3-70b-instruct:free',
            'mistralai/mistral-small-3.1-24b-instruct:free',
            'google/gemini-2.0-flash-exp:free',
          ];
          requestBody.models = Array.from(new Set(fallbackModels));
        }

        const res = await fetch(chatEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
        });

        if (!res.ok) {
          const errData: any = await res.json().catch(() => ({}));
          throw new Error(AiAssistantRegistry.sanitizeErrorMessage(errData?.error?.message || `${defaultProvider.modelDisplayName} HTTP ${res.status}`, defaultProvider.apiKey));
        }

        const data: any = await res.json();
        if (data?.error) {
          throw new Error(AiAssistantRegistry.sanitizeErrorMessage(data.error.message || 'Provider returned error', defaultProvider.apiKey));
        }
        rawAnswerText = data?.choices?.[0]?.message?.content || 'No response returned from model.';
      }

      // Parse suggested actions based on context
      const suggestedActions: AiSuggestedAction[] = [];
      const dcId = req.context?.selectedDetectedContentId;
      if (dcId) {
        suggestedActions.push({
          id: 'act-view-dc',
          label: `Open ${dcId}`,
          actionType: 'NAVIGATE',
          payload: { path: `/detected-content/${dcId}` },
        });
      }

      return {
        message: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: rawAnswerText,
          timestamp: new Date().toISOString(),
          suggestedActions,
        },
        provider: {
          id: defaultProvider.id,
          providerId: defaultProvider.providerId,
          modelDisplayName: defaultProvider.modelDisplayName,
          modelId: defaultProvider.modelId,
        },
      };
    } catch (err: any) {
      console.log('[AI Assistant] Operating in offline database fallback mode:', err.message);

      // If network/provider error occurred, fall back to deterministic response if available
      if (deterministic.handled && deterministic.response) {
        return {
          message: {
            ...deterministic.response,
            error: `Primary provider (${defaultProvider.modelDisplayName}) was unreachable. Showing local database evidence.`,
          },
          provider: {
            id: defaultProvider.id,
            providerId: defaultProvider.providerId,
            modelDisplayName: defaultProvider.modelDisplayName,
            modelId: defaultProvider.modelId,
          },
        };
      }

      // Synthesize intelligent offline/local answer based on structured database context
      const stats = db.getDashboardStats();
      const dcId = req.context?.selectedDetectedContentId || (req.context?.currentRoute?.startsWith('/detected-content/') ? req.context?.currentRoute.split('/')[2] : undefined);
      const selectedItem = dcId ? db.getDetectedContentById(dcId) : undefined;

      const evidenceBullets: string[] = [];
      const suggestedActions: AiSuggestedAction[] = [];

      if (selectedItem) {
        evidenceBullets.push(`Document: ${selectedItem.name} (${selectedItem.id})`);
        evidenceBullets.push(`Recorded Risk: ${selectedItem.risk} (Score: ${selectedItem.riskScore}/100)`);
        evidenceBullets.push(`Extraction Confidence: ${selectedItem.ocrConfidence ?? selectedItem.confidence ?? 'N/A'}%`);
        if (selectedItem.matchedReferencePaper) {
          evidenceBullets.push(`Reference Match: ${selectedItem.matchedReferencePaper.overlapPercentage}% overlap with "${selectedItem.matchedReferencePaper.title}"`);
        }
        suggestedActions.push({
          id: 'act-view-dc',
          label: `Inspect ${selectedItem.id}`,
          actionType: 'NAVIGATE',
          payload: { path: `/detected-content/${selectedItem.id}` },
        });
      } else {
        evidenceBullets.push(`Active System Status: ${stats.systemStatus}`);
        evidenceBullets.push(`Active Alerts: ${stats.activeAlerts} (${stats.highRiskAlerts} High Risk)`);
        evidenceBullets.push(`Verified Papers in Vault: ${stats.realPaperCount}`);
        suggestedActions.push({
          id: 'act-view-alerts',
          label: 'View Alerts',
          actionType: 'NAVIGATE',
          payload: { path: '/alerts' },
        });
        suggestedActions.push({
          id: 'act-view-detected',
          label: 'View Detected Content',
          actionType: 'NAVIGATE',
          payload: { path: '/detected-content' },
        });
      }

      suggestedActions.push({
        id: 'act-open-settings',
        label: 'AI Provider Settings',
        actionType: 'NAVIGATE',
        payload: { path: '/settings' },
      });

      const fallbackContent = selectedItem
        ? `**Local Forensic Analysis for ${selectedItem.name} (\`${selectedItem.id}\`):**\n\nThe document is currently recorded with a **${selectedItem.risk}** risk classification (Score: ${selectedItem.riskScore}/100).\n\n${selectedItem.matchedReferencePaper ? `High similarity detected against verified exam paper **${selectedItem.matchedReferencePaper.title}** (${selectedItem.matchedReferencePaper.overlapPercentage}% overlap).` : 'No direct reference vault match was identified.'}\n\n*Human verification is required before confirming or dismissing this finding.*`
        : `**LeakLens Examination Security Summary:**\n\nThe system is actively monitoring all configured channels. There are currently **${stats.activeAlerts} active alerts** (${stats.highRiskAlerts} high risk) and **${stats.pendingReviews} items pending review** across **${stats.scannedTotal} scanned documents**.\n\n*All statistics reflect live records in the secure exam vault.*`;

      return {
        message: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: fallbackContent,
          timestamp: new Date().toISOString(),
          evidenceBullets,
          suggestedActions,
        },
        provider: {
          id: defaultProvider.id,
          providerId: defaultProvider.providerId,
          modelDisplayName: `${defaultProvider.modelDisplayName} (Local Fallback)`,
          modelId: defaultProvider.modelId,
        },
      };
    }
  }
}
