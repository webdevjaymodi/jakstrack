"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

const navItems = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/bugs", label: "Bugs", icon: "🐛" },
  { href: "/requirements", label: "Requirements", icon: "📋" },
  { href: "/projects", label: "Projects", icon: "📁" },
  { href: "/team", label: "Team", icon: "👥" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col bg-slate-950 border-r border-white/10 z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/" className="block">
            <h1 className="text-xl font-bold tracking-tight">
              Jaks<span className="text-cyan-400">Track</span>
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">by Jaksdev Studios</p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(item.href)
                  ? "bg-cyan-400/10 text-cyan-400 border-l-2 border-cyan-400 ml-0"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        {user && (
          <div className="px-4 py-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cyan-600 flex items-center justify-center text-xs font-semibold text-white">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-3 w-full text-xs text-slate-500 hover:text-red-400 transition-colors text-left px-1"
            >
              ← Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-t border-white/10 z-40 px-2 py-1 safe-area-pb">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-all ${
                isActive(item.href)
                  ? "text-cyan-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
