import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { Calendar, Clock, Video, ClipboardList, CheckSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentTimetablePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [enrollments, assignments, quizzes] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: { include: { teacher: true } },
        batch: true,
      },
    }),
    prisma.assignment.findMany({
      where: {
        course: { enrollments: { some: { userId: user.id } } },
      },
      include: { course: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.quiz.findMany({
      where: {
        course: { enrollments: { some: { userId: user.id } } },
      },
      include: { course: true },
    }),
  ]);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Weekly Timetable & Master Calendar
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          All your live coaching sessions, homework deadlines, and quiz dates in one consolidated view.
        </p>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {daysOfWeek.map((day, idx) => {
          // Find matching live classes or assignments for this day
          const dayBatches = enrollments.filter(
            (e) => e.batch && e.batch.scheduleText?.toLowerCase().includes(day.toLowerCase().slice(0, 3))
          );

          return (
            <div
              key={day}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">{day}</span>
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {dayBatches.length > 0 ? `${dayBatches.length} Classes` : "Study Day"}
                  </span>
                </div>

                {dayBatches.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">Self-paced project practice</p>
                ) : (
                  dayBatches.map((en) => (
                    <div
                      key={en.id}
                      className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {en.course.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{en.batch?.scheduleText}</p>
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          Coach: {en.course.teacher?.name}
                        </span>
                        <a
                          href={en.batch?.meetingLink || "https://meet.google.com/wis-ekid-cls"}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700"
                        >
                          Join
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deadlines list */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>Upcoming Deliverables & Deadlines</span>
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {assignments.map((a) => (
            <div key={a.id} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{a.title}</p>
                <p className="text-indigo-600 dark:text-indigo-400 text-[11px]">{a.course?.title}</p>
              </div>
              <span className="text-slate-500 font-mono text-[11px]">
                Due: {new Date(a.dueDate).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
