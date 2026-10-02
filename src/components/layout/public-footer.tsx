"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, ShieldCheck, Heart, ArrowRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";

export function PublicFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribed(true);
        success("Subscribed!", "You're now on the WiseKids STEM newsletter list.");
        setEmail("");
      } else {
        const data = await res.json();
        error("Subscription issue", data.message || "Please try again.");
      }
    } catch {
      error("Network error", "Unable to subscribe right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-black text-white tracking-tight">WiseKids</span>
                <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded-full font-bold uppercase bg-indigo-900 text-indigo-300 border border-indigo-700">
                  Academy
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Empowering children ages 6–16 with world-class curriculum in Math Olympiad, Robotics, Computer Science, and Junior Debate. Learning made joyful, interactive, and rigorous.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>COPPA Compliant & Child-Safe Online Learning Environment</span>
            </div>
          </div>

          {/* Col 2: Learning Tracks */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Curriculum Tracks</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/#courses" className="hover:text-indigo-400 transition-colors">
                  Math Olympiad & Logic
                </Link>
              </li>
              <li>
                <Link href="/#courses" className="hover:text-indigo-400 transition-colors">
                  Hands-on Science & Physics
                </Link>
              </li>
              <li>
                <Link href="/#courses" className="hover:text-indigo-400 transition-colors">
                  Python Game Programming
                </Link>
              </li>
              <li>
                <Link href="/#courses" className="hover:text-indigo-400 transition-colors">
                  Robotics & Smart IoT
                </Link>
              </li>
              <li>
                <Link href="/#courses" className="hover:text-indigo-400 transition-colors">
                  Junior Debate & Speech
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Portals & Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="hover:text-indigo-400 transition-colors">
                  Student Portal Login
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-400 transition-colors">
                  Teacher Portal Login
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-400 transition-colors">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-indigo-400 transition-colors">
                  Join as Student
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-indigo-400 transition-colors">
                  Apply as Instructor
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Join STEM Newsletter</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get weekly science puzzles, coding challenges, and parent guides straight to your inbox.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="parent@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                >
                  <span>{loading ? "Joining..." : "Subscribe Free"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} WiseKids Learning Academy Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/#contact" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="/#contact" className="hover:text-slate-300">Terms of Service</Link>
            <Link href="/#contact" className="hover:text-slate-300">Safeguarding Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
