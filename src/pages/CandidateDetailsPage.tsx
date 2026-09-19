import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SubjectIcon } from '../components/common/SubjectIcon';
import { SocialPlatformIcon } from '../components/common/SocialPlatformIcon';
import { StatusIcon } from '../components/common/StatusIcon';
import { QuestionForensicsMatrix } from '../components/candidate-details/QuestionForensicsMatrix';
import { ReviewDecisionPanel } from '../components/review/ReviewDecisionPanel';
import { ArrowLeft, ShieldAlert, CheckCircle2, UserCheck, FileText, Calendar, Clock, Layers } from 'lucide-react';
import { ReviewDecision } from '../types/review';

export const CandidateDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const candidateId = id || 'C-8AD6';
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('Needs Verification');

  const handleSubmitDecision = (itemId: string, decision: ReviewDecision, notes: string) => {
    setReviewSubmitted(true);
    setCurrentStatus(decision === 'Mark as Reviewed' ? 'Reviewed' : decision === 'Dismiss Candidate' ? 'Dismissed' : 'In Review');
  };

  return (
    <ResponsiveContainer>
      <div className="mb-4">
        <Link to="/candidates">
          <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Candidates
          </Button>
        </Link>
      </div>

      <PageHeader
        title={`Candidate Investigation: ${candidateId}`}
        description="Candidate document forensics and human verification workspace."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        {/* Main Left column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Overview Card */}
          <Card
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100">{candidateId}</span>
                  <Badge variant="danger">HIGH RISK</Badge>
                </div>
                <span className="text-xs font-mono text-slate-400">Detected 2026-09-19 11:42</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Document Name</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  CS501 Study Forum Questions.pdf
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Subject</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <SubjectIcon subject="Computer Science" size={16} />
                  Computer Science (CS501)
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Platform Source</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <SocialPlatformIcon platform="Telegram" size={16} />
                  Telegram / LeakChannel_A
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Question Overlap</span>
                <p className="font-mono font-bold text-rose-600">94% Overlap</p>
              </div>
            </div>
          </Card>

          {/* Question Forensics Comparison */}
          <QuestionForensicsMatrix candidateId={candidateId} />
        </div>

        {/* Right column (1 col): Risk Assessment vs Human Review & Decision Panel */}
        <div className="space-y-6">
          {/* AI / System Risk Assessment (Strictly separated) */}
          <Card title="System Risk Assessment">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Risk Level</span>
                <span className="font-bold text-rose-600 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> HIGH
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Risk Score</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">87 / 100</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Uncertainty</span>
                <span className="font-medium text-amber-600">Medium</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Primary Flag</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">Question Similarity 94%</span>
              </div>
            </div>
          </Card>

          {/* Human Review Status */}
          <Card title="Human Review Status">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Review Status</span>
                <span className="font-semibold text-amber-600 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> {currentStatus}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Assigned Reviewer</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">Senior Security Analyst</span>
              </div>
            </div>
          </Card>

          {/* Review Decision Panel */}
          <ReviewDecisionPanel
            item={{
              id: 'REV-001',
              candidateId: candidateId,
              subject: 'Computer Science',
              subjectCode: 'CS501',
              riskScore: 87,
              riskLevel: 'HIGH',
              evidenceCount: 4,
              detectedTime: '2026-09-19 11:42',
              reviewerStatus: 'Needs Verification',
              priority: 'High Priority',
            }}
            onSubmitDecision={handleSubmitDecision}
          />
        </div>
      </div>
    </ResponsiveContainer>
  );
};

