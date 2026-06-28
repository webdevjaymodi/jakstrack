import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { sendNewCommentEmail } from "@/app/lib/email";

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required"),
});

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const bug = await prisma.bug.findUnique({ where: { id } });
    if (!bug) {
      return NextResponse.json({ error: "Bug not found" }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { bugId: id },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("[Bug Comments GET Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    const bug = await prisma.bug.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    if (!bug) {
      return NextResponse.json({ error: "Bug not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = createCommentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { content } = parsed.data;

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: user.id,
        bugId: id,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        action: `Commented on bug ${bug.bugId}`,
        userId: user.id,
        bugId: id,
      },
    });

    // Email assignee if different from commenter
    if (bug.assignedTo && bug.assignedTo.id !== user.id) {
      const preview = content.length > 100 ? content.substring(0, 100) + "..." : content;
      await sendNewCommentEmail({
        to: bug.assignedTo.email,
        title: bug.title,
        itemId: bug.bugId,
        commentBy: user.name,
        commentPreview: preview,
      });
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("[Bug Comments POST Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
