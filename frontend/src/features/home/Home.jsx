import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import {
  FiCheckCircle,
  FiCalendar,
  FiFileText,
  FiMessageSquare,
  FiMail,
  FiLayers,
  FiArrowRight,
  FiShield,
  FiZap,
  FiStar,
  FiCheck,
} from "react-icons/fi";
import { TbChecklist, TbLayoutKanban } from "react-icons/tb";

const DEMO_TABS = [
  { id: "tasks", label: "Task List", icon: TbChecklist },
  { id: "scrum", label: "Scrumboard", icon: TbLayoutKanban },
  { id: "notes", label: "Notes", icon: FiFileText },
  { id: "calendar", label: "Calendar", icon: FiCalendar },
];

export default function Home() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState("tasks");

  const [demoTasks, setDemoTasks] = useState([
    {
      id: 1,
      title: "Ship version 2.0 interface refresh",
      tag: "work",
      priority: "high",
      dueDate: "Today",
      done: false,
    },
    {
      id: 2,
      title: "Review Q4 roadmap & sprint backlog",
      tag: "urgent",
      priority: "medium",
      dueDate: "Tomorrow",
      done: false,
    },
    {
      id: 3,
      title: "Draft weekly customer retrospective notes",
      tag: "personal",
      priority: "low",
      dueDate: "Friday",
      done: true,
    },
  ]);

  const toggleDemoTask = (id) => {
    setDemoTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const handleCta = () => {
    if (isLoggedIn) {
      navigate("/todo");
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="relative overflow-hidden bg-white text-slate-900 selection:bg-[#4361ee] selection:text-white">
      {/* Background decorative gradient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-200/40 via-[#4361ee]/20 to-sky-200/30 blur-3xl" />

      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-20 sm:px-6 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-[#4361ee] shadow-xs backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#4361ee] animate-pulse" />
            <span>The All-in-One Productivity Workspace 2.0</span>
          </div>

          {/* Headline */}
          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-6xl md:text-7xl leading-[1.1]">
            Organize work & life.
            <br />
            <span className="bg-gradient-to-r from-[#4361ee] via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Finally in one calm place.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600">
            Ditch disconnected apps. Manage your tasks, drag-and-drop Scrumboard,
            rich markdown notes, deadline calendar, team chat, and mailbox —
            all unified in an ultra-responsive, beautiful interface.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleCta}
              className="inline-flex items-center gap-2.5 rounded-xl bg-[#4361ee] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-[#3451d1] hover:shadow-indigo-500/35 active:scale-95"
            >
              <span>{isLoggedIn ? "Open Your Workspace" : "Get Started Free"}</span>
              <FiArrowRight size={18} />
            </button>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900"
            >
              Explore Architecture
            </Link>
          </div>

          {/* Quick social proof / feature pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <FiCheck className="text-emerald-500" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <FiCheck className="text-emerald-500" /> Fast local & MongoDB cloud
            </span>
            <span className="flex items-center gap-1.5">
              <FiCheck className="text-emerald-500" /> 100% Secure session auth
            </span>
          </div>
        </div>

        {/* Interactive Workspace Live Preview Card */}
        <div className="mx-auto mt-16 max-w-5xl rounded-3xl border border-slate-200/90 bg-white p-3 sm:p-5 shadow-2xl shadow-indigo-950/10">
          {/* Top chrome bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 sm:pb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-semibold text-slate-400">
                app.todo.workspace
              </span>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex rounded-xl bg-slate-100/90 p-1 text-xs font-medium">
              {DEMO_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                      active
                        ? "bg-white text-[#4361ee] shadow-xs font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Screen Display */}
          <div className="min-h-[320px] rounded-2xl bg-slate-50/60 p-4 sm:p-6 text-left">
            {activeTab === "tasks" && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Interactive Task List
                    </h3>
                    <p className="text-xs text-slate-500">
                      Try clicking checkboxes below to test real-time state!
                    </p>
                  </div>
                  <span className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-semibold text-[#4361ee]">
                    {demoTasks.filter((t) => !t.done).length} active
                  </span>
                </div>

                <div className="space-y-2.5">
                  {demoTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleDemoTask(task.id)}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border bg-white p-3.5 shadow-xs transition hover:border-[#4361ee]/40 ${
                        task.done
                          ? "border-slate-200 opacity-60"
                          : "border-slate-200/90"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition ${
                            task.done
                              ? "border-[#4361ee] bg-[#4361ee] text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {task.done && <FiCheck size={12} strokeWidth={3} />}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            task.done
                              ? "text-slate-400 line-through"
                              : "text-slate-900"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                            task.priority === "high"
                              ? "border-rose-200 bg-rose-50 text-rose-600"
                              : task.priority === "medium"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-emerald-200 bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="hidden sm:inline text-xs text-slate-400">
                          Due {task.dueDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "scrum" && (
              <div>
                <h3 className="mb-1 text-base font-bold text-slate-900">
                  Agile Kanban Scrumboard
                </h3>
                <p className="mb-4 text-xs text-slate-500">
                  Multi-column visual pipeline for team sprints and backlogs.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-3">
                    <span className="text-xs font-bold text-slate-700">
                      📋 To Do (2)
                    </span>
                    <div className="mt-2 rounded-lg bg-white p-2.5 text-xs font-medium shadow-xs border border-slate-200">
                      Research competitor features
                    </div>
                    <div className="mt-2 rounded-lg bg-white p-2.5 text-xs font-medium shadow-xs border border-slate-200">
                      Prepare user interview guide
                    </div>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3">
                    <span className="text-xs font-bold text-blue-700">
                      ⚡ In Progress (1)
                    </span>
                    <div className="mt-2 rounded-lg bg-white p-2.5 text-xs font-medium shadow-xs border border-blue-100">
                      Refactor authentication cookie tokens
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                    <span className="text-xs font-bold text-emerald-700">
                      ✅ Completed (3)
                    </span>
                    <div className="mt-2 rounded-lg bg-white p-2.5 text-xs font-medium shadow-xs border border-emerald-100 text-slate-500 line-through">
                      Build interactive calendar view
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div>
                <h3 className="mb-1 text-base font-bold text-slate-900">
                  Rich Notes Workspace
                </h3>
                <p className="mb-4 text-xs text-slate-500">
                  Instant color-coded idea capture with tagging and search.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 shadow-xs">
                    <span className="text-xs font-bold text-indigo-700">
                      Product Philosophy
                    </span>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                      Always prioritize clarity and calmness over bloat.
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs">
                    <span className="text-xs font-bold text-amber-700">
                      Sprint Goals
                    </span>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                      Optimize bundle size &amp; improve automated testing.
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs">
                    <span className="text-xs font-bold text-emerald-700">
                      Reading List
                    </span>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                      Design Systems by Alla Kholmatova.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "calendar" && (
              <div>
                <h3 className="mb-1 text-base font-bold text-slate-900">
                  Smart Calendar &amp; Agenda
                </h3>
                <p className="mb-4 text-xs text-slate-500">
                  Deadlines classified into Overdue, Due Today, and Upcoming.
                </p>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between border-b pb-3 text-xs font-bold text-slate-700">
                    <span>Upcoming Deadlines Agenda</span>
                    <span className="text-[#4361ee]">October 2026</span>
                  </div>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between rounded-lg bg-amber-50 p-2 text-amber-800">
                      <span>• Client demonstration review</span>
                      <span className="font-semibold">Today (Oct 8)</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-blue-50 p-2 text-blue-800">
                      <span>• Release Candidate Build 1.0</span>
                      <span className="font-semibold">Oct 12</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="border-t border-slate-100 bg-slate-50/60 py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#4361ee]">
              Engineered For Peak Performance
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Everything you need. Nothing you don&apos;t.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-[#4361ee]">
                <TbChecklist size={22} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Task Management &amp; Filters
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Filter by Inbox, Due Date, Important, and Trash. Paginated,
                searchable, and backed by MongoDB indexing.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <TbLayoutKanban size={22} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Kanban Scrumboard
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Visual pipeline dividing your tasks into To Do, In Progress,
                and Done. Track sprint stages effortlessly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <FiFileText size={22} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Rich Color Notes
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Quick thoughts and detailed memos with custom colors, category
                diamonds, and live keyword filtering.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <FiCalendar size={22} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Deadlines Calendar
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Full interactive month grid and day agenda. Highlights overdue,
                due today, and upcoming milestones.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FiMessageSquare size={22} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Integrated Direct Chat
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Communicate directly with registered members by email. Message
                polling keeps threads updated in real time.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <FiShield size={22} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Security &amp; Idle Protection
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                HttpOnly token verification, bcrypt encrypted passwords, and an
                automatic 15-minute inactivity timeout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-[#4361ee] to-indigo-700 p-8 sm:p-14 text-center text-white shadow-2xl shadow-indigo-500/25">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Start getting things done today.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-indigo-100">
            Join thousands of focused creators and teams who rely on Todo to
            structure their day and achieve their goals.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handleCta}
              className="rounded-xl bg-white px-8 py-3.5 text-base font-bold text-[#4361ee] shadow-lg transition hover:bg-indigo-50 active:scale-95"
            >
              {isLoggedIn ? "Open Workspace" : "Create Free Account"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
