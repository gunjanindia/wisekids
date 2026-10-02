"use client";

import React, { useState } from "react";
import { FileText, Save, CheckCircle2, Sparkles, MessageSquare } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";

export default function AdminCmsPage() {
  const { success } = useToast();
  const [heroHeading, setHeroHeading] = useState(
    "Where Curious Minds Become Future Innovators"
  );
  const [heroSubheading, setHeroSubheading] = useState(
    "Join the premier online academy for kids. Master Olympiad mathematics, physical science experiments, Python game coding, robotics, and parliamentary debate with certified mentors in small, interactive batches."
  );
  const [announcementBanner, setAnnouncementBanner] = useState(
    "2026 Spring Cohorts Now Enrolling • Ages 6-16"
  );
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      success("CMS Updated", "Landing page copy has been updated.");
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Website Content & CMS Editor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize marketing landing page copy, hero banners, and highlight texts dynamically.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hero Section Configuration</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Top Badge Announcement
            </label>
            <input
              type="text"
              value={announcementBanner}
              onChange={(e) => setAnnouncementBanner(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Main Headline (H1)
            </label>
            <input
              type="text"
              value={heroHeading}
              onChange={(e) => setHeroHeading(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Subheadline Description
            </label>
            <textarea
              rows={3}
              value={heroSubheading}
              onChange={(e) => setHeroSubheading(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Publish to Website"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
