type PanelMode = 'login' | 'register';

export class AnimationFactory {
  // Devuelve props para motion.div del panel derecho
  static getPanelSlide(mode: PanelMode) {
    const x = mode === 'login' ? 30 : -30;
    return {
      initial: { opacity: 0, x },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.5 },
    } as const;
  }
}