"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Select from "@/app/components/ui/Select";
import Card from "@/app/components/ui/Card";
import Toast, { useToast } from "@/app/components/ui/Toast";

export default function NewBugPage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    projectId: "",
    module: "",
    title: "",
    description: "",
    stepsToReproduce: "",
    expectedResult: "",
    actualResult: "",
    severity: "MAJOR",
    priority: "HIGH",
    assignedToId: "",
    screenshotUrl: "",
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
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.projectId) errs.projectId = "Project is required";
    if (!form.module.trim()) errs.module = "Module is required";
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.stepsToReproduce.trim()) errs.stepsToReproduce = "Steps are required";
    if (!form.expectedResult.trim()) errs.expectedResult = "Expected result is required";
    if (!form.actualResult.trim()) errs.actualResult = "Actual result is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/bugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        addToast("Bug reported successfully!", "success");
        setTimeout(() => router.push("/bugs"), 1000);
      } else {
        addToast(data.message || "Failed to create bug", "error");
      }
    } catch {
      addToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Report New Bug</h1>
        <p className="text-sm text-slate-400 mt-1">
          Fill in the details including Lightshot proof link, severity, priority and assigned developer.
        </p>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <Select
              label="Project *"
              name="projectId"
              value={form.projectId}
              onChange={handleChange}
              placeholder="Select project"
              options={projects.map((p) => ({ value: p.id, label: p.name }))}
              error={errors.projectId}
            />
            <Input label="Module *" name="module" value={form.module} onChange={handleChange} placeholder="e.g. Login" error={errors.module} />
            <Input label="Bug Title *" name="title" value={form.title} onChange={handleChange} placeholder="Brief bug title" error={errors.title} className="md:col-span-2" />
            <Input label="Description" name="description" as="textarea" rows={3} value={form.description} onChange={handleChange} placeholder="Explain the issue..." className="md:col-span-2" />
            <Input label="Steps to Reproduce *" name="stepsToReproduce" as="textarea" rows={4} value={form.stepsToReproduce} onChange={handleChange} placeholder={"1. Open website\n2. Login\n3. ..."} error={errors.stepsToReproduce} className="md:col-span-2" />
            <Input label="Expected Result *" name="expectedResult" as="textarea" rows={3} value={form.expectedResult} onChange={handleChange} placeholder="What should happen" error={errors.expectedResult} />
            <Input label="Actual Result *" name="actualResult" as="textarea" rows={3} value={form.actualResult} onChange={handleChange} placeholder="What actually happens" error={errors.actualResult} />
            <Select
              label="Severity"
              name="severity"
              value={form.severity}
              onChange={handleChange}
              options={[
                { value: "MINOR", label: "Minor" },
                { value: "MAJOR", label: "Major" },
                { value: "CRITICAL", label: "Critical" },
                { value: "BLOCKER", label: "Blocker" },
              ]}
            />
            <Select
              label="Priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              options={[
                { value: "LOW", label: "Low" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HIGH", label: "High" },
                { value: "URGENT", label: "Urgent" },
              ]}
            />
            <Select
              label="Assign Developer"
              name="assignedToId"
              value={form.assignedToId}
              onChange={handleChange}
              placeholder="Unassigned"
              options={users.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` }))}
            />
            <Input label="Screenshot / Lightshot Link" name="screenshotUrl" type="url" value={form.screenshotUrl} onChange={handleChange} placeholder="https://prnt.sc/xxxxxx" />
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button type="submit" loading={loading}>Save Bug</Button>
            <Button variant="secondary" href="/bugs">Cancel</Button>
          </div>
        </form>
      </Card>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
