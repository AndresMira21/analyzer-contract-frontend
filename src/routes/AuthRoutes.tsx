import type { JSX } from 'react';
import { Routes, Route } from 'react-router-dom';
import NewLogin from '../components/Login';
import NewRegister from '../components/Register';

export default function AuthRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path="/login-alt" element={<NewLogin />} />
      <Route path="/register-alt" element={<NewRegister />} />
    </Routes>
  );
}