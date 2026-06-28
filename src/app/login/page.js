"use client";

import { useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "setup"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Invalid credentials");
        window.location.href = "/";
      } else {
        if (!form.name.trim()) throw new Error("Name is required");
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: "ADMIN",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");
        window.location.href = "/";
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(80px, -60px) scale(1.1); }
          50% { transform: translate(-40px, -120px) scale(0.95); }
          75% { transform: translate(-80px, 40px) scale(1.05); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-100px, 80px) scale(1.08); }
          50% { transform: translate(60px, 100px) scale(0.9); }
          75% { transform: translate(100px, -60px) scale(1.12); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .login-orb-1 {
          animation: orbFloat1 20s ease-in-out infinite;
        }
        .login-orb-2 {
          animation: orbFloat2 25s ease-in-out infinite;
        }
        .login-card {
          animation: fadeInUp 0.8s ease-out;
        }
        .login-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>

      <div className="relative min-h-screen overflow-hidden bg-slate-950 flex items-center justify-center px-4">
        {/* Animated gradient orbs */}
        <div className="login-orb-1 absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-600/30 to-cyan-500/20 blur-[120px] pointer-events-none" />
        <div className="login-orb-2 absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-cyan-500/25 to-indigo-600/20 blur-[100px] pointer-events-none" />

        {/* Glassmorphism card */}
        <div className="login-card relative z-10 w-full max-w-md">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-2xl p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 mb-4 shadow-lg shadow-cyan-500/20">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Jaks<span className="text-cyan-400">Track</span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">QA & Bug Tracking</p>
            </div>

            {/* Mode Toggle */}
            <div className="flex rounded-xl bg-white/[0.04] border border-white/10 p-1 mb-6">
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  mode === "login"
                    ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setMode("setup"); setError(""); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  mode === "setup"
                    ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Setup Admin
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "setup" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="login-shimmer w-full rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 px-4 py-3.5 text-sm font-bold text-slate-950 hover:from-cyan-300 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-cyan-500/25 mt-2 flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {loading
                  ? mode === "login" ? "Signing in..." : "Creating account..."
                  : mode === "login" ? "Sign In" : "Create Admin Account"
                }
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-xs text-slate-500 mt-6">
              {mode === "login"
                ? "First time? Switch to Setup Admin to create your account."
                : "Already have an account? Switch to Login."
              }
            </p>
          </div>

          {/* Bottom branding */}
          <p className="text-center text-xs text-slate-600 mt-6">
            JaksTrack v1.0 — by Jaksdev Studios
          </p>
        </div>
      </div>
    </>
  );
}
