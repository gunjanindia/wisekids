import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTeacherOrAdmin } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const teacher = await requireTeacherOrAdmin();
    const quizzes = await prisma.quiz.findMany({
      where: teacher.role === "ADMIN" ? {} : { teacherId: teacher.id },
      include: {
        course: true,
        questions: {
          include: { options: true },
          orderBy: { order: "asc" },
        },
        attempts: {
          include: { student: true },
          orderBy: { completedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const courses = await prisma.course.findMany({
      where: teacher.role === "ADMIN" ? {} : { teacherId: teacher.id },
    });

    return NextResponse.json({ quizzes, courses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const teacher = await requireTeacherOrAdmin();
    const body = await request.json();
    const { courseId, title, description, timeLimitMinutes, passingScore, questions } = body;

    if (!courseId || !title) {
      return NextResponse.json({ error: "Missing required quiz title or course" }, { status: 400 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        courseId,
        teacherId: teacher.id,
        title,
        description: description || "",
        timeLimitMinutes: parseInt(timeLimitMinutes) || 15,
        passingScore: parseInt(passingScore) || 70,
        isPublished: true,
      },
    });

    if (questions && Array.isArray(questions)) {
      for (let qIdx = 0; qIdx < questions.length; qIdx++) {
        const q = questions[qIdx];
        const questionRecord = await prisma.question.create({
          data: {
            quizId: quiz.id,
            text: q.text,
            type: q.type || "MCQ",
            points: parseInt(q.points) || 10,
            explanation: q.explanation || "",
            order: qIdx + 1,
          },
        });

        if (q.options && Array.isArray(q.options)) {
          for (let oIdx = 0; oIdx < q.options.length; oIdx++) {
            const opt = q.options[oIdx];
            await prisma.option.create({
              data: {
                questionId: questionRecord.id,
                text: opt.text,
                isCorrect: !!opt.isCorrect,
                order: oIdx + 1,
              },
            });
          }
        }
      }
    }

    await createAuditLog({
      userId: teacher.id,
      action: "TEACHER_CREATE_QUIZ",
      entity: "Quiz",
      entityId: quiz.id,
      details: { title, courseId },
    });

    return NextResponse.json({ success: true, quiz });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create quiz" }, { status: 500 });
  }
}
