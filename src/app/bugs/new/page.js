"use client";

import { useState } from "react";
import Link from "next/link";

export default function AddBugPage() {
  const [formData, setFormData] = useState({
    project: "",
    module: "",
    title: "",
    description: "",
    stepsToReproduce: "",
    expectedResult: "",
    actualResult: "",
    severity: "Major",
    priority: "High",
    assignedDeveloperEmail: "",
    screenshotUrl: "",
    status: "Open",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/bugs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Something went wrong");
        return;
      }

      alert("Bug saved successfully!");

      setFormData({
        project: "",
        module: "",
        title: "",
        description: "",
        stepsToReproduce: "",
        expectedResult: "",
        actualResult: "",
        severity: "Major",
        priority: "High",
        assignedDeveloperEmail: "",
        screenshotUrl: "",
        status: "Open",
      });
    } catch (error) {
      console.error(error);
      alert("Server error. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-2xl font-bold">
              Jaks<span className="text-cyan-400">Track</span>
            </h1>
            <p className="text-xs text-slate-400">Report a new bug</p>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="mb-6">
          <p className="text-sm font-medium text-cyan-400">Bug Tracking</p>
          <h2 className="mt-2 text-3xl font-bold">Add New Bug</h2>
          <p className="mt-2 text-slate-400">
            Add bug details, expected result, actual result, Lightshot proof link,
            severity, priority and assigned developer email.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:p-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Project Name
              </label>
              <input
                name="project"
                value={formData.project}
                onChange={handleChange}
                placeholder="Example: Clinixy"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Module
              </label>
              <input
                name="module"
                value={formData.module}
                onChange={handleChange}
                placeholder="Example: Login"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Bug Title
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Login redirects to 404 after logout"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Bug Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Explain issue clearly..."
                rows="3"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Steps to Reproduce
              </label>
              <textarea
                name="stepsToReproduce"
                value={formData.stepsToReproduce}
                onChange={handleChange}
                placeholder={`1. Open website\n2. Login with valid user\n3. Logout\n4. Login again`}
                rows="5"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Expected Result
              </label>
              <textarea
                name="expectedResult"
                value={formData.expectedResult}
                onChange={handleChange}
                placeholder="User should login successfully."
                rows="4"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Actual Result
              </label>
              <textarea
                name="actualResult"
                value={formData.actualResult}
                onChange={handleChange}
                placeholder="404 page not found is displayed."
                rows="4"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Severity
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
              >
                <option>Minor</option>
                <option>Major</option>
                <option>Critical</option>
                <option>Blocker</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
              >
                <option>Open</option>
                <option>Assigned</option>
                <option>In Progress</option>
                <option>Fixed</option>
                <option>Retest</option>
                <option>Closed</option>
                <option>Reopened</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Assigned Developer Email
              </label>
              <input
                type="email"
                name="assignedDeveloperEmail"
                value={formData.assignedDeveloperEmail}
                onChange={handleChange}
                placeholder="developer@example.com"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Lightshot / Screenshot Link
              </label>
              <input
                type="url"
                name="screenshotUrl"
                value={formData.screenshotUrl}
                onChange={handleChange}
                placeholder="https://prnt.sc/xxxxxx"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 hover:bg-cyan-300"
            >
              Save Bug
            </button>

            <Link
              href="/"
              className="rounded-xl border border-white/15 px-6 py-3 text-center font-bold hover:bg-white/10"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
