import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import Link from "next/link";
import { BookOpen, Video, Award, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentMyCoursesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          teacher: true,
          modules: { include: { lessons: true } },
        },
      },
      batch: true,
    },
    orderBy: { enrolledAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            My Enrolled Courses & Progress
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access lessons, video players, PDF downloads, and track your graduation status.
          </p>
        </div>

        <Link
          href="/student/catalog"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Explore More Tracks</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No courses enrolled yet. Browse the catalog to start!
          </div>
        ) : (
          enrollments.map((en) => {
            const totalLessons = en.course.modules.reduce(
              (acc, m) => acc + m.lessons.length,
              0
            );

            return (
              <div
                key={en.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 w-full bg-slate-100 dark:bg-slate-800">
                    <img
                      src={en.course.thumbnail || "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80"}
                      alt={en.course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-md">
                        {en.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                      {en.batch ? en.batch.name : "Self-Paced Track"}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {en.course.title}
                    </h3>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        <span>Course Progress</span>
                        <span>{en.progressPercentage}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${en.progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800">
                      <span>Coach: {en.course.teacher?.name}</span>
                      <span>{totalLessons} Lessons</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600">
                    {en.progressPercentage === 100 ? "Completed 🎓" : "In Progress"}
                  </span>
                  <Link
                    href={`/student/courses/${en.courseId}/learn`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                  >
                    <span>Launch Player</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
