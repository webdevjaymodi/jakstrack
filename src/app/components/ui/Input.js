"use client";

export default function Input({
  label,
  error,
  className = "",
  as = "input",
  ...rest
}) {
  const Tag = as === "textarea" ? "textarea" : "input";

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <Tag
        className={`
          w-full bg-slate-900 border rounded-xl px-4 py-3 text-white
          placeholder-slate-500 outline-none transition-all duration-200
          ${error ? "border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400/20" : "border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"}
        `}
        {...rest}
      />
      {error && (
        <p className="text-red-400 text-xs mt-1.5">{error}</p>
      )}
    </div>
  );
}
