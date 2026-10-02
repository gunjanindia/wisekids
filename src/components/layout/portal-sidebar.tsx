"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  UserCheck,
  CreditCard,
  FileText,
  Megaphone,
  BarChart3,
  Settings,
  Mail,
  ShieldAlert,
  GraduationCap,
  ClipboardList,
  CheckSquare,
  Video,
  Award,
  MessageSquare,
  FolderLock,
  UserCircle,
  HelpCircle,
  LogOut,
  X,
  ExternalLink,
} from "lucide-react";

interface SidebarProps {
  role: "ADMIN" | "TEACHER" | "STUDENT";
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function PortalSidebar({ role, user, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();

  const adminNav = [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "User Management", href: "/admin/users", icon: Users },
    { title: "Courses & Curricula", href: "/admin/courses", icon: BookOpen },
    { title: "Batches & Classes", href: "/admin/batches", icon: CalendarDays },
    { title: "Enrollments", href: "/admin/enrollments", icon: UserCheck },
    { title: "Payments & Fees", href: "/admin/payments", icon: CreditCard },
    { title: "Website CMS", href: "/admin/cms", icon: FileText },
    { title: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { title: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
    { title: "Inbox & Leads", href: "/admin/inbox", icon: Mail },
    { title: "Security Audit Log", href: "/admin/audit", icon: ShieldAlert },
    { title: "Portal Settings", href: "/admin/settings", icon: Settings },
  ];

  const teacherNav = [
    { title: "Dashboard", href: "/teacher", icon: LayoutDashboard },
    { title: "Course Builder", href: "/teacher/courses", icon: BookOpen },
    { title: "Assignments", href: "/teacher/assignments", icon: ClipboardList },
    { title: "Quizzes & Tests", href: "/teacher/quizzes", icon: CheckSquare },
    { title: "Attendance", href: "/teacher/attendance", icon: UserCheck },
    { title: "Live Classes", href: "/teacher/live-classes", icon: Video },
    { title: "Student Roster", href: "/teacher/students", icon: Users },
    { title: "Gradebook", href: "/teacher/gradebook", icon: BarChart3 },
    { title: "Q&A Forum", href: "/teacher/discussions", icon: MessageSquare },
    { title: "Resource Library", href: "/teacher/resources", icon: FolderLock },
    { title: "Teacher Profile", href: "/teacher/profile", icon: UserCircle },
  ];

  const studentNav = [
    { title: "My Dashboard", href: "/student", icon: LayoutDashboard },
    { title: "Course Catalog", href: "/student/catalog", icon: Sparkles },
    { title: "My Courses & Player", href: "/student/courses", icon: BookOpen },
    { title: "Assignments", href: "/student/assignments", icon: ClipboardList },
    { title: "Quizzes & Tests", href: "/student/quizzes", icon: CheckSquare },
    { title: "Timetable & Schedule", href: "/student/timetable", icon: CalendarDays },
    { title: "My Attendance", href: "/student/attendance", icon: UserCheck },
    { title: "Grades & Report Card", href: "/student/grades", icon: BarChart3 },
    { title: "Certificates", href: "/student/certificates", icon: Award },
    { title: "Discussions & Q&A", href: "/student/discussions", icon: MessageSquare },
    { title: "My Profile", href: "/student/profile", icon: UserCircle },
  ];

  const navItems = role === "ADMIN" ? adminNav : role === "TEACHER" ? teacherNav : studentNav;

  const roleColor =
    role === "ADMIN"
      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900"
      : role === "TEACHER"
      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900"
      : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900";

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-md text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                WiseKids
              </span>
              <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {role}
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 mx-3 my-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-indigo-100 dark:bg-slate-700 font-bold text-sm text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
            {user.image ? (
              <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
            ) : (
              <span>{user.name?.[0]?.toUpperCase() || "U"}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
            <span
              className={cn(
                "inline-block text-[10px] font-bold px-1.5 py-0.2 rounded border",
                roleColor
              )}
            >
              {role}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== `/${role.toLowerCase()}` && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all",
                  isActive
                    ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-500/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-500 dark:text-slate-400")} />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-slate-400" />
            <span>Public Website</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 w-full px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
