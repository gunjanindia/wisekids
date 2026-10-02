"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Video,
  FileText,
  CheckCircle2,
  Loader2,
  X,
  Layers,
} from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";

export default function TeacherCoursesPage() {
  const { success, error } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [builderModalOpen, setBuilderModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("99");
  const [isFree, setIsFree] = useState(false);
  const [level, setLevel] = useState("Beginner");
  const [ageGroup, setAgeGroup] = useState("8-12 Years");
  const [durationWeeks, setDurationWeeks] = useState("8");
  const [thumbnail, setThumbnail] = useState("");

  // Dynamic modules & lessons builder
  const [modules, setModules] = useState<
    Array<{
      title: string;
      description: string;
      lessons: Array<{
        title: string;
        contentType: string;
        contentUrl: string;
        contentText: string;
        durationMinutes: number;
        isFreePreview: boolean;
      }>;
    }>
  >([
    {
      title: "Module 1: Foundations & Concepts",
      description: "Introductory principles and hands-on examples.",
      lessons: [
        {
          title: "Introduction & Setup",
          contentType: "VIDEO",
          contentUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          contentText: "Welcome to the course! Get ready to explore exciting challenges.",
          durationMinutes: 15,
          isFreePreview: true,
        },
      ],
    },
  ]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
        setCategories(data.categories || []);
        if (data.categories?.length > 0) setCategoryId(data.categories[0].id);
      }
    } catch {
      error("Fetch Error", "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = () => {
    setModules((prev) => [
      ...prev,
      {
        title: `Module ${prev.length + 1}: Next Stage`,
        description: "",
        lessons: [
          {
            title: "Lesson 1: Deep Dive",
            contentType: "VIDEO",
            contentUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            contentText: "Lesson breakdown and exercises.",
            durationMinutes: 20,
            isFreePreview: false,
          },
        ],
      },
    ]);
  };

  const handleAddLesson = (moduleIndex: number) => {
    setModules((prev) => {
      const updated = [...prev];
      updated[moduleIndex].lessons.push({
        title: `Lesson ${updated[moduleIndex].lessons.length + 1}`,
        contentType: "VIDEO",
        contentUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        contentText: "Practice worksheet and notes.",
        durationMinutes: 15,
        isFreePreview: false,
      });
      return updated;
    });
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/teacher/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          categoryId,
          price: isFree ? 0 : parseFloat(price),
          isFree,
          level,
          ageGroup,
          durationWeeks: parseInt(durationWeeks),
          thumbnail:
            thumbnail ||
            "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80",
          modules,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        success("Course Created!", `${title} has been added to the curriculum.`);
        setBuilderModalOpen(false);
        setTitle("");
        setDescription("");
        fetchCourses();
      } else {
        error("Error", data.error || "Failed to create course.");
      }
    } catch {
      error("Network Error", "Unable to create course.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Curriculum Builder & Course Studio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Design structured courses with video lessons, PDF materials, interactive slides, and projects.
          </p>
        </div>

        <button
          onClick={() => setBuilderModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Course Studio</span>
        </button>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
            <span>Loading studio...</span>
          </div>
        ) : courses.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No courses created yet. Click &quot;New Course Studio&quot; to build your first curriculum!
          </div>
        ) : (
          courses.map((c) => {
            const totalLessons = c.modules?.reduce(
              (acc: number, m: any) => acc + (m.lessons?.length || 0),
              0
            );

            return (
              <div
                key={c.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-36 w-full bg-slate-100 dark:bg-slate-800">
                    <img
                      src={c.thumbnail || "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80"}
                      alt={c.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                        {c.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                      {c.category?.name || "STEM"}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                      <span>{c.modules?.length || 0} Modules</span>
                      <span>{totalLessons} Lessons</span>
                      <span>{c._count.enrollments} Enrolled Students</span>
                      <span>{c.isFree ? "Free" : `$${c.price}`}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {c.level} • {c.ageGroup}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {c.durationWeeks} weeks
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Course Studio Modal */}
      {builderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Interactive Course Studio
                </h3>
                <p className="text-xs text-slate-500">
                  Build multi-module courses with lessons, videos, and worksheets.
                </p>
              </div>
              <button
                onClick={() => setBuilderModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Space Science & Rocket Physics"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category Track
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Course Description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Outline the learning objectives and fun projects students will build..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>All Levels</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Age Group
                  </label>
                  <input
                    type="text"
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Weeks)
                  </label>
                  <input
                    type="number"
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Modules & Lessons Section */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>Curriculum Modules & Lessons</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddModule}
                    className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100"
                  >
                    + Add Module
                  </button>
                </div>

                {modules.map((mod, mIdx) => (
                  <div
                    key={mIdx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        required
                        value={mod.title}
                        onChange={(e) => {
                          const updated = [...modules];
                          updated[mIdx].title = e.target.value;
                          setModules(updated);
                        }}
                        className="flex-1 font-bold text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddLesson(mIdx)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                      >
                        + Add Lesson
                      </button>
                    </div>

                    <div className="space-y-2 pl-2 border-l-2 border-indigo-200 dark:border-indigo-800">
                      {mod.lessons.map((les, lIdx) => (
                        <div
                          key={lIdx}
                          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              required
                              placeholder="Lesson Title"
                              value={les.title}
                              onChange={(e) => {
                                const updated = [...modules];
                                updated[mIdx].lessons[lIdx].title = e.target.value;
                                setModules(updated);
                              }}
                              className="flex-1 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                            />
                            <select
                              value={les.contentType}
                              onChange={(e) => {
                                const updated = [...modules];
                                updated[mIdx].lessons[lIdx].contentType = e.target.value;
                                setModules(updated);
                              }}
                              className="px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                            >
                              <option value="VIDEO">Video</option>
                              <option value="PDF">PDF</option>
                              <option value="TEXT">Interactive Text</option>
                              <option value="SLIDE">Slide</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setBuilderModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Publish Course to Catalog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
