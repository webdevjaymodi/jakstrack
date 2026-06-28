const variants = {
  default: "bg-slate-700/50 text-slate-300 border border-slate-600/30",
  success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  danger: "bg-red-500/15 text-red-400 border border-red-500/20",
  info: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20",
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-xs",
};

export default function Badge({
  children,
  variant = "default",
  size = "sm",
  className = "",
}) {
  return (
    <span
      className={`rounded-full inline-flex items-center font-medium whitespace-nowrap ${
        variants[variant] || variants.default
      } ${sizes[size] || sizes.sm} ${className}`}
    >
      {children}
    </span>
  );
}
