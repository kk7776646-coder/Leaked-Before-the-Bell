import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
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
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/create-account" element={<RegisterPage />} />
            <Route path="/register" element={<Navigate to="/create-account" replace />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected Application Routes with AppLayout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
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
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
