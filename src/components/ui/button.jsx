import React from "react";

const base = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-md";

const variants = {
  default: "bg-blue-600 text-white hover:bg-blue-500",
  outline: "border border-slate-700 text-white bg-transparent hover:bg-slate-800/50",
  ghost: "text-slate-300 hover:bg-slate-800/50 hover:text-white",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({ variant = "default", size = "md", className = "", ...props }) {
  const cls = [base, variants[variant] || variants.default, sizes[size] || sizes.md, className]
    .filter(Boolean)
    .join(" ");
  return <button className={cls} {...props} />;
}