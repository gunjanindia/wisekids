"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";

export default function TeacherAssignmentsPage() {
  const { success, error } = useToast();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  // Create form
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [dueDateDays, setDueDateDays] = useState("7");

  // Grade form
  const [marks, setMarks] = useState("95");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/assignments");
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments || []);
        setCourses(data.courses || []);
        if (data.courses?.length > 0) setCourseId(data.courses[0].id);
      }
    } catch {
      error("Fetch Error", "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + parseInt(dueDateDays));

      const res = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title,
          instructions,
          maxMarks,
          dueDate: dueDate.toISOString(),
        }),
      });
      if (res.ok) {
        success("Assignment Created!", `${title} is now active.`);
        setCreateModalOpen(false);
        setTitle("");
        setInstructions("");
        fetchAssignments();
      } else {
        error("Failed", "Could not create assignment.");
      }
    } catch {
      error("Network Error", "Unable to create assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/teacher/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          marks: parseFloat(marks),
          feedback,
          status: "GRADED",
        }),
      });
      if (res.ok) {
        success("Grade & Feedback Recorded!", "Student notified.");
        setGradingModalOpen(false);
        setSelectedSubmission(null);
        fetchAssignments();
      } else {
        error("Grading Error", "Could not save grade.");
      }
    } catch {
      error("Network Error", "Unable to save grade.");
    } finally {
      setSubmitting(false);
    }
  };

  const openGrading = (submission: any, assignment: any) => {
    setSelectedSubmission({ ...submission, assignmentTitle: assignment.title, maxMarks: assignment.maxMarks });
    setMarks(submission.marks ? submission.marks.toString() : "90");
    setFeedback(submission.feedback || "Excellent work! Clear demonstration of concepts.");
    setGradingModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Assignments & Gradebook Feedback
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create homework tasks, evaluate student project submissions, and provide personalized coaching feedback.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Assignment List */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
            <span>Loading assignments & student solutions...</span>
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            No assignments created. Click &quot;New Assignment&quot; to publish your first exercise!
          </div>
        ) : (
          assignments.map((asg) => (
            <div
              key={asg.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                    {asg.course?.title}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{asg.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                    {asg.instructions}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span>Max: {asg.maxMarks} pts</span>
                  <span>Due: {new Date(asg.dueDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Submissions Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Student Submissions ({asg.submissions?.length || 0})
                </h4>

                {asg.submissions?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No submissions uploaded yet for this assignment.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {asg.submissions.map((sub: any) => (
                      <div
                        key={sub.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-slate-800 font-bold text-xs flex items-center justify-center text-indigo-700">
                            {sub.student?.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {sub.student?.name}
                            </p>
                            <p className="text-[11px] text-slate-500 max-w-xs truncate italic">
                              &quot;{sub.comments || "Uploaded work sample"}&quot;
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              sub.status === "GRADED"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {sub.status === "GRADED" ? `Score: ${sub.marks}/${asg.maxMarks}` : "Pending Review"}
                          </span>

                          <button
                            onClick={() => openGrading(sub, asg)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                          >
                            {sub.status === "GRADED" ? "Edit Feedback" : "Grade Submission"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Assignment Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">New Course Assignment</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Course
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Density Lab Report"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Instructions
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe what students need to solve or submit..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Due In (Days)
                  </label>
                  <input
                    type="number"
                    value={dueDateDays}
                    onChange={(e) => setDueDateDays(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Publish Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grading & Feedback Modal */}
      {gradingModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Grading: {selectedSubmission.student?.name}
                </h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                  {selectedSubmission.assignmentTitle}
                </p>
              </div>
              <button onClick={() => setGradingModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmission} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Marks Awarded (out of {selectedSubmission.maxMarks})
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedSubmission.maxMarks}
                  required
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teacher Coaching Feedback
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Praise strengths and provide guidance for improvement..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGradingModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Grade & Notify"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
