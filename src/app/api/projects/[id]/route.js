import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: { select: { bugs: true, requirements: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("GET_PROJECT_ERROR:", error);
    return NextResponse.json({ message: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "QA"].includes(user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("UPDATE_PROJECT_ERROR:", error);
    return NextResponse.json({ message: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const counts = await prisma.project.findUnique({
      where: { id },
      include: { _count: { select: { bugs: true, requirements: true } } },
    });

    if (counts?._count.bugs > 0 || counts?._count.requirements > 0) {
      return NextResponse.json(
        { message: "Cannot delete project with existing bugs or requirements" },
        { status: 400 }
      );
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ message: "Project deleted" });
  } catch (error) {
    console.error("DELETE_PROJECT_ERROR:", error);
    return NextResponse.json({ message: "Failed to delete project" }, { status: 500 });
  }
}
