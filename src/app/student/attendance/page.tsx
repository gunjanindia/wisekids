import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { UserCheck, CheckCircle2, Clock, XCircle, Award } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentAttendancePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const attendanceRecords = await prisma.attendance.findMany({
    where: { studentId: user.id },
    include: {
      course: true,
      batch: true,
    },
    orderBy: { date: "desc" },
  });

  const totalClasses = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((a) => a.status === "PRESENT").length;
  const lateCount = attendanceRecords.filter((a) => a.status === "LATE").length;
  const absentCount = attendanceRecords.filter((a) => a.status === "ABSENT").length;

  const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          My Attendance & Participation Log
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Track your live class attendance rate and view attendance verified by instructors.
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase">Attendance Rate</p>
          <p className="text-3xl font-black text-emerald-600">{percentage}%</p>
          <p className="text-[10px] text-slate-400">Target: 85%+</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase">Present Classes</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{presentCount}</p>
          <p className="text-[10px] text-emerald-600 font-bold">On time</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase">Late Arrivals</p>
          <p className="text-3xl font-black text-amber-600">{lateCount}</p>
          <p className="text-[10px] text-slate-400">Recorded</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase">Absences</p>
          <p className="text-3xl font-black text-rose-600">{absentCount}</p>
          <p className="text-[10px] text-slate-400">Total missed</p>
        </div>
      </div>

      {/* Attendance History */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Class by Class Log</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Batch</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Coach Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No attendance records logged yet.
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(a.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {a.course?.title}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {a.batch?.name || "Live Cohort"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          a.status === "PRESENT"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : a.status === "LATE"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] italic">
                      {a.notes || "Active class attendance"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
