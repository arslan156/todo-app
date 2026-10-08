import React, { useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiCircle,
  FiClock,
  FiEdit2,
  FiFilter,
  FiPlus,
  FiSearch,
  FiStar,
  FiTrash2,
  FiArrowRight,
  FiArrowLeft,
} from "react-icons/fi";
import { formatLocalDateKey, getDueDateStatus } from "./dateUtils";
import { stripHtml } from "./constants";
import ConfirmModal from "../../shared/components/ConfirmModal";

const priorityStyles = {
  high: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50",
  medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50",
  low: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50",
};

const tagStyles = {
  work: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",
  personal: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300",
  urgent: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",
  design: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  dev: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  team: "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300",
  update: "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300",
};

export default function ScrumboardView({
  tasks = [],
  onEdit,
  onAdd,
  onToggleDone,
  onToggleStar,
  onTrash,
}) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [taskPendingTrash, setTaskPendingTrash] = useState(null);

  const todayKey = formatLocalDateKey();

  const activeTasks = useMemo(
    () => tasks.filter((t) => !t.trashed),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    return activeTasks.filter((task) => {
      const matchSearch =
        !search.trim() ||
        task.title?.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase()) ||
        task.assignee?.toLowerCase().includes(search.toLowerCase());

      const matchTag =
        selectedTag === "all" || task.tag === selectedTag;

      return matchSearch && matchTag;
    });
  }, [activeTasks, search, selectedTag]);

  // Partition into columns:
  // 1. "To Do": active, not done, low or unstarted
  // 2. "In Progress": active, not done, high or medium or starred
  // 3. "Done": completed
  const columns = useMemo(() => {
    const todo = [];
    const inProgress = [];
    const done = [];

    filteredTasks.forEach((task) => {
      if (task.done) {
        done.push(task);
      } else if (task.starred || task.priority === "high" || task.priority === "medium") {
        inProgress.push(task);
      } else {
        todo.push(task);
      }
    });

    return [
      {
        id: "todo",
        title: "To Do / Backlog",
        count: todo.length,
        color: "border-slate-300 dark:border-slate-700",
        badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        tasks: todo,
      },
      {
        id: "in_progress",
        title: "In Progress / Priority",
        count: inProgress.length,
        color: "border-blue-400 dark:border-blue-600",
        badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
        tasks: inProgress,
      },
      {
        id: "done",
        title: "Completed",
        count: done.length,
        color: "border-emerald-400 dark:border-emerald-600",
        badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
        tasks: done,
      },
    ];
  }, [filteredTasks]);

  return (
    <div className="modern-scrollbar min-h-0 flex-1 overflow-y-auto bg-[#f7f8fc] dark:bg-slate-950 p-3 sm:p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#4361ee]">
              Interactive Agile Board
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[#172033] dark:text-slate-100 sm:text-3xl">
              Scrumboard
            </h1>
            <p className="mt-1 text-sm text-[#8490a5] dark:text-slate-400">
              Track tasks seamlessly across development stages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search board..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 sm:w-60 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4361ee]/20"
              />
            </div>

            {/* Tag Filter */}
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Tags</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="urgent">Urgent</option>
              <option value="design">Design</option>
              <option value="dev">Dev</option>
              <option value="team">Team</option>
            </select>

            {/* New Task Button */}
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4361ee] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-[#3451d1] active:scale-95"
            >
              <FiPlus size={16} strokeWidth={2.5} />
              New task
            </button>
          </div>
        </div>

        {/* Board Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-start">
          {columns.map((col) => (
            <div
              key={col.id}
              className="flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-900/50 p-3 sm:p-4 shadow-xs"
            >
              {/* Column Header */}
              <div className="mb-3 flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.id === 'done' ? 'bg-emerald-500' : col.id === 'in_progress' ? 'bg-[#4361ee]' : 'bg-slate-400'}`} />
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {col.title}
                  </h2>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${col.badge}`}>
                  {col.count}
                </span>
              </div>

              {/* Task Cards in Column */}
              <div className="space-y-3 min-h-[300px]">
                {col.tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/70 rounded-xl">
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      No tasks in this stage
                    </p>
                  </div>
                ) : (
                  col.tasks.map((task) => {
                    const desc = stripHtml(task.description);
                    const dueStatus = getDueDateStatus(task.dueDate, todayKey);

                    return (
                      <div
                        key={task.id}
                        className="group relative rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-850 p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                      >
                        {/* Header Badges */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              priorityStyles[task.priority] || priorityStyles.low
                            }`}
                          >
                            {task.priority || "Low"}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {task.tag && (
                              <span
                                className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize ${
                                  tagStyles[task.tag] || "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300"
                                }`}
                              >
                                {task.tag}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => onToggleStar(task.id)}
                              className={`rounded p-1 transition ${
                                task.starred ? "text-amber-500" : "text-slate-300 hover:text-amber-500"
                              }`}
                            >
                              <FiStar size={14} fill={task.starred ? "currentColor" : "none"} />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <h3
                          onClick={() => onEdit(task)}
                          className={`text-sm font-semibold cursor-pointer transition hover:text-[#4361ee] ${
                            task.done
                              ? "text-slate-400 line-through dark:text-slate-500"
                              : "text-slate-900 dark:text-slate-100"
                          }`}
                        >
                          {task.title}
                        </h3>

                        {/* Description Preview */}
                        {desc ? (
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                            {desc}
                          </p>
                        ) : null}

                        {/* Card Footer */}
                        <div className="mt-3.5 pt-2.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                          {/* Due Date */}
                          {task.dueDate ? (
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                                dueStatus === "overdue"
                                  ? "text-rose-600 dark:text-rose-400"
                                  : dueStatus === "today"
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              <FiClock size={12} />
                              {task.dueDate}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">No deadline</span>
                          )}

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              title={task.done ? "Mark as active" : "Mark as completed"}
                              onClick={() => onToggleDone(task.id)}
                              className={`rounded-lg p-1.5 transition ${
                                task.done
                                  ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                  : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              }`}
                            >
                              <FiCheckCircle size={15} />
                            </button>

                            <button
                              type="button"
                              title="Edit task"
                              onClick={() => onEdit(task)}
                              className="rounded-lg p-1.5 text-slate-400 hover:text-[#4361ee] hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                              <FiEdit2 size={13} />
                            </button>

                            <button
                              type="button"
                              title="Move to Trash"
                              onClick={() => setTaskPendingTrash(task)}
                              className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {taskPendingTrash && (
        <ConfirmModal
          open={Boolean(taskPendingTrash)}
          title="Move task to Trash?"
          message={`"${taskPendingTrash.title}" will be moved to Trash. You can restore it anytime.`}
          confirmText="Move to Trash"
          variant="danger"
          onClose={() => setTaskPendingTrash(null)}
          onConfirm={() => {
            onTrash(taskPendingTrash.id);
            setTaskPendingTrash(null);
          }}
        />
      )}
    </div>
  );
}
