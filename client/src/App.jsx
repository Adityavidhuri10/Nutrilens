import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Modern custom styled Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#16171d',
            color: '#f3f4f6',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
          },
          success: {
            iconTheme: {
              primary: '#a855f7',
              secondary: '#16171d',
            },
          },
        }}
      />
    </>
  );
}

export default App;
