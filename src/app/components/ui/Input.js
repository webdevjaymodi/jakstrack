"use client";

export default function Input({
  label,
  error,
  className = "",
  as = "input",
  ...rest
}) {
  const Component = as === "textarea" ? "textarea" : "input";

  const inputStyles =
    "w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 hover:border-white/20";

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <Component
        className={`${inputStyles} ${
          as === "textarea" ? "min-h-[120px] resize-y" : ""
        } ${error ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/20" : ""}`}
        {...rest}
      />
      {error && (
        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
          <svg
            className="w-3 h-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
