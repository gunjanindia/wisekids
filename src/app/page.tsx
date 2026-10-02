import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import {
  Sparkles,
  Rocket,
  Brain,
  Code,
  FlaskConical,
  Calculator,
  Palette,
  ShieldCheck,
  Star,
  Users,
  Award,
  Video,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  Check,
  Play,
  Heart,
  ChevronRight,
  Send,
} from "lucide-react";
import { ContactForm } from "@/components/home/contact-form";

export const revalidate = 60; // Cache for 60s

export default async function HomePage() {
  // Fetch courses, categories, teachers, testimonials for the landing page
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    include: {
      category: true,
      teacher: { include: { profile: true } },
      modules: { include: { lessons: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { featured: "desc" },
    take: 6,
  });

  const categories = await prisma.category.findMany();
  const batches = await prisma.batch.findMany({
    include: { course: true, teacher: true },
    take: 4,
  });
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER", status: "ACTIVE" },
    include: { profile: true, taughtCourses: true },
    take: 3,
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-radial from-indigo-100/70 via-slate-50 to-purple-50/50 dark:from-indigo-950/40 dark:via-slate-950 dark:to-purple-950/20">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide animate-float">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>2026 Spring Cohorts Now Enrolling • Ages 6-16</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Where Curious Minds Become{" "}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Future Innovators
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Join the premier online academy for kids. Master Olympiad mathematics, physical science experiments, Python game coding, robotics, and parliamentary debate with certified mentors in small, interactive batches.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/login"
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Rocket className="w-5 h-5" />
                  <span>Launch Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="#courses"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm sm:text-base hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                  <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Browse Courses</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 dark:border-slate-800/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">15,000+</p>
                  <p className="text-xs text-slate-500 font-medium">Young Learners</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">4.9 / 5.0</p>
                  <p className="text-xs text-slate-500 font-medium">Parent Rating ⭐</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">100%</p>
                  <p className="text-xs text-slate-500 font-medium">Live & Certified Mentors</p>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic: Interactive Live Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                {/* Main Hero Card */}
                <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6 relative overflow-hidden">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                        <Code className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Live Python Sandbox</h4>
                        <p className="text-[10px] text-slate-500">Lesson 4: Game Loops & Sprites</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Live
                    </span>
                  </div>

                  {/* Code / Visual preview */}
                  <div className="mt-4 p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs space-y-1.5 shadow-inner">
                    <p className="text-slate-500 text-[10px]"># WiseKids Space Game Engine</p>
                    <p><span className="text-purple-400">def</span> <span className="text-blue-400">launch_rocket</span>(speed, angle):</p>
                    <p className="pl-4 text-emerald-400">player.velocity = speed * 1.5</p>
                    <p className="pl-4 text-emerald-400">stars.animate(glow=True)</p>
                    <p className="pl-4"><span className="text-purple-400">return</span> <span className="text-amber-300">&quot;Mission Complete! 🌟&quot;</span></p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Cohort Challenge Progress</span>
                      <span className="text-indigo-600 dark:text-indigo-400">84%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 w-[84%]" />
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80" alt="Student" className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 object-cover" />
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80" alt="Student" className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 object-cover" />
                      <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&auto=format&fit=crop&q=80" alt="Student" className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 object-cover" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">18 students coding live</span>
                  </div>
                </div>

                {/* Floating Badge: Math Award */}
                <div className="absolute -top-6 -right-6 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-2.5 animate-float-delayed">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                    🏆
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Olympiad Gold</p>
                    <p className="text-[10px] text-slate-500">Top 1% Global Rank</p>
                  </div>
                </div>

                {/* Floating Badge: Safe Verified */}
                <div className="absolute -bottom-6 -left-6 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-2.5 animate-float">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">100% Kid Safe</p>
                    <p className="text-[10px] text-slate-500">COPPA & FERPA Verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Tracks & Category Filters */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-6">
            Explore Curated STEM & Arts Disciplines
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all hover:shadow-md cursor-pointer group text-center"
              >
                <div
                  className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs"
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color || "#6366F1" }}
                >
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Showcase */}
      <section id="courses" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
              Interactive Curriculum
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Featured Flagship Programs
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Every course blends live interactive mentor sessions with hands-on projects, automated quizzes, and verifiable graduation certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => {
              const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

              return (
                <div
                  key={course.id}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col group"
                >
                  {/* Thumbnail & Level */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={course.thumbnail || "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80"}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-slate-900/80 text-white backdrop-blur-md">
                        {course.level}
                      </span>
                      {course.isFree && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500 text-white shadow-md">
                          Free
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-slate-900/80 text-white text-[11px] font-bold backdrop-blur-md">
                      {course.ageGroup}
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                        <span>{course.category?.name || "Curriculum Track"}</span>
                        <span>{course.durationWeeks} Weeks</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {course.shortDesc || course.description}
                      </p>
                    </div>

                    {/* Meta stats */}
                    <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-slate-400" />
                        <span>{totalLessons} Interactive Lessons</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{course._count.enrollments} Enrolled</span>
                      </div>
                    </div>

                    {/* Teacher & Enroll CTA */}
                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-indigo-100">
                          <img
                            src={course.teacher.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"}
                            alt={course.teacher.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {course.teacher.name.split(" ")[0]}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          {course.isFree ? "Free" : `$${course.price.toFixed(0)}`}
                        </span>
                        <Link
                          href="/login"
                          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
                        >
                          <span>Enroll</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why WiseKids Matrix */}
      <section id="why-us" className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/80 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
              The WiseKids Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Designed for Curiosity, Built for Mastery
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              We replace passive video watching with active problem-solving, live code execution, and supportive mentorship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Discovery Learning</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Kids deduce principles through simulations, hands-on physics puzzles, and interactive code sandboxes before formulas are introduced.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Micro-Cohorts (Max 15)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Small interactive batches ensure every child asks questions, leads group discussions, and receives personalized feedback.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Gamified XP & Certificates</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Unlock achievements, maintain study streaks, earn verifiable completion certificates, and download academic report cards.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">COPPA Child-Safe Platform</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Strict role-based moderation, audited interactions, zero third-party ads, and dedicated parent communication channels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Batches Schedule */}
      <section id="batches" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                Live Class Schedule
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Upcoming Cohort Openings
              </h2>
            </div>
            <Link
              href="/login"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All Batches in Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {batch.code}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Seats Available ({batch.maxStudents} max)
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{batch.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{batch.scheduleText}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-indigo-600 dark:hover:bg-indigo-400 transition-all shrink-0"
                >
                  Join Cohort
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Star Instructors */}
      <section id="instructors" className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
              World-Class Faculty
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Mentors Who Inspire Greatness
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Our educators hold top degrees in applied mathematics, computer science, and engineering from MIT, RISD, and Carnegie Mellon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md text-center space-y-4"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto ring-4 ring-indigo-500/20 shadow-md">
                  <img
                    src={teacher.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
                    alt={teacher.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{teacher.name}</h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{teacher.profile?.qualifications}</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {teacher.profile?.bio}
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {teacher.profile?.subjectsTaught}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/80 px-3 py-1 rounded-full border border-pink-200 dark:border-pink-800">
              Community Love
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Loved by 15,000+ Parents & Kids
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex text-amber-400 gap-1 text-sm">⭐⭐⭐⭐⭐</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                &quot;My 9-year old daughter went from being intimidated by math to solving Math Olympiad logic puzzles with genuine enthusiasm. Sarah Jenkins is an extraordinary coach!&quot;
              </p>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 font-bold text-xs flex items-center justify-center text-indigo-700">
                  KW
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Karen White</p>
                  <p className="text-[10px] text-slate-500">Parent of 4th Grader, Boston</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex text-amber-400 gap-1 text-sm">⭐⭐⭐⭐⭐</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                &quot;The interactive Python games curriculum is top notch. He coded his own Space Arcade game and proudly demonstrated it to his school teachers. Highly recommended!&quot;
              </p>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 font-bold text-xs flex items-center justify-center text-purple-700">
                  MR
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Marcus Rivera</p>
                  <p className="text-[10px] text-slate-500">Parent of 6th Grader, Seattle</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex text-amber-400 gap-1 text-sm">⭐⭐⭐⭐⭐</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                &quot;The learning portal makes it super easy to track homework deadlines, quiz attempts, and download term report cards. Very clean and safe for kids.&quot;
              </p>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-100 font-bold text-xs flex items-center justify-center text-pink-700">
                  SL
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Dr. Sandra Lee</p>
                  <p className="text-[10px] text-slate-500">Parent of 5th Grader, San Francisco</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Contact & Inquiry Section */}
      <section id="contact" className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Info */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                Get In Touch
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Have Questions About Admissions or Cohorts?
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Our academic counselors are available to guide you on track selection, live class timings, hardware requirements, and scholarship opportunities.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                    📍
                  </div>
                  <span>100 Academic Way, Cambridge, MA 02138</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                    ✉️
                  </div>
                  <span>admissions@wisekids.org / support@wisekids.org</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                    📞
                  </div>
                  <span>+1 (800) 555-WISE (Mon - Fri, 9am - 6pm EST)</span>
                </div>
              </div>
            </div>

            {/* Right Contact Form Client Component */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
