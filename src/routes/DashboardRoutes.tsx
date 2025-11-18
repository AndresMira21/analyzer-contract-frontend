import type { JSX } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import DashboardHome from '../components/dashboard/DashboardHome';
import ContractsPage from '../components/dashboard/ContractsPage';
import UploadContractPage from '../components/dashboard/UploadContractPage';
import AIAnalysisPage from '../components/dashboard/AIAnalysisPage';
import RecentlyDeleted from '../components/dashboard/RecentlyDeleted';
import SettingsPage from '../components/dashboard/SettingsPage';
import ContractDetails from '../components/ContractDetails';

export default function DashboardRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardHome />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="contracts/:id" element={<ContractDetails />} />
        <Route path="upload" element={<UploadContractPage />} />
        <Route path="ai" element={<AIAnalysisPage />} />
        <Route path="recently-deleted" element={<RecentlyDeleted />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}