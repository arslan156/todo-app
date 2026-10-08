import React, { useMemo, useState } from "react";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiPlus,
} from "react-icons/fi";
import {
  formatLocalDateKey,
  getDueDateStatus,
} from "./dateUtils";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatMonth = (date) =>
  date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

const formatSelectedDate = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

export default function CalendarView({ tasks, onEdit, onAdd }) {
  const todayKey = formatLocalDateKey();
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const scheduledTasks = useMemo(
    () => tasks.filter((task) => !task.trashed && task.dueDate),
    [tasks]
  );

  const tasksByDate = useMemo(() => {
    return scheduledTasks.reduce((grouped, task) => {
      if (!grouped[task.dueDate]) {
        grouped[task.dueDate] = [];
      }
      grouped[task.dueDate].push(task);
      return grouped;
    }, {});
  }, [scheduledTasks]);

  const calendarDays = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const monthLength = new Date(year, monthIndex + 1, 0).getDate();
    const previousMonthLength = new Date(year, monthIndex, 0).getDate();

    return Array.from({ length: 42 }, (_, index) => {
      const dayNumber = index - firstDay + 1;
      let date;
      let inMonth = true;

      if (dayNumber < 1) {
        date = new Date(year, monthIndex - 1, previousMonthLength + dayNumber);
        inMonth = false;
      } else if (dayNumber > monthLength) {
        date = new Date(year, monthIndex + 1, dayNumber - monthLength);
        inMonth = false;
      } else {
        date = new Date(year, monthIndex, dayNumber);
      }

      return { date, inMonth, key: formatLocalDateKey(date) };
    });
  }, [month]);

  const selectedTasks = tasksByDate[selectedDate] || [];
  const todayCount = (tasksByDate[todayKey] || []).filter(
    (task) => !task.done
  ).length;
  const overdueCount = scheduledTasks.filter(
    (task) => !task.done && task.dueDate < todayKey
  ).length;
  const upcomingCount = scheduledTasks.filter(
    (task) => !task.done && task.dueDate > todayKey
  ).length;

  const changeMonth = (amount) => {
    setMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1)
    );
  };

  const goToToday = () => {
    const today = new Date();
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(todayKey);
  };

  const statCards = [
    {
      label: "Due today",
      value: todayCount,
      icon: FiCalendar,
      color: "text-amber-600",
      background: "bg-amber-50",
    },
    {
      label: "Overdue",
      value: overdueCount,
      icon: FiClock,
      color: "text-rose-600",
      background: "bg-rose-50",
    },
    {
      label: "Coming up",
      value: upcomingCount,
      icon: FiChevronRight,
      color: "text-blue-600",
      background: "bg-blue-50",
    },
  ];

  return (
    <div className="calendar-view modern-scrollbar min-h-0 flex-1 overflow-y-auto bg-[#f7f8fc] p-3 sm:p-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-5 sm:gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#4361ee]">
              Plan your work
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-[#172033] sm:text-3xl">
              Calendar
            </h1>
            <p className="mt-1 text-sm text-[#8490a5]">
              Your deadlines and scheduled tasks, all in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-[#4361ee] px-4 py-2.5 text-sm font-medium text-white shadow-[0_8px_18px_-8px_#4361ee] transition hover:bg-[#3451d1]"
          >
            <FiPlus size={17} />
            New task
          </button>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2 sm:mb-5 sm:gap-3">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="flex min-w-0 flex-col items-start gap-2 rounded-xl border border-[#e8ebf2] bg-white p-3 shadow-[0_2px_8px_rgba(20,35,70,0.03)] sm:flex-row sm:items-center sm:gap-3 sm:p-4"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${card.background} ${card.color}`}
                >
                  <Icon size={19} />
                </span>
                <span>
                  <span className="block text-xs text-[#8490a5]">{card.label}</span>
                  <span className="mt-0.5 block text-xl font-semibold text-[#172033]">
                    {card.value}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 xl:min-h-[560px] xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-xl border border-[#e8ebf2] bg-white p-3 shadow-[0_2px_8px_rgba(20,35,70,0.03)] sm:p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#172033]">
                  {formatMonth(month)}
                </h2>
                <p className="mt-0.5 text-xs text-[#8490a5]">
                  {scheduledTasks.length} scheduled task
                  {scheduledTasks.length === 1 ? "" : "s"} total
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={goToToday}
                  className="mr-1 rounded-md px-3 py-2 text-xs font-semibold text-[#4361ee] transition hover:bg-[#f1f4ff]"
                >
                  Today
                </button>
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => changeMonth(-1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e8ebf2] text-[#64748b] transition hover:bg-[#f7f8fc] hover:text-[#4361ee]"
                >
                  <FiChevronLeft size={17} />
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => changeMonth(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e8ebf2] text-[#64748b] transition hover:bg-[#f7f8fc] hover:text-[#4361ee]"
                >
                  <FiChevronRight size={17} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-[#eef0f4] pb-2">
              {weekdays.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[#9aa4b5] sm:text-xs"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map(({ date, inMonth, key }) => {
                const dayTasks = tasksByDate[key] || [];
                const isSelected = selectedDate === key;
                const isToday = todayKey === key;
                const overdue = dayTasks.some(
                  (task) => !task.done && getDueDateStatus(key, todayKey) === "overdue"
                );
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(key)}
                    className={`relative flex min-h-[66px] flex-col items-center border-b border-[#f0f2f6] py-2 transition sm:min-h-[88px] sm:py-3 ${
                      isSelected
                        ? "bg-[#f0f3ff]"
                        : "hover:bg-[#f8f9fc]"
                    } ${inMonth ? "" : "opacity-40"}`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium sm:h-9 sm:w-9 sm:text-sm ${
                        isSelected
                          ? "bg-[#4361ee] text-white"
                          : isToday
                          ? "border border-[#4361ee] text-[#4361ee]"
                          : "text-[#364256]"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="mt-1.5 flex items-center gap-1">
                        {dayTasks.slice(0, 3).map((task) => (
                          <span
                            key={task.id}
                            className={`h-1.5 w-1.5 rounded-full ${
                              task.done
                                ? "bg-emerald-400"
                                : overdue
                                ? "bg-rose-500"
                                : task.priority === "high"
                                ? "bg-orange-500"
                                : "bg-[#4361ee]"
                            }`}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <span className="text-[9px] font-medium text-[#8490a5]">
                            +{dayTasks.length - 3}
                          </span>
                        )}
                      </span>
                    )}
                    {dayTasks.length > 0 && (
                      <span className="mt-1 hidden text-[9px] text-[#8490a5] sm:block">
                        {dayTasks.length} task{dayTasks.length === 1 ? "" : "s"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-[#8490a5] sm:text-xs">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#4361ee]" />
                Scheduled
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Overdue
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Completed
              </span>
            </div>
          </section>

          <aside className="flex min-h-[240px] flex-col overflow-hidden rounded-xl sm:min-h-[360px] border border-[#e8ebf2] bg-white shadow-[0_2px_8px_rgba(20,35,70,0.03)]">
            <div className="border-b border-[#eef0f4] px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4361ee]">
                Your agenda
              </p>
              <h2 className="mt-1 text-base font-semibold text-[#172033]">
                {formatSelectedDate(selectedDate)}
              </h2>
              <p className="mt-1 text-xs text-[#8490a5]">
                {selectedTasks.length} task
                {selectedTasks.length === 1 ? "" : "s"} scheduled
              </p>
            </div>

            <div className="modern-scrollbar flex-1 overflow-y-auto p-3">
              {selectedTasks.length > 0 ? (
                <div className="space-y-2">
                  {selectedTasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => onEdit(task)}
                      className="group flex w-full gap-3 rounded-lg border border-[#edf0f5] p-3 text-left transition hover:border-[#cbd5ff] hover:bg-[#f8f9ff]"
                    >
                      <span
                        className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                          task.done
                            ? "bg-emerald-400"
                            : getDueDateStatus(task.dueDate, todayKey) === "overdue"
                            ? "bg-rose-500"
                            : task.priority === "high"
                            ? "bg-orange-500"
                            : "bg-[#4361ee]"
                        }`}
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-sm font-medium ${
                            task.done
                              ? "text-[#94a3b8] line-through group-hover:text-[#4361ee] group-focus-visible:text-[#4361ee]"
                              : "text-[#263247] group-hover:text-[#4361ee] group-focus-visible:text-[#4361ee]"
                          }`}
                        >
                          {task.title || "Untitled task"}
                        </span>
                        <span className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                              task.done
                                ? "bg-emerald-50 text-emerald-600"
                                : getDueDateStatus(task.dueDate, todayKey) === "overdue"
                                ? "bg-rose-50 text-rose-600"
                                : getDueDateStatus(task.dueDate, todayKey) === "today"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {task.done
                              ? "Completed"
                              : getDueDateStatus(task.dueDate, todayKey) === "overdue"
                              ? "Overdue"
                              : getDueDateStatus(task.dueDate, todayKey) === "today"
                              ? "Due today"
                              : "Scheduled"}
                          </span>
                          <span className="text-[10px] capitalize text-[#8490a5]">
                            {task.priority || "low"} priority
                          </span>
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex h-full min-h-[220px] flex-col items-center justify-center px-4 text-center">
                  <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f4fa] text-[#8a96aa]">
                    <FiCalendar size={19} />
                  </span>
                  <p className="text-sm font-medium text-[#364256]">
                    Nothing scheduled
                  </p>
                  <p className="mt-1 max-w-[220px] text-xs leading-5 text-[#8490a5]">
                    Add a due date to a task and it will show up here.
                  </p>
                  <button
                    type="button"
                    onClick={onAdd}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold text-[#4361ee] transition hover:bg-[#f1f4ff]"
                  >
                    <FiPlus size={14} />
                    Add a task
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
