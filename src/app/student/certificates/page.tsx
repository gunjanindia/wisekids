"use client";

import React, { useState, useEffect } from "react";
import { Award, Download, ShieldCheck, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";
import { jsPDF } from "jspdf";

export default function StudentCertificatesPage() {
  const { success, error } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setCertificates(data.user?.certificates || []);
      }
    } catch {
      error("Error", "Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (cert: any) => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Background border
      doc.setDrawColor(79, 70, 229);
      doc.setLineWidth(4);
      doc.rect(10, 10, 277, 190);

      doc.setDrawColor(217, 70, 239);
      doc.setLineWidth(1);
      doc.rect(14, 14, 269, 182);

      // Academy Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.setTextColor(79, 70, 229);
      doc.text("WISEKIDS LEARNING ACADEMY", 148, 40, { align: "center" });

      doc.setFontSize(14);
      doc.setTextColor(100, 116, 139);
      doc.text("CERTIFICATE OF CURRICULUM MASTERY", 148, 52, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      doc.text("This prestigious credential is proudly presented to", 148, 72, { align: "center" });

      // Student Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(15, 23, 42);
      doc.text(profile?.name || "Leo Alexander", 148, 90, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(51, 65, 85);
      doc.text(
        `for successfully completing all modules, practical projects, and assessments in:`,
        148,
        105,
        { align: "center" }
      );

      // Course Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(79, 70, 229);
      doc.text(cert.course?.title || "Junior Math Olympiad Masters", 148, 120, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Certificate ID: ${cert.certificateNumber}  •  Verification Code: ${cert.verificationCode}`,
        148,
        145,
        { align: "center" }
      );

      // Signatures
      doc.setDrawColor(148, 163, 184);
      doc.line(40, 175, 100, 175);
      doc.line(197, 175, 257, 175);

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("Dr. Eleanor Vance", 70, 180, { align: "center" });
      doc.text("Lead Master Coach", 227, 180, { align: "center" });

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Academic Dean of Curriculum", 70, 185, { align: "center" });
      doc.text("WiseKids STEM Faculty", 227, 185, { align: "center" });

      doc.save(`WiseKids-Certificate-${cert.certificateNumber}.pdf`);
      success("Certificate Downloaded!", "PDF successfully created.");
    } catch {
      error("PDF Error", "Unable to download certificate.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Graduation Certificates & Accreditations
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Verifiable credentials earned upon achieving 100% completion on course tracks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
            <span>Loading credentials...</span>
          </div>
        ) : certificates.length === 0 ? (
          <div className="col-span-full p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <Award className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Certificates Earned Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Complete 100% of lessons in any enrolled course track to automatically unlock your verified certificate.
            </p>
          </div>
        ) : (
          certificates.map((cert) => (
            <div
              key={cert.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-900/60 shadow-lg space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                  <Award className="w-6 h-6" />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {cert.course?.title || "STEM Curriculum Track"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Awarded to {profile?.name} on {new Date(cert.issuedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 font-mono text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <p>Certificate: <span className="font-bold text-indigo-600">{cert.certificateNumber}</span></p>
                <p>Verification: {cert.verificationCode}</p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleDownloadPDF(cert)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Certificate</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
