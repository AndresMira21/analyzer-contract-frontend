import { motion } from 'motion/react';
import { FileText, Shield, Lock, Code2 } from 'lucide-react';

export function ProfessionalBackground() {
  const hexChars = '0123456789ABCDEF';
  const generateHexString = () => {
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += hexChars[Math.floor(Math.random() * hexChars.length)];
    }
    return result;
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      <svg className="absolute inset-0 w-full h-full opacity-[0.02]">
        <defs>
          <pattern id="hexagons" width="100" height="86.6" patternUnits="userSpaceOnUse">
            <path
              d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-blue-400"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>

      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`connection-${i}`}
          className="absolute"
          style={{
            top: `${10 + (i * 8)}%`,
            left: `${5 + (i * 7)}%`,
          }}
        >
          <svg width="200" height="2" className="text-blue-500/10">
            <motion.line
              x1="0"
              y1="1"
              x2="200"
              y2="1"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="10 5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1, 0],
                opacity: [0, 0.4, 0]
              }}
              transition={{
                duration: 8 + i * 0.5,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 0.8,
              }}
            />
          </svg>
        </motion.div>
      ))}

      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`hex-${i}`}
          initial={{ 
            opacity: 0,
            y: -50,
          }}
          animate={{ 
            opacity: [0, 0.15, 0.15, 0],
            y: [
              -50,
              window.innerHeight + 50,
            ],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 2,
          }}
          className="absolute text-blue-400/20 font-mono text-xs tracking-wider"
          style={{
            left: `${5 + i * 6}%`,
          }}
        >
          {generateHexString()}
        </motion.div>
      ))}

      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`node-${i}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1, 0.8],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 1.2,
          }}
          className="absolute w-3 h-3 bg-blue-500/20 rounded-full border border-blue-400/30"
          style={{
            top: `${15 + Math.random() * 70}%`,
            left: `${10 + Math.random() * 80}%`,
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)'
          }}
        />
      ))}

      {[Shield, Lock, Code2, FileText].map((Icon, i) => (
        <motion.div
          key={`corp-icon-${i}`}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.04, 0],
            y: [0, -80, 0],
            rotate: [0, 15, 0]
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 5,
          }}
          className="absolute"
          style={{
            top: `${20 + i * 20}%`,
            right: `${5 + i * 15}%`,
          }}
        >
          <Icon className="w-32 h-32 text-blue-300" strokeWidth={0.5} />
        </motion.div>
      ))}

      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`scan-${i}`}
          animate={{
            x: ['0%', '100%'],
            opacity: [0, 0.15, 0]
          }}
          transition={{
            duration: 12 + i * 3,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 4,
          }}
          className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-400/30 to-transparent"
          style={{
            left: `${i * 33}%`,
            filter: 'blur(1px)'
          }}
        />
      ))}

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.circle
            key={`data-${i}`}
            cx={`${10 + i * 15}%`}
            cy="50%"
            r="2"
            fill="rgb(59, 130, 246)"
            opacity="0"
            initial={{ cy: '0%', opacity: 0 }}
            animate={{ 
              cy: ['0%', '100%'],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 1.5,
            }}
          />
        ))}
      </svg>

      <div className="absolute inset-0 opacity-[0.015]" style={{ perspective: '1000px' }}>
        <motion.div
          animate={{
            rotateX: [0, 5, 0],
            rotateY: [0, -5, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-full h-full"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(59, 130, 246, 0.5) 50px, rgba(59, 130, 246, 0.5) 51px),
              repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(59, 130, 246, 0.5) 50px, rgba(59, 130, 246, 0.5) 51px)
            `,
            transformStyle: 'preserve-3d',
          }}
        />
      </div>

      {[...Array(30)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          initial={{ 
            opacity: 0,
            scale: 0,
          }}
          animate={{ 
            opacity: [0, 0.3, 0],
            scale: [0, 1, 0],
            y: [0, -200],
            x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100]
          }}
          transition={{
            duration: 8 + Math.random() * 6,
            repeat: Infinity,
            ease: 'easeOut',
            delay: Math.random() * 8,
          }}
          className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`edge-pulse-${i}`}
          initial={{ scale: 0, opacity: 0.2 }}
          animate={{ 
            scale: [0, 2.5],
            opacity: [0.15, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeOut',
            delay: i * 2,
          }}
          className="absolute w-64 h-64 border border-blue-400/20 rounded-full"
          style={{
            top: i < 2 ? '10%' : '80%',
            left: i % 2 === 0 ? '10%' : '80%',
          }}
        />
      ))}

      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] font-mono text-xs text-blue-400 overflow-hidden">
        <motion.pre
          animate={{
            y: ['0%', '-50%'],
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="whitespace-pre leading-relaxed"
        >
          {`function analyzeContract(document) {
  const clauses = extractClauses(document);
  const risks = identifyRisks(clauses);
  const recommendations = generateRecommendations(risks);
  return { clauses, risks, recommendations };
}

class ContractAnalyzer {
  constructor(aiModel) {
    this.model = aiModel;
    this.confidence = 0.95;
  }
  
  async analyze() {
    const result = await this.model.process();
    return result.validate();
  }
}`}
        </motion.pre>
      </div>
    </div>
  );
}