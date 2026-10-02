"use client";

import React, { useState, useEffect } from "react";
import { Mail, Trash2, CheckCircle2, Loader2, Download, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";

export default function AdminInboxPage() {
  const { success, error } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"inquiries" | "subscribers">("inquiries");

  useEffect(() => {
    fetchInbox();
  }, []);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inbox");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setSubscribers(data.subscribers || []);
      }
    } catch {
      error("Error", "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/inbox", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        success("Updated", `Message marked as ${status}`);
        fetchInbox();
      }
    } catch {
      error("Error", "Failed to update status");
    }
  };

  const handleDelete = async (id: string, type: "message" | "subscriber") => {
    if (!confirm("Are you sure you want to remove this item?")) return;
    try {
      const res = await fetch(`/api/admin/inbox?id=${id}&type=${type}`, { method: "DELETE" });
      if (res.ok) {
        success("Deleted");
        fetchInbox();
      }
    } catch {
      error("Error", "Failed to delete item");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Admissions Inbox & Leads
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review parent inquiries, school group partnership requests, and newsletter subscribers.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "inquiries"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Contact Inquiries ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab("subscribers")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "subscribers"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Newsletter List ({subscribers.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
          <span>Loading inbox...</span>
        </div>
      ) : activeTab === "inquiries" ? (
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="py-16 text-center text-slate-400">No contact messages in inbox.</div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{m.name}</p>
                      <a href={`mailto:${m.email}`} className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline">
                        {m.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        m.status === "UNREAD"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                          : m.status === "READ"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}
                    >
                      {m.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    Subject: {m.subject}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
                    {m.message}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {m.status !== "READ" && (
                      <button
                        onClick={() => handleToggleStatus(m.id, "READ")}
                        className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                      >
                        Mark Read
                      </button>
                    )}
                    {m.status !== "REPLIED" && (
                      <button
                        onClick={() => handleToggleStatus(m.id, "REPLIED")}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                      >
                        Mark Replied
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(m.id, "message")}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Newsletter Subscribers</h3>
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(
                "Email,SubscribedDate\n" +
                  subscribers.map((s) => `"${s.email}","${s.createdAt}"`).join("\n")
              )}`}
              download="wisekids-newsletter-subscribers.csv"
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Subscriber Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined On</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {s.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(s.id, "subscriber")}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
