import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { CandidateDetailsPage } from './pages/CandidateDetailsPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { AlertsPage } from './pages/AlertsPage';
import { HistoricalPapersPage } from './pages/HistoricalPapersPage';
import { RealPapersPage } from './pages/RealPapersPage';
import { ExamMetadataPage } from './pages/ExamMetadataPage';
import { DataSourcesOverviewPage } from './pages/DataSourcesOverviewPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/candidates/:id" element={<CandidateDetailsPage />} />
          <Route path="/review" element={<ReviewQueuePage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/historical" element={<HistoricalPapersPage />} />
          <Route path="/real-papers" element={<RealPapersPage />} />
          <Route path="/metadata" element={<ExamMetadataPage />} />
          <Route path="/sources" element={<DataSourcesOverviewPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
