import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { Video, Calendar, Clock, Users, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherLiveClassesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const batches = await prisma.batch.findMany({
    where: user.role === "ADMIN" ? {} : { teacherId: user.id },
    include: {
      course: true,
      enrollments: { include: { user: true } },
    },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Live Interactive Classrooms
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Launch live video teaching sessions, share meeting links, and check student attendance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {batch.code}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Ready
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{batch.name}</h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                {batch.course?.title}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Schedule: {batch.scheduleText}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{batch.enrollments?.length || 0} Students in Cohort</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <a
                href={batch.meetingLink || "https://meet.google.com/wis-ekid-cls"}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20"
              >
                <Video className="w-4 h-4" />
                <span>Start Live Meeting</span>
              </a>

              <span className="text-[11px] text-slate-400">Google Meet / Zoom</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
