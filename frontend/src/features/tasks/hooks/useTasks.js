import { useEffect, useMemo, useRef, useState } from "react";
import { taskApi } from "../../../services/api";
import { addNotification } from "../notificationUtils";
import { formatLocalDateKey } from "../dateUtils";

const KEY = "todolist.tasks.v1";
const REMINDER_KEY = "todolist.reminders.v1";
const IMPORTED_KEY = "todolist.tasks.imported.v1";
const taskLoadRequests = new Map();

const seed = [
  {
    id: 1,
    title: "Review landing page design",
    description: "Check spacing and mobile layout.",
    assignee: "Arslan",
    tag: "team",
    priority: "high",
    dueDate: "2026-10-05",
    createdAt: "2026-10-01T10:00:00.000Z",
    done: false,
    starred: true,
    trashed: false,
  },
  {
    id: 2,
    title: "Update project README",
    description: "Add setup steps and screenshots.",
    assignee: "Arslan",
    tag: "update",
    priority: "low",
    dueDate: "2026-10-08",
    createdAt: "2026-10-01T11:00:00.000Z",
    done: false,
    starred: false,
    trashed: false,
  },
  {
    id: 3,
    title: "Send weekly report",
    description: "Share progress with the team.",
    assignee: "Ali",
    tag: "please",
    priority: "medium",
    dueDate: "2026-10-03",
    createdAt: "2026-10-01T12:00:00.000Z",
    done: true,
    starred: false,
    trashed: false,
  },
];

function normalizeTask(task) {
  return {
    ...task,
    id: task._id || task.id,
    title: task.title ?? "",
    description: task.description ?? task.body ?? "",
    assignee: task.assignee ?? "",
    tag: task.tag ?? "",
    priority: task.priority ?? "low",
    dueDate: task.dueDate ?? "",
    createdAt: task.createdAt ?? new Date().toISOString(),
    done: Boolean(task.done),
    starred: Boolean(task.starred),
    trashed: Boolean(task.trashed),
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;

    const savedTasks = JSON.parse(raw);
    if (!Array.isArray(savedTasks)) return seed;

    return savedTasks.map((task) =>
      normalizeTask({
        ...task,
        id: task.id ?? Date.now(),
      })
    );
  } catch {
    return seed;
  }
}

function loadReminders() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(REMINDER_KEY) || "{}"
    );
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function apiError(error, fallback) {
  return error.response?.data?.message || fallback;
}

const stripHtml = (html = "") =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const matchesTaskFilter = (task, filter) => {
  if (filter === "trash") return Boolean(task.trashed);
  if (task.trashed) return false;
  if (filter === "done") return Boolean(task.done);
  if (filter === "important") return Boolean(task.starred);
  if (filter === "due") return Boolean(task.dueDate && !task.done);
  return true;
};

const sortTasks = (tasks, filter) =>
  [...tasks].sort((first, second) => {
    if (filter === "due") {
      return (
        first.dueDate.localeCompare(second.dueDate) ||
        new Date(second.createdAt || 0).getTime() -
          new Date(first.createdAt || 0).getTime()
      );
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDifference =
      (priorityOrder[first.priority] ?? 3) -
      (priorityOrder[second.priority] ?? 3);

    if (priorityDifference) return priorityDifference;

    return (
      new Date(second.createdAt || 0).getTime() -
      new Date(first.createdAt || 0).getTime()
    );
  });

const getTasksForUser = (userId) => {
  if (!taskLoadRequests.has(userId)) {
    const request = (async () => {
      const { data } = await taskApi.get(`/getTasks/${userId}`);
      let remoteTasks = Array.isArray(data.list)
        ? data.list.map(normalizeTask)
        : [];

      if (
        remoteTasks.length === 0 &&
        localStorage.getItem(IMPORTED_KEY) !== "true"
      ) {
        for (const task of load()) {
          const { data: created } = await taskApi.post("/addTask", {
            userId,
            ...task,
          });
          remoteTasks.push(normalizeTask(created.task));
        }
        localStorage.setItem(IMPORTED_KEY, "true");
      } else if (remoteTasks.length > 0) {
        localStorage.setItem(IMPORTED_KEY, "true");
      }

      return remoteTasks;
    })();

    taskLoadRequests.set(userId, request);
  }

  return taskLoadRequests.get(userId);
};

export default function useTasks({
  page = 1,
  limit = 10,
  search = "",
  filter = "inbox",
  tag = null,
  priority = null,
} = {}) {
  const userId = sessionStorage.getItem("id");
  const [tasks, setTasks] = useState(() => (userId ? [] : load()));
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(!userId);
  const [serverPageTasks, setServerPageTasks] = useState([]);
  const [serverPagination, setServerPagination] = useState({
    page: 1,
    limit,
    totalItems: 0,
    totalPages: 1,
  });
  const [pageLoading, setPageLoading] = useState(Boolean(userId));
  const [pageError, setPageError] = useState("");
  const [pageRevision, setPageRevision] = useState(0);
  const [pageRetry, setPageRetry] = useState(0);
  const pageRequestId = useRef(0);
  const remindersRef = useRef(loadReminders());

  useEffect(() => {
    let active = true;

    if (!userId) {
      setTasks(load());
      setLoading(false);
      setLoaded(true);
      return () => {
        active = false;
      };
    }

    const loadTasks = async () => {
      setLoading(true);
      setError("");

      try {
        const remoteTasks = await getTasksForUser(userId);

        if (active) {
          setTasks(remoteTasks);
          setLoaded(true);
        }
      } catch (requestError) {
        taskLoadRequests.delete(userId);
        if (active) {
          setError(apiError(requestError, "Unable to load tasks from the server."));
        }
      } finally {
        taskLoadRequests.delete(userId);
        if (active) {
          setLoading(false);
          setLoaded(true);
        }
      }
    };

    loadTasks();

    return () => {
      active = false;
    };
  }, [userId]);

  const localPage = useMemo(() => {
    if (userId) return null;

    const searchText = search.trim().toLowerCase();
    const filteredTasks = tasks.filter((task) => {
      const searchContent = [
        task.title,
        stripHtml(task.description),
        task.assignee,
        task.tag,
        task.priority,
        task.dueDate,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesTaskFilter(task, filter) &&
        (!tag || task.tag === tag) &&
        (!priority || task.priority === priority) &&
        (!searchText || searchContent.includes(searchText))
      );
    });
    const sortedTasks = sortTasks(filteredTasks, filter);
    const totalPages = Math.max(1, Math.ceil(sortedTasks.length / limit));
    const currentPage = Math.min(page, totalPages);

    return {
      tasks: sortedTasks.slice((currentPage - 1) * limit, currentPage * limit),
      pagination: {
        page: currentPage,
        limit,
        totalItems: sortedTasks.length,
        totalPages,
      },
    };
  }, [userId, tasks, search, filter, tag, priority, page, limit]);

  useEffect(() => {
    if (!userId) {
      setPageLoading(false);
      setPageError("");
      return undefined;
    }
    if (!loaded) {
      setPageLoading(true);
      return undefined;
    }

    const controller = new AbortController();
    const requestId = pageRequestId.current + 1;
    pageRequestId.current = requestId;
    setPageLoading(true);
    setPageError("");

    taskApi
      .get(`/getTasks/${userId}`, {
        params: { page, limit, search, filter, tag: tag || "", priority: priority || "" },
        signal: controller.signal,
      })
      .then(({ data }) => {
        if (pageRequestId.current !== requestId) return;
        setServerPageTasks(
          Array.isArray(data.tasks) ? data.tasks.map(normalizeTask) : []
        );
        setServerPagination(data.pagination);
        setError("");
      })
      .catch((requestError) => {
        if (controller.signal.aborted || pageRequestId.current !== requestId) {
          return;
        }
        setPageError(
          apiError(requestError, "Unable to load tasks. Please try again.")
        );
      })
      .finally(() => {
        if (!controller.signal.aborted && pageRequestId.current === requestId) {
          setPageLoading(false);
        }
      });

    return () => controller.abort();
  }, [
    userId,
    loaded,
    page,
    limit,
    search,
    filter,
    tag,
    priority,
    pageRevision,
    pageRetry,
  ]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(tasks));
    } catch {
      setError("Tasks loaded, but the local cache could not be updated.");
    }
  }, [loaded, tasks]);

  useEffect(() => {
    const checkReminders = () => {
      const currentDate = formatLocalDateKey();
      const reminders = remindersRef.current;
      let changed = false;

      tasks.forEach((task) => {
        if (task.done || task.trashed || !task.dueDate) return;
        if (task.dueDate > currentDate) return;

        const reminderId = String(task.id);
        if (reminders[reminderId] === task.dueDate) return;

        const dueToday = task.dueDate === currentDate;
        addNotification({
          title: dueToday ? "Task due today" : "Overdue task",
          message: dueToday
            ? `"${task.title}" is due today.`
            : `"${task.title}" was due on ${task.dueDate}.`,
          type: "reminder",
        });
        reminders[reminderId] = task.dueDate;
        changed = true;
      });

      if (changed) {
        try {
          localStorage.setItem(REMINDER_KEY, JSON.stringify(reminders));
        } catch {
          setError("Could not save reminder status in this browser.");
        }
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [tasks]);

  const saveChanges = async (id, changes) => {
    const current = tasks.find((task) => task.id === id);
    if (!current) return null;

    try {
      const updated = userId
        ? normalizeTask(
            (
              await taskApi.put(`/updateTask/${id}`, {
                ...current,
                ...changes,
                userId,
              })
            ).data.task
          )
        : { ...current, ...changes };

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === id ? updated : task))
      );
      if (userId) setPageRevision((revision) => revision + 1);
      setError("");
      return updated;
    } catch (requestError) {
      const message = apiError(requestError, "Unable to save task changes.");
      setError(message);
      addNotification({ title: "Task update failed", message, variant: "error" });
      return null;
    }
  };

  const update = async (id, changes) => {
    const updated = await saveChanges(id, changes);
    if (updated) {
      addNotification({
        title: "Task updated",
        message: `"${updated.title}" has been updated.`,
        type: "task",
      });
    }
    return updated;
  };

  const add = async (data) => {
    const newTask = {
      title: data.title?.trim() || "",
      description: data.description || "",
      assignee: data.assignee || "",
      tag: data.tag || "",
      priority: data.priority || "low",
      dueDate: data.dueDate || "",
      createdAt: new Date().toISOString(),
      done: false,
      starred: false,
      trashed: false,
    };

    try {
      const savedTask = userId
        ? normalizeTask(
            (
              await taskApi.post("/addTask", {
                ...newTask,
                userId,
              })
            ).data.task
          )
        : { ...newTask, id: Date.now() };

      setTasks((currentTasks) => [savedTask, ...currentTasks]);
      if (userId) setPageRevision((revision) => revision + 1);
      setError("");
      addNotification({
        title: "New task added",
        message: `"${savedTask.title}" has been added to your task list.`,
        type: "task",
      });
      return savedTask;
    } catch (requestError) {
      const message = apiError(requestError, "Unable to create task.");
      setError(message);
      addNotification({ title: "Task creation failed", message, variant: "error" });
      return null;
    }
  };

  const toggleDone = async (id) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return null;
    const updated = await saveChanges(id, { done: !task.done });
    if (updated?.done) {
      addNotification({
        title: "Task completed",
        message: `"${updated.title}" has been completed.`,
        type: "complete",
      });
    }
    return updated;
  };

  const toggleStar = async (id) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return null;
    const updated = await saveChanges(id, { starred: !task.starred });
    if (updated?.starred) {
      addNotification({
        title: "Task marked important",
        message: `"${updated.title}" was added to important tasks.`,
        type: "important",
      });
    }
    return updated;
  };

  const trash = async (id) => {
    const task = await saveChanges(id, { trashed: true });
    if (task) {
      addNotification({
        title: "Task moved to trash",
        message: `"${task.title}" was moved to Trash.`,
        type: "trash",
      });
    }
    return task;
  };

  const restore = async (id) => {
    const task = await saveChanges(id, { trashed: false });
    if (task) {
      addNotification({
        title: "Task restored",
        message: `"${task.title}" was restored.`,
        type: "restore",
      });
    }
    return task;
  };

  const remove = async (id) => {
    try {
      if (userId) {
        await taskApi.delete(`/deleteTask/${id}`, {
          data: { userId },
        });
      }
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== id)
      );
      if (userId) setPageRevision((revision) => revision + 1);
      setError("");
      addNotification({
        title: "Task deleted",
        message: "The task was permanently deleted.",
      });
      return true;
    } catch (requestError) {
      const message = apiError(requestError, "Unable to delete task.");
      setError(message);
      addNotification({ title: "Task deletion failed", message, variant: "error" });
      return false;
    }
  };

  const emptyTrash = async () => {
    const trashedTasks = tasks.filter((task) => task.trashed);
    try {
      if (userId) {
        await Promise.all(
          trashedTasks.map((task) =>
            taskApi.delete(`/deleteTask/${task.id}`, {
              data: { userId },
            })
          )
        );
      }
      setTasks((currentTasks) =>
        currentTasks.filter((task) => !task.trashed)
      );
      if (userId) setPageRevision((revision) => revision + 1);
      setError("");
      addNotification({
        title: "Trash emptied",
        message: "All trashed tasks were permanently deleted.",
        type: "trash",
      });
      return true;
    } catch (requestError) {
      const message = apiError(requestError, "Unable to empty trash.");
      setError(message);
      addNotification({ title: "Unable to empty trash", message, variant: "error" });
      return false;
    }
  };

  return {
    tasks,
    loading,
    error,
    pageTasks: userId ? serverPageTasks : localPage.tasks,
    pagination: userId ? serverPagination : localPage.pagination,
    pageLoading,
    pageError,
    retryPage: () => setPageRetry((retry) => retry + 1),
    update,
    add,
    toggleDone,
    toggleStar,
    trash,
    restore,
    remove,
    emptyTrash,
  };
}
