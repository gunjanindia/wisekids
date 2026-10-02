import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    await requireAdmin();
    const batches = await prisma.batch.findMany({
      include: {
        course: true,
        teacher: true,
        enrollments: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const courses = await prisma.course.findMany({ where: { status: "PUBLISHED" } });
    const teachers = await prisma.user.findMany({ where: { role: "TEACHER", status: "ACTIVE" } });

    return NextResponse.json({ batches, courses, teachers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { name, code, courseId, teacherId, scheduleText, meetingLink, maxStudents } = body;

    if (!name || !code || !courseId || !teacherId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const batch = await prisma.batch.create({
      data: {
        name,
        code,
        courseId,
        teacherId,
        scheduleText: scheduleText || "Mon, Wed 4:00 PM EST",
        meetingLink: meetingLink || "https://meet.google.com/wis-ekid-cls",
        maxStudents: parseInt(maxStudents) || 20,
      },
    });

    await createAuditLog({
      userId: admin.id,
      action: "ADMIN_CREATE_BATCH",
      entity: "Batch",
      entityId: batch.id,
      details: { name: batch.name, code: batch.code },
    });

    return NextResponse.json({ success: true, batch });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create batch" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Batch ID required" }, { status: 400 });

    await prisma.batch.delete({ where: { id } });

    await createAuditLog({
      userId: admin.id,
      action: "ADMIN_DELETE_BATCH",
      entity: "Batch",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete batch" }, { status: 500 });
  }
}
