"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Calendar,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Users,
} from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";

export default function TeacherAttendancePage() {
  const { success, error } = useToast();
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Student statuses state { studentId: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" }
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/attendance");
      if (res.ok) {
        const data = await res.json();
        setBatches(data.batches || []);
        if (data.batches?.length > 0) {
          const firstBatch = data.batches[0];
          setSelectedBatchId(firstBatch.id);
          initStatuses(firstBatch);
        }
      }
    } catch {
      error("Fetch Error", "Failed to load batches.");
    } finally {
      setLoading(false);
    }
  };

  const initStatuses = (batch: any) => {
    const initial: Record<string, string> = {};
    batch.enrollments?.forEach((e: any) => {
      initial[e.user.id] = "PRESENT";
    });
    setStatuses(initial);
  };

  const currentBatch = batches.find((b) => b.id === selectedBatchId);

  const handleBatchChange = (batchId: string) => {
    setSelectedBatchId(batchId);
    const b = batches.find((item) => item.id === batchId);
    if (b) initStatuses(b);
  };

  const handleSaveAttendance = async () => {
    if (!currentBatch) return;
    setSaving(true);
    try {
      const records = Object.entries(statuses).map(([studentId, status]) => ({
        studentId,
        status,
        notes: "Class attendance recorded.",
      }));

      const res = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: currentBatch.id,
          courseId: currentBatch.courseId,
          date: new Date(attendanceDate).toISOString(),
          records,
        }),
      });

      if (res.ok) {
        success("Attendance Saved!", `Recorded for ${records.length} students.`);
      } else {
        error("Error", "Failed to save attendance.");
      }
    } catch {
      error("Network Error", "Unable to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Class Attendance Register
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mark daily attendance per cohort, monitor absences, and update participation records.
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={saving || !currentBatch}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Records..." : "Save Attendance Sheet"}</span>
        </button>
      </div>

      {/* Cohort & Date Selectors */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Select Batch Cohort
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => handleBatchChange(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Class Date
            </label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {currentBatch && (
          <div className="text-right">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {currentBatch.course?.title}
            </span>
            <p className="text-[11px] text-slate-500">{currentBatch.scheduleText}</p>
          </div>
        )}
      </div>

      {/* Attendance Roster */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Enrolled Students ({currentBatch?.enrollments?.length || 0})</span>
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const allPres: Record<string, string> = {};
                currentBatch?.enrollments?.forEach((e: any) => (allPres[e.user.id] = "PRESENT"));
                setStatuses(allPres);
              }}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Mark All Present
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {!currentBatch || currentBatch.enrollments?.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              No students enrolled in this cohort yet.
            </div>
          ) : (
            currentBatch.enrollments.map((en: any) => {
              const student = en.user;
              const curStatus = statuses[student.id] || "PRESENT";

              return (
                <div
                  key={student.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-indigo-100 dark:bg-slate-800 font-bold text-xs flex items-center justify-center text-indigo-700 dark:text-indigo-300">
                      {student.image ? (
                        <img src={student.image} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{student.name[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{student.name}</p>
                      <p className="text-[11px] text-slate-500">{student.email}</p>
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5">
                    {[
                      { val: "PRESENT", label: "Present", color: "bg-emerald-600 text-white" },
                      { val: "LATE", label: "Late", color: "bg-amber-500 text-white" },
                      { val: "ABSENT", label: "Absent", color: "bg-rose-600 text-white" },
                      { val: "EXCUSED", label: "Excused", color: "bg-purple-600 text-white" },
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        onClick={() => setStatuses((prev) => ({ ...prev, [student.id]: btn.val }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          curStatus === btn.val
                            ? btn.color + " shadow-xs scale-105"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
