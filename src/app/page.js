import Link from "next/link";

export default function Home() {
  const stats = [
    { title: "Total Bugs", value: "24", note: "8 open issues" },
    { title: "Requirements", value: "12", note: "4 in progress" },
    { title: "Critical Bugs", value: "3", note: "Needs quick fix" },
    { title: "Team Members", value: "5", note: "QA + Developers" },
  ];

  const issues = [
    {
      id: "BUG-001",
      title: "Login redirects to 404 after logout",
      project: "Clinixy",
      priority: "High",
      status: "Open",
    },
    {
      id: "REQ-002",
      title: "Add doctor appointment booking flow",
      project: "Clinixy",
      priority: "Medium",
      status: "In Progress",
    },
    {
      id: "BUG-003",
      title: "Mobile menu not closing after click",
      project: "Website",
      priority: "Low",
      status: "Assigned",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90 sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Jaks<span className="text-cyan-400">Track</span>
            </h1>
            <p className="text-xs text-slate-400">by Jaksdev Studios</p>
          </div>

          <Link
            href="/bugs/new"
            className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
          >
            + Add Bug
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl">
          <p className="mb-2 text-sm font-medium text-cyan-400">
            QA & Requirement Tracking Tool
          </p>
          <h2 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
            Track requirements, report bugs, and ship better software.
          </h2>
          <p className="mt-4 max-w-2xl text-slate-400">
            Manage bugs, requirements, developer assignments, Lightshot proof links,
            status updates, and email notifications from one mobile friendly dashboard.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/bugs/new"
              className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
            >
              Create New Bug
            </Link>
            <button className="rounded-xl border border-white/15 px-5 py-3 font-semibold text-white hover:bg-white/10">
              Add Requirement
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <p className="text-sm text-slate-400">{item.title}</p>
              <h3 className="mt-2 text-3xl font-bold">{item.value}</h3>
              <p className="mt-2 text-sm text-cyan-400">{item.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold">Recent Activity</h3>
              <button className="text-sm text-cyan-400 hover:text-cyan-300">
                View all
              </button>
            </div>

            <div className="space-y-3">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="rounded-xl border border-white/10 bg-slate-900 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold text-cyan-400">
                        {issue.id} • {issue.project}
                      </p>
                      <h4 className="mt-1 font-semibold">{issue.title}</h4>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs text-orange-300">
                        {issue.priority}
                      </span>
                      <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-300">
                        {issue.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h3 className="text-xl font-bold">Quick Actions</h3>

            <div className="mt-5 space-y-3">
              <Link
                href="/bugs/new"
                className="block w-full rounded-xl bg-cyan-400 px-4 py-3 text-left font-semibold text-slate-950 hover:bg-cyan-300"
              >
                + Add New Bug
              </Link>
              <button className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-left font-semibold hover:bg-slate-800">
                + Add Requirement
              </button>
              <button className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-left font-semibold hover:bg-slate-800">
                + Add Developer
              </button>
              <button className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-left font-semibold hover:bg-slate-800">
                View Reports
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p className="text-sm text-cyan-200">
                Next step: Bug add form banavishu jema Lightshot screenshot link field,
                severity, priority ane developer assignment hase.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
