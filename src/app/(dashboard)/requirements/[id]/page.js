"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";
import PriorityBadge from "@/app/components/ui/PriorityBadge";
import Avatar from "@/app/components/ui/Avatar";
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

export default function RequirementDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const fetchReq = async () => {
    try {
      const res = await fetch(`/api/requirements/${id}`);
      const data = await res.json();
      if (res.ok) setReq(data.requirement);
    } catch { addToast("Failed to load", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReq(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await fetch(`/api/requirements/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) { addToast("Status updated", "success"); fetchReq(); }
    } catch { addToast("Failed", "error"); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const res = await fetch(`/api/requirements/${id}/comments`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) { setNewComment(""); addToast("Comment added", "success"); fetchReq(); }
    } catch { addToast("Failed", "error"); }
    finally { setCommentLoading(false); }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/requirements/${id}`, { method: "DELETE" });
      if (res.ok) { addToast("Deleted", "success"); router.push("/requirements"); }
      else { const d = await res.json(); addToast(d.message, "error"); }
    } catch { addToast("Failed", "error"); }
    setShowDelete(false);
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!req) return <div className="text-center py-20 text-slate-400">Not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/requirements")}>← Back</Button>
        {user && ["ADMIN", "QA"].includes(user.role) && (
          <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>Delete</Button>
        )}
      </div>

      <Card padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <span className="text-sm font-mono font-bold text-cyan-400">{req.reqId}</span>
          <StatusBadge status={req.status} />
          <PriorityBadge priority={req.priority} />
        </div>
        <h1 className="text-2xl font-bold text-white">{req.title}</h1>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><p className="text-slate-500">Project</p><p className="text-white font-medium">{req.project?.name}</p></div>
          <div><p className="text-slate-500">Assigned To</p>
            <div className="flex items-center gap-2 mt-1">
              {req.assignedTo ? (<><Avatar name={req.assignedTo.name} size="sm" /><span className="text-white">{req.assignedTo.name}</span></>) : <span className="text-slate-400">Unassigned</span>}
            </div>
          </div>
          <div><p className="text-slate-500">Created By</p><p className="text-white">{req.createdBy?.name || "—"}</p></div>
          <div><p className="text-slate-500">Created</p><p className="text-white">{new Date(req.createdAt).toLocaleDateString()}</p></div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
          <label className="text-sm text-slate-400">Status:</label>
          <select value={req.status} onChange={(e) => handleStatusChange(e.target.value)} className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-cyan-400">
            {["PENDING", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "CANCELLED"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Description</h3>
            <p className="text-white whitespace-pre-wrap">{req.description}</p>
          </Card>

          {req.screenshotUrl && (
            <Card>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Screenshot</h3>
              <a href={req.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 text-sm break-all">🔗 {req.screenshotUrl}</a>
            </Card>
          )}

          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Comments ({req.comments?.length || 0})</h3>
            <div className="space-y-4">
              {req.comments?.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar name={c.author?.name} size="sm" />
                  <div><div className="flex items-center gap-2"><span className="text-sm font-medium text-white">{c.author?.name}</span><span className="text-xs text-slate-500">{timeAgo(c.createdAt)}</span></div><p className="text-sm text-slate-300 mt-1">{c.content}</p></div>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddComment} className="mt-4 pt-4 border-t border-white/10">
              <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." rows={3} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-400 text-sm" />
              <div className="mt-2 flex justify-end"><Button type="submit" size="sm" loading={commentLoading}>Post</Button></div>
            </form>
          </Card>
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Activity</h3>
          <div className="space-y-3">
            {req.activities?.map((a) => (
              <div key={a.id} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <div><p className="text-slate-300"><span className="font-medium text-white">{a.user?.name}</span> {a.action}</p><p className="text-xs text-slate-500 mt-0.5">{timeAgo(a.createdAt)}</p></div>
              </div>
            ))}
            {(!req.activities || req.activities.length === 0) && <p className="text-sm text-slate-500">No activity</p>}
          </div>
        </Card>
      </div>

      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Requirement" size="sm">
        <p className="text-slate-300 mb-6">Delete <strong>{req.reqId}</strong>? This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
