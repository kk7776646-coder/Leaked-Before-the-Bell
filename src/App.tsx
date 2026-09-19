import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { CandidateDetailsPage } from './pages/CandidateDetailsPage';
import { AlertsPage } from './pages/AlertsPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { HistoricalPapersPage } from './pages/HistoricalPapersPage';
import { CurrentExamMetadataPage } from './pages/CurrentExamMetadataPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/candidates/:id" element={<CandidateDetailsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/review-queue" element={<ReviewQueuePage />} />
          <Route path="/knowledge-base/historical-papers" element={<HistoricalPapersPage />} />
          <Route path="/knowledge-base/exam-metadata" element={<CurrentExamMetadataPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
