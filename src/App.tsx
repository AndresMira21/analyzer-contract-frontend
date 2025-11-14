import { HomePage } from "./components/Home";
import { LoginContent } from "./components/Login";
import { RegisterContent } from "./components/Register";
import { AuthLayout } from "./components/AuthLayout";
import { Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import type { JSX } from "react";

function App(): JSX.Element {
  const navigate = useNavigate();
  const handleLogin: () => void = () => navigate("/login");
  const handleRegister: () => void = () => navigate("/register");

  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/"
          element={<HomePage onLogin={handleLogin} onRegister={handleRegister} />}
        />
        {/* Layout padre sin path: mantiene ilustración y fondo persistentes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginContent />} />
          <Route path="/register" element={<RegisterContent />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;