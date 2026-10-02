"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Clock,
  Award,
  Loader2,
  X,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";

export default function TeacherQuizzesPage() {
  const { success, error } = useToast();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form states
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState("15");
  const [passingScore, setPassingScore] = useState("70");

  const [questions, setQuestions] = useState<
    Array<{
      text: string;
      type: string;
      points: number;
      explanation: string;
      options: Array<{ text: string; isCorrect: boolean }>;
    }>
  >([
    {
      text: "What is the speed of light in vacuum?",
      type: "MCQ",
      points: 25,
      explanation: "Approximately 300,000 km/s.",
      options: [
        { text: "300,000 km/s", isCorrect: true },
        { text: "150,000 km/s", isCorrect: false },
        { text: "30,000 km/s", isCorrect: false },
        { text: "3,000 km/s", isCorrect: false },
      ],
    },
  ]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/quizzes");
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes || []);
        setCourses(data.courses || []);
        if (data.courses?.length > 0) setCourseId(data.courses[0].id);
      }
    } catch {
      error("Error", "Failed to load quizzes.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        text: `Question ${prev.length + 1}`,
        type: "MCQ",
        points: 25,
        explanation: "",
        options: [
          { text: "Correct Option", isCorrect: true },
          { text: "Incorrect Option", isCorrect: false },
        ],
      },
    ]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/teacher/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title,
          description,
          timeLimitMinutes: parseInt(timeLimitMinutes),
          passingScore: parseInt(passingScore),
          questions,
        }),
      });
      if (res.ok) {
        success("Quiz Created!", `${title} is now active.`);
        setCreateModalOpen(false);
        setTitle("");
        fetchQuizzes();
      } else {
        error("Error", "Failed to create quiz.");
      }
    } catch {
      error("Network Error", "Unable to create quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Quizzes & Automated Assessments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Design timed quizzes with multiple choice, true/false, and short answer question banks.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Quiz Builder</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
            <span>Loading quizzes...</span>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No quizzes created. Click &quot;New Quiz Builder&quot; to build an interactive quiz!
          </div>
        ) : (
          quizzes.map((q) => (
            <div
              key={q.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                    {q.course?.title}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    Pass: {q.passingScore}%
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{q.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{q.description || "Course assessment."}</p>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{q.timeLimitMinutes} Mins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>{q.questions?.length || 0} Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>{q.attempts?.length || 0} Attempts</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Active & Published</span>
                <span>Auto-Graded</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Quiz Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">New Quiz Assessment</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sprint Math Logic Challenge"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Time Limit (Minutes)
                  </label>
                  <input
                    type="number"
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Question list */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Question Bank ({questions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Add Question
                  </button>
                </div>

                {questions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Question text..."
                        value={q.text}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[qIdx].text = e.target.value;
                          setQuestions(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                      />
                      <span className="text-[11px] font-bold text-slate-500">{q.points} pts</span>
                    </div>

                    <div className="space-y-1.5 pl-3">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={opt.isCorrect}
                            onChange={() => {
                              const updated = [...questions];
                              updated[qIdx].options.forEach((o, i) => (o.isCorrect = i === oIdx));
                              setQuestions(updated);
                            }}
                          />
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[qIdx].options[oIdx].text = e.target.value;
                              setQuestions(updated);
                            }}
                            className="flex-1 px-2 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[11px]"
                          />
                          {opt.isCorrect && (
                            <span className="text-[10px] font-bold text-emerald-600">Correct Answer</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
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
                  {submitting ? "Saving..." : "Save & Publish Quiz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
