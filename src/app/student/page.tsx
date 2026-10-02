import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  ClipboardList,
  CheckSquare,
  Award,
  Video,
  ArrowRight,
  TrendingUp,
  Clock,
  Flame,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [enrollments, assignments, submissions, quizAttempts, announcements, attendance] =
    await Promise.all([
      prisma.enrollment.findMany({
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
      }),
      prisma.assignment.findMany({
        where: {
          course: {
            enrollments: { some: { userId: user.id } },
          },
        },
        include: { course: true },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
      prisma.submission.findMany({
        where: { studentId: user.id },
        include: { assignment: true },
      }),
      prisma.quizAttempt.findMany({
        where: { studentId: user.id },
        include: { quiz: true },
        orderBy: { completedAt: "desc" },
        take: 4,
      }),
      prisma.announcement.findMany({
        where: {
          OR: [{ targetRole: "ALL" }, { targetRole: "STUDENT" }],
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        take: 3,
      }),
      prisma.attendance.findMany({
        where: { studentId: user.id },
      }),
    ]);

  const totalLessonsInCourses = enrollments.reduce((acc, e) => {
    const lCount = e.course.modules.reduce((mAcc, m) => mAcc + m.lessons.length, 0);
    return acc + lCount;
  }, 0);

  const presentAttendance = attendance.filter((a) => a.status === "PRESENT").length;
  const attendanceRate = attendance.length
    ? Math.round((presentAttendance / attendance.length) * 100)
    : 100;

  return (
    <div className="space-y-8">
      {/* Student Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Young Explorer Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ready for today&apos;s quest, {user.name.split(" ")[0]}? 🚀
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
              You are enrolled in {enrollments.length} active course tracks. Keep up your learning streak and solve today&apos;s assignments!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Streak Counter */}
            <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-300 font-extrabold text-lg">
                <Flame className="w-5 h-5 fill-amber-300" />
                <span>5 Days</span>
              </div>
              <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-wider mt-0.5">
                Active Streak
              </p>
            </div>

            <Link
              href="/student/catalog"
              className="px-4 py-3 rounded-2xl bg-white text-indigo-900 font-extrabold text-xs shadow-lg hover:bg-indigo-50 transition-all"
            >
              Explore Catalog
            </Link>
          </div>
        </div>
      </div>

      {/* Campus Announcements */}
      {announcements.length > 0 && (
        <div className="p-4 rounded-3xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
              {announcements[0].title}
            </p>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              {announcements[0].content}
            </p>
          </div>
        </div>
      )}

      {/* My Active Courses Progress Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">My Active Courses</h2>
            <p className="text-xs text-slate-500">Pick up right where you left off</p>
          </div>
          <Link
            href="/student/courses"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>All Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-500">You are not enrolled in any courses yet.</p>
            <Link
              href="/student/catalog"
              className="inline-flex px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              Browse Course Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.map((en) => {
              const totalLessons = en.course.modules.reduce(
                (acc, m) => acc + m.lessons.length,
                0
              );

              return (
                <div
                  key={en.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                        {en.course.level} • {en.batch ? en.batch.name : "Self Paced"}
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {en.progressPercentage}% Completed
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {en.course.title}
                    </h3>

                    {/* Progress Bar */}
                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${en.progressPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Instructor: {en.course.teacher?.name}</span>
                      <span>{totalLessons} Lessons in Syllabus</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {en.progressPercentage === 100 ? "🎓 Completed" : "In Progress"}
                    </span>

                    <Link
                      href={`/student/courses/${en.courseId}/learn`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                    >
                      <span>{en.progressPercentage > 0 ? "Resume Learning" : "Start Course"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Grid: Upcoming Tasks & Live Class Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Homework Tasks Due */}
        <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assignments & Projects</h3>
            <Link
              href="/student/assignments"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {assignments.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">No active assignments due.</p>
            ) : (
              assignments.map((asg) => {
                const sub = submissions.find((s) => s.assignmentId === asg.id);

                return (
                  <div
                    key={asg.id}
                    className="py-3.5 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                        {asg.course?.title}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{asg.title}</h4>
                      <p className="text-[10px] text-slate-500">
                        Due: {new Date(asg.dueDate).toLocaleDateString()} • Max {asg.maxMarks} pts
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {sub ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {sub.status === "GRADED" ? `Score: ${sub.marks} pts` : "Submitted"}
                        </span>
                      ) : (
                        <Link
                          href="/student/assignments"
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                        >
                          Submit Solution
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Classes & Attendance Summary */}
        <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Classroom Batches</h3>
            <Link
              href="/student/timetable"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Timetable
            </Link>
          </div>

          <div className="space-y-3">
            {enrollments
              .filter((e) => e.batch)
              .map((e) => (
                <div
                  key={e.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{e.batch?.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                      {e.batch?.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{e.batch?.scheduleText}</p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      Teacher: {e.course.teacher?.name}
                    </span>
                    <a
                      href={e.batch?.meetingLink || "https://meet.google.com/wis-ekid-cls"}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-1"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Class</span>
                    </a>
                  </div>
                </div>
              ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold">Attendance Record</span>
            <span className="text-emerald-600 font-bold">{attendanceRate}% Present</span>
          </div>
        </div>
      </div>
    </div>
  );
}
