import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'motion/react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import DashboardNavbar from './DashboardNavbar';
import { ProfessionalBackground } from '../ProfessionalBackground.jsx';

export default function DashboardLayout(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [jsonReady, setJsonReady] = useState<boolean>(false);
  const [minDelayPassed, setMinDelayPassed] = useState<boolean>(false);
  const [lottieData, setLottieData] = useState<any>(null);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  useEffect(() => {
    const applyResponsive = () => {
      const isSmall = window.innerWidth < 1024;
      if (isSmall) setCollapsed(true);
    };
    applyResponsive();
    window.addEventListener('resize', applyResponsive);
    return () => window.removeEventListener('resize', applyResponsive);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const mod = await import('../../assets/animations/Robot run.json');
        if (!active) return;
        setLottieData((mod as any).default ?? mod);
        setJsonReady(true);
      } catch {
        setJsonReady(true);
      }
    })();
    const t = window.setTimeout(() => setMinDelayPassed(true), 3000);
    return () => { active = false; window.clearTimeout(t); };
  }, []);

  useEffect(() => {
    const onPop = () => { navigate('/dashboard', { replace: true }); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-blue-950 text-white relative">
      <ProfessionalBackground />
      <div className="flex h-screen relative z-10">
        <AnimatePresence>
          {!(jsonReady && minDelayPassed) && (
            <motion.div
              className="fixed inset-0 z-[2000] flex items-center justify-center"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{ background: 'linear-gradient(180deg, rgba(2,6,23,1) 0%, rgba(2,6,23,1) 100%)', backdropFilter: 'blur(6px)' }}
            >
              <div className="flex flex-col items-center">
                <div className="w-[260px] md:w-[340px]">
                  {lottieData ? <Lottie animationData={lottieData} loop autoplay /> : null}
                </div>
                <div className="mt-4 text-slate-300 text-xl">Cargando ...</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <DashboardSidebar
          userName={user?.name ?? 'Usuario'}
          userEmail={user?.email ?? ''}
          onLogout={handleLogout}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((v) => !v)}
          onItemSelected={() => setCollapsed(true)}
        />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar userName={user?.name ?? 'Usuario'} />
          <main className="flex-1 overflow-y-auto p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}