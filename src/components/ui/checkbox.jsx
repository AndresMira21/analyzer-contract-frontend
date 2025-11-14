export function Checkbox({ id, checked, onCheckedChange, className = '', ...props }) {
  const base = 'h-4 w-4 rounded border-slate-700 text-blue-500 focus:ring-blue-500';
  const classes = className ? base + ' ' + className : base;
  const handleChange = (e) => {
    if (onCheckedChange) onCheckedChange(e.target.checked);
  };
  return (
    <input
      type="checkbox"
      id={id}
      checked={!!checked}
      onChange={handleChange}
      className={classes}
      {...props}
    />
  );
}

export default Checkbox;