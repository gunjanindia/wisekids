"use client";

import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const enrollmentData = [
  { month: "Jan", students: 120, teachers: 8 },
  { month: "Feb", students: 195, teachers: 10 },
  { month: "Mar", students: 310, teachers: 14 },
  { month: "Apr", students: 480, teachers: 18 },
  { month: "May", students: 620, teachers: 22 },
  { month: "Jun", students: 850, teachers: 28 },
];

const revenueByTrack = [
  { track: "Math Olympiad", revenue: 4200, count: 28 },
  { track: "Young Physics", revenue: 3600, count: 24 },
  { track: "Python Games", revenue: 5800, count: 32 },
  { track: "Digital Art", revenue: 2100, count: 18 },
  { track: "Junior Debate", revenue: 3400, count: 22 },
  { track: "Robotics & IoT", revenue: 6400, count: 30 },
];

const categoryDistribution = [
  { name: "Mathematics", value: 30, color: "#3B82F6" },
  { name: "Science & Robotics", value: 25, color: "#10B981" },
  { name: "Coding & Tech", value: 25, color: "#8B5CF6" },
  { name: "Creative Arts", value: 10, color: "#EC4899" },
  { name: "Debate & Speech", value: 10, color: "#F59E0B" },
];

export function AdminCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Enrollment Growth Area Chart */}
      <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Enrollment Growth Trend</h3>
            <p className="text-xs text-slate-500">Student & Instructor onboarding velocity (2026)</p>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg">
            Active Cohort +42%
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={enrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "12px",
                  border: "none",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="students"
                stroke="#6366F1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#studentGradient)"
                name="Total Students"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue & Track Distribution Pie/Bar */}
      <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Track Popularity Share</h3>
          <p className="text-xs text-slate-500">Distribution across STEM & Arts</p>
        </div>

        <div className="h-44 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={68}
                paddingAngle={4}
                dataKey="value"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "12px",
                  border: "none",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
          {categoryDistribution.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.name} ({item.value}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
