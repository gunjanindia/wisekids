"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Video,
  FileText,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Loader2,
  Check,
  MessageSquare,
  Award,
} from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";
import confetti from "canvas-confetti";

export default function LessonPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const router = useRouter();
  const { success, error } = useToast();

  const [course, setCourse] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const [coursesRes, profileRes] = await Promise.all([
        fetch("/api/teacher/courses"),
        fetch("/api/student/profile"),
      ]);

      if (coursesRes.ok) {
        const data = await coursesRes.json();
        const found = data.courses?.find((c: any) => c.id === courseId);
        if (found) {
          setCourse(found);
          const firstLesson = found.modules?.[0]?.lessons?.[0];
          if (firstLesson) setActiveLesson(firstLesson);
        }
      }

      if (profileRes.ok) {
        const pData = await profileRes.json();
        const enrollment = pData.user?.enrollments?.find((e: any) => e.courseId === courseId);
        if (enrollment) {
          setProgressPercentage(enrollment.progressPercentage);
        }
      }
    } catch {
      error("Fetch Error", "Failed to load course lessons.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    setCompleting(true);
    try {
      const res = await fetch("/api/student/lessons/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: activeLesson.id, courseId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCompletedLessonIds((prev) => [...prev, activeLesson.id]);
        setProgressPercentage(data.progressPercentage);
        success("🌟 Lesson Complete!", "Your progress has been recorded.");

        if (data.isCourseCompleted) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
          success("🏆 Congratulations!", "You completed the entire course track! Certificate generated.");
        }

        // Find next lesson
        findAndSetNextLesson();
      } else {
        error("Error", "Could not mark lesson complete.");
      }
    } catch {
      error("Network Error", "Failed to sync progress.");
    } finally {
      setCompleting(false);
    }
  };

  const findAndSetNextLesson = () => {
    if (!course || !activeLesson) return;
    const allLessons: any[] = [];
    course.modules?.forEach((m: any) => {
      m.lessons?.forEach((l: any) => allLessons.push(l));
    });

    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      setActiveLesson(allLessons[currentIndex + 1]);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
        <span>Loading classroom player...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-24 text-center text-slate-400">
        <p>Course not found.</p>
        <Link href="/student/courses" className="mt-2 inline-block text-xs font-bold text-indigo-600 hover:underline">
          Return to My Courses
        </Link>
      </div>
    );
  }

  const isCompleted = completedLessonIds.includes(activeLesson?.id);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Progress Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/student/courses"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {course.title}
            </h1>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              Coach: {course.teacher?.name} • {course.level}
            </p>
          </div>
        </div>

        {/* Course Progress Meter */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {progressPercentage}% Completed
            </p>
            <p className="text-[10px] text-slate-400">Track Progress</p>
          </div>
          <div className="w-24 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Player Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Lesson Player & Content */}
        <div className="lg:col-span-8 space-y-6">
          {activeLesson && (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
              {/* Media Player Area */}
              <div className="relative w-full aspect-video bg-slate-950 flex items-center justify-center">
                {activeLesson.contentType === "VIDEO" ? (
                  <iframe
                    src={activeLesson.contentUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <FileText className="w-12 h-12 text-indigo-400 mx-auto" />
                    <h3 className="text-base font-bold text-white">{activeLesson.title}</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      Interactive reading material & project worksheet below.
                    </p>
                  </div>
                )}
              </div>

              {/* Lesson Info & Actions */}
              <div className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                      {activeLesson.contentType} Lesson • {activeLesson.durationMinutes} Minutes
                    </span>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                      {activeLesson.title}
                    </h2>
                  </div>

                  <button
                    onClick={handleMarkComplete}
                    disabled={completing}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shrink-0"
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed (Next Lesson)</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Mark as Complete & Next</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Lesson Notes & Explanation */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Lesson Overview & Practice Notes
                  </h4>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {activeLesson.contentText || "Review the video concepts carefully and try out the homework challenges."}
                  </div>
                </div>

                {/* Q&A / Resources Links */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <Link
                    href="/student/discussions"
                    className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ask Coach in Forum</span>
                  </Link>
                  <Link
                    href="/student/assignments"
                    className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-bold hover:underline"
                  >
                    <span>View Homework Assignments</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Syllabus Modules Accordion */}
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Course Syllabus
            </h3>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              {course.modules?.length || 0} Modules
            </span>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {course.modules?.map((mod: any, mIdx: number) => (
              <div key={mod.id} className="space-y-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white px-2">
                  {mod.title}
                </p>

                <div className="space-y-1">
                  {mod.lessons?.map((les: any) => {
                    const isActive = activeLesson?.id === les.id;
                    const isDone = completedLessonIds.includes(les.id);

                    return (
                      <button
                        key={les.id}
                        onClick={() => setActiveLesson(les)}
                        className={`w-full text-left p-3 rounded-2xl flex items-center justify-between gap-3 text-xs transition-all ${
                          isActive
                            ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {isDone ? (
                            <CheckCircle2
                              className={`w-4 h-4 shrink-0 ${
                                isActive ? "text-white" : "text-emerald-500"
                              }`}
                            />
                          ) : (
                            <Circle
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isActive ? "text-white/70" : "text-slate-400"
                              }`}
                            />
                          )}
                          <span className="truncate">{les.title}</span>
                        </div>

                        <span
                          className={`text-[10px] font-mono shrink-0 ${
                            isActive ? "text-white/80" : "text-slate-400"
                          }`}
                        >
                          {les.durationMinutes}m
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
