export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={`rounded-full border-cyan-400/30 border-t-cyan-400 animate-spin ${sizes[size]} ${className}`}
      style={{ animationName: "spin", animationDuration: "0.7s", animationTimingFunction: "linear", animationIterationCount: "infinite" }}
    />
  );
}

export function FullPageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-400 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
