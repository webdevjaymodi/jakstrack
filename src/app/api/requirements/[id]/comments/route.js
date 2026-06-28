import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { sendNewCommentEmail } from "@/app/lib/email";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const comments = await prisma.comment.findMany({
      where: { requirementId: id },
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("GET_REQ_COMMENTS_ERROR:", error);
    return NextResponse.json({ message: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    if (!body.content?.trim()) {
      return NextResponse.json({ message: "Comment cannot be empty" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: { content: body.content.trim(), authorId: user.id, requirementId: id },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    await prisma.activity.create({
      data: { action: "added a comment", userId: user.id, requirementId: id },
    });

    const req = await prisma.requirement.findUnique({
      where: { id },
      include: { assignedTo: { select: { email: true } } },
    });

    if (req?.assignedTo && req.assignedTo.email !== user.email) {
      await sendNewCommentEmail({
        to: req.assignedTo.email,
        title: req.title,
        itemId: req.reqId,
        commentBy: user.name,
        commentPreview: body.content.trim().substring(0, 100),
      });
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("CREATE_REQ_COMMENT_ERROR:", error);
    return NextResponse.json({ message: "Failed to add comment" }, { status: 500 });
  }
}
