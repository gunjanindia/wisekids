"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Upload,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";

export default function StudentAssignmentsPage() {
  const { success, error } = useToast();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/assignments");
      const profileRes = await fetch("/api/student/profile");

      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments || []);
      }

      if (profileRes.ok) {
        const pData = await profileRes.json();
        // Load student submissions
      }
    } catch {
      error("Fetch Error", "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/student/assignments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          comments,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        success("🎉 Solution Submitted!", "Your coach will review and grade your work.");
        setSubmitModalOpen(false);
        setComments("");
        fetchAssignments();
      } else {
        error("Error", data.error || "Failed to submit assignment.");
      }
    } catch {
      error("Network Error", "Unable to submit assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  const openSubmit = (asg: any) => {
    setSelectedAssignment(asg);
    setComments("");
    setSubmitModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Assignments & Project Quests
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload your experimental findings, math proofs, and coding scripts for mentor grading.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
            <span>Loading assignments...</span>
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            No assignments currently assigned.
          </div>
        ) : (
          assignments.map((asg) => (
            <div
              key={asg.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                    {asg.course?.title}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {asg.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {asg.instructions}
                  </p>
                </div>

                <div className="text-right text-xs shrink-0">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Max: {asg.maxMarks} Points
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Due: {new Date(asg.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">
                  Resubmissions Allowed: {asg.allowResubmission ? "Yes" : "No"}
                </span>

                <button
                  onClick={() => openSubmit(asg)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Submit Solution</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submission Modal */}
      {submitModalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Submit Work: {selectedAssignment.title}
                </h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                  {selectedAssignment.course?.title}
                </p>
              </div>
              <button onClick={() => setSubmitModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSolution} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your Answer, Steps & Observations
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Type your answer, calculations, or paste links to your scratch project / code..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-1">
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Optional File Attachment
                </p>
                <p className="text-[10px] text-slate-400">Simulated file upload ready</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Uploading..." : "Turn In Assignment"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
