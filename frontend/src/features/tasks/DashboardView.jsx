import React, { useMemo } from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiTarget,
  FiTrendingUp,
  FiLayers,
} from "react-icons/fi";
import { formatLocalDateKey } from "./dateUtils";

const formatDueDate = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export default function DashboardView({
  tasks,
  loading = false,
  error = "",
  onAdd,
  onEdit,
  onCalendar,
}) {
  const todayKey = formatLocalDateKey();
  const activeTasks = useMemo(
    () => tasks.filter((task) => !task.trashed),
    [tasks]
  );
  const pendingTasks = useMemo(
    () => activeTasks.filter((task) => !task.done),
    [activeTasks]
  );

  const completedCount = activeTasks.length - pendingTasks.length;
  const completionRate =
    activeTasks.length > 0
      ? Math.round((completedCount / activeTasks.length) * 100)
      : 0;

  const dueToday = pendingTasks.filter((task) => task.dueDate === todayKey);
  const overdue = pendingTasks.filter(
    (task) => task.dueDate && task.dueDate < todayKey
  );

  const highPriority = pendingTasks.filter((t) => t.priority === "high");
  const mediumPriority = pendingTasks.filter((t) => t.priority === "medium");
  const lowPriority = pendingTasks.filter((t) => t.priority === "low");

  const upcomingTasks = useMemo(
    () =>
      [...pendingTasks]
        .sort((first, second) => {
          if (!first.dueDate) return 1;
          if (!second.dueDate) return -1;
          return (
            first.dueDate.localeCompare(second.dueDate) ||
            new Date(second.createdAt || 0).getTime() -
              new Date(first.createdAt || 0).getTime()
          );
        })
        .slice(0, 6),
    [pendingTasks]
  );

  const cards = [
    {
      label: "Pending Tasks",
      value: pendingTasks.length,
      icon: FiTarget,
      color: "text-blue-600 dark:text-blue-400",
      background: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      label: "Completed",
      value: completedCount,
      icon: FiCheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      background: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      label: "Due Today",
      value: dueToday.length,
      icon: FiCalendar,
      color: "text-amber-600 dark:text-amber-400",
      background: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      label: "Overdue",
      value: overdue.length,
      icon: FiAlertCircle,
      color: "text-rose-600 dark:text-rose-400",
      background: "bg-rose-50 dark:bg-rose-950/40",
    },
  ];

  return (
    <div className="dashboard-view modern-scrollbar min-h-0 flex-1 overflow-y-auto bg-[#f7f8fc] dark:bg-slate-950 p-3 sm:p-6">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#4361ee]">
              Performance & Insights
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[#172033] dark:text-slate-100 sm:text-3xl">
              Workspace Overview
            </h1>
            <p className="mt-1 text-sm text-[#8490a5] dark:text-slate-400">
              Real-time analytics and deadlines across all your projects.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onCalendar}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <FiCalendar size={16} />
              Calendar
            </button>
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4361ee] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-[#3451d1] active:scale-95"
            >
              <FiPlus size={17} strokeWidth={2.4} />
              New task
            </button>
          </div>
        </div>

        {/* 4 Main Stat Cards */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${card.background} ${card.color}`}
                >
                  <Icon size={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                    {card.label}
                  </span>
                  <span className="mt-0.5 block text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {card.value}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress & Priority Breakdown Grid */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Progress Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Completion Rate
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <FiTrendingUp size={14} />
                {completionRate}%
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {completionRate}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                of total active tasks done
              </span>
            </div>
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4361ee] to-emerald-500 transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {completedCount} finished out of {activeTasks.length} active tasks.
            </p>
          </div>

          {/* Priority Distribution */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pending Priority Distribution
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                <FiLayers size={14} />
                {pendingTasks.length} open
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-rose-100 dark:border-rose-950/60 bg-rose-50/60 dark:bg-rose-950/30 p-3.5">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                  High Priority
                </span>
                <p className="mt-1 text-2xl font-bold text-rose-800 dark:text-rose-300">
                  {highPriority.length}
                </p>
              </div>

              <div className="rounded-xl border border-amber-100 dark:border-amber-950/60 bg-amber-50/60 dark:bg-amber-950/30 p-3.5">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Medium
                </span>
                <p className="mt-1 text-2xl font-bold text-amber-800 dark:text-amber-300">
                  {mediumPriority.length}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Low Priority
                </span>
                <p className="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                  {lowPriority.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {/* Up Next / Upcoming Tasks Section */}
        <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Upcoming Deadlines
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Your closest pending tasks sorted by due date.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <FiClock size={13} />
              {upcomingTasks.length} tasks shown
            </span>
          </div>

          {loading && upcomingTasks.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Loading your tasks...
            </p>
          ) : upcomingTasks.length === 0 && error ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Tasks are unavailable until the connection is restored.
            </p>
          ) : upcomingTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 px-4 py-12 text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                You’re completely caught up!
              </p>
              <p className="mt-1 text-xs text-slate-400">
                No pending deadlines found. Click &quot;New task&quot; to schedule your work.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {upcomingTasks.map((task) => {
                const isOverdue = task.dueDate && task.dueDate < todayKey;
                const isDueToday = task.dueDate === todayKey;
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onEdit(task)}
                    className="group flex w-full flex-wrap items-center justify-between gap-3 rounded-xl px-3 py-3.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100 transition-colors group-hover:text-[#4361ee]">
                        {task.title || "Untitled task"}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                        {task.description
                          ? task.description.replace(/<[^>]*>/g, " ").trim()
                          : "No description added"}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                        isOverdue
                          ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
                          : isDueToday
                          ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                          : task.dueDate
                          ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                          : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {isOverdue
                        ? `Overdue · ${formatDueDate(task.dueDate)}`
                        : isDueToday
                        ? "Due today"
                        : task.dueDate
                        ? formatDueDate(task.dueDate)
                        : "No due date"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
