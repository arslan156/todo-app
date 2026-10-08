export const PER_PAGE = 8;

export const FILTERS = [
  ["inbox", "Inbox"],
  ["important", "Important"],
  ["done", "Done"],
  ["due", "Due Dates"],
  ["trash", "Trash"],
];

export const TAGS = {
  work: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  personal: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
  urgent: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
  design: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  dev: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  team: "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
  update: "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
  please: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
};

export const TASK_TAG_OPTIONS = ["team", "update", "please"];

export const PRIORITY = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

export const PRIORITY_STYLES = {
  high: "border-rose-200 bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-300",
  medium: "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-300",
  low: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-300",
};

export const ASSIGNEES = ["Arslan", "Ali", "Sara", "Ahmed", "Myself", "Team"];

export const EMPTY_TASK = {
  title: "",
  description: "",
  assignee: "",
  tag: "",
  priority: "low",
  dueDate: "",
};

// The rich-text editor saves HTML. Use this for plain-text previews and search.
export const stripHtml = (html = "") =>
  html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

export const matchesFilter = (t, f) =>
  f === "trash"
    ? t.trashed
    : !t.trashed &&
      (f === "inbox" || (f === "important" && t.starred) || (f === "done" && t.done) || (f === "due" && t.dueDate && !t.done));
