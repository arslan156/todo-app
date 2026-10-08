import React from "react";
import {
  FiFileText,
  FiStar,
  FiTrash2,
  FiPlus,
  FiThumbsUp,
} from "react-icons/fi";
import { TbListCheck } from "react-icons/tb";
import { PRIORITY, TASK_TAG_OPTIONS } from "./constants";

const TAG_COLORS = {
  team: "#1abc9c",
  update: "#2196f3",
  please: "#ff9800",
};

const tagLabel = (tag) => tag.charAt(0).toUpperCase() + tag.slice(1);

const FILTERS = [
  {
    key: "inbox",
    label: "Inbox",
    icon: TbListCheck,
  },
  {
    key: "done",
    label: "Done",
    icon: FiThumbsUp,
  },
  {
    key: "important",
    label: "Important",
    icon: FiStar,
  },
  {
    key: "trash",
    label: "Trash",
    icon: FiTrash2,
  },
];

const TAG_CONFIG = TASK_TAG_OPTIONS.map((key) => ({
  key,
  label: tagLabel(key),
  color: TAG_COLORS[key],
  shape: key === "team" ? "diamond" : "circle",
}));

export default function TodoSidebar({
  filter,
  tag,
  priority,
  counts,
  onFilter,
  onTag,
  onPriority,
  onAdd,
  mobileOpen = false,
  onMobileClose,
}) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close filters"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`${
          mobileOpen
            ? "fixed inset-x-3 top-[70px] bottom-3 z-50 flex lg:static lg:inset-auto lg:z-auto"
            : "hidden lg:flex"
        } h-auto min-h-0 w-auto shrink-0 flex-col overflow-hidden rounded-xl border border-[#e0e6ed] dark:border-[#1b2e4b] bg-white dark:bg-[#0e1726] p-4 lg:h-full lg:w-[240px]`}
      >
        {/* Header: Todo list with icon */}
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#f1f2f3] dark:border-[#1b2e4b]">
          <FiFileText
            size={18}
            className="text-[#0e1726] dark:text-[#e0e6ed]"
          />
          <h2 className="text-[17px] font-semibold text-[#0e1726] dark:text-[#e0e6ed]">
            Todo list
          </h2>

          <button
            type="button"
            onClick={onMobileClose}
            className="ml-auto text-xs text-[#888ea8] lg:hidden"
          >
            Done
          </button>
        </div>

        {/* Filters */}
        <div className="modern-scrollbar flex-1 overflow-y-auto py-3 space-y-1">
          {FILTERS.map((item) => {
            const Icon = item.icon;
            const active =
              filter === item.key && !tag && !priority;
            const count = counts?.[item.key] ?? 0;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onFilter(item.key)}
                className={`group flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-[14px] transition-all duration-150 ${
                  active
                    ? "bg-[#eef2ff] dark:bg-[#1b2e4b] text-[#4361ee] dark:text-[#4361ee] font-semibold"
                    : "text-[#3b3f5c] dark:text-[#888ea8] hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b]/50 hover:text-[#0e1726] dark:hover:text-[#e0e6ed] font-medium"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={
                      active
                        ? "text-[#4361ee]"
                        : "text-[#888ea8] group-hover:text-[#4361ee] transition-colors"
                    }
                  />
                  <span>{item.label}</span>
                </div>

                {count > 0 && (
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                      active
                        ? "bg-[#4361ee]/15 text-[#4361ee]"
                        : "bg-[#f4f5f8] dark:bg-[#1b2e4b] text-[#3b3f5c] dark:text-[#888ea8]"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Priority Filters */}
          <div className="pt-4 mt-3">
            <h3 className="px-3.5 text-[12px] font-medium text-[#888ea8] dark:text-[#64748b]">
              Priority
            </h3>

            <div className="mt-2 space-y-1">
              {Object.keys(PRIORITY).map((level) => {
                const active = priority === level;
                const count = counts?.priorities?.[level] ?? 0;

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onPriority(active ? null : level)}
                    className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2 text-left text-[13px] transition ${
                      active
                        ? "bg-[#f4f5f8] dark:bg-[#1b2e4b] font-semibold text-[#0e1726] dark:text-[#e0e6ed]"
                        : "text-[#3b3f5c] dark:text-[#888ea8] hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b]/40 font-medium"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${PRIORITY[level]}`}
                      />
                      {tagLabel(level)}
                    </span>
                    {count > 0 && (
                      <span className="text-[11px] text-[#888ea8]">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags Section */}
          <div className="pt-4 mt-3">
            <h3 className="px-3.5 text-[12px] font-medium text-[#888ea8] dark:text-[#64748b]">
              Tags
            </h3>

            <div className="mt-2 space-y-1">
              {TAG_CONFIG.map((t) => {
                const active = tag === t.key;
                const count = counts?.tags?.[t.key] || 0;

                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => onTag(active ? null : t.key)}
                    className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2 text-left text-[13px] transition ${
                      active
                        ? "bg-[#f4f5f8] dark:bg-[#1b2e4b] font-semibold text-[#0e1726] dark:text-[#e0e6ed]"
                        : "text-[#3b3f5c] dark:text-[#888ea8] hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b]/40 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {t.shape === "diamond" ? (
                        <span
                          className="h-2.5 w-2.5 shrink-0 rotate-45 rounded-[2px]"
                          style={{ backgroundColor: t.color }}
                        />
                      ) : (
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: t.color }}
                        />
                      )}
                      <span>{t.label}</span>
                    </div>

                    {count > 0 && (
                      <span className="text-[11px] text-[#888ea8]">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Add New Task Button */}
        <div className="pt-3">
          <button
            type="button"
            onClick={onAdd}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#4361ee] px-4 py-2.5 text-[14px] font-semibold text-white shadow-[0_6px_16px_-4px_rgba(67,97,238,0.5)] transition hover:bg-[#3451d1] active:scale-[0.98]"
          >
            <FiPlus size={18} strokeWidth={2.5} />
            <span>Add New Task</span>
          </button>
        </div>
      </aside>
    </>
  );
}