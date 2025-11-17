import type { JSX } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardHome from '../components/dashboard/DashboardHome';
import ContractsPage from '../components/dashboard/ContractsPage';
import UploadContractPage from '../components/dashboard/UploadContractPage';
import AIAnalysisPage from '../components/dashboard/AIAnalysisPage';
import SettingsPage from '../components/dashboard/SettingsPage';
import ContractDetails from '../components/ContractDetails';

export default function DashboardRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="upload" element={<UploadContractPage />} />
        <Route path="ai" element={<AIAnalysisPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="/contracts/:id" element={<ContractDetails />} />
    </Routes>
  );
}