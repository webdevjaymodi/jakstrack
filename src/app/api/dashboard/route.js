import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const [
      totalBugs,
      openBugs,
      criticalBugs,
      totalRequirements,
      teamMembers,
      bugsByStatus,
      bugsByPriority,
      recentActivity,
      recentBugs,
    ] = await Promise.all([
      prisma.bug.count(),
      prisma.bug.count({ where: { status: "OPEN" } }),
      prisma.bug.count({ where: { severity: "CRITICAL" } }),
      prisma.requirement.count(),
      prisma.user.count(),
      prisma.bug.groupBy({ by: ["status"], _count: true }),
      prisma.bug.groupBy({ by: ["priority"], _count: true }),
      prisma.activity.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
          bug: { select: { bugId: true, title: true } },
          requirement: { select: { reqId: true, title: true } },
        },
      }),
      prisma.bug.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          project: { select: { name: true } },
          assignedTo: { select: { name: true } },
        },
      }),
    ]);

    return NextResponse.json({
      totalBugs,
      openBugs,
      criticalBugs,
      totalRequirements,
      teamMembers,
      bugsByStatus: bugsByStatus.map((b) => ({ status: b.status, count: b._count })),
      bugsByPriority: bugsByPriority.map((b) => ({ priority: b.priority, count: b._count })),
      recentActivity,
      recentBugs,
    });
  } catch (error) {
    console.error("DASHBOARD_ERROR:", error);
    return NextResponse.json({ message: "Failed to load dashboard" }, { status: 500 });
  }
}
