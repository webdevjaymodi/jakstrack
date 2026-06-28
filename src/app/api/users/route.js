import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { assignedBugs: true, assignedReqs: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET_USERS_ERROR:", error);
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}
