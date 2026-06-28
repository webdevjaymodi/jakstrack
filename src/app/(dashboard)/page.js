"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import StatusBadge from "@/app/components/ui/StatusBadge";
import PriorityBadge from "@/app/components/ui/PriorityBadge";
import Avatar from "@/app/components/ui/Avatar";
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

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    { label: "Total Bugs", value: data?.totalBugs || 0, icon: "🐛", accent: "from-violet-500/20 to-violet-500/5" },
    { label: "Open Bugs", value: data?.openBugs || 0, icon: "🔓", accent: "from-cyan-500/20 to-cyan-500/5" },
    { label: "Critical Bugs", value: data?.criticalBugs || 0, icon: "🔴", accent: "from-red-500/20 to-red-500/5" },
    { label: "Requirements", value: data?.totalRequirements || 0, icon: "📋", accent: "from-emerald-500/20 to-emerald-500/5" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Here&apos;s your project overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card
            key={stat.label}
            className={`animate-slide-up delay-${i + 1} bg-gradient-to-br ${stat.accent}`}
          >
            <span className="text-2xl">{stat.icon}</span>
            <h3 className="text-3xl font-bold text-white mt-2">{stat.value}</h3>
            <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Bugs */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Bugs</h3>
              <Button variant="ghost" size="sm" href="/bugs">View all →</Button>
            </div>
            <div className="space-y-3">
              {data?.recentBugs?.length > 0 ? (
                data.recentBugs.map((bug) => (
                  <div
                    key={bug.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-cyan-400">
                        {bug.bugId} • {bug.project?.name}
                      </p>
                      <p className="text-sm font-medium text-white truncate mt-0.5">{bug.title}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={bug.status} />
                      <PriorityBadge priority={bug.priority} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm py-4 text-center">No bugs yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions + Activity */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="primary" className="w-full justify-start" href="/bugs/new">
                🐛 Report New Bug
              </Button>
              <Button variant="secondary" className="w-full justify-start" href="/requirements/new">
                📋 Add Requirement
              </Button>
              <Button variant="secondary" className="w-full justify-start" href="/projects">
                📁 View Projects
              </Button>
              <Button variant="secondary" className="w-full justify-start" href="/team">
                👥 Manage Team
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {data?.recentActivity?.length > 0 ? (
                data.recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <Avatar name={activity.user?.name || "?"} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-300">
                        <span className="font-medium text-white">{activity.user?.name}</span>{" "}
                        {activity.action}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activity.bug?.bugId || activity.requirement?.reqId || ""} • {timeAgo(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm text-center py-2">No activity yet</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
