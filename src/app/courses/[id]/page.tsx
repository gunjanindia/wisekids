import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import {
  BookOpen,
  Video,
  FileText,
  Users,
  Award,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const courseId = resolvedParams.id;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      category: true,
      teacher: { include: { profile: true } },
      modules: {
        include: { lessons: true },
        orderBy: { order: "asc" },
      },
      batches: true,
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    notFound();
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <PublicHeader />

      <main className="flex-1 pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10">
        {/* Back Link */}
        <Link
          href="/#courses"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Courses</span>
        </Link>

        {/* Hero Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {course.category?.name || "STEM Track"}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {course.level}
              </span>
              {course.isFree && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500 text-white">
                  Free
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {course.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {course.description}
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{course.durationWeeks} Weeks</p>
                <p className="text-slate-500 text-[11px]">Program Length</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{totalLessons} Lessons</p>
                <p className="text-slate-500 text-[11px]">Interactive Modules</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{course.ageGroup}</p>
                <p className="text-slate-500 text-[11px]">Target Cohort</p>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Link
                href="/login"
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>{course.isFree ? "Enroll Free in Portal" : `Enroll Now • $${course.price}`}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-900">
              <img
                src={course.thumbnail || "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80"}
                alt={course.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-6 space-y-3 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100">
                    <img
                      src={course.teacher.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                      alt={course.teacher.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Coach {course.teacher.name}</p>
                    <p className="text-[11px] text-slate-500">{course.teacher.profile?.qualifications}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Syllabus breakdown */}
        <div className="space-y-6 pt-10 border-t border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Curriculum Syllabus</h2>
            <p className="text-xs text-slate-500">Modules and lessons covered in this program</p>
          </div>

          <div className="space-y-4">
            {course.modules.map((mod: any, mIdx: number) => (
              <div
                key={mod.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
              >
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {mod.title}
                </h3>
                {mod.description && (
                  <p className="text-xs text-slate-500">{mod.description}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {mod.lessons.map((les: any) => (
                    <div
                      key={les.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {les.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {les.durationMinutes}m • {les.contentType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
