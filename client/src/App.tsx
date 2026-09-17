import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { SubscriptionFormPage } from './pages/SubscriptionFormPage';
import { SubscriptionDetailPage } from './pages/SubscriptionDetailPage';
import { CalendarPage } from './pages/CalendarPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth Pages */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Authenticated Dashboard Pages */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
              <Route path="/subscriptions/new" element={<SubscriptionFormPage />} />
              <Route path="/subscriptions/:id" element={<SubscriptionDetailPage />} />
              <Route path="/subscriptions/:id/edit" element={<SubscriptionFormPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/evaluation" element={<EvaluationPage />} />
              <Route path="/settings" element={<ProfileSettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
