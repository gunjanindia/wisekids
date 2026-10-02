import React from "react";
import prisma from "@/lib/prisma";
import { BarChart3, Download, Users, CheckSquare, Award, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const [courses, enrollments, attendance, quizAttempts] = await Promise.all([
    prisma.course.findMany({
      include: {
        _count: { select: { enrollments: true, assignments: true, quizzes: true } },
      },
    }),
    prisma.enrollment.findMany({
      include: { user: true, course: true },
    }),
    prisma.attendance.findMany({
      include: { student: true, course: true },
    }),
    prisma.quizAttempt.findMany({
      include: { student: true, quiz: true },
    }),
  ]);

  const totalPresent = attendance.filter((a) => a.status === "PRESENT").length;
  const attendanceRate = attendance.length
    ? Math.round((totalPresent / attendance.length) * 100)
    : 100;

  const passedAttempts = quizAttempts.filter((q) => q.passed).length;
  const quizPassRate = quizAttempts.length
    ? Math.round((passedAttempts / quizAttempts.length) * 100)
    : 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Academic Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comprehensive attendance logs, quiz performance distributions, and graduation rates.
          </p>
        </div>

        {/* CSV export */}
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(
            "Student,Email,Course,ProgressPercentage,Status\n" +
              enrollments
                .map(
                  (e) =>
                    `"${e.user.name}","${e.user.email}","${e.course.title}",${e.progressPercentage},"${e.status}"`
                )
                .join("\n")
          )}`}
          download="wisekids-student-progress-report.csv"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Academic Report (CSV)</span>
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase">Overall Attendance Rate</p>
          <p className="text-2xl font-black text-emerald-600">{attendanceRate}%</p>
          <p className="text-[10px] text-slate-400">{attendance.length} class check-ins recorded</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase">Quiz Pass Ratio</p>
          <p className="text-2xl font-black text-indigo-600">{quizPassRate}%</p>
          <p className="text-[10px] text-slate-400">{passedAttempts} of {quizAttempts.length} passed</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase">Active Enrollments</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{enrollments.length}</p>
          <p className="text-[10px] text-slate-400">Total active students in courses</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase">Avg Course Completion</p>
          <p className="text-2xl font-black text-purple-600">
            {enrollments.length
              ? Math.round(
                  enrollments.reduce((acc, e) => acc + e.progressPercentage, 0) /
                    enrollments.length
                )
              : 0}
            %
          </p>
          <p className="text-[10px] text-slate-400">Across all 6 tracks</p>
        </div>
      </div>

      {/* Course Performance Breakdown Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Curriculum Track Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Enrolled Students</th>
                <th className="py-3 px-4">Assessments</th>
                <th className="py-3 px-4">Quizzes</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Publish Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{c.title}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {c._count.enrollments}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {c._count.assignments} assignments
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {c._count.quizzes} quizzes
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{c.level}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {c.status}
                    </span>
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
