import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { sendStatusChangedEmail } from "@/app/lib/email";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const requirement = await prisma.requirement.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        comments: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
        activities: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!requirement) {
      return NextResponse.json({ message: "Requirement not found" }, { status: 404 });
    }

    return NextResponse.json({ requirement });
  } catch (error) {
    console.error("GET_REQUIREMENT_ERROR:", error);
    return NextResponse.json({ message: "Failed to fetch requirement" }, { status: 500 });
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

    const existing = await prisma.requirement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Requirement not found" }, { status: 404 });
    }

    if (body.status && body.status !== existing.status) {
      await prisma.activity.create({
        data: {
          action: `changed status from ${existing.status} to ${body.status}`,
          userId: user.id,
          requirementId: id,
        },
      });
    }

    const requirement = await prisma.requirement.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description && { description: body.description }),
        ...(body.priority && { priority: body.priority }),
        ...(body.status && { status: body.status }),
        ...(body.assignedToId !== undefined && { assignedToId: body.assignedToId || null }),
        ...(body.screenshotUrl !== undefined && { screenshotUrl: body.screenshotUrl }),
      },
      include: {
        assignedTo: { select: { name: true, email: true } },
      },
    });

    if (body.status && body.status !== existing.status && requirement.assignedTo) {
      await sendStatusChangedEmail({
        to: requirement.assignedTo.email,
        title: requirement.title,
        itemId: existing.reqId,
        newStatus: body.status,
        changedBy: user.name,
      });
    }

    return NextResponse.json({ requirement });
  } catch (error) {
    console.error("UPDATE_REQUIREMENT_ERROR:", error);
    return NextResponse.json({ message: "Failed to update requirement" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "QA"].includes(user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.requirement.delete({ where: { id } });

    return NextResponse.json({ message: "Requirement deleted" });
  } catch (error) {
    console.error("DELETE_REQUIREMENT_ERROR:", error);
    return NextResponse.json({ message: "Failed to delete requirement" }, { status: 500 });
  }
}
