import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { lessonId, courseId } = body;

    if (!lessonId || !courseId) {
      return NextResponse.json({ error: "Lesson ID and Course ID required" }, { status: 400 });
    }

    // Upsert lesson progress
    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
      create: {
        userId: user.id,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    // Calculate total lessons in course and completed count to update enrollment progress %
    const totalLessons = await prisma.lesson.count({
      where: { module: { courseId } },
    });

    const completedCount = await prisma.lessonProgress.count({
      where: {
        userId: user.id,
        isCompleted: true,
        lesson: { module: { courseId } },
      },
    });

    const progressPercentage =
      totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
      data: {
        progressPercentage,
        status: progressPercentage === 100 ? "COMPLETED" : "ACTIVE",
        completedAt: progressPercentage === 100 ? new Date() : null,
      },
    });

    // If 100% complete, issue certificate if not exists
    if (progressPercentage === 100) {
      const existingCert = await prisma.certificate.findUnique({
        where: { userId_courseId: { userId: user.id, courseId } },
      });
      if (!existingCert) {
        const certNum = `WK-CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        await prisma.certificate.create({
          data: {
            userId: user.id,
            courseId,
            certificateNumber: certNum,
            verificationCode: `VERIF-${certNum}`,
          },
        });
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: "🏆 Graduation Certificate Earned!",
            message: "Congratulations on completing the entire course! View your verified certificate.",
            type: "SYSTEM",
            link: "/student/certificates",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      progressPercentage,
      isCourseCompleted: progressPercentage === 100,
    });
  } catch (error: any) {
    console.error("Lesson progress error:", error);
    return NextResponse.json({ error: error.message || "Failed to update progress" }, { status: 500 });
  }
}
