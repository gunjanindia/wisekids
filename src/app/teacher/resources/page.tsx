"use client";

import React, { useState } from "react";
import { FolderLock, Plus, Download, FileText, Trash2, X } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";

export default function TeacherResourcesPage() {
  const { success } = useToast();
  const [resources, setResources] = useState([
    {
      id: "1",
      title: "Olympiad Fast Divisibility Reference Sheet.pdf",
      track: "Math & Logic",
      size: "1.4 MB",
      date: "Oct 2026",
    },
    {
      id: "2",
      title: "Pygame Zero Starter Arcade Game Template.zip",
      track: "Coding & Tech",
      size: "4.8 MB",
      date: "Oct 2026",
    },
    {
      id: "3",
      title: "Kitchen Physics Safety Guidelines & Lab Protocols.pdf",
      track: "Science & Robotics",
      size: "820 KB",
      date: "Oct 2026",
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [track, setTrack] = useState("Mathematics");

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setResources((prev) => [
      {
        id: Math.random().toString(),
        title,
        track,
        size: "2.1 MB",
        date: "Just now",
      },
      ...prev,
    ]);
    success("File Shared", "Resource uploaded to student library.");
    setModalOpen(false);
    setTitle("");
  };

  const handleDelete = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    success("Resource Removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Curriculum Resource Library
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload study guides, PDF blueprints, slides, and practice starter code for your cohorts.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Study Material</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resources.map((res) => (
          <div
            key={res.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                  {res.track}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mt-0.5">
                  {res.title}
                </h3>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>{res.size} • {res.date}</span>
              <button
                onClick={() => handleDelete(res.id)}
                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Upload Resource Material</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title & File Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robotics Circuit Diagram Blueprint.pdf"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Track Domain
                </label>
                <input
                  type="text"
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-1">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Drag & Drop files here or click to browse
                </p>
                <p className="text-[10px] text-slate-400">PDF, ZIP, PPTX, MP4 up to 50MB</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700"
                >
                  Upload & Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
