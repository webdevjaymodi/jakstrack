import Badge from "./Badge";

const PRIORITY_MAP = {
  LOW: { variant: "default", label: "Low" },
  MEDIUM: { variant: "info", label: "Medium" },
  HIGH: { variant: "warning", label: "High" },
  URGENT: { variant: "danger", label: "Urgent" },
};

export default function PriorityBadge({ priority }) {
  const config = PRIORITY_MAP[priority] || { variant: "default", label: priority };

  const dotColors = {
    default: "bg-slate-400",
    info: "bg-cyan-400",
    warning: "bg-amber-400",
    danger: "bg-red-400",
  };

  return (
    <Badge variant={config.variant}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[config.variant]}`} />
      {config.label}
    </Badge>
  );
}
