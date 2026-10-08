import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiStar, FiEdit2, FiTrash2, FiRotateCcw, FiMoreVertical } from "react-icons/fi";
import ConfirmModal from "../../shared/components/ConfirmModal";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import { stripHtml } from "./constants";

const priorityStyles = {
  high: "border-[#e7515a] text-[#e7515a]",
  medium: "border-[#4361ee] text-[#4361ee]",
  low: "border-[#e2a03f] text-[#e2a03f]",
};

const tagStyles = {
  team: "border-[#1abc9c] text-[#1abc9c]",
  update: "border-[#2196f3] text-[#2196f3]",
  work: "border-[#4361ee] text-[#4361ee]",
  personal: "border-[#805dca] text-[#805dca]",
  urgent: "border-[#e7515a] text-[#e7515a]",
  design: "border-[#e2a03f] text-[#e2a03f]",
  dev: "border-[#00ab55] text-[#00ab55]",
};

const formatVristoDate = (value) => {
  if (!value) return "Aug, 07 2020";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = months[date.getMonth()];
  const d = String(date.getDate()).padStart(2, "0");
  const y = date.getFullYear();
  return `${m}, ${d} ${y}`;
};

export default function TaskItem({
  task,
  onToggleDone,
  onToggleStar,
  onTrash,
  onRestore,
  onEdit,
  onRemove,
  onView,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [pendingAction, setPendingAction] = useState("");
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const moreButtonRef = useRef(null);
  const menuRef = useRef(null);

  const cleanDescription = stripHtml(task.description || "");
  const actionLoading =
    pendingAction === "trash" || pendingAction === "delete";

  const runAction = async (name, action) => {
    if (pendingAction) return null;
    setPendingAction(name);
    try {
      return await action();
    } finally {
      setPendingAction("");
    }
  };

  const calculatePosition = () => {
    if (!moreButtonRef.current) return;
    const button = moreButtonRef.current.getBoundingClientRect();
    const menuWidth = 190;
    const menuHeight = 170;
    const gap = 6;
    const padding = 10;

    let top = button.bottom + gap;
    if (top + menuHeight > window.innerHeight - padding) {
      top = button.top - menuHeight - gap;
    }
    let left = button.right - menuWidth;
    if (left < padding) left = padding;

    setMenuPosition({ top, left });
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
    calculatePosition();
    setMenuOpen(true);
  };

  const confirmAction = async () => {
    const actionName = confirmDialog?.type === "trash" ? "trash" : "delete";
    const result = await runAction(
      actionName,
      actionName === "trash"
        ? () => onTrash(task.id)
        : () => onRemove(task.id)
    );
    if (result) setConfirmDialog(null);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsideClick = (e) => {
      if (
        !moreButtonRef.current?.contains(e.target) &&
        !menuRef.current?.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("scroll", calculatePosition, true);
    window.addEventListener("resize", calculatePosition);
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", calculatePosition, true);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [menuOpen]);

  const priorityStyle =
    priorityStyles[task.priority?.toLowerCase()] || priorityStyles.low;

  const tagStyle =
    tagStyles[task.tag?.toLowerCase()] || "border-[#1abc9c] text-[#1abc9c]";

  return (
    <>
      <div
        onClick={() => onView?.(task)}
        className={`group relative flex cursor-pointer items-center justify-between gap-3 border-b border-[#e0e6ed] dark:border-[#1b2e4b] px-4 py-3.5 transition-colors duration-150 hover:bg-[#fafbfc] dark:hover:bg-[#121e2d] ${
          task.done ? "bg-[#fcfdfd]/60 dark:bg-[#0e1726]/40" : ""
        }`}
      >
        {/* Left: Checkbox + Title & Snippet */}
        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          {/* Custom Checkbox */}
          <button
            type="button"
            aria-label={task.done ? "Mark task active" : "Mark task done"}
            disabled={Boolean(pendingAction)}
            onClick={(e) => {
              e.stopPropagation();
              runAction("done", () => onToggleDone(task.id));
            }}
            className="flex shrink-0 items-center justify-center disabled:cursor-wait"
          >
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-[5px] border-2 transition-all duration-150 ${
                task.done
                  ? "border-[#4361ee] bg-[#4361ee] text-white"
                  : "border-[#d3d3d3] dark:border-[#253b5c] bg-white dark:bg-[#1b2e4b] hover:border-[#4361ee]"
              }`}
            >
              {pendingAction === "done" ? (
                <LoadingSpinner className="h-3 w-3" />
              ) : task.done ? (
                <svg
                  className="h-3 w-3 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : null}
            </div>
          </button>

          {/* Title & Preview */}
          <div className="min-w-0 flex-1">
            <h4
              className={`truncate text-[14px] font-semibold tracking-[-0.01em] transition-colors ${
                task.done
                  ? "text-[#888ea8] line-through dark:text-[#506690]"
                  : "text-[#0e1726] dark:text-[#e0e6ed] group-hover:text-[#4361ee]"
              }`}
            >
              {task.title}
            </h4>

            {cleanDescription && (
              <p
                className={`mt-0.5 truncate text-[12px] ${
                  task.done
                    ? "text-[#888ea8]/60 line-through dark:text-[#506690]/60"
                    : "text-[#888ea8] dark:text-[#64748b]"
                }`}
              >
                {cleanDescription}
              </p>
            )}
          </div>
        </div>

        {/* Right side: Badges, Date, Actions */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex shrink-0 items-center gap-2.5 sm:gap-4"
        >
          {/* Priority Pill */}
          {task.priority && (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize tracking-wide ${priorityStyle}`}
            >
              {task.priority}
            </span>
          )}

          {/* Tag Pill */}
          {task.tag && (
            <span
              className={`hidden sm:inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize tracking-wide ${tagStyle}`}
            >
              {task.tag}
            </span>
          )}

          {/* Formatted Date */}
          <span className="hidden md:inline-block text-[12px] font-medium text-[#888ea8] dark:text-[#64748b]">
            {formatVristoDate(task.dueDate || task.createdAt)}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {task.trashed ? (
              <>
                <button
                  type="button"
                  title="Restore task"
                  disabled={Boolean(pendingAction)}
                  onClick={() =>
                    runAction("restore", () => onRestore(task.id))
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[#00ab55] hover:bg-[#00ab55]/10 transition"
                >
                  {pendingAction === "restore" ? (
                    <LoadingSpinner />
                  ) : (
                    <FiRotateCcw size={15} />
                  )}
                </button>
                <button
                  type="button"
                  title="Delete permanently"
                  onClick={() =>
                    setConfirmDialog({
                      type: "delete",
                      title: "Delete permanently?",
                      message: `"${task.title}" will be permanently removed.`,
                      confirmText: "Delete",
                    })
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[#e7515a] hover:bg-[#e7515a]/10 transition"
                >
                  <FiTrash2 size={15} />
                </button>
              </>
            ) : (
              <>
                {/* Important Star */}
                <button
                  type="button"
                  title={task.starred ? "Important" : "Mark Important"}
                  disabled={Boolean(pendingAction)}
                  onClick={() =>
                    runAction("star", () => onToggleStar(task.id))
                  }
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition ${
                    task.starred
                      ? "text-[#e2a03f]"
                      : "text-[#888ea8] hover:text-[#e2a03f]"
                  }`}
                >
                  {pendingAction === "star" ? (
                    <LoadingSpinner />
                  ) : (
                    <FiStar
                      size={16}
                      className={task.starred ? "fill-[#e2a03f]" : ""}
                    />
                  )}
                </button>

                {/* Edit */}
                <button
                  type="button"
                  title="Edit task"
                  onClick={() => onEdit(task)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[#888ea8] hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b] hover:text-[#4361ee] transition"
                >
                  <FiEdit2 size={15} />
                </button>

                {/* More options menu */}
                <button
                  ref={moreButtonRef}
                  type="button"
                  title="More actions"
                  onClick={toggleMenu}
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition ${
                    menuOpen
                      ? "bg-[#eef2ff] text-[#4361ee] dark:bg-[#1b2e4b]"
                      : "text-[#888ea8] hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b] hover:text-[#0e1726] dark:hover:text-[#e0e6ed]"
                  }`}
                >
                  <FiMoreVertical size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Menu Portal */}
      {menuOpen &&
        !task.trashed &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
            className="z-[99999] w-48 overflow-hidden rounded-lg border border-[#e0e6ed] dark:border-[#1b2e4b] bg-white dark:bg-[#0e1726] p-1.5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onView?.(task);
              }}
              className="w-full rounded-md px-3 py-2 text-left text-xs font-medium text-[#3b3f5c] dark:text-[#e0e6ed] hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b] transition"
            >
              View details
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onEdit(task);
              }}
              className="w-full rounded-md px-3 py-2 text-left text-xs font-medium text-[#3b3f5c] dark:text-[#e0e6ed] hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b] transition"
            >
              Edit task
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                runAction("done", () => onToggleDone(task.id));
              }}
              className="w-full rounded-md px-3 py-2 text-left text-xs font-medium text-[#3b3f5c] dark:text-[#e0e6ed] hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b] transition"
            >
              {task.done ? "Mark as active" : "Mark as done"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                runAction("star", () => onToggleStar(task.id));
              }}
              className="w-full rounded-md px-3 py-2 text-left text-xs font-medium text-[#3b3f5c] dark:text-[#e0e6ed] hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b] transition"
            >
              {task.starred ? "Remove Important" : "Mark Important"}
            </button>
            <div className="my-1 border-t border-[#e0e6ed] dark:border-[#1b2e4b]" />
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setConfirmDialog({
                  type: "trash",
                  title: "Move to Trash?",
                  message: `"${task.title}" will be moved to Trash.`,
                  confirmText: "Move to Trash",
                });
              }}
              className="w-full rounded-md px-3 py-2 text-left text-xs font-medium text-[#e7515a] hover:bg-[#e7515a]/10 transition"
            >
              Move to Trash
            </button>
          </div>,
          document.body
        )}

      {/* Confirmation Modal */}
      {confirmDialog && (
        <ConfirmModal
          open={Boolean(confirmDialog)}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          variant="danger"
          loading={actionLoading}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmAction}
        />
      )}
    </>
  );
}