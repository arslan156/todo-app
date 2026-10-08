import React from "react";
import { FiX } from "react-icons/fi";

const priorityBadgeStyles = {
  high: "border-[#e7515a] text-[#e7515a]",
  medium: "border-[#4361ee] text-[#4361ee]",
  low: "border-[#e2a03f] text-[#e2a03f]",
};

const tagBadgeStyles = {
  team: "border-[#1abc9c] text-[#1abc9c]",
  update: "border-[#2196f3] text-[#2196f3]",
  work: "border-[#4361ee] text-[#4361ee]",
  personal: "border-[#805dca] text-[#805dca]",
  urgent: "border-[#e7515a] text-[#e7515a]",
  design: "border-[#e2a03f] text-[#e2a03f]",
  dev: "border-[#00ab55] text-[#00ab55]",
};

export default function TaskViewModal({ task, onClose, onEdit }) {
  if (!task) return null;

  const priorityStyle =
    priorityBadgeStyles[task.priority?.toLowerCase()] ||
    priorityBadgeStyles.low;

  const tagStyle =
    tagBadgeStyles[task.tag?.toLowerCase()] ||
    "border-[#1abc9c] text-[#1abc9c]";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] overflow-hidden rounded-xl border border-[#e0e6ed] dark:border-[#1b2e4b] bg-white dark:bg-[#0e1726] shadow-2xl transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e0e6ed] dark:border-[#1b2e4b] px-6 py-4">
          <div className="flex flex-wrap items-center gap-2.5 pr-4">
            <h3
              id="task-detail-title"
              className="text-[17px] font-semibold text-[#0e1726] dark:text-[#e0e6ed]"
            >
              {task.title}
            </h3>

            {task.priority && (
              <span
                className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium capitalize ${priorityStyle}`}
              >
                {task.priority}
              </span>
            )}

            {task.tag && (
              <span
                className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium capitalize ${tagStyle}`}
              >
                {task.tag}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#888ea8] hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b] hover:text-[#0e1726] dark:hover:text-[#e0e6ed] transition"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5 text-[14px] leading-relaxed text-[#3b3f5c] dark:text-[#888ea8]">
          {task.description ? (
            <div
              className="prose dark:prose-invert max-w-none text-[14px] leading-6 space-y-3 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[#4361ee] [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: task.description }}
            />
          ) : (
            <p className="italic text-[#888ea8]">No description provided for this task.</p>
          )}

          {/* Metadata footer details */}
          {(task.assignee || task.dueDate) && (
            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-[#f1f2f3] dark:border-[#1b2e4b] pt-4 text-xs text-[#888ea8]">
              {task.assignee && (
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-[#0e1726] dark:text-[#e0e6ed]">
                    Assignee:
                  </span>
                  <span>{task.assignee}</span>
                </div>
              )}
              {task.dueDate && (
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-[#0e1726] dark:text-[#e0e6ed]">
                    Due Date:
                  </span>
                  <span>{task.dueDate}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#e0e6ed] dark:border-[#1b2e4b] px-6 py-3.5 bg-[#fafafa] dark:bg-[#0e1726]/60">
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="rounded-md border border-[#4361ee] px-4 py-1.5 text-xs font-semibold text-[#4361ee] transition hover:bg-[#4361ee] hover:text-white"
            >
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#e7515a] px-5 py-1.5 text-xs font-semibold text-[#e7515a] transition hover:bg-[#e7515a] hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
