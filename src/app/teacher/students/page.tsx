import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { Users, GraduationCap, Mail, Phone, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherStudentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const enrollments = await prisma.enrollment.findMany({
    where: user.role === "ADMIN" ? {} : { course: { teacherId: user.id } },
    include: {
      user: { include: { profile: true } },
      course: true,
      batch: true,
    },
    orderBy: { enrolledAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Enrolled Student Directory
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          View roster details, parent contact information, and course progress for all your students.
        </p>
      </div>

      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Course Track</th>
                <th className="py-3 px-4">Cohort</th>
                <th className="py-3 px-4">Grade Level</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Parent Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {enrollments.map((en) => (
                <tr key={en.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{en.user.name}</p>
                    <p className="text-[10px] text-slate-500">{en.user.email}</p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {en.course.title}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    {en.batch?.name || "Self-Paced"}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {en.user.profile?.gradeLevel || "Grade 4"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${en.progressPercentage}%` }}
                        />
                      </div>
                      <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
                        {en.progressPercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px]">
                    <p>{en.user.profile?.parentName || "Parent"}</p>
                    <p className="text-[10px] text-slate-400">{en.user.profile?.parentPhone || "+1 (555) 700-1000"}</p>
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
