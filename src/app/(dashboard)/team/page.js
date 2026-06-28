"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Avatar from "@/app/components/ui/Avatar";
import Badge from "@/app/components/ui/Badge";
import Modal from "@/app/components/ui/Modal";
import Input from "@/app/components/ui/Input";
import Select from "@/app/components/ui/Select";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import Toast, { useToast } from "@/app/components/ui/Toast";

const ROLE_VARIANT = { ADMIN: "danger", QA: "info", DEVELOPER: "success" };

export default function TeamPage() {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "DEVELOPER" });
  const [errors, setErrors] = useState({});

  const isAdmin = user?.role === "ADMIN";

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch { console.error("Failed"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleCreateUser = async () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.email.trim()) errs.email = "Required";
    if (!form.password || form.password.length < 6) errs.password = "Min 6 chars";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        addToast("User created!", "success");
        setShowModal(false);
        setForm({ name: "", email: "", password: "", role: "DEVELOPER" });
        fetchUsers();
      } else {
        const data = await res.json();
        addToast(data.message || "Failed", "error");
      }
    } catch { addToast("Network error", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <p className="text-sm text-slate-400 mt-1">{users.length} member{users.length !== 1 ? "s" : ""}</p>
        </div>
        {isAdmin && <Button onClick={() => setShowModal(true)}>+ Add Member</Button>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((member) => (
          <Card key={member.id} padding="lg" className="animate-fade-in">
            <div className="flex items-center gap-4">
              <Avatar name={member.name} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-white truncate">{member.name}</h3>
                <p className="text-sm text-slate-400 truncate">{member.email}</p>
                <Badge variant={ROLE_VARIANT[member.role]} className="mt-1.5">{member.role}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/10">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{member._count?.assignedBugs || 0}</p>
                <p className="text-xs text-slate-500">Bugs</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{member._count?.assignedReqs || 0}</p>
                <p className="text-xs text-slate-500">Requirements</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Team Member" size="sm">
        <div className="space-y-4">
          <Input label="Full Name *" name="name" value={form.name} onChange={handleChange} placeholder="Jay Modi" error={errors.name} />
          <Input label="Email *" name="email" type="email" value={form.email} onChange={handleChange} placeholder="jay@example.com" error={errors.email} />
          <Input label="Password *" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" error={errors.password} />
          <Select label="Role" name="role" value={form.role} onChange={handleChange} options={[
            { value: "DEVELOPER", label: "Developer" },
            { value: "QA", label: "QA" },
            { value: "ADMIN", label: "Admin" },
          ]} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button size="sm" loading={saving} onClick={handleCreateUser}>Create User</Button>
          </div>
        </div>
      </Modal>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
