"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Avatar from "@/app/components/ui/Avatar";
import StatusBadge from "@/app/components/ui/StatusBadge";
import PriorityBadge from "@/app/components/ui/PriorityBadge";
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

const STATUS_COLORS = {
  OPEN: "bg-blue-500",
  ASSIGNED: "bg-indigo-500",
  IN_PROGRESS: "bg-amber-500",
  FIXED: "bg-emerald-500",
  RETEST: "bg-purple-500",
  CLOSED: "bg-slate-500",
  REOPENED: "bg-red-500",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Bugs",
      value: data?.totalBugs ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0112 12.75zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 01-1.152-6.135c-.117-1.955-1.727-3.43-3.68-3.43h-6.75c-1.953 0-3.563 1.475-3.68 3.43a23.91 23.91 0 01-1.152 6.135A24.073 24.073 0 0112 12.75z" />
        </svg>
      ),
      gradient: "from-purple-500/20 to-purple-600/5",
      iconColor: "text-purple-400",
      borderColor: "border-purple-500/20",
    },
    {
      label: "Open Bugs",
      value: data?.openBugs ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      ),
      gradient: "from-cyan-500/20 to-cyan-600/5",
      iconColor: "text-cyan-400",
      borderColor: "border-cyan-500/20",
    },
    {
      label: "Critical Bugs",
      value: data?.criticalBugs ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
        </svg>
      ),
      gradient: "from-red-500/20 to-red-600/5",
      iconColor: "text-red-400",
      borderColor: "border-red-500/20",
    },
    {
      label: "Requirements",
      value: data?.totalRequirements ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
      ),
      gradient: "from-emerald-500/20 to-emerald-600/5",
      iconColor: "text-emerald-400",
      borderColor: "border-emerald-500/20",
    },
  ];

  const statusBreakdown = data?.statusBreakdown || {};

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
        .delay-6 { animation-delay: 0.6s; }
      `}</style>

      <div className="space-y-6">
        {/* Welcome */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(" ")[0] || "User"} 👋
          </h1>
          <p className="text-slate-400 mt-1">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`animate-fade-in delay-${i + 1} rounded-2xl border ${stat.borderColor} bg-gradient-to-br ${stat.gradient} p-5 hover:scale-[1.02] transition-transform duration-300`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`${stat.iconColor}`}>{stat.icon}</span>
                <span className="text-3xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bug Status Breakdown */}
        <div className="animate-fade-in delay-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Bug Status Breakdown</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(STATUS_COLORS).map(([status, color]) => {
              const count = statusBreakdown[status] || 0;
              return (
                <div
                  key={status}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-sm text-slate-300">{status.replace("_", " ")}</span>
                  <span className="text-sm font-bold text-white ml-1">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 animate-fade-in delay-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {(data?.recentActivities || []).length === 0 && (
                <p className="text-slate-500 text-sm py-4 text-center">No recent activity</p>
              )}
              {(data?.recentActivities || []).map((activity, i) => (
                <div
                  key={activity.id || i}
                  className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <Avatar name={activity.user?.name || "User"} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300">
                      <span className="font-medium text-white">{activity.user?.name || "User"}</span>{" "}
                      {activity.action}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {timeAgo(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="animate-fade-in delay-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2.5">
              <Button className="w-full justify-start" onClick={() => router.push("/bugs/new")}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Bug Report
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => router.push("/requirements/new")}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Requirement
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => router.push("/projects")}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
                View Projects
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => router.push("/team")}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                View Team
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Bugs */}
        <div className="animate-fade-in delay-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Bugs</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push("/bugs")}>
              View all →
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {(data?.recentBugs || []).length === 0 && (
              <p className="text-slate-500 text-sm py-4 col-span-full text-center">No bugs yet</p>
            )}
            {(data?.recentBugs || []).map((bug) => (
              <div
                key={bug.id}
                onClick={() => router.push(`/bugs/${bug.id}`)}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06] hover:border-cyan-500/30 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {bug.bugId}
                  </Badge>
                  <StatusBadge status={bug.status} />
                </div>
                <h3 className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {bug.title}
                </h3>
                <div className="flex items-center justify-between mt-3">
                  <PriorityBadge priority={bug.priority} />
                  <span className="text-xs text-slate-500">
                    {timeAgo(bug.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
