"use client";

import React, { useState } from "react";
import { MessageSquare, Send, Sparkles, User, HelpCircle } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";

export default function StudentDiscussionsPage() {
  const { success } = useToast();
  const [threads, setThreads] = useState([
    {
      id: "1",
      course: "Junior Math Olympiad Masters",
      coach: "Prof. Sarah Jenkins",
      question: "In puzzle #4 on Logic Grids, can we assume all clues are distinct?",
      answer: "Great question! All items in standard logic grids are unique 1-to-1 pairings.",
      time: "Today, 10:14 AM",
    },
    {
      id: "2",
      course: "Coding Adventures with Python",
      coach: "Elena Gomez",
      question: "How do we make the spaceship laser shoot automatically on keypress?",
      answer: "Use pygame.KEYDOWN event handler to trigger a new laser instance!",
      time: "Yesterday, 3:20 PM",
    },
  ]);

  const [questionText, setQuestionText] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("Junior Math Olympiad Masters");

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    setThreads((prev) => [
      {
        id: Math.random().toString(),
        course: selectedCourse,
        coach: "Assigned Faculty Coach",
        question: questionText,
        answer: "Your instructor has received this question and will post an answer shortly.",
        time: "Just now",
      },
      ...prev,
    ]);

    success("Question Sent!", "Your teacher has been notified in the course forum.");
    setQuestionText("");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Course Discussions & Faculty Q&A
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ask questions about concepts, get unblocked on projects, and discuss challenges with your mentors.
        </p>
      </div>

      {/* Ask Question Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          <span>Ask Your Mentor a Question</span>
        </h3>

        <form onSubmit={handlePostQuestion} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Course Track
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
            >
              <option>Junior Math Olympiad Masters</option>
              <option>Young Explorers: Hands-on Science & Physics</option>
              <option>Coding Adventures with Python & Pygame</option>
              <option>Digital Art & 2D Character Animation</option>
              <option>Junior Public Speaking & Parliamentary Debate</option>
              <option>Robotics & Smart IoT Inventions</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Your Question or Blockers
            </label>
            <textarea
              required
              rows={3}
              placeholder="Explain where you got stuck or what puzzle you'd like a hint on..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Question</span>
            </button>
          </div>
        </form>
      </div>

      {/* Discussion Threads */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Recent Q&A Threads ({threads.length})
        </h3>

        {threads.map((t) => (
          <div
            key={t.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                {t.course}
              </span>
              <span className="text-[10px] text-slate-400">{t.time}</span>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Q: {t.question}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs space-y-1">
              <p className="font-bold text-indigo-950 dark:text-indigo-200">
                Coach {t.coach} Answer:
              </p>
              <p className="text-indigo-900 dark:text-indigo-300 leading-relaxed">{t.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
