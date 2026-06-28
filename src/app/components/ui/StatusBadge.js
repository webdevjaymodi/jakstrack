import Badge from "./Badge";

const STATUS_MAP = {
  OPEN: { variant: "info", label: "Open" },
  PENDING: { variant: "info", label: "Pending" },
  ASSIGNED: { variant: "warning", label: "Assigned" },
  IN_PROGRESS: { variant: "warning", label: "In Progress" },
  FIXED: { variant: "success", label: "Fixed" },
  COMPLETED: { variant: "success", label: "Completed" },
  RETEST: { variant: "info", label: "Retest" },
  CLOSED: { variant: "default", label: "Closed" },
  REOPENED: { variant: "danger", label: "Reopened" },
  ON_HOLD: { variant: "warning", label: "On Hold" },
  CANCELLED: { variant: "default", label: "Cancelled" },
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || { variant: "default", label: status };

  const dotColors = {
    info: "bg-cyan-400",
    warning: "bg-amber-400",
    success: "bg-emerald-400",
    danger: "bg-red-400",
    default: "bg-slate-400",
  };

  return (
    <Badge variant={config.variant}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[config.variant]}`} />
      {config.label}
    </Badge>
  );
}
