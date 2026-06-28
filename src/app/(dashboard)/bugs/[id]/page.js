"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";
import PriorityBadge from "@/app/components/ui/PriorityBadge";
import Avatar from "@/app/components/ui/Avatar";
import Badge from "@/app/components/ui/Badge";
import Modal from "@/app/components/ui/Modal";
import Toast, { useToast } from "@/app/components/ui/Toast";
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

const SEVERITY_VARIANT = { MINOR: "default", MAJOR: "warning", CRITICAL: "danger", BLOCKER: "danger" };

export default function BugDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const fetchBug = async () => {
    try {
      const res = await fetch(`/api/bugs/${id}`);
      const data = await res.json();
      if (res.ok) setBug(data.bug);
      else addToast("Bug not found", "error");
    } catch {
      addToast("Failed to load bug", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBug(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/bugs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        addToast("Status updated", "success");
        fetchBug();
      }
    } catch {
      addToast("Failed to update status", "error");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const res = await fetch(`/api/bugs/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        setNewComment("");
        addToast("Comment added", "success");
        fetchBug();
      }
    } catch {
      addToast("Failed to add comment", "error");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/bugs/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Bug deleted", "success");
        router.push("/bugs");
      } else {
        const data = await res.json();
        addToast(data.message || "Delete failed", "error");
      }
    } catch {
      addToast("Failed to delete", "error");
    }
    setShowDelete(false);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  if (!bug) {
    return <div className="text-center py-20 text-slate-400">Bug not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/bugs")}>← Back to Bugs</Button>
        {user && ["ADMIN", "QA"].includes(user.role) && (
          <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>Delete</Button>
        )}
      </div>

      {/* Header */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <span className="text-sm font-mono font-bold text-cyan-400">{bug.bugId}</span>
          <StatusBadge status={bug.status} />
          <PriorityBadge priority={bug.priority} />
          <Badge variant={SEVERITY_VARIANT[bug.severity]}>{bug.severity}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-white">{bug.title}</h1>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Project</p>
            <p className="text-white font-medium">{bug.project?.name}</p>
          </div>
          <div>
            <p className="text-slate-500">Module</p>
            <p className="text-white font-medium">{bug.module}</p>
          </div>
          <div>
            <p className="text-slate-500">Assigned To</p>
            <div className="flex items-center gap-2 mt-1">
              {bug.assignedTo ? (
                <>
                  <Avatar name={bug.assignedTo.name} size="sm" />
                  <span className="text-white">{bug.assignedTo.name}</span>
                </>
              ) : (
                <span className="text-slate-400">Unassigned</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-slate-500">Reported By</p>
            <p className="text-white">{bug.reportedBy?.name || "—"}</p>
          </div>
        </div>

        {/* Status Change */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
          <label className="text-sm text-slate-400">Change Status:</label>
          <select
            value={bug.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={statusLoading}
            className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-cyan-400"
          >
            {["OPEN", "ASSIGNED", "IN_PROGRESS", "FIXED", "RETEST", "CLOSED", "REOPENED"].map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Details */}
        <div className="lg:col-span-2 space-y-4">
          {bug.description && (
            <Card>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Description</h3>
              <p className="text-white whitespace-pre-wrap">{bug.description}</p>
            </Card>
          )}
          <Card>
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Steps to Reproduce</h3>
            <p className="text-white whitespace-pre-wrap">{bug.stepsToReproduce}</p>
          </Card>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-sm font-semibold text-emerald-400 mb-2">✓ Expected Result</h3>
              <p className="text-white whitespace-pre-wrap">{bug.expectedResult}</p>
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-red-400 mb-2">✗ Actual Result</h3>
              <p className="text-white whitespace-pre-wrap">{bug.actualResult}</p>
            </Card>
          </div>

          {bug.screenshotUrl && (
            <Card>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Screenshot Proof</h3>
              <a href={bug.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 text-sm break-all">
                🔗 {bug.screenshotUrl}
              </a>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Comments ({bug.comments?.length || 0})</h3>
            <div className="space-y-4">
              {bug.comments?.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar name={comment.author?.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{comment.author?.name}</span>
                      <span className="text-xs text-slate-500">{timeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-300 mt-1 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="mt-4 pt-4 border-t border-white/10">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-400 text-sm"
              />
              <div className="mt-2 flex justify-end">
                <Button type="submit" size="sm" loading={commentLoading}>Post Comment</Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Activity Timeline */}
        <div>
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Activity</h3>
            <div className="space-y-3">
              {bug.activities?.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-slate-300">
                      <span className="font-medium text-white">{activity.user?.name}</span>{" "}
                      {activity.action}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{timeAgo(activity.createdAt)}</p>
                  </div>
                </div>
              ))}
              {(!bug.activities || bug.activities.length === 0) && (
                <p className="text-sm text-slate-500">No activity yet</p>
              )}
            </div>
          </Card>

          <Card className="mt-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Created</span>
                <span className="text-slate-300">{new Date(bug.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Updated</span>
                <span className="text-slate-300">{new Date(bug.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Bug" size="sm">
        <p className="text-slate-300 mb-6">Are you sure you want to delete <strong>{bug.bugId}</strong>? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>Delete Bug</Button>
        </div>
      </Modal>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
