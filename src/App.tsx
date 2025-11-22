import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import type { JSX } from "react";
import { HomePage } from "./components/Home";
import { LoginForm } from "./components/Login";
import { motion } from "motion/react";
import { ProfessionalBackground } from "./components/ProfessionalBackground.jsx";
import { ContractAnimation } from "./components/ContractAnimation";
import { AnimationFactory } from "./utils/animationFactory";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

type Screen = "home" | "login" | "register" | "dashboard";

function App(): JSX.Element | null {
  const [screen, setScreen] = useState<Screen>("home");
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    const authed = isAuthenticated();
    if (authed && (path === "/login" || path === "/register")) {
      navigate("/dashboard", { replace: true });
      return;
    }
    if (path === "/login") {
      setScreen("login");
      return;
    }
    if (path === "/register") {
      setScreen("register");
      return;
    }
    if (path === "/dashboard") {
      setScreen("dashboard");
      return;
    }
    setScreen("home");
  }, [location.pathname, isAuthenticated, navigate]);

  if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/contracts')) {
    return null;
  }

  const goLogin = () => navigate("/login");
  const goRegister = () => navigate("/register");
  

  switch (screen) {
    case "dashboard":
      return null;
    case "login":
    case "register": {
      const mode = screen;
      const { initial, animate, transition } = AnimationFactory.getPanelSlide(mode);
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-6 relative font-sans antialiased tracking-wide">
          <ProfessionalBackground />
          <div className="w-full h-full max-w-[1600px] mx-auto">
            <div className="grid md:grid-cols-2 gap-0 h-full min-h-[700px]">
              <ContractAnimation />
              <div className="w-full">
                <motion.div initial={initial} animate={animate} transition={transition}>
                  <LoginForm
                    mode={mode}
                    onModeChange={(m) => { if (m === "login") goLogin(); else goRegister(); }}
                    onRegisterSuccess={() => goLogin()}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    case "home":
    default:
      return (
        <HomePage onLogin={goLogin} onRegister={goRegister} />
      );
  }
}

export default App;
