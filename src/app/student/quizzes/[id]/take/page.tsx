"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Award,
  Loader2,
  Sparkles,
  RotateCcw,
  Check,
} from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";
import confetti from "canvas-confetti";

export default function TakeQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const quizId = resolvedParams.id;
  const router = useRouter();
  const { success, error } = useToast();

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/quizzes");
      if (res.ok) {
        const data = await res.json();
        const found = data.quizzes?.find((q: any) => q.id === quizId);
        if (found) {
          setQuiz(found);
          setTimeLeftSeconds((found.timeLimitMinutes || 15) * 60);
        }
      }
    } catch {
      error("Fetch Error", "Failed to load quiz.");
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!quiz || result || timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quiz, result, timeLeftSeconds]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleTextAnswer = (questionId: string, textVal: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: textVal }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/student/quizzes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          answers,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
        if (data.passed) {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 },
          });
          success("🎉 You Passed the Quiz!", `Score: ${data.score}%`);
        } else {
          error("Quiz Attempt Complete", `Score: ${data.score}%. Minimum passing is ${quiz.passingScore}%.`);
        }
      } else {
        error("Submission Error", data.error || "Failed to submit quiz.");
      }
    } catch {
      error("Network Error", "Unable to score quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
        <span>Loading assessment...</span>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="py-24 text-center text-slate-400">
        <p>Quiz not found.</p>
        <Link href="/student/quizzes" className="text-xs font-bold text-indigo-600 underline mt-2 block">
          Return to Quizzes
        </Link>
      </div>
    );
  }

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const currentQ = quiz.questions[currentQuestionIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Header & Timer */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
            {quiz.course?.title}
          </span>
          <h1 className="text-lg font-black text-slate-900 dark:text-white">{quiz.title}</h1>
        </div>

        {!result && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      {/* If Quiz Completed: Score Summary & Review */}
      {result ? (
        <div className="space-y-6 animate-in zoom-in-95 duration-200">
          <div
            className={`p-8 rounded-3xl border text-center space-y-4 shadow-xl ${
              result.passed
                ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100"
                : "bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100"
            }`}
          >
            <div
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center font-bold text-2xl shadow-lg ${
                result.passed ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
              }`}
            >
              {result.passed ? "🏆" : "📝"}
            </div>

            <div>
              <h2 className="text-2xl font-black">
                {result.passed ? "Great Job! You Passed!" : "Keep Practicing!"}
              </h2>
              <p className="text-3xl font-black mt-2">
                Your Score: <span className="underline">{result.score}%</span>
              </p>
              <p className="text-xs opacity-80 mt-1">Passing standard: {quiz.passingScore}%</p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                  setCurrentQuestionIdx(0);
                  setTimeLeftSeconds((quiz.timeLimitMinutes || 15) * 60);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md"
              >
                Retake Assessment
              </button>
              <Link
                href="/student/quizzes"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
              >
                Back to All Quizzes
              </Link>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Question by Question Review</h3>

            <div className="space-y-4">
              {result.reviewDetails?.map((rev: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    rev.isCorrect
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
                      : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      #{idx + 1}. {rev.questionText}
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                        rev.isCorrect ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                      }`}
                    >
                      {rev.isCorrect ? `+${rev.points} pts` : "0 pts"}
                    </span>
                  </div>

                  {rev.explanation && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">Explanation: </span>
                      {rev.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Active Question Stepper */
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
          {/* Question Stepper Dots */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500">
              Question {currentQuestionIdx + 1} of {quiz.questions.length}
            </span>
            <div className="flex items-center gap-1.5">
              {quiz.questions.map((_: any, qIndex: number) => (
                <div
                  key={qIndex}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentQuestionIdx === qIndex
                      ? "bg-indigo-600 scale-125 ring-2 ring-indigo-300"
                      : answers[quiz.questions[qIndex].id]
                      ? "bg-emerald-500"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current Question */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {currentQ.text}
            </h2>

            {currentQ.type === "MCQ" || currentQ.type === "TRUE_FALSE" ? (
              <div className="space-y-2.5">
                {currentQ.options?.map((opt: any) => {
                  const isSelected = answers[currentQ.id] === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt.id)}
                      className={`w-full text-left p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-900 dark:text-indigo-200 shadow-xs"
                          : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span>{opt.text}</span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Type your concise answer:
                </label>
                <input
                  type="text"
                  placeholder="Enter answer..."
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => handleTextAnswer(currentQ.id, e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Stepper Navigation Controls */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 disabled:opacity-30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {currentQuestionIdx < quiz.questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating Score...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Grade Quiz</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
