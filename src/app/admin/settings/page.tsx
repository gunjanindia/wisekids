"use client";

import React, { useState } from "react";
import { Settings, Save, ShieldCheck, Mail, Globe, Palette } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";

export default function AdminSettingsPage() {
  const { success } = useToast();
  const [siteName, setSiteName] = useState("WiseKids Learning Academy");
  const [academicTerm, setAcademicTerm] = useState("Spring Term 2026");
  const [supportEmail, setSupportEmail] = useState("support@wisekids.org");
  const [allowTeacherSignup, setAllowTeacherSignup] = useState(true);
  const [requireAdminApproval, setRequireAdminApproval] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      success("Settings Saved", "System configuration updated.");
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          System & Academy Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure academic years, registration rules, email preferences, and security policies.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">General Portal Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Academy Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Current Academic Term
              </label>
              <input
                type="text"
                value={academicTerm}
                onChange={(e) => setAcademicTerm(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Admissions & Support Email
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Security & Access Policies */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security & RBAC Enforcement</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Allow Public Teacher Applications</p>
                <p className="text-[11px] text-slate-500">Enable prospective instructors to apply via registration page.</p>
              </div>
              <input
                type="checkbox"
                checked={allowTeacherSignup}
                onChange={(e) => setAllowTeacherSignup(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Require Admin Approval for Instructors</p>
                <p className="text-[11px] text-slate-500">Hold new teacher accounts in PENDING_APPROVAL until verified.</p>
              </div>
              <input
                type="checkbox"
                checked={requireAdminApproval}
                onChange={(e) => setRequireAdminApproval(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save System Settings"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
