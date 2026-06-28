export default function EmptyState({
  icon = "📭",
  title = "Nothing here yet",
  description = "",
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-slate-300 mb-1">{title}</h3>
      {description && (
        <p className="text-slate-500 text-sm max-w-md">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
