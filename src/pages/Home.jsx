import { motion } from 'framer-motion';

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-2xl md:text-4xl font-semibold text-gray-900 text-center"
      >
        Analizador de Contratos Legales con IA
      </motion.h1>
    </div>
  );
}

export default Home;