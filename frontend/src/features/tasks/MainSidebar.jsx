import React from "react";
import {
  TbMessage,
  TbMail,
  TbChecklist,
  TbNotes,
  TbLayoutKanban,
  TbCalendar,
  TbChevronRight,
  TbChevronsLeft,
  TbLayoutDashboard,
} from "react-icons/tb";

const appsList = [
  { key: "chat", label: "Chat", icon: TbMessage },
  { key: "mail", label: "Mailbox", icon: TbMail },
  { key: "todo", label: "Todo List", icon: TbChecklist },
  { key: "notes", label: "Notes", icon: TbNotes },
  { key: "scrum", label: "Scrumboard", icon: TbLayoutKanban },
  { key: "calendar", label: "Calendar", icon: TbCalendar },
];

export default function MainSidebar({
  open,
  onClose,
  onCollapse,
  onDashboard,
  onCalendar,
  onScrumboard,
  onTasks,
  onNotes,
  onMailbox,
  onChat,
  dashboardViewActive = false,
  tasksViewActive = true,
  scrumboardViewActive = false,
  notesViewActive = false,
  mailboxViewActive = false,
  chatViewActive = false,
  calendarViewActive = false,
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden border-r border-[#e0e6ed] dark:border-[#1b2e4b] bg-white dark:bg-[#0e1726] transition-all duration-200 lg:static lg:z-auto ${
          open ? "w-[240px] translate-x-0" : "w-0 -translate-x-full border-r-0"
        }`}
      >
        {/* Brand Header (matches the home page navbar logo) */}
        <div className="flex h-[62px] shrink-0 items-center justify-between border-b border-[#f1f2f3] dark:border-[#1b2e4b] px-4">
          <div className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-950 dark:text-[#e0e6ed]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4361ee] text-white shadow-md shadow-indigo-500/20">
              <TbChecklist size={20} strokeWidth={2.4} />
            </div>
            <span>
              TODO<span className="text-[#4361ee]">.</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onCollapse}
            aria-label="Collapse sidebar"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#888ea8] hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b] hover:text-[#0e1726] dark:hover:text-[#e0e6ed] transition"
          >
            <TbChevronsLeft size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* Navigation items */}
        <div className="modern-scrollbar flex-1 overflow-y-auto px-3 py-3">
          {/* Dashboard menu item */}
          <button
            type="button"
            onClick={onDashboard}
            className={`flex w-full items-center justify-between rounded-md px-3.5 py-2.5 text-left text-[14px] transition ${
              dashboardViewActive
                ? "bg-[#f4f5f8] dark:bg-[#1b2e4b] font-semibold text-[#4361ee]"
                : "text-[#3b3f5c] dark:text-[#888ea8] hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b]/60 hover:text-[#0e1726] dark:hover:text-[#e0e6ed] font-medium"
            }`}
          >
            <div className="flex items-center gap-3">
              <TbLayoutDashboard size={19} className="shrink-0" />
              <span>Dashboard</span>
            </div>
            <TbChevronRight size={15} className="text-[#888ea8]" />
          </button>

          {/* APPS SECTION */}
          <div className="mt-4">
            <h3 className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#888ea8] dark:text-[#506690]">
              APPS
            </h3>

            <div className="mt-1 space-y-0.5">
              {appsList.map((item) => {
                const Icon = item.icon;
                const active =
                  item.key === "calendar"
                    ? calendarViewActive
                    : item.key === "scrum"
                    ? scrumboardViewActive
                    : item.key === "todo"
                    ? tasksViewActive
                    : item.key === "notes"
                    ? notesViewActive
                    : item.key === "mail"
                    ? mailboxViewActive
                    : item.key === "chat"
                    ? chatViewActive
                    : false;

                const handleClick = () => {
                  if (item.key === "calendar") onCalendar?.();
                  else if (item.key === "scrum") onScrumboard?.();
                  else if (item.key === "todo") onTasks?.();
                  else if (item.key === "notes") onNotes?.();
                  else if (item.key === "mail") onMailbox?.();
                  else if (item.key === "chat") onChat?.();
                };

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={handleClick}
                    className={`flex w-full items-center justify-between rounded-md px-3.5 py-2.5 text-left text-[14px] transition-all duration-150 ${
                      active
                        ? "bg-[#f4f5f8] dark:bg-[#1b2e4b] font-semibold text-[#0e1726] dark:text-[#e0e6ed]"
                        : "text-[#3b3f5c] dark:text-[#888ea8] hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b]/60 hover:text-[#0e1726] dark:hover:text-[#e0e6ed] font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={19}
                        className={`shrink-0 ${
                          active
                            ? "text-[#4361ee]"
                            : "text-[#888ea8]"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}