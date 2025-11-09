import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import UploadContract from './components/UploadContract';
import Settings from './components/Settings';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<UploadContract />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;