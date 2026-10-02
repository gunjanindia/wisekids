import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTeacherOrAdmin } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const teacher = await requireTeacherOrAdmin();
    const assignments = await prisma.assignment.findMany({
      where: teacher.role === "ADMIN" ? {} : { teacherId: teacher.id },
      include: {
        course: true,
        submissions: {
          include: { student: { include: { profile: true } } },
          orderBy: { submittedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const courses = await prisma.course.findMany({
      where: teacher.role === "ADMIN" ? {} : { teacherId: teacher.id },
    });

    return NextResponse.json({ assignments, courses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const teacher = await requireTeacherOrAdmin();
    const body = await request.json();
    const { courseId, title, instructions, maxMarks, dueDate, attachmentUrl, allowResubmission } =
      body;

    if (!courseId || !title || !instructions) {
      return NextResponse.json({ error: "Missing required assignment fields" }, { status: 400 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId,
        teacherId: teacher.id,
        title,
        instructions,
        maxMarks: parseInt(maxMarks) || 100,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 86400000),
        attachmentUrl: attachmentUrl || null,
        allowResubmission: allowResubmission ?? true,
      },
    });

    await createAuditLog({
      userId: teacher.id,
      action: "TEACHER_CREATE_ASSIGNMENT",
      entity: "Assignment",
      entityId: assignment.id,
      details: { title, courseId },
    });

    return NextResponse.json({ success: true, assignment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create assignment" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const teacher = await requireTeacherOrAdmin();
    const body = await request.json();
    const { submissionId, marks, feedback, status } = body;

    if (!submissionId) {
      return NextResponse.json({ error: "Submission ID required" }, { status: 400 });
    }

    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        marks: parseFloat(marks),
        feedback,
        status: status || "GRADED",
        gradedAt: new Date(),
      },
      include: { student: true, assignment: true },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: submission.studentId,
        title: `Grade Posted: ${submission.assignment.title}`,
        message: `Your teacher graded your work: ${submission.marks} marks. Feedback: "${feedback || "Great job!"}"`,
        type: "GRADE",
        link: "/student/assignments",
      },
    });

    await createAuditLog({
      userId: teacher.id,
      action: "TEACHER_GRADE_SUBMISSION",
      entity: "Submission",
      entityId: submission.id,
      details: { student: submission.student.email, marks, feedback },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to grade submission" }, { status: 500 });
  }
}
