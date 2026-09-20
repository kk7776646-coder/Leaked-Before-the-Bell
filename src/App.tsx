import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { DetectedContentPage } from './pages/DetectedContentPage';
import { DetectedContentDetailsPage } from './pages/DetectedContentDetailsPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { AlertsPage } from './pages/AlertsPage';
import { HistoricalPapersPage } from './pages/HistoricalPapersPage';
import { RealPapersPage } from './pages/RealPapersPage';
import { ExamMetadataPage } from './pages/ExamMetadataPage';
import { DataSourcesOverviewPage } from './pages/DataSourcesOverviewPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/detected-content" element={<DetectedContentPage />} />
            <Route path="/detected-content/:id" element={<DetectedContentDetailsPage />} />
            <Route path="/candidates" element={<Navigate to="/detected-content" replace />} />
            <Route path="/candidates/:id" element={<DetectedContentDetailsPage />} />
            <Route path="/review" element={<ReviewQueuePage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/historical" element={<HistoricalPapersPage />} />
            <Route path="/real-papers" element={<RealPapersPage />} />
            <Route path="/metadata" element={<ExamMetadataPage />} />
            <Route path="/sources" element={<DataSourcesOverviewPage />} />
            <Route path="/data-sources" element={<Navigate to="/sources" replace />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

