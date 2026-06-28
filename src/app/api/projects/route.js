import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional().default(""),
});

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: { select: { bugs: true, requirements: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("GET_PROJECTS_ERROR:", error);
    return NextResponse.json({ message: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "QA"].includes(user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = projectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.project.findUnique({ where: { name: parsed.data.name } });
    if (existing) {
      return NextResponse.json({ message: "Project name already exists" }, { status: 409 });
    }

    const project = await prisma.project.create({
      data: parsed.data,
    });

    return NextResponse.json({ message: "Project created", project }, { status: 201 });
  } catch (error) {
    console.error("CREATE_PROJECT_ERROR:", error);
    return NextResponse.json({ message: "Failed to create project" }, { status: 500 });
  }
}
