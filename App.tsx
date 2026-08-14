import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './components/AuthProvider';

const TimerPage = lazy(() => import('./pages/TimerPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const DailyPlanPage = lazy(() => import('./pages/DailyPlanPage'));

// Fallback loader
const PageLoader = () => (
  <div className="flex h-full w-full items-center justify-center bg-[#fdfbf9]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c24127]"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={
              <Suspense fallback={<PageLoader />}>
                <TimerPage />
              </Suspense>
            } />
            <Route path="stats" element={
              <Suspense fallback={<PageLoader />}>
                <StatsPage />
              </Suspense>
            } />
            <Route path="report" element={
              <Suspense fallback={<PageLoader />}>
                <ReportPage />
              </Suspense>
            } />
            <Route path="settings" element={
              <Suspense fallback={<PageLoader />}>
                <SettingsPage />
              </Suspense>
            } />
            <Route path="daily-plan" element={
              <Suspense fallback={<PageLoader />}>
                <DailyPlanPage />
              </Suspense>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
