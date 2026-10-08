import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiAlertTriangle, FiTrash2, FiInfo, FiX } from "react-icons/fi";
import LoadingSpinner from "./LoadingSpinner";

export default function ConfirmModal({
  open = false,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // "danger" | "primary" | "warning"
  onConfirm,
  onClose,
  loading = false,
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, loading]);

  if (!open) return null;

  const iconMap = {
    danger: <FiTrash2 className="h-5 w-5 text-rose-500" />,
    warning: <FiAlertTriangle className="h-5 w-5 text-amber-500" />,
    primary: <FiInfo className="h-5 w-5 text-[#4361ee]" />,
  };

  const iconBgMap = {
    danger: "bg-rose-50 border-rose-100",
    warning: "bg-amber-50 border-amber-100",
    primary: "bg-indigo-50 border-indigo-100",
  };

  const confirmBtnMap = {
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20",
    warning: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20",
    primary: "bg-[#4361ee] hover:bg-[#3451d1] text-white shadow-indigo-500/20",
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 transition-opacity animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl transition-all duration-200 dark:border-slate-800 dark:bg-slate-900"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close modal"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition"
        >
          <FiX size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconBgMap[variant] || iconBgMap.danger}`}
          >
            {iconMap[variant] || iconMap.danger}
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h3
              id="confirm-modal-title"
              className="text-base font-semibold text-slate-900 dark:text-slate-100"
            >
              {title}
            </h3>
            <p
              id="confirm-modal-description"
              className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400"
            >
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md transition focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${confirmBtnMap[variant] || confirmBtnMap.danger}`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <LoadingSpinner />
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
