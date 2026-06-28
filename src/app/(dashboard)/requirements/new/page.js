"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Select from "@/app/components/ui/Select";
import Card from "@/app/components/ui/Card";
import Toast, { useToast } from "@/app/components/ui/Toast";

export default function NewRequirementPage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    projectId: "", title: "", description: "", priority: "MEDIUM", assignedToId: "", screenshotUrl: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]).then(([pData, uData]) => {
      setProjects(pData.projects || []);
      setUsers(uData.users || []);
    });
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.projectId) errs.projectId = "Required";
    if (!form.title.trim()) errs.title = "Required";
    if (!form.description.trim()) errs.description = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        addToast("Requirement created!", "success");
        setTimeout(() => router.push("/requirements"), 1000);
      } else {
        const data = await res.json();
        addToast(data.message || "Failed", "error");
      }
    } catch { addToast("Network error", "error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">New Requirement</h1>
        <p className="text-sm text-slate-400 mt-1">Add a new project requirement</p>
      </div>
      <Card padding="lg">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <Select label="Project *" name="projectId" value={form.projectId} onChange={handleChange} placeholder="Select project" options={projects.map((p) => ({ value: p.id, label: p.name }))} error={errors.projectId} />
            <Select label="Priority" name="priority" value={form.priority} onChange={handleChange} options={[{ value: "LOW", label: "Low" }, { value: "MEDIUM", label: "Medium" }, { value: "HIGH", label: "High" }, { value: "URGENT", label: "Urgent" }]} />
            <Input label="Title *" name="title" value={form.title} onChange={handleChange} placeholder="Requirement title" error={errors.title} className="md:col-span-2" />
            <Input label="Description *" name="description" as="textarea" rows={5} value={form.description} onChange={handleChange} placeholder="Detailed requirement description..." error={errors.description} className="md:col-span-2" />
            <Select label="Assign To" name="assignedToId" value={form.assignedToId} onChange={handleChange} placeholder="Unassigned" options={users.map((u) => ({ value: u.id, label: u.name }))} />
            <Input label="Screenshot Link" name="screenshotUrl" type="url" value={form.screenshotUrl} onChange={handleChange} placeholder="https://prnt.sc/xxxxxx" />
          </div>
          <div className="mt-8 flex gap-3">
            <Button type="submit" loading={loading}>Save Requirement</Button>
            <Button variant="secondary" href="/requirements">Cancel</Button>
          </div>
        </form>
      </Card>
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
