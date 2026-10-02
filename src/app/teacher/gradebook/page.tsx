import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { BarChart3, Download, Award, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherGradebookPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isRoot = user.role === "ADMIN";

  const submissions = await prisma.submission.findMany({
    where: isRoot ? {} : { assignment: { teacherId: user.id } },
    include: {
      student: true,
      assignment: { include: { course: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  const quizAttempts = await prisma.quizAttempt.findMany({
    where: isRoot ? {} : { quiz: { teacherId: user.id } },
    include: {
      student: true,
      quiz: { include: { course: true } },
    },
    orderBy: { completedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Comprehensive Gradebook Matrix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Overview of assignment marks, quiz scores, and academic grading analytics.
          </p>
        </div>

        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(
            "Student,Email,Course,Assessment,Type,Score,MaxMarks,Date\n" +
              submissions
                .map(
                  (s) =>
                    `"${s.student.name}","${s.student.email}","${s.assignment.course.title}","${s.assignment.title}","Assignment",${s.marks || 0},${s.assignment.maxMarks},"${s.submittedAt.toISOString()}"`
                )
                .join("\n")
          )}`}
          download="wisekids-gradebook.csv"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Gradebook CSV</span>
        </a>
      </div>

      {/* Assignment Marks Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assignment Submissions & Scores</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Assignment</th>
                <th className="py-3 px-4">Marks Awarded</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Graded Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{s.student.name}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{s.assignment.course.title}</td>
                  <td className="py-3 px-4 text-indigo-600 dark:text-indigo-400 font-semibold">
                    {s.assignment.title}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {s.marks !== null ? `${s.marks} / ${s.assignment.maxMarks}` : "Pending"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        s.status === "GRADED"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {s.gradedAt ? new Date(s.gradedAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
