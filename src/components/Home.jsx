import { motion } from 'framer-motion';

const variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
      <motion.h1
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="text-center text-xl md:text-3xl font-semibold text-gray-900"
      >
        Bienvenido al Analizador de Contratos Legales con IA
      </motion.h1>
    </div>
  );
}

export default Home;