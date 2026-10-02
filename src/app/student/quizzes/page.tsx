import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import Link from "next/link";
import { CheckSquare, Clock, Award, Play, CheckCircle2, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentQuizzesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const quizzes = await prisma.quiz.findMany({
    where: {
      course: {
        enrollments: { some: { userId: user.id } },
      },
    },
    include: {
      course: true,
      questions: true,
      attempts: {
        where: { studentId: user.id },
        orderBy: { completedAt: "desc" },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Quizzes & Skill Checkpoints
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Take interactive timed quizzes to earn mastery badges and test your understanding.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No quizzes available for your enrolled courses.
          </div>
        ) : (
          quizzes.map((q) => {
            const bestAttempt = q.attempts[0];
            const hasPassed = bestAttempt && bestAttempt.passed;

            return (
              <div
                key={q.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                      {q.course?.title}
                    </span>
                    {hasPassed && (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" /> Passed
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{q.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {q.description || "Interactive quiz assessment."}
                  </p>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{q.timeLimitMinutes} Mins</span>
                    </div>
                    <span>{q.questions.length} Questions</span>
                    <span className="font-bold text-indigo-600">Pass: {q.passingScore}%</span>
                  </div>

                  {bestAttempt && (
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Latest Score: {bestAttempt.score}%</span>
                      <span>{q.attempts.length} Attempts</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Auto-Graded
                  </span>
                  <Link
                    href={`/student/quizzes/${q.id}/take`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{bestAttempt ? "Retake Quiz" : "Start Quiz"}</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
