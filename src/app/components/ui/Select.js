"use client";

export default function Select({
  label,
  options = [],
  error,
  placeholder,
  className = "",
  ...rest
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            w-full appearance-none bg-slate-900 border rounded-xl px-4 py-3 pr-10 text-white
            outline-none transition-all duration-200
            ${error ? "border-red-500 focus:border-red-400" : "border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"}
          `}
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
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-1.5">{error}</p>
      )}
    </div>
  );
}
