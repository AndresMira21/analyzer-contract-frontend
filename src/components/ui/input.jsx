export function Input({ className = '', ...props }) {
  const base = 'w-full px-4 py-3 bg-slate-900/80 border border-blue-500/30 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all';
  const classes = className ? base + ' ' + className : base;
  return <input {...props} className={classes} />;
}

export default Input;