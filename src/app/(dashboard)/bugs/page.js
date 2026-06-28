"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Select from "@/app/components/ui/Select";
import Badge from "@/app/components/ui/Badge";
import Avatar from "@/app/components/ui/Avatar";
import StatusBadge from "@/app/components/ui/StatusBadge";
import PriorityBadge from "@/app/components/ui/PriorityBadge";
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
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

const BUG_STATUSES = ["", "OPEN", "ASSIGNED", "IN_PROGRESS", "FIXED", "RETEST", "CLOSED", "REOPENED"];
const PRIORITIES = ["", "LOW", "MEDIUM", "HIGH", "URGENT"];
const SEVERITIES = ["", "MINOR", "MAJOR", "CRITICAL", "BLOCKER"];

export default function BugsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
    priority: searchParams.get("priority") || "",
    severity: searchParams.get("severity") || "",
    projectId: searchParams.get("projectId") || "",
  });

  const fetchBugs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      if (filters.priority) params.set("priority", filters.priority);
      if (filters.severity) params.set("severity", filters.severity);
      if (filters.projectId) params.set("projectId", filters.projectId);
      params.set("page", page.toString());
      params.set("pageSize", pageSize.toString());

      const res = await fetch(`/api/bugs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBugs(data.bugs || data);
        setTotalCount(data.total ?? (data.bugs || data).length);
      }
    } catch (err) {
      console.error("Failed to fetch bugs:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data.projects || data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchBugs();
  }, [fetchBugs]);

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Bugs</h1>
          <p className="text-slate-400 text-sm mt-1">
            Showing {bugs.length} bug{bugs.length !== 1 ? "s" : ""}
            {totalCount > 0 && ` of ${totalCount}`}
          </p>
        </div>
        <Button onClick={() => router.push("/bugs/new")}>
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Bug
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input
            placeholder="Search bugs..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            }
          />
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            options={BUG_STATUSES.map((s) => ({
              value: s,
              label: s || "All Statuses",
            }))}
          />
          <Select
            value={filters.priority}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
            options={PRIORITIES.map((p) => ({
              value: p,
              label: p || "All Priorities",
            }))}
          />
          <Select
            value={filters.severity}
            onChange={(e) => handleFilterChange("severity", e.target.value)}
            options={SEVERITIES.map((s) => ({
              value: s,
              label: s || "All Severities",
            }))}
          />
          <Select
            value={filters.projectId}
            onChange={(e) => handleFilterChange("projectId", e.target.value)}
            options={[
              { value: "", label: "All Projects" },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </div>
      </div>

      {/* Bug List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : bugs.length === 0 ? (
        <EmptyState
          icon="🐛"
          title="No bugs found"
          description="Try adjusting your filters or create a new bug report."
          action={
            <Button onClick={() => router.push("/bugs/new")}>
              Create Bug Report
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {bugs.map((bug) => (
              <div
                key={bug.id}
                onClick={() => router.push(`/bugs/${bug.id}`)}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-xs font-mono">
                    {bug.bugId}
                  </Badge>
                  <PriorityBadge priority={bug.priority} />
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2">
                  {bug.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <span>{bug.project?.name || "—"}</span>
                  {bug.module && (
                    <>
                      <span>•</span>
                      <span>{bug.module}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <StatusBadge status={bug.status} />
                  <div className="flex items-center gap-2">
                    {bug.assignedTo && (
                      <div className="flex items-center gap-1.5">
                        <Avatar name={bug.assignedTo.name} size="xs" />
                        <span className="text-xs text-slate-400 hidden sm:inline">
                          {bug.assignedTo.name}
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-slate-500">
                      {timeAgo(bug.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        page === pageNum
                          ? "bg-cyan-400 text-slate-950"
                          : "text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
