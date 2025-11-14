import React from "react";

export function Card({ className = "", children, ...props }) {
  const cls = [
    "rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-md",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} {...props}>
      {children}
    </div>
  );
}