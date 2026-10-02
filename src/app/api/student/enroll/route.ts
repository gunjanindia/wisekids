import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 });
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "You are already enrolled in this course." }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { batches: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const defaultBatch = course.batches?.[0] || null;

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId,
        batchId: defaultBatch?.id || null,
        progressPercentage: 0,
        status: "ACTIVE",
      },
    });

    // If paid course, record a mock payment
    if (!course.isFree) {
      await prisma.payment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          amount: course.price,
          currency: "USD",
          status: "COMPLETED",
          invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          paymentMethod: "CARD",
        },
      });
    }

    // Send welcoming notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: `🎉 Enrolled in ${course.title}!`,
        message: "Your learning journey begins now. Head over to My Courses to start Lesson 1.",
        type: "SYSTEM",
        link: `/student/courses/${course.id}/learn`,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "STUDENT_ENROLL_COURSE",
      entity: "Enrollment",
      entityId: enrollment.id,
      details: { course: course.title },
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (error: any) {
    console.error("Enrollment error:", error);
    return NextResponse.json({ error: error.message || "Failed to enroll" }, { status: 500 });
  }
}
