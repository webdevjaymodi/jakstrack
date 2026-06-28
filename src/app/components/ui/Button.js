"use client";

import Link from "next/link";

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  loading = false,
  disabled = false,
  href,
  ...rest
}) {
  const variants = {
    primary: "bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-semibold shadow-lg shadow-cyan-400/10",
    secondary: "border border-white/10 bg-slate-800/80 text-white hover:bg-slate-700 hover:border-white/20",
    danger: "bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25",
    ghost: "text-slate-400 hover:text-white hover:bg-white/10",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-xl",
  };

  const classes = `
    inline-flex items-center justify-center gap-2 font-medium transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variants[variant]} ${sizes[size]} ${className}
  `.trim();

  const spinner = (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} {...rest}>
        {loading && spinner}
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading && spinner}
      {children}
    </button>
  );
}
