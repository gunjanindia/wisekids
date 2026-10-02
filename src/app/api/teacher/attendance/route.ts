import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTeacherOrAdmin } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const teacher = await requireTeacherOrAdmin();
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");

    const batches = await prisma.batch.findMany({
      where: teacher.role === "ADMIN" ? {} : { teacherId: teacher.id },
      include: {
        course: true,
        enrollments: { include: { user: { include: { profile: true } } } },
      },
    });

    let attendanceRecords: any[] = [];
    if (batchId) {
      attendanceRecords = await prisma.attendance.findMany({
        where: { batchId },
        include: { student: true },
        orderBy: { date: "desc" },
      });
    }

    return NextResponse.json({ batches, attendanceRecords });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const teacher = await requireTeacherOrAdmin();
    const body = await request.json();
    const { batchId, courseId, date, records } = body; // records: Array<{ studentId, status, notes }>

    if (!batchId || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: "Missing required attendance parameters" }, { status: 400 });
    }

    const attendanceDate = date ? new Date(date) : new Date();

    for (const rec of records) {
      // Upsert attendance for student on this date
      await prisma.attendance.upsert({
        where: {
          batchId_studentId_date: {
            batchId,
            studentId: rec.studentId,
            date: attendanceDate,
          },
        },
        update: {
          status: rec.status,
          notes: rec.notes || null,
          markedById: teacher.id,
        },
        create: {
          batchId,
          courseId,
          studentId: rec.studentId,
          markedById: teacher.id,
          date: attendanceDate,
          status: rec.status,
          notes: rec.notes || null,
        },
      });
    }

    await createAuditLog({
      userId: teacher.id,
      action: "TEACHER_MARK_ATTENDANCE",
      entity: "Attendance",
      entityId: batchId,
      details: { count: records.length, date: attendanceDate },
    });

    return NextResponse.json({ success: true, count: records.length });
  } catch (error: any) {
    console.error("Attendance error:", error);
    return NextResponse.json({ error: error.message || "Failed to mark attendance" }, { status: 500 });
  }
}
