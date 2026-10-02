import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    await requireAdmin();
    const announcements = await prisma.announcement.findMany({
      include: {
        author: true,
        targetCourse: true,
        targetBatch: true,
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });

    const courses = await prisma.course.findMany({ where: { status: "PUBLISHED" } });
    const batches = await prisma.batch.findMany();

    return NextResponse.json({ announcements, courses, batches });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { title, content, targetRole, targetCourseId, targetBatchId, isPinned } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        authorId: admin.id,
        title,
        content,
        targetRole: targetRole || "ALL",
        targetCourseId: targetCourseId || null,
        targetBatchId: targetBatchId || null,
        isPinned: !!isPinned,
      },
    });

    await createAuditLog({
      userId: admin.id,
      action: "ADMIN_CREATE_ANNOUNCEMENT",
      entity: "Announcement",
      entityId: announcement.id,
      details: { title, targetRole },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create announcement" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.announcement.delete({ where: { id } });

    await createAuditLog({
      userId: admin.id,
      action: "ADMIN_DELETE_ANNOUNCEMENT",
      entity: "Announcement",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete announcement" }, { status: 500 });
  }
}
