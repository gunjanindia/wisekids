import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import Link from "next/link";
import {
  BookOpen,
  Users,
  ClipboardList,
  CheckSquare,
  Video,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  AlertCircle,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isRoot = user.role === "ADMIN";

  const [courses, batches, pendingSubmissions, recentAttempts, announcements] =
    await Promise.all([
      prisma.course.findMany({
        where: isRoot ? {} : { teacherId: user.id },
        include: {
          modules: { include: { lessons: true } },
          _count: { select: { enrollments: true, assignments: true } },
        },
      }),
      prisma.batch.findMany({
        where: isRoot ? {} : { teacherId: user.id },
        include: { course: true, enrollments: true },
      }),
      prisma.submission.findMany({
        where: {
          status: "PENDING",
          assignment: isRoot ? {} : { teacherId: user.id },
        },
        include: { assignment: true, student: true },
        take: 6,
      }),
      prisma.quizAttempt.findMany({
        where: {
          quiz: isRoot ? {} : { teacherId: user.id },
        },
        include: { quiz: true, student: true },
        orderBy: { completedAt: "desc" },
        take: 5,
      }),
      prisma.announcement.findMany({
        where: {
          OR: [{ targetRole: "ALL" }, { targetRole: "TEACHER" }],
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        take: 3,
      }),
    ]);

  const totalStudentsTaught = courses.reduce((acc, c) => acc + c._count.enrollments, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Instructor Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Faculty Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, {user.name}! Track student submissions, manage modules, and launch live classrooms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/teacher/courses"
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Course Builder</span>
          </Link>
          <Link
            href="/teacher/attendance"
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Mark Attendance</span>
          </Link>
        </div>
      </div>

      {/* Announcements Banner */}
      {announcements.length > 0 && (
        <div className="p-4 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Campus Faculty Notice:</span>
          </div>
          <p className="text-xs text-indigo-950 dark:text-indigo-200 font-semibold">{announcements[0].title}</p>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">{announcements[0].content}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">My Courses</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{courses.length}</p>
          <p className="text-[10px] text-slate-400">Published & active tracks</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Learners</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{totalStudentsTaught}</p>
          <p className="text-[10px] text-purple-600 font-bold">Enrolled across my cohorts</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">To Grade</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{pendingSubmissions.length}</p>
          <p className="text-[10px] text-slate-400">Pending student submissions</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Batches</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{batches.length}</p>
          <p className="text-[10px] text-emerald-600 font-bold">Live classroom cohorts</p>
        </div>
      </div>

      {/* Grid: Pending Submissions & Live Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Pending Submissions to Grade */}
        <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assignments Awaiting Grading</h3>
              <p className="text-xs text-slate-500">Review solutions and provide formative feedback</p>
            </div>
            <Link
              href="/teacher/assignments"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Gradebook</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingSubmissions.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                🎉 All student submissions are currently graded!
              </p>
            ) : (
              pendingSubmissions.map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{s.student?.name}</p>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400">{s.assignment?.title}</p>
                    <p className="text-[10px] text-slate-400">
                      Submitted: {new Date(s.submittedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <Link
                    href="/teacher/assignments"
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                  >
                    Grade Now
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Cohorts & Class Schedule */}
        <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Live Classes</h3>
            <Link
              href="/teacher/live-classes"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Schedule
            </Link>
          </div>

          <div className="space-y-3">
            {batches.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No active batches assigned.</p>
            ) : (
              batches.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{b.name}</span>
                    <span className="text-[10px] font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-bold">
                      {b.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{b.course?.title}</p>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">{b.scheduleText}</span>
                    {b.meetingLink && (
                      <a
                        href={b.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 flex items-center gap-1"
                      >
                        <Video className="w-3 h-3" />
                        <span>Launch</span>
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
