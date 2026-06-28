import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

const reqSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional().default("MEDIUM"),
  assignedToId: z.string().optional(),
  screenshotUrl: z.string().optional().default(""),
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const projectId = searchParams.get("projectId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = projectId;
    if (search) where.title = { contains: search, mode: "insensitive" };

    const [requirements, total] = await Promise.all([
      prisma.requirement.findMany({
        where,
        include: {
          project: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.requirement.count({ where }),
    ]);

    return NextResponse.json({
      requirements,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET_REQUIREMENTS_ERROR:", error);
    return NextResponse.json({ message: "Failed to fetch requirements" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = reqSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const count = await prisma.requirement.count();
    const reqId = `REQ-${String(count + 1).padStart(3, "0")}`;

    const requirement = await prisma.requirement.create({
      data: {
        reqId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: "PENDING",
        screenshotUrl: data.screenshotUrl,
        projectId: data.projectId,
        assignedToId: data.assignedToId || null,
        createdById: user.id,
      },
      include: {
        project: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
    });

    await prisma.activity.create({
      data: {
        action: "created this requirement",
        userId: user.id,
        requirementId: requirement.id,
      },
    });

    return NextResponse.json({ message: "Requirement created", requirement }, { status: 201 });
  } catch (error) {
    console.error("CREATE_REQUIREMENT_ERROR:", error);
    return NextResponse.json({ message: "Failed to create requirement" }, { status: 500 });
  }
}
