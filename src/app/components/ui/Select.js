"use client";

export default function Select({
  label,
  options = [],
  error,
  placeholder,
  className = "",
  ...rest
}) {
  const selectStyles =
    "w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 hover:border-white/20 appearance-none cursor-pointer";

  const chevronSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`${selectStyles} pr-10 ${
            error
              ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/20"
              : ""
          }`}
          style={{
            backgroundImage: chevronSvg,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
            backgroundSize: "16px",
          }}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
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
