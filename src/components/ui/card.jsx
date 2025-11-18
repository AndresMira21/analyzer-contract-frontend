import React from "react";

export function Card({ className = "", variant = "glass", children, ...props }) {
  const base = "rounded-xl border border-slate-700/50";
  const look = variant === "solid" ? "bg-slate-900" : "bg-slate-900/50 backdrop-blur-md";
  const cls = [base, look, className].filter(Boolean).join(" ");
  return (
    <div className={cls} {...props}>
      {children}
    </div>
  );
}