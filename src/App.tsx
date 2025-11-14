import { HomePage } from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import { Routes, Route, useNavigate } from "react-router-dom";
import type { JSX } from "react";

function App(): JSX.Element {
  const navigate = useNavigate();
  const handleLogin: () => void = () => navigate("/login");
  const handleRegister: () => void = () => navigate("/register");

  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage onLogin={handleLogin} onRegister={handleRegister} />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;