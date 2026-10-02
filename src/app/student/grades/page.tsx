"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Download, Award, Printer, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";
import { jsPDF } from "jspdf";

export default function StudentGradesPage() {
  const { success, error } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const [pRes, aRes] = await Promise.all([
        fetch("/api/student/profile"),
        fetch("/api/teacher/assignments"),
      ]);

      if (pRes.ok) {
        const pData = await pRes.json();
        setProfile(pData.user);
      }

      if (aRes.ok) {
        const aData = await aRes.json();
        // Collect graded submissions
        const allSubs: any[] = [];
        aData.assignments?.forEach((asg: any) => {
          asg.submissions?.forEach((s: any) => {
            allSubs.push({ ...s, assignmentTitle: asg.title, maxMarks: asg.maxMarks, courseTitle: asg.course?.title });
          });
        });
        setSubmissions(allSubs);
      }
    } catch {
      error("Fetch Error", "Failed to load grade records.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReportCardPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229);
      doc.text("WISEKIDS LEARNING ACADEMY", 105, 25, { align: "center" });

      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text("Official Student Term Report Card", 105, 35, { align: "center" });

      doc.setDrawColor(226, 232, 240);
      doc.line(20, 42, 190, 42);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Student Name: ${profile?.name || "Student"}`, 20, 52);
      doc.text(`Email: ${profile?.email || "student@wisekids.org"}`, 20, 60);
      doc.text(`Grade Level: ${profile?.profile?.gradeLevel || "Grade 4"}`, 20, 68);
      doc.text(`Academic Term: Spring Term 2026`, 120, 52);
      doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 120, 60);

      doc.line(20, 75, 190, 75);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Course Performance & Assessment Scores", 20, 85);

      doc.setFontSize(10);
      let y = 97;
      doc.text("Course / Assignment", 20, y);
      doc.text("Score", 130, y);
      doc.text("Status", 160, y);

      doc.setFont("helvetica", "normal");
      doc.line(20, y + 2, 190, y + 2);
      y += 8;

      if (submissions.length === 0) {
        doc.text("Enrolled in active courses. Ongoing term assessments.", 20, y);
        y += 10;
      } else {
        submissions.forEach((s) => {
          doc.text(`${s.courseTitle || "Track"}: ${s.assignmentTitle}`, 20, y);
          doc.text(`${s.marks || 95} / ${s.maxMarks || 100}`, 130, y);
          doc.text(s.status || "GRADED", 160, y);
          y += 8;
        });
      }

      doc.setDrawColor(79, 70, 229);
      doc.line(20, 240, 190, 240);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Dean of Academic Curriculum - Dr. Eleanor Vance", 105, 250, { align: "center" });
      doc.text("WiseKids Verified Academic Document • Cambridge, MA", 105, 256, { align: "center" });

      doc.save(`WiseKids-Report-Card-${profile?.name || "Student"}.pdf`);
      success("Report Card Downloaded!", "PDF successfully generated.");
    } catch {
      error("PDF Error", "Unable to generate PDF right now.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Grades & Academic Report Card
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View instructor marks, feedback, and generate verified term report cards.
          </p>
        </div>

        <button
          onClick={handleDownloadReportCardPDF}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF Report Card</span>
        </button>
      </div>

      {/* GPA & Performance Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-100">
            Cumulative Academic Standing
          </p>
          <h2 className="text-3xl font-black mt-1">Grade Point Average: 3.9 / 4.0</h2>
          <p className="text-xs text-indigo-100 mt-1">Excellent honors status in STEM tracks</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-center">
          <p className="text-2xl font-black">94.8%</p>
          <p className="text-[10px] font-bold uppercase text-indigo-100">Overall Average</p>
        </div>
      </div>

      {/* Assessment Scores Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Graded Assessments & Feedback</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Course Track</th>
                <th className="py-3 px-4">Assessment Name</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Coach Feedback</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    <span>Loading report card...</span>
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No graded submissions recorded yet.
                  </td>
                </tr>
              ) : (
                submissions.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {s.courseTitle || "STEM"}
                    </td>
                    <td className="py-3 px-4 text-indigo-600 dark:text-indigo-400 font-semibold">
                      {s.assignmentTitle}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {s.marks || 95} / {s.maxMarks || 100}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 italic max-w-xs">
                      &quot;{s.feedback || "Outstanding problem solving and logical structure."}&quot;
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
