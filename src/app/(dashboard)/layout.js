"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { FullPageLoader } from "@/app/components/ui/LoadingSpinner";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <FullPageLoader />;
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="md:ml-64 pb-20 md:pb-0 min-h-screen">
        <Header />
        <div className="px-4 md:px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
