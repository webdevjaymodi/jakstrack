import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { sendStatusChangedEmail } from "@/app/lib/email";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const bug = await prisma.bug.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        reportedBy: { select: { id: true, name: true, email: true } },
        comments: {
          include: { author: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "asc" },
        },
        activities: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!bug) {
      return NextResponse.json({ message: "Bug not found" }, { status: 404 });
    }

    return NextResponse.json({ bug });
  } catch (error) {
    console.error("GET_BUG_ERROR:", error);
    return NextResponse.json({ message: "Failed to fetch bug" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.bug.findUnique({
      where: { id },
      include: { assignedTo: { select: { name: true, email: true } } },
    });

    if (!existing) {
      return NextResponse.json({ message: "Bug not found" }, { status: 404 });
    }

    // Track changes for activity log
    const activities = [];

    if (body.status && body.status !== existing.status) {
      activities.push(`changed status from ${existing.status} to ${body.status}`);
    }
    if (body.assignedToId && body.assignedToId !== existing.assignedToId) {
      const newAssignee = await prisma.user.findUnique({
        where: { id: body.assignedToId },
        select: { name: true },
      });
      if (newAssignee) {
        activities.push(`assigned to ${newAssignee.name}`);
      }
    }

    const bug = await prisma.bug.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.module && { module: body.module }),
        ...(body.stepsToReproduce && { stepsToReproduce: body.stepsToReproduce }),
        ...(body.expectedResult && { expectedResult: body.expectedResult }),
        ...(body.actualResult && { actualResult: body.actualResult }),
        ...(body.severity && { severity: body.severity }),
        ...(body.priority && { priority: body.priority }),
        ...(body.status && { status: body.status }),
        ...(body.assignedToId !== undefined && { assignedToId: body.assignedToId || null }),
        ...(body.screenshotUrl !== undefined && { screenshotUrl: body.screenshotUrl }),
      },
      include: {
        project: { select: { name: true } },
        assignedTo: { select: { name: true, email: true } },
      },
    });

    // Create activity logs
    for (const action of activities) {
      await prisma.activity.create({
        data: { action, userId: user.id, bugId: id },
      });
    }

    // Send email on status change
    if (body.status && body.status !== existing.status && bug.assignedTo) {
      await sendStatusChangedEmail({
        to: bug.assignedTo.email,
        title: bug.title,
        itemId: bug.bugId,
        newStatus: body.status,
        changedBy: user.name,
      });
    }

    return NextResponse.json({ bug });
  } catch (error) {
    console.error("UPDATE_BUG_ERROR:", error);
    return NextResponse.json({ message: "Failed to update bug" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "QA"].includes(user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.bug.delete({ where: { id } });

    return NextResponse.json({ message: "Bug deleted" });
  } catch (error) {
    console.error("DELETE_BUG_ERROR:", error);
    return NextResponse.json({ message: "Failed to delete bug" }, { status: 500 });
  }
}
