"use client";

import React, { useState } from "react";
import { MessageSquare, Send, User, Sparkles } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";

export default function TeacherDiscussionsPage() {
  const { success } = useToast();
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "Leo Alexander (Student)",
      course: "Junior Math Olympiad Masters",
      subject: "Question regarding problem #4 on Logic Grids",
      text: "Hello Coach! In puzzle 4, can we assume all clues are distinct or can two people have the same pet?",
      time: "Today, 10:14 AM",
      reply: "Great question Leo! All items in standard logic grids are unique 1-to-1 pairings.",
    },
    {
      id: "2",
      sender: "Maya Patel (Student)",
      course: "Coding Adventures with Python",
      subject: "Sprite collision error in pygame loop",
      text: "Coach Elena, when my spaceship touches the asteroid sprite, the loop crashes with IndexError. Any hints?",
      time: "Yesterday, 4:30 PM",
      reply: "Make sure you check sprite boundaries before removing from the list!",
    },
  ]);

  const [replyText, setReplyText] = useState("");
  const [activeMessageId, setActiveMessageId] = useState("1");

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === activeMessageId ? { ...m, reply: replyText } : m))
    );
    success("Reply Sent", "Student has been answered in discussion thread.");
    setReplyText("");
  };

  const selectedMsg = messages.find((m) => m.id === activeMessageId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Course Q&A & Student Messaging
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Answer student questions, clarify assignment instructions, and nurture curiosity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Messages List */}
        <div className="md:col-span-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 py-1">
            Active Question Threads
          </h3>
          {messages.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMessageId(m.id)}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                activeMessageId === m.id
                  ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800"
                  : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white">{m.sender}</span>
                <span className="text-[10px] text-slate-400">{m.time}</span>
              </div>
              <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                {m.subject}
              </p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{m.text}</p>
            </button>
          ))}
        </div>

        {/* Message Thread View */}
        <div className="md:col-span-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-4">
          {selectedMsg ? (
            <>
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                  {selectedMsg.course}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedMsg.subject}</h3>
                <p className="text-xs text-slate-500">From {selectedMsg.sender} • {selectedMsg.time}</p>
              </div>

              {/* Student message box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1 text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">Student Question:</p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedMsg.text}</p>
              </div>

              {/* Instructor reply box */}
              {selectedMsg.reply && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 space-y-1 text-xs">
                  <p className="font-bold text-indigo-950 dark:text-indigo-200">Your Answer:</p>
                  <p className="text-indigo-900 dark:text-indigo-300 leading-relaxed">{selectedMsg.reply}</p>
                </div>
              )}

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="space-y-3 pt-2">
                <textarea
                  rows={3}
                  required
                  placeholder="Write an encouraging, clear explanation..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Answer to Student</span>
                </button>
              </form>
            </>
          ) : (
            <p className="text-center py-16 text-slate-400 text-xs">Select a message thread</p>
          )}
        </div>
      </div>
    </div>
  );
}
