const COLORS = [
  "bg-cyan-600", "bg-violet-600", "bg-emerald-600", "bg-amber-600",
  "bg-rose-600", "bg-blue-600", "bg-indigo-600", "bg-teal-600",
];

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

function getColor(name) {
  if (!name) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function Avatar({ name, size = "md", className = "" }) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold text-white ${getColor(name)} ${sizes[size]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
