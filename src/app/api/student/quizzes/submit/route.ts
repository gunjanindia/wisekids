import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { quizId, answers } = body; // answers: Record<questionId, selectedOptionId or text>

    if (!quizId || !answers) {
      return NextResponse.json({ error: "Quiz ID and answers required" }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    let earnedScore = 0;
    let totalScore = 0;
    const reviewDetails: any[] = [];

    quiz.questions.forEach((q) => {
      totalScore += q.points;
      const studentAns = answers[q.id];
      let isCorrect = false;

      if (q.type === "MCQ" || q.type === "TRUE_FALSE") {
        const correctOpt = q.options.find((o) => o.isCorrect);
        if (correctOpt && studentAns === correctOpt.id) {
          isCorrect = true;
          earnedScore += q.points;
        }
      } else {
        // Short Answer comparison
        const correctOpt = q.options.find((o) => o.isCorrect);
        if (
          correctOpt &&
          studentAns &&
          studentAns.toString().trim().toLowerCase() === correctOpt.text.trim().toLowerCase()
        ) {
          isCorrect = true;
          earnedScore += q.points;
        }
      }

      reviewDetails.push({
        questionId: q.id,
        questionText: q.text,
        studentAnswer: studentAns,
        isCorrect,
        points: isCorrect ? q.points : 0,
        explanation: q.explanation,
      });
    });

    const percentage = totalScore > 0 ? Math.round((earnedScore / totalScore) * 100) : 0;
    const passed = percentage >= quiz.passingScore;

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        studentId: user.id,
        score: percentage,
        maxScore: 100,
        passed,
        answersJson: JSON.stringify(reviewDetails),
        completedAt: new Date(),
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "STUDENT_COMPLETE_QUIZ",
      entity: "QuizAttempt",
      entityId: attempt.id,
      details: { quiz: quiz.title, score: percentage, passed },
    });

    return NextResponse.json({
      success: true,
      score: percentage,
      passed,
      attemptId: attempt.id,
      reviewDetails,
    });
  } catch (error: any) {
    console.error("Quiz submit error:", error);
    return NextResponse.json({ error: error.message || "Failed to score quiz" }, { status: 500 });
  }
}
