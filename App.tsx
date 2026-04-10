import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TimerPage from './pages/TimerPage';
import TasksPage from './pages/TasksPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';
import { AuthProvider } from './components/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<TimerPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
