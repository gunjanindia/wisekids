import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { assignmentId, comments, fileUrl } = body;

    if (!assignmentId || !comments) {
      return NextResponse.json({ error: "Assignment ID and solution text are required" }, { status: 400 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { teacher: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const isLate = new Date() > new Date(assignment.dueDate);

    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: user.id,
        },
      },
      update: {
        comments,
        fileUrl: fileUrl || "https://example.com/submissions/student-work-sample.pdf",
        status: isLate ? "LATE" : "PENDING",
        submittedAt: new Date(),
      },
      create: {
        assignmentId,
        studentId: user.id,
        comments,
        fileUrl: fileUrl || "https://example.com/submissions/student-work-sample.pdf",
        status: isLate ? "LATE" : "PENDING",
        submittedAt: new Date(),
      },
    });

    // Notify teacher
    await prisma.notification.create({
      data: {
        userId: assignment.teacherId,
        title: `New Submission: ${assignment.title}`,
        message: `${user.name} uploaded their solution for review.`,
        type: "ASSIGNMENT",
        link: "/teacher/assignments",
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "STUDENT_SUBMIT_ASSIGNMENT",
      entity: "Submission",
      entityId: submission.id,
      details: { assignment: assignment.title },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error: any) {
    console.error("Assignment submission error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit assignment" }, { status: 500 });
  }
}
