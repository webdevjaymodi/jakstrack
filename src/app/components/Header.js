"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import Avatar from "./ui/Avatar";

const PAGE_TITLES = {
  "/": "Dashboard",
  "/bugs": "Bugs",
  "/bugs/new": "Report Bug",
  "/requirements": "Requirements",
  "/requirements/new": "New Requirement",
  "/projects": "Projects",
  "/team": "Team",
};

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getTitle = () => {
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
    if (pathname.startsWith("/bugs/")) return "Bug Details";
    if (pathname.startsWith("/requirements/")) return "Requirement Details";
    return "JaksTrack";
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{getTitle()}</h2>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-[11px] text-slate-500">{user.role}</p>
            </div>
            <Avatar name={user.name} size="sm" />
          </div>
        )}
      </div>
    </header>
  );
}
