"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Modal from "@/app/components/ui/Modal";
import Input from "@/app/components/ui/Input";
import EmptyState from "@/app/components/ui/EmptyState";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import Toast, { useToast } from "@/app/components/ui/Toast";

export default function ProjectsPage() {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const isManager = user && ["ADMIN", "QA"].includes(user.role);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch { console.error("Failed to load projects"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const openNew = () => {
    setEditProject(null);
    setFormName("");
    setFormDesc("");
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProject(p);
    setFormName(p.name);
    setFormDesc(p.description || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      const url = editProject ? `/api/projects/${editProject.id}` : "/api/projects";
      const method = editProject ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim(), description: formDesc.trim() }),
      });
      if (res.ok) {
        addToast(editProject ? "Project updated" : "Project created", "success");
        setShowModal(false);
        fetchProjects();
      } else {
        const data = await res.json();
        addToast(data.message || "Failed", "error");
      }
    } catch { addToast("Network error", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/projects/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Project deleted", "success");
        fetchProjects();
      } else {
        const data = await res.json();
        addToast(data.message || "Failed", "error");
      }
    } catch { addToast("Failed", "error"); }
    setDeleteId(null);
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-slate-400 mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        {isManager && <Button onClick={openNew}>+ New Project</Button>}
      </div>

      {projects.length === 0 ? (
        <EmptyState icon="📁" title="No projects yet" description="Create your first project to start tracking bugs and requirements." action={isManager ? <Button onClick={openNew}>+ Create Project</Button> : null} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} hover padding="lg" className="animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  {project.description && <p className="text-sm text-slate-400 mt-1 line-clamp-2">{project.description}</p>}
                </div>
                <span className="text-2xl">📁</span>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{project._count?.bugs || 0}</p>
                  <p className="text-xs text-slate-500">Bugs</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{project._count?.requirements || 0}</p>
                  <p className="text-xs text-slate-500">Requirements</p>
                </div>
                {isManager && (
                  <div className="ml-auto flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(project)}>✏️</Button>
                    {user?.role === "ADMIN" && <Button variant="ghost" size="sm" onClick={() => setDeleteId(project.id)}>🗑️</Button>}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editProject ? "Edit Project" : "New Project"} size="sm">
        <div className="space-y-4">
          <Input label="Project Name *" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. JaksTrack" />
          <Input label="Description" as="textarea" rows={3} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Brief project description" />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button size="sm" loading={saving} onClick={handleSave}>{editProject ? "Update" : "Create"}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Project" size="sm">
        <p className="text-slate-300 mb-6">This will only work if the project has no bugs or requirements.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
