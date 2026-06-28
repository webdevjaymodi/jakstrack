import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { sendBugAssignedEmail } from "@/app/lib/email";

const createBugSchema = z.object({
  module: z.string().min(1, "Module is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  stepsToReproduce: z.string().min(1, "Steps to reproduce is required"),
  expectedResult: z.string().min(1, "Expected result is required"),
  actualResult: z.string().min(1, "Actual result is required"),
  severity: z.enum(["MINOR", "MAJOR", "CRITICAL", "BLOCKER"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "FIXED", "RETEST", "CLOSED", "REOPENED"]).optional(),
  projectId: z.string().min(1, "Project ID is required"),
  assignedToId: z.string().optional(),
  screenshotUrl: z.string().optional(),
});

/**
 * Generate the next sequential bug ID in the format BUG-001, BUG-002, etc.
 */
async function generateBugId() {
  const lastBug = await prisma.bug.findFirst({
    orderBy: { createdAt: "desc" },
    select: { bugId: true },
  });

  if (!lastBug) {
    return "BUG-001";
  }

  const lastNumber = parseInt(lastBug.bugId.replace("BUG-", ""), 10);
  const nextNumber = lastNumber + 1;
  return `BUG-${String(nextNumber).padStart(3, "0")}`;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const severity = searchParams.get("severity");
    const projectId = searchParams.get("projectId");
    const assignedToId = searchParams.get("assignedToId");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (severity) where.severity = severity;
    if (projectId) where.projectId = projectId;
    if (assignedToId) where.assignedToId = assignedToId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { bugId: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { module: { contains: search, mode: "insensitive" } },
      ];
    }

    const [bugs, total] = await Promise.all([
      prisma.bug.findMany({
        where,
        include: {
          project: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          reportedBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.bug.count({ where }),
    ]);

    return NextResponse.json({
      bugs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[Bugs GET Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createBugSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const bugId = await generateBugId();

    const bug = await prisma.bug.create({
      data: {
        bugId,
        module: data.module,
        title: data.title,
        description: data.description,
        stepsToReproduce: data.stepsToReproduce,
        expectedResult: data.expectedResult,
        actualResult: data.actualResult,
        severity: data.severity || "MAJOR",
        priority: data.priority || "HIGH",
        status: data.status || "OPEN",
        projectId: data.projectId,
        assignedToId: data.assignedToId || null,
        reportedById: user.id,
        screenshotUrl: data.screenshotUrl || null,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        reportedBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        action: `Created bug ${bugId}: "${data.title}"`,
        userId: user.id,
        bugId: bug.id,
      },
    });

    // Send email if assigned
    if (data.assignedToId && bug.assignedTo) {
      await sendBugAssignedEmail({
        to: bug.assignedTo.email,
        bugTitle: bug.title,
        bugId: bug.bugId,
        projectName: bug.project.name,
        assignedBy: user.name,
      });
    }

    return NextResponse.json({ bug }, { status: 201 });
  } catch (error) {
    console.error("[Bugs POST Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
