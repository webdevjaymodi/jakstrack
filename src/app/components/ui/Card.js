const paddings = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export default function Card({
  children,
  className = "",
  hover = false,
  padding = "md",
}) {
  const base = "rounded-2xl border border-white/10 bg-white/[0.04]";
  const hoverStyles = hover
    ? "hover:border-white/20 hover:bg-white/[0.06] transition-all duration-200 cursor-pointer"
    : "";

  return (
    <div
      className={`${base} ${paddings[padding] || paddings.md} ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  );
}
