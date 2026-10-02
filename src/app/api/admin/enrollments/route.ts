import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    await requireAdmin();
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: true,
        course: true,
        batch: true,
      },
      orderBy: { enrolledAt: "desc" },
    });

    const students = await prisma.user.findMany({
      where: { role: "STUDENT", status: "ACTIVE" },
      orderBy: { name: "asc" },
    });

    const courses = await prisma.course.findMany({
      where: { status: "PUBLISHED" },
      include: { batches: true },
      orderBy: { title: "asc" },
    });

    return NextResponse.json({ enrollments, students, courses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { userId, courseId, batchId, status } = body;

    if (!userId || !courseId) {
      return NextResponse.json({ error: "Student and Course are required." }, { status: 400 });
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existing) {
      return NextResponse.json({ error: "Student is already enrolled in this course." }, { status: 409 });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        batchId: batchId || null,
        status: status || "ACTIVE",
        progressPercentage: 0,
      },
      include: { course: true, user: true },
    });

    // Send notification to student
    await prisma.notification.create({
      data: {
        userId,
        title: `🎓 Enrolled in ${enrollment.course.title}!`,
        message: "You have been enrolled by the administrator. Start your lessons today!",
        type: "SYSTEM",
        link: `/student/courses/${courseId}/learn`,
      },
    });

    await createAuditLog({
      userId: admin.id,
      action: "ADMIN_MANUAL_ENROLLMENT",
      entity: "Enrollment",
      entityId: enrollment.id,
      details: { studentEmail: enrollment.user.email, courseTitle: enrollment.course.title },
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create enrollment" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { id, status, batchId } = body;

    if (!id) return NextResponse.json({ error: "Enrollment ID required" }, { status: 400 });

    const updated = await prisma.enrollment.update({
      where: { id },
      data: {
        status,
        batchId: batchId || null,
      },
    });

    await createAuditLog({
      userId: admin.id,
      action: "ADMIN_UPDATE_ENROLLMENT",
      entity: "Enrollment",
      entityId: id,
      details: { status, batchId },
    });

    return NextResponse.json({ success: true, enrollment: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update enrollment" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Enrollment ID required" }, { status: 400 });

    await prisma.enrollment.delete({ where: { id } });

    await createAuditLog({
      userId: admin.id,
      action: "ADMIN_DELETE_ENROLLMENT",
      entity: "Enrollment",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete enrollment" }, { status: 500 });
  }
}
