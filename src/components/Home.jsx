import { motion } from "motion/react";
import {
Scale,
Upload,
Brain,
FileCheck,
ShieldAlert,
MessageSquare,
Award,
FileText,
CheckCircle,
AlertTriangle,
Clock,
Lock,
BarChart3,
ArrowRight,
Sparkles,
FileSignature,
Shield,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ProfessionalBackground } from "./ProfessionalBackground.jsx";
export function HomePage({ onLogin, onRegister }) {

    const features = [
    {
    icon: Upload,
        title: "Carga Inteligente",
        description:
        "Sube tus contratos en PDF o texto. Validamos automáticamente que sea un documento legal válido.",
        color: "from-slate-600 to-slate-700",
    },
    {
        icon: Brain,
        title: "Análisis con IA",
        description:
        "Procesamiento avanzado con inteligencia artificial para detectar cláusulas clave y términos importantes.",
        color: "from-blue-700 to-blue-800",
    },
    {
        icon: ShieldAlert,
        title: "Detección de Riesgos",
        description:
        "Identificamos cláusulas abusivas, ambigüedades y posibles riesgos para tu protección.",
        color: "from-slate-700 to-slate-800",
    },
    {
        icon: MessageSquare,
        title: "Asistente Virtual",
        description:
        "Pregunta lo que quieras sobre tu contrato y recibe respuestas en lenguaje sencillo.",
    color: "from-blue-600 to-blue-700",
    },
    {
        icon: Award,
        title: "Evaluación de Factibilidad",
        description:
        "Obtén un puntaje de confianza basado en el equilibrio y riesgos del contrato.",
        color: "from-slate-600 to-blue-700",
    },
    {
        icon: FileCheck,
        title: "Reportes en PDF",
        description:
        "Descarga análisis completos con cláusulas, riesgos y recomendaciones profesionales.",
        color: "from-blue-800 to-slate-800",
    },
    ];

    const steps = [
    {
        number: "01",
        title: "Carga tu Contrato",
        description:
        "Arrastra o selecciona tu archivo PDF o documento de texto",
        icon: Upload,
    },
    {
        number: "02",
        title: "Análisis Automático",
        description:
        "Nuestra IA procesa el documento en segundos",
        icon: Brain,
    },
    {
        number: "03",
        title: "Recibe Insights",
        description:
        "Obtén análisis detallado, riesgos y recomendaciones",
        icon: Sparkles,
    },
    {
        number: "04",
        title: "Toma Decisiones",
        description:
        "Firma con confianza o solicita modificaciones",
        icon: FileSignature,
    },
    ];

    const clauseTypes = [
    {
        icon: Lock,
        text: "Confidencialidad",
        color: "text-blue-400",
    },
    {
        icon: Clock,
        text: "Duración y Vigencia",
        color: "text-slate-400",
    },
    {
        icon: AlertTriangle,
        text: "Penalidades",
        color: "text-blue-300",
    },
    {
        icon: CheckCircle,
        text: "Obligaciones",
        color: "text-slate-300",
    },
    {
        icon: BarChart3,
        text: "Clasificación",
        color: "text-blue-500",
    },
    ];

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 overflow-x-hidden font-sans antialiased tracking-wide">
        <ProfessionalBackground />

      {/* Header flotante */}
        <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-700/50"
        >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
            <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 4,
                }}
            >
                <Scale className="h-8 w-8 text-blue-400" />
            </motion.div>
            <span className="text-3xl text-white font-semibold tracking-tight">
                LegalConnect
            </span>
        </div>

            <div className="flex items-center gap-3">
            <Button
            variant="ghost"
            onClick={onLogin}
            className="text-lg text-slate-300 hover:bg-slate-800/50 hover:text-white font-medium tracking-wide"
            >
              Iniciar Sesión
            </Button>
            <Button
              onClick={onRegister}
              className="text-lg bg-blue-700 hover:bg-blue-600 text-white shadow-lg shadow-blue-900/30 font-semibold tracking-wide"
            >
              Regístrate Gratis
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block"
            >
              <div className="px-6 py-2 bg-slate-800/50 border border-slate-700/50 rounded-full backdrop-blur-sm">
                <span className="text-lg md:text-xl text-slate-300 flex items-center gap-2 font-medium tracking-wide">
                  <Sparkles className="h-5 w-5" />
                  Análisis Legal Asistido por IA
                </span>
              </div>
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-5xl md:text-7xl lg:text-8xl text-white max-w-6xl mx-auto leading-tight font-extrabold tracking-tight"
              >
                Tu asistente inteligente para
              </motion.h1>

              {/* Texto estático con efecto de brillo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="relative"
              >
                <motion.h2
                  className="text-5xl md:text-7xl lg:text-8xl bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent inline-block relative font-extrabold tracking-tight"
                  animate={{
                    backgroundPosition: ["0%", "100%", "0%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    backgroundSize: "200% auto",
                  }}
                >
                  análisis de contratos

                  {/* Efecto de brillo que recorre el texto */}
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                    animate={{
                      opacity: [0, 0.3, 0],
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: "easeInOut",
                    }}
                    style={{
                      backgroundSize: "50% 100%",
                      filter: "blur(20px)",
                    }}
                  />
                </motion.h2>
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-xl md:text-2xl text-slate-300/90 max-w-2xl mx-auto leading-relaxed"
            >
              Solución que apoya el trabajo legal: analiza cláusulas,
              identifica riesgos y facilita decisiones informadas con
              apoyo de inteligencia artificial.
            </motion.p>

            {/* Iconos flotantes animados alrededor del hero */}
            {[
              { Icon: Brain, delay: 0, x: -100, y: -50 },
              { Icon: Shield, delay: 0.2, x: 100, y: -30 },
              { Icon: FileCheck, delay: 0.4, x: -80, y: 80 },
              { Icon: Award, delay: 0.6, x: 90, y: 100 },
            ].map(({ Icon, delay, x, y }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{
                  opacity: { duration: 4, repeat: Infinity, delay },
                  scale: { duration: 4, repeat: Infinity, delay },
                  rotate: { duration: 20, repeat: Infinity, ease: "linear", delay },
                }}
                className="absolute hidden lg:block"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                }}
              >
                <Icon className="w-16 h-16 text-blue-400/20" />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Elementos decorativos más sutiles */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-40 left-20 w-96 h-96 bg-blue-700/10 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.03, 0.08, 0.03],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-slate-700/10 rounded-full blur-3xl pointer-events-none"
        />

        {/* Partículas brillantes flotantes */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: [0, -100],
              x: [0, (Math.random() - 0.5) * 100],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeOut",
            }}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: "0 0 10px 2px rgba(59, 130, 246, 0.5)",
            }}
          />
        ))}
      </section>

      {/* Cómo funciona */}
      <section className="relative py-20 px-6">
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.h2
              className="text-5xl md:text-6xl bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent mb-4 tracking-tight font-bold leading-tight"
              initial={{ opacity: 0, letterSpacing: "-0.05em" }}
              whileInView={{
                opacity: 1,
                letterSpacing: "0.02em",
              }}
              animate={{
                backgroundPosition: ["0%", "100%", "0%"],
              }}
              style={{
                backgroundSize: "200% auto",
              }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              CÓMO FUNCIONA
            </motion.h2>
            <motion.div
              className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-500 via-slate-400 to-blue-500 rounded-full"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <p className="text-2xl text-slate-400 leading-relaxed tracking-wide">
              Analizar tus contratos nunca fue tan fácil
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="relative"
              >
                <Card className="bg-slate-900/50 backdrop-blur-lg border-slate-700/50 p-8 h-full hover:bg-slate-800/50 hover:border-blue-600/50 transition-all duration-300 group relative overflow-hidden">
                  {/* Efecto de luz en hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-400/10 to-blue-600/0"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  
                  <div className="absolute -top-4 -left-4 text-6xl font-mono opacity-5 group-hover:opacity-10 transition-opacity text-blue-400">
                    {step.number}
                  </div>
                  <div className="relative">
                    <motion.div
                      className={`h-16 w-16 bg-gradient-to-br ${index % 2 === 0 ? "from-slate-700 to-slate-800" : "from-blue-700 to-blue-800"} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative`}
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <step.icon className="h-8 w-8 text-white" />
                      
                      {/* Pulso en el icono */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-blue-400/20"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.3,
                        }}
                      />
                    </motion.div>
                    <h3 className="text-2xl text-white mb-3 font-semibold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-lg text-slate-400 leading-relaxed tracking-wide">
                      {step.description}
                    </p>
                  </div>
                </Card>

                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-slate-600 to-transparent"
                  >
                    {/* Partícula que se mueve por la línea */}
                    <motion.div
                      className="absolute w-2 h-2 bg-blue-400 rounded-full"
                      animate={{
                        x: [0, 24, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.5,
                      }}
                      style={{
                        boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)',
                      }}
                    />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Características principales */}
      <section className="relative py-20 px-6 bg-slate-950/30">
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.h2
              className="text-5xl md:text-6xl bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent mb-4 tracking-tight font-bold leading-tight"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
              style={{ backgroundSize: "200% auto" }}
            >
              TECNOLOGÍA QUE TE PROTEGE
            </motion.h2>
            <motion.div
              className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-500 via-slate-400 to-blue-500 rounded-full"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <p className="text-2xl text-slate-400 leading-relaxed tracking-wide">
              Herramientas potentes para análisis legal
              inteligente
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  y: -15,
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className="bg-slate-900/50 backdrop-blur-lg border-slate-700/50 p-8 h-full hover:bg-slate-800/50 hover:border-blue-600/50 hover:shadow-2xl hover:shadow-blue-600/20 transition-all duration-300 group overflow-hidden relative">
                  {/* Resplandor de fondo animado */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />
                  
                  {/* Efecto de onda en hover */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className={`w-full h-full bg-gradient-to-r ${feature.color} rounded-full blur-3xl`} />
                  </motion.div>

                  <div className="relative">
                    <motion.div
                      className={`h-14 w-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg relative`}
                    >
                      <feature.icon className="h-7 w-7 text-white" />
                      
                      {/* Anillos de pulso alrededor del icono */}
                      <motion.div
                        className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.color}`}
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.6, 0, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.2,
                        }}
                      />
                      <motion.div
                        className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.color}`}
                        animate={{
                          scale: [1, 1.6, 1],
                          opacity: [0.4, 0, 0.4],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.2 + 0.5,
                        }}
                      />
                    </motion.div>
                    <motion.h3 
                      className="text-2xl text-white mb-3 font-semibold tracking-tight"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {feature.title}
                    </motion.h3>
                    <p className="text-lg text-slate-400 leading-relaxed tracking-wide">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Partículas que aparecen en hover */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100"
                      style={{
                        left: `${20 + i * 30}%`,
                        top: `${30 + i * 20}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detección de Cláusulas */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.h2
                className="text-5xl md:text-6xl bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent mb-7 tracking-tight font-bold leading-tight"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                style={{ backgroundSize: "200% auto" }}
              >
                DETECTAMOS LAS CLÁUSULAS QUE IMPORTAN
              </motion.h2>
              <motion.div
                className="h-1 w-24 bg-gradient-to-r from-blue-500 via-slate-400 to-blue-500 rounded-full mb-6"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <p className="text-2xl text-slate-400 mb-10">
                Nuestro sistema identifica automáticamente los
                elementos críticos de tu contrato y te alerta
                sobre posibles riesgos.
              </p>

              <div className="space-y-4">
                {clauseTypes.map((clause, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:bg-slate-800/50 transition-colors"
                  >
                    <clause.icon
                      className={`h-7 w-7 ${clause.color}`}
                    />
                    <span className="text-white text-lg">
                      {clause.text}
                    </span>
                    <CheckCircle className="h-6 w-6 text-blue-400 ml-auto" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-3 w-3 rounded-full bg-slate-600" />
                  <div className="h-3 w-3 rounded-full bg-slate-600" />
                  <div className="h-3 w-3 rounded-full bg-blue-600" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-700/50">
                    <FileText className="h-9 w-9 text-blue-400" />
                    <div>
                      <div className="text-white">
                        Contrato_Arrendamiento.pdf
                      </div>
                      <div className="text-sm text-slate-400">
                        Analizado hace 2 minutos
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="flex items-center gap-2 text-blue-400"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm">
                        Cláusula de confidencialidad detectada
                      </span>
                    </motion.div>

                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.3,
                      }}
                      className="flex items-center gap-2 text-slate-400"
                    >
                      <AlertTriangle className="h-5 w-5" />
                      <span className="text-sm">
                        Penalidad alta detectada - Revisar
                      </span>
                    </motion.div>

                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.6,
                      }}
                      className="flex items-center gap-2 text-slate-300"
                    >
                      <Brain className="h-5 w-5" />
                      <span className="text-sm">
                        Análisis de IA completado
                      </span>
                    </motion.div>
                  </div>

                  <div className="pt-4 border-t border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">
                        Nivel de Confianza
                      </span>
                      <span className="text-white">87%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "87%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Elementos decorativos */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-700/10 to-slate-700/10 rounded-full blur-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-slate-900/80 via-blue-950/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-14 text-center relative overflow-hidden"
          >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 0],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0 bg-gradient-to-r from-blue-900/5 via-slate-800/5 to-blue-900/5"
              />

              <div className="relative">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="inline-block mb-6"
                >
                  <Sparkles className="h-20 w-20 text-blue-400" />
                </motion.div>

              <motion.h2
                className="text-5xl md:text-6xl bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent mb-6 tracking-tight font-bold leading-tight"
                animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                style={{ backgroundSize: "200% auto" }}
              >
                ¿Listo para analizar tus contratos?
              </motion.h2>
              <motion.div
                className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-500 via-slate-400 to-blue-500 rounded-full"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <p className="text-2xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Únete a LegalConnect y toma decisiones
                informadas con el respaldo de inteligencia
                artificial
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={onRegister}
                  className="bg-blue-700 hover:bg-blue-600 text-white text-lg px-10 py-7 shadow-2xl hover:shadow-blue-900/30 transition-all duration-300 group"
                >
                  Crear Cuenta Gratis
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onLogin}
                  className="bg-slate-900/50 backdrop-blur-sm border-slate-700 text-white hover:bg-slate-800/50 text-lg px-10 py-7"
                >
                  Ya tengo cuenta
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-slate-800/50">
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Scale className="h-8 w-8 text-blue-400" />
              <span className="text-xl text-white">
                LegalConnect
              </span>
            </div>

            <p className="text-slate-500 text-sm">
              © 2025 LegalConnect. Análisis legal asistido por
              IA.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}