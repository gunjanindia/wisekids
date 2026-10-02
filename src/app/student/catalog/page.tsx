"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Search,
  BookOpen,
  Users,
  Video,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";

export default function StudentCatalogPage() {
  const { success, error } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      // Fetch public courses & student enrollments
      const [coursesRes, profileRes] = await Promise.all([
        fetch("/api/teacher/courses"), // provides courses list
        fetch("/api/student/profile"),
      ]);

      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        setCourses(cData.courses || []);
        setCategories(cData.categories || []);
      }

      if (profileRes.ok) {
        const pData = await profileRes.json();
        const ids = pData.user?.enrollments?.map((e: any) => e.courseId) || [];
        setEnrolledCourseIds(ids);
      }
    } catch {
      error("Error", "Failed to load catalog");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string, courseTitle: string) => {
    setEnrollingId(courseId);
    try {
      const res = await fetch("/api/student/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      if (res.ok) {
        success("🎉 Enrolled Successfully!", `You are now enrolled in ${courseTitle}.`);
        setEnrolledCourseIds((prev) => [...prev, courseId]);
      } else {
        error("Enrollment Issue", data.error || "Unable to enroll.");
      }
    } catch {
      error("Network Error", "Failed to enroll in course.");
    } finally {
      setEnrollingId(null);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesCat = selectedCategory === "ALL" || c.categoryId === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Curriculum Catalog & Course Finder
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Discover new STEM & Arts tracks. 1-click enroll to start learning immediately.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Math Olympiad, Python Game Dev, Science..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === "ALL"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            All Disciplines
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
            <span>Loading course tracks...</span>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No courses found matching &quot;{search}&quot;.
          </div>
        ) : (
          filteredCourses.map((c) => {
            const isEnrolled = enrolledCourseIds.includes(c.id);
            const totalLessons = c.modules?.reduce(
              (acc: number, m: any) => acc + (m.lessons?.length || 0),
              0
            );

            return (
              <div
                key={c.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all group"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={c.thumbnail || "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80"}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-md">
                        {c.level}
                      </span>
                      {c.isFree && (
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500 text-white">
                          Free
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                      <span>{c.category?.name || "STEM Track"}</span>
                      <span>{c.durationWeeks} Weeks</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {c.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800">
                      <span>Teacher: {c.teacher?.name}</span>
                      <span>{totalLessons} Lessons</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {c.isFree ? "Free" : `$${c.price}`}
                  </span>

                  {isEnrolled ? (
                    <a
                      href={`/student/courses/${c.id}/learn`}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Already Enrolled</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => handleEnroll(c.id, c.title)}
                      disabled={enrollingId === c.id}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {enrollingId === c.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Enrolling...</span>
                        </>
                      ) : (
                        <>
                          <span>Enroll Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
