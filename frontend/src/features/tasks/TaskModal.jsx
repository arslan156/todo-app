import { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { FiX } from "react-icons/fi";
import LoadingSpinner from "../../shared/components/LoadingSpinner";

import {
  ASSIGNEES,
  TASK_TAG_OPTIONS,
  PRIORITY,
  EMPTY_TASK,
} from "./constants";

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "link"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["clean"],
];

const cap = (text = "") =>
  text.charAt(0).toUpperCase() + text.slice(1);

const createForm = (task) => ({
  ...EMPTY_TASK,
  title: task?.title || "",
  description: task?.description || "",
  assignee: task?.assignee || "",
  tag: task?.tag || "",
  priority: task?.priority || "low",
  dueDate: task?.dueDate || "",
});

export default function TaskModal({ task, onSave, onClose }) {
  const isEdit = Boolean(task);
  const [form, setForm] = useState(createForm(task));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const tagOptions =
    form.tag && !TASK_TAG_OPTIONS.includes(form.tag)
      ? [form.tag, ...TASK_TAG_OPTIONS]
      : TASK_TAG_OPTIONS;

  useEffect(() => {
    setForm(createForm(task));
    setError("");
  }, [task]);

  const updateField = (field) => (e) => {
    setForm((current) => ({
      ...current,
      [field]: e.target.value,
    }));
    if (field === "title") {
      setError("");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setError("Task title is required.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...form,
        title,
        description: form.description || "",
        assignee: form.assignee || "",
        tag: form.tag || "",
        priority: form.priority || "low",
        dueDate: form.dueDate || "",
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-[#e0e6ed] dark:border-[#1b2e4b] bg-white dark:bg-[#1b2e4b]/40 px-3.5 py-2.5 text-sm text-[#0e1726] dark:text-[#e0e6ed] placeholder-[#888ea8] outline-none transition focus:border-[#4361ee]";

  const labelClass =
    "mb-1.5 block text-xs font-semibold text-[#0e1726] dark:text-[#e0e6ed]";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-xl border border-[#e0e6ed] dark:border-[#1b2e4b] bg-white dark:bg-[#0e1726] shadow-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#e0e6ed] dark:border-[#1b2e4b] px-6 py-4">
          <h3 className="text-[17px] font-semibold text-[#0e1726] dark:text-[#e0e6ed]">
            {isEdit ? "Edit Task" : "Add Task"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#888ea8] hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b] hover:text-[#0e1726] dark:hover:text-[#e0e6ed] transition"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className={labelClass}>
              Title <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={form.title}
              onChange={updateField("title")}
              placeholder="Enter Task Title"
              className={inputClass}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>

          {/* Assignee */}
          <div>
            <label className={labelClass}>Assignee</label>
            <select
              value={form.assignee}
              onChange={updateField("assignee")}
              className={inputClass}
            >
              <option value="">Select Assignee</option>
              {ASSIGNEES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Tag + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tag</label>
              <select
                value={form.tag}
                onChange={updateField("tag")}
                className={inputClass}
              >
                <option value="">Select Tag</option>
                {tagOptions.map((t) => (
                  <option key={t} value={t}>
                    {cap(t)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Priority</label>
              <select
                value={form.priority}
                onChange={updateField("priority")}
                className={inputClass}
              >
                {Object.keys(PRIORITY).map((p) => (
                  <option key={p} value={p}>
                    {cap(p)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="task-due-date" className={labelClass}>
              Due Date
            </label>
            <input
              id="task-due-date"
              type="date"
              value={form.dueDate}
              onChange={updateField("dueDate")}
              className={inputClass}
            />
          </div>

          {/* Description with ReactQuill */}
          <div>
            <label className={labelClass}>Description</label>
            <div className="overflow-hidden rounded-md border border-[#e0e6ed] dark:border-[#1b2e4b]">
              <ReactQuill
                theme="snow"
                value={form.description}
                onChange={(html) =>
                  setForm((c) => ({ ...c, description: html }))
                }
                modules={{ toolbar: TOOLBAR }}
                placeholder="Write your task description..."
                className="
                  [&_.ql-toolbar]:border-none
                  [&_.ql-toolbar]:border-b
                  [&_.ql-toolbar]:border-[#e0e6ed]
                  dark:[&_.ql-toolbar]:border-[#1b2e4b]
                  dark:[&_.ql-toolbar]:bg-[#1b2e4b]/20
                  dark:[&_.ql-stroke]:stroke-[#888ea8]
                  dark:[&_.ql-fill]:fill-[#888ea8]
                  [&_.ql-container]:border-none
                  [&_.ql-editor]:min-h-[120px]
                  [&_.ql-editor]:text-sm
                  [&_.ql-editor]:text-[#0e1726]
                  dark:[&_.ql-editor]:text-[#e0e6ed]
                "
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#e0e6ed] dark:border-[#1b2e4b] bg-[#fafafa] dark:bg-[#0e1726]/60 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md border border-[#e0e6ed] dark:border-[#1b2e4b] px-4 py-2 text-xs font-semibold text-[#0e1726] dark:text-[#e0e6ed] hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b] transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[#4361ee] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#3451d1] disabled:cursor-wait disabled:opacity-70"
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <LoadingSpinner />
                {isEdit ? "Updating..." : "Adding..."}
              </span>
            ) : isEdit ? (
              "Update Task"
            ) : (
              "Add Task"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}