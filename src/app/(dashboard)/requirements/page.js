"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";
import PriorityBadge from "@/app/components/ui/PriorityBadge";
import Avatar from "@/app/components/ui/Avatar";
import EmptyState from "@/app/components/ui/EmptyState";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RequirementsPage() {
  const router = useRouter();
  const [requirements, setRequirements] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", projectId: "" });

  const fetchRequirements = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.projectId) params.set("projectId", filters.projectId);

    try {
      const res = await fetch(`/api/requirements?${params}`);
      const data = await res.json();
      setRequirements(data.requirements || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetch("/api/projects").then((r) => r.json()).then((d) => setProjects(d.projects || []));
  }, []);

  useEffect(() => { fetchRequirements(); }, [fetchRequirements]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Requirements</h1>
          <p className="text-sm text-slate-400 mt-1">Showing {total} requirement{total !== 1 ? "s" : ""}</p>
        </div>
        <Button href="/requirements/new">+ New Requirement</Button>
      </div>

      <Card padding="sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input placeholder="Search..." value={filters.search} onChange={(e) => handleFilterChange("search", e.target.value)} className="col-span-2 md:col-span-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400" />
          <select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)} className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none">
            <option value="">All Status</option>
            {["PENDING", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "CANCELLED"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
          <select value={filters.priority} onChange={(e) => handleFilterChange("priority", e.target.value)} className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none">
            <option value="">All Priority</option>
            {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filters.projectId} onChange={(e) => handleFilterChange("projectId", e.target.value)} className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none">
            <option value="">All Projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : requirements.length === 0 ? (
        <EmptyState icon="📋" title="No requirements found" description="Try adjusting your filters or add a new requirement." action={<Button href="/requirements/new">+ Add Requirement</Button>} />
      ) : (
        <div className="space-y-3">
          {requirements.map((req) => (
            <Card key={req.id} hover padding="sm" onClick={() => router.push(`/requirements/${req.id}`)}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-semibold text-cyan-400">{req.reqId}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs text-slate-400">{req.project?.name}</span>
                  </div>
                  <p className="text-sm font-medium text-white truncate">{req.title}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <StatusBadge status={req.status} />
                  <PriorityBadge priority={req.priority} />
                  {req.assignedTo && <Avatar name={req.assignedTo.name} size="sm" />}
                  <span className="text-xs text-slate-500">{timeAgo(req.createdAt)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Previous</Button>
          <span className="text-sm text-slate-400 px-4">Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</Button>
        </div>
      )}
    </div>
  );
}
