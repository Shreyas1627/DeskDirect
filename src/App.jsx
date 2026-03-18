import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { useAuth } from './hooks/useAuth';
import LoginPage  from './pages/LoginPage';
import { Dashboard } from './components/Dashboard';
import MarketsPage   from './pages/MarketsPage';
import PortfolioPage from './pages/PortfolioPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RiskPage      from './pages/RiskPage';
import AlertsPage    from './pages/AlertsPage';

// ── Auth Guard ─────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        >
          {/* default child */}
          <Route index element={<MarketsPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="risk"      element={<RiskPage />} />
          <Route path="alerts"    element={<AlertsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
