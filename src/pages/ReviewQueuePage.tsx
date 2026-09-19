import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { ReviewQueueTable } from '../components/review/ReviewQueueTable';
import { ReviewEvidencePanel } from '../components/review/ReviewEvidencePanel';
import { ReviewDecisionPanel } from '../components/review/ReviewDecisionPanel';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { ReviewItem, ReviewDecision } from '../types/review';
import { Badge } from '../components/common/Badge';

export const mockReviewItems: ReviewItem[] = [
  {
    id: 'REV-901',
    candidateId: 'LB-1042',
    subject: 'Advanced Organic Chemistry II',
    subjectCode: 'CHEM-402',
    riskScore: 94,
    riskLevel: 'HIGH',
    evidenceCount: 3,
    detectedTime: '12 mins ago',
    reviewerStatus: 'Needs Verification',
    priority: 'High Priority',
  },
  {
    id: 'REV-902',
    candidateId: 'LB-1043',
    subject: 'Quantum Physics & Special Relativity',
    subjectCode: 'PHYS-301',
    riskScore: 88,
    riskLevel: 'HIGH',
    evidenceCount: 2,
    detectedTime: '38 mins ago',
    reviewerStatus: 'Assigned',
    assignedReviewer: 'Dr. Sarah Jenkins',
    priority: 'High Priority',
  },
  {
    id: 'REV-903',
    candidateId: 'LB-1045',
    subject: 'Microeconomics Theory III',
    subjectCode: 'ECON-305',
    riskScore: 78,
    riskLevel: 'HIGH',
    evidenceCount: 2,
    detectedTime: '2 hours ago',
    reviewerStatus: 'Needs Verification',
    priority: 'High Priority',
  },
];

export const ReviewQueuePage: React.FC = () => {
  const [items, setItems] = useState<ReviewItem[]>(mockReviewItems);
  const [activeReviewItem, setActiveReviewItem] = useState<ReviewItem | null>(null);

  const handleSubmitDecision = (itemId: string, decision: ReviewDecision, notes: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              reviewerStatus: 'Completed',
              decision,
              reviewerNotes: notes,
            }
          : item
      )
    );
    setActiveReviewItem(null);
  };

  const pendingItems = items.filter((i) => i.reviewerStatus !== 'Completed');

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Human-in-the-Loop Review Queue"
        description="Formal analyst review workbench for verifying automated early-warning alerts before security escalation."
        badge={<Badge variant="warning">{pendingItems.length} Action Pending</Badge>}
      />

      {items.length > 0 ? (
        <ReviewQueueTable items={items} onOpenReview={(item) => setActiveReviewItem(item)} />
      ) : (
        <EmptyState
          title="Review Queue Clear"
          description="All flagged examination candidate documents have been formally audited and reviewed."
        />
      )}

      {/* Formal Review Modal */}
      {activeReviewItem && (
        <Modal
          isOpen={!!activeReviewItem}
          onClose={() => setActiveReviewItem(null)}
          title={`Conduct Review: Candidate ${activeReviewItem.candidateId}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <ReviewEvidencePanel item={activeReviewItem} />
            <ReviewDecisionPanel
              item={activeReviewItem}
              onSubmitDecision={handleSubmitDecision}
            />
          </div>
        </Modal>
      )}
    </ResponsiveContainer>
  );
};
