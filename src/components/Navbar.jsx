import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

function Navbar() {
  const linkBase =
    'px-4 py-2 rounded-md text-sm md:text-base font-medium text-white transition-colors';

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-800 text-white shadow-md z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-14 flex items-center gap-4">
          <motion.div className="flex items-center gap-4"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div whileHover={{ scale: 1.03 }}>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? 'bg-gray-700' : 'bg-transparent'} hover:text-blue-300`
                }
              >
                Inicio
              </NavLink>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }}>
              <NavLink
                to="/upload"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? 'bg-gray-700' : 'bg-transparent'} hover:text-blue-300`
                }
              >
                Subir Contrato
              </NavLink>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }}>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? 'bg-gray-700' : 'bg-transparent'} hover:text-blue-300`
                }
              >
                Configuración
              </NavLink>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;