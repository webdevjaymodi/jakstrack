export default function EmptyState({
  icon = "📭",
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <span className="text-5xl mb-4" role="img" aria-label="empty state icon">
        {icon}
      </span>
      {title && (
        <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-slate-500 text-sm text-center max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
