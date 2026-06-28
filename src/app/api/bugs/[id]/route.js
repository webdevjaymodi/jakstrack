import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { sendStatusChangedEmail, sendBugAssignedEmail } from "@/app/lib/email";

const updateBugSchema = z.object({
  module: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  stepsToReproduce: z.string().min(1).optional(),
  expectedResult: z.string().min(1).optional(),
  actualResult: z.string().min(1).optional(),
  severity: z.enum(["MINOR", "MAJOR", "CRITICAL", "BLOCKER"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "FIXED", "RETEST", "CLOSED", "REOPENED"]).optional(),
  projectId: z.string().optional(),
  assignedToId: z.string().nullable().optional(),
  screenshotUrl: z.string().nullable().optional(),
});

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
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        activities: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!bug) {
      return NextResponse.json({ error: "Bug not found" }, { status: 404 });
    }

    return NextResponse.json({ bug });
  } catch (error) {
    console.error("[Bug GET Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    const existingBug = await prisma.bug.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    if (!existingBug) {
      return NextResponse.json({ error: "Bug not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateBugSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const updatedBug = await prisma.bug.update({
      where: { id },
      data,
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        reportedBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Track status changes
    if (data.status && data.status !== existingBug.status) {
      await prisma.activity.create({
        data: {
          action: `Changed status from ${existingBug.status} to ${data.status}`,
          userId: user.id,
          bugId: id,
        },
      });

      // Notify assignee of status change
      if (existingBug.assignedTo && existingBug.assignedTo.id !== user.id) {
        await sendStatusChangedEmail({
          to: existingBug.assignedTo.email,
          title: existingBug.title,
          itemId: existingBug.bugId,
          newStatus: data.status,
          changedBy: user.name,
        });
      }
    }

    // Track assignment changes
    if (data.assignedToId !== undefined && data.assignedToId !== existingBug.assignedToId) {
      const newAssignee = data.assignedToId
        ? await prisma.user.findUnique({
            where: { id: data.assignedToId },
            select: { name: true, email: true },
          })
        : null;

      const actionText = newAssignee
        ? `Assigned to ${newAssignee.name}`
        : "Unassigned";

      await prisma.activity.create({
        data: {
          action: actionText,
          userId: user.id,
          bugId: id,
        },
      });

      // Notify new assignee
      if (newAssignee && data.assignedToId !== user.id) {
        await sendBugAssignedEmail({
          to: newAssignee.email,
          bugTitle: existingBug.title,
          bugId: existingBug.bugId,
          projectName: existingBug.project.name,
          assignedBy: user.name,
        });
      }
    }

    return NextResponse.json({ bug: updatedBug });
  } catch (error) {
    console.error("[Bug PUT Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (user.role !== "ADMIN" && user.role !== "QA") {
      return NextResponse.json(
        { error: "Only ADMIN or QA can delete bugs" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const bug = await prisma.bug.findUnique({ where: { id } });

    if (!bug) {
      return NextResponse.json({ error: "Bug not found" }, { status: 404 });
    }

    await prisma.bug.delete({ where: { id } });

    return NextResponse.json(
      { message: `Bug ${bug.bugId} deleted successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Bug DELETE Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
