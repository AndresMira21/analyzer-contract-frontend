export function Label({ className = '', ...props }) {
  const base = 'block text-sm font-medium text-slate-300';
  const classes = className ? base + ' ' + className : base;
  return <label {...props} className={classes} />;
}

export default Label;