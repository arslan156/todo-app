import React, { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useDispatch } from "react-redux";

import useTasks from "./hooks/useTasks";
import useAuth from "../auth/useAuth";
import { authActions } from "../../app/store";
import useUrlState from "../../shared/hooks/useUrlState";

import MainSidebar from "./MainSidebar";
import Topbar from "./Topbar";
import TodoSidebar from "./TodoSidebar";
import TaskItem from "./TaskItem";
import TaskModal from "./TaskModal";
import TaskViewModal from "./TaskViewModal";
import CalendarView from "./CalendarView";
import DashboardView from "./DashboardView";
import ScrumboardView from "./ScrumboardView";
import MailboxView from "../mailbox/MailboxView";
import NotesView from "../notes/NotesView";
import ChatView from "../chat/ChatView";
import ProfilePage from "../profile/ProfilePage";
import ConfirmModal from "../../shared/components/ConfirmModal";
import { PRIORITY, TASK_TAG_OPTIONS } from "./constants";

import {
  FiSearch,
  FiFileText,
  FiFilter,
  FiPlus,
  FiX,
} from "react-icons/fi";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const THEME_KEY = "todolist.theme.v1";

const getPageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [1];
  if (currentPage > 3) pages.push("start-ellipsis");
  for (
    let pageNumber = Math.max(2, currentPage - 1);
    pageNumber <= Math.min(totalPages - 1, currentPage + 1);
    pageNumber += 1
  ) {
    pages.push(pageNumber);
  }
  if (currentPage < totalPages - 2) pages.push("end-ellipsis");
  pages.push(totalPages);
  return pages;
};

const TodoDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dashboardView = location.pathname === "/todo/dashboard";
  const scrumboardView = location.pathname === "/todo/scrumboard";
  const notesView = location.pathname === "/todo/notes";
  const mailboxView = location.pathname === "/todo/mailbox";
  const chatView = location.pathname === "/todo/chat";
  const profileView = location.pathname === "/todo/profile";
  const calendarView = location.pathname === "/todo/calendar";
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const [emptyTrashConfirmOpen, setEmptyTrashConfirmOpen] = useState(false);
  const [emptyTrashLoading, setEmptyTrashLoading] = useState(false);
  const [filter, setFilter] = useUrlState("filter", "inbox", "/todo");
  const [tag, setTag] = useUrlState("tag", null, "/todo");
  const [priority, setPriority] = useUrlState("priority", null, "/todo");
  const [, setUrlSearch] = useUrlState("search", "", "/todo");
  const [, setUrlPage] = useUrlState("page", "1", "/todo");
  const urlSearch = searchParams.get("search") || "";
  const [query, setQuery] = useState(urlSearch);
  const [debouncedQuery, setDebouncedQuery] = useState(urlSearch.trim());
  const requestedPage = Number(searchParams.get("page"));
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const [pageSize, setPageSize] = useState(10);
  const setPage = (nextPage) => {
    const resolvedPage =
      typeof nextPage === "function" ? nextPage(page) : nextPage;
    setUrlPage(Math.max(1, resolvedPage));
  };

  const {
    tasks,
    loading: loadingTasks,
    error: taskError,
    pageTasks: currentTasks,
    pagination,
    pageLoading,
    pageError,
    retryPage,
    add,
    update,
    toggleDone,
    toggleStar,
    trash,
    restore,
    remove,
    emptyTrash,
  } = useTasks({
    page,
    limit: pageSize,
    search: debouncedQuery,
    filter,
    tag,
    priority,
  });

  const [mainSidebarOpen, setMainSidebarOpen] = useState(() =>
    window.matchMedia("(min-width: 1024px)").matches
  );
  const [mobileTaskFiltersOpen, setMobileTaskFiltersOpen] = useState(false);

  const [modal, setModal] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) === "dark"
        ? "dark"
        : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark", "todo-dark");
    } else {
      document.documentElement.classList.remove("dark", "todo-dark");
    }

    return () => {
      document.documentElement.classList.remove("dark", "todo-dark");
    };
  }, [theme]);

  useEffect(() => {
    const closeMobilePanels = () => {
      if (window.innerWidth < 1024) {
        setMainSidebarOpen(false);
      }
      setMobileTaskFiltersOpen(false);
    };

    window.addEventListener("resize", closeMobilePanels);
    return () => window.removeEventListener("resize", closeMobilePanels);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (urlSearch !== query) {
      setQuery(urlSearch);
      setDebouncedQuery(urlSearch.trim());
    }
  }, [urlSearch, query]);

  /* =====================================================
     COUNTS
  ===================================================== */

  const counts = useMemo(() => {
    const activeTasks = tasks.filter(
      (task) => !task.trashed
    );

    return {
      inbox: activeTasks.length,

      done: activeTasks.filter(
        (task) => task.done
      ).length,

      important: activeTasks.filter(
        (task) => task.starred
      ).length,

      due: activeTasks.filter(
        (task) => task.dueDate && !task.done
      ).length,

      trash: tasks.filter(
        (task) => task.trashed
      ).length,

      tags: TASK_TAG_OPTIONS.reduce((tagCounts, taskTag) => {
        tagCounts[taskTag] = activeTasks.filter(
          (task) => task.tag === taskTag
        ).length;
        return tagCounts;
      }, {}),

      priorities: Object.keys(PRIORITY).reduce(
        (priorityCounts, level) => {
          priorityCounts[level] = activeTasks.filter(
            (task) => task.priority === level
          ).length;
          return priorityCounts;
        },
        {}
      ),
    };
  }, [tasks]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = pagination.totalPages;
  const pageNumbers = getPageNumbers(page, totalPages);
  const waitingForSearch = query.trim() !== debouncedQuery;

  useEffect(() => {
    if (location.pathname === "/todo" && page > totalPages) {
      setPage(totalPages);
    }
  }, [location.pathname, page, totalPages]);

  /* =====================================================
     MODAL
  ===================================================== */

  const openAddModal = () => {
    setModal("new");
  };

  const openEditModal = (task) => {
    setModal(task);
  };

  const saveTask = async (data) => {
    let savedTask = null;
    if (modal === "new") {
      savedTask = await add(data);
    } else if (modal) {
      savedTask = await update(modal.id, data);
    }

    if (savedTask) setModal(null);
  };

  /* =====================================================
     FILTER HANDLERS
  ===================================================== */

  const handleFilter = (value) => {
    setFilter(value);
    setPage(1);
  };

  const handleTag = (value) => {
    setTag(value);
    setPage(1);
  };

  const handlePriority = (value) => {
    setPriority(value);
    setPage(1);
  };

  const clearFilters = () => {
    setFilter("inbox");
    setTag(null);
    setPriority(null);
    handleSearch("");
  };

  const showDueTasks = () => {
    setFilter("due");
    setTag(null);
    setPriority(null);
    handleSearch("");
  };

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme =
        currentTheme === "dark" ? "light" : "dark";

      try {
        localStorage.setItem(THEME_KEY, nextTheme);
      } catch {
        // Keep the selected theme for this session.
      }

      return nextTheme;
    });
  };

  const handleLogout = async () => {
    await logout();
    dispatch(authActions.logout());
    navigate("/signin");
  };

  /* =====================================================
     SEARCH
  ===================================================== */

  const handleSearch = (value) => {
    setQuery(value);
    setUrlSearch(value.trim(), { replace: true });
    setUrlPage(1, { replace: true });
  };

  /* =====================================================
     TOPBAR SEARCH RESULT CLICK
  ===================================================== */

  const handleTopbarTaskSelect = (task) => {
    /*
      Make sure the selected task can actually
      be seen in the main task area.
    */

    if (task.trashed) {
      setFilter("trash");
    } else if (task.done) {
      setFilter("done");
    } else {
      setFilter("inbox");
    }

    setTag(null);
    setPriority(null);

    /*
      Search is cleared so the normal task list
      becomes visible.
    */
    handleSearch("");
  };

  const showCalendarView = () => {
    navigate("/todo/calendar");
    setMainSidebarOpen(window.matchMedia("(min-width: 1024px)").matches);
  };

  const showScrumboardView = () => {
    navigate("/todo/scrumboard");
    setMainSidebarOpen(window.matchMedia("(min-width: 1024px)").matches);
  };

  const showDashboardView = () => {
    navigate("/todo/dashboard");
    setMainSidebarOpen(window.matchMedia("(min-width: 1024px)").matches);
  };

  const showNotesView = () => {
    navigate("/todo/notes");
    setMainSidebarOpen(window.matchMedia("(min-width: 1024px)").matches);
  };

  const showMailboxView = () => {
    navigate("/todo/mailbox");
    setMainSidebarOpen(window.matchMedia("(min-width: 1024px)").matches);
  };

  const showChatView = () => {
    navigate("/todo/chat");
    setMainSidebarOpen(window.matchMedia("(min-width: 1024px)").matches);
  };

  const showTasksView = () => {
    navigate("/todo");
    setMainSidebarOpen(window.matchMedia("(min-width: 1024px)").matches);
  };

  return (
    <div
      className={`todo-dashboard flex h-screen h-dvh overflow-hidden bg-[#f7f8fa] text-[#3b3f5c] ${
        theme === "dark" ? "todo-dark" : ""
      }`}
    >

      {/* MAIN SIDEBAR */}

      <MainSidebar
        open={mainSidebarOpen}
        onClose={() =>
          setMainSidebarOpen(false)
        }
        onCollapse={() =>
          setMainSidebarOpen(false)
        }
        onDashboard={showDashboardView}
        onCalendar={showCalendarView}
        onScrumboard={showScrumboardView}
        onTasks={showTasksView}
        onNotes={showNotesView}
        onMailbox={showMailboxView}
        onChat={showChatView}
        dashboardViewActive={dashboardView}
        scrumboardViewActive={scrumboardView}
        tasksViewActive={!dashboardView && !scrumboardView && !notesView && !mailboxView && !chatView && !profileView && !calendarView}
        notesViewActive={notesView}
        mailboxViewActive={mailboxView}
        chatViewActive={chatView}
        calendarViewActive={calendarView}
      />

      {/* MAIN AREA */}

      <div className="flex min-w-0 flex-1 flex-col">

        {/* TOPBAR */}

        <Topbar
          sidebarOpen={mainSidebarOpen}
          onToggleSidebar={() =>
            setMainSidebarOpen((open) => !open)
          }
          searchQuery={query}
          searchTasks={tasks}
          searchResults={currentTasks}
          searchLoading={pageLoading || query.trim() !== debouncedQuery}
          searchError={pageError}
          onSearch={handleSearch}
          onTaskSelect={
            handleTopbarTaskSelect
          }
          onCompose={openAddModal}
          onChat={showChatView}
          onMailbox={showMailboxView}
          onDueTasks={showDueTasks}
          theme={theme}
          onTheme={toggleTheme}
          user={user}
          onLogout={handleLogout}
          onProfile={() => navigate("/todo/profile")}
          onCalendar={showCalendarView}
          calendarViewActive={calendarView}
          onTasks={showTasksView}
        />

        {/* CONTENT */}

        <main className="min-h-0 flex-1 overflow-hidden p-2 sm:p-4">

          <div className="mx-auto flex h-full min-h-0 w-full gap-3">

            {/* TODO SIDEBAR */}

            {!calendarView && !profileView && !dashboardView && !scrumboardView && !notesView && !mailboxView && !chatView && (
              <TodoSidebar
                mobileOpen={mobileTaskFiltersOpen}
                onMobileClose={() => setMobileTaskFiltersOpen(false)}
                filter={filter}
                tag={tag}
                priority={priority}
                counts={counts}
                onFilter={(value) => {
                  handleFilter(value);
                  setMobileTaskFiltersOpen(false);
                }}
                onTag={(value) => {
                  handleTag(value);
                  setMobileTaskFiltersOpen(false);
                }}
                onPriority={(value) => {
                  handlePriority(value);
                  setMobileTaskFiltersOpen(false);
                }}
                onAdd={() => {
                  setMobileTaskFiltersOpen(false);
                  openAddModal();
                }}
              />
            )}

            {/* TASK CONTENT */}
            <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#e0e6ed] dark:border-[#1b2e4b] bg-white dark:bg-[#0e1726]">

              {chatView ? (
                <ChatView />
              ) : mailboxView ? (
                <MailboxView user={user} />
              ) : notesView ? (
                <NotesView user={user} />
              ) : profileView ? (
                <ProfilePage />
              ) : dashboardView ? (
                <DashboardView
                  tasks={tasks}
                  loading={loadingTasks}
                  error={taskError}
                  onAdd={openAddModal}
                  onEdit={openEditModal}
                  onCalendar={showCalendarView}
                />
              ) : scrumboardView ? (
                <ScrumboardView
                  tasks={tasks}
                  onEdit={openEditModal}
                  onAdd={openAddModal}
                  onToggleDone={toggleDone}
                  onToggleStar={toggleStar}
                  onTrash={trash}
                />
              ) : calendarView ? (
                <CalendarView
                  tasks={tasks}
                  onEdit={openEditModal}
                  onAdd={openAddModal}
                />
              ) : (
                <>
              {taskError && (
                  <div
                    role="alert"
                    className="m-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {taskError}
                  </div>
              )}
              {/* SEARCH + RANGE */}

              {/* SEARCH + PAGINATION */}
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#e0e6ed] dark:border-[#1b2e4b] bg-white dark:bg-[#0e1726] p-3 sm:px-5 sm:py-3.5">
                <div className="flex min-w-0 w-full max-w-[460px] items-center gap-2 lg:max-w-[280px]">
                  <button
                    type="button"
                    onClick={() => setMobileTaskFiltersOpen(true)}
                    aria-label="Open task filters"
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-[#e0e6ed] dark:border-[#1b2e4b] bg-[#f4f6f8] dark:bg-[#1b2e4b] px-2.5 text-xs font-medium text-[#3b3f5c] dark:text-[#e0e6ed] lg:hidden"
                  >
                    <FiFilter size={14} />
                    <span>Filters</span>
                  </button>

                  <div className="relative min-w-0 flex-1">
                    <input
                      type="text"
                      value={query}
                      aria-label="Search tasks"
                      autoComplete="off"
                      onChange={(event) => handleSearch(event.target.value)}
                      placeholder="Search Task..."
                      className="h-9 w-full rounded-md border border-[#e0e6ed] dark:border-[#1b2e4b] bg-white dark:bg-[#1b2e4b]/30 px-3.5 pr-9 text-xs text-[#0e1726] dark:text-[#e0e6ed] placeholder-[#888ea8] outline-none transition focus:border-[#4361ee]"
                    />
                    {!query ? (
                      <FiSearch
                        size={15}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#888ea8]"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSearch("")}
                        aria-label="Clear search"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888ea8] hover:text-[#0e1726] dark:hover:text-[#e0e6ed]"
                      >
                        <FiX size={14} />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={openAddModal}
                    aria-label="Add task"
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md bg-[#4361ee] px-3 text-xs font-semibold text-white transition hover:bg-[#3451d1] lg:hidden"
                  >
                    <FiPlus size={15} />
                    <span>Add</span>
                  </button>
                </div>

                {/* Right Pagination Controls: 1-10 of 24 < > */}
                <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                  <span aria-live="polite" className="whitespace-nowrap text-xs font-medium text-[#888ea8] dark:text-[#64748b]">
                    {pagination.totalItems === 0
                      ? "0 of 0"
                      : `${(page - 1) * pageSize + 1}-${Math.min(
                          page * pageSize,
                          pagination.totalItems
                        )} of ${pagination.totalItems}`}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="Previous page"
                      title="Previous page"
                      disabled={page === 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-[#e0e6ed] dark:border-[#1b2e4b] bg-white dark:bg-[#0e1726] text-sm text-[#888ea8] transition hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b] hover:text-[#0e1726] dark:hover:text-[#e0e6ed] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      aria-label="Next page"
                      title="Next page"
                      disabled={page === totalPages || totalPages === 0}
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-[#e0e6ed] dark:border-[#1b2e4b] bg-white dark:bg-[#0e1726] text-sm text-[#888ea8] transition hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b] hover:text-[#0e1726] dark:hover:text-[#e0e6ed] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>

              {/* ACTIVE FILTERS */}

              {(tag ||
                priority ||
                query) && (
                <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#e8ebef] bg-white px-4 py-3">

                  {tag && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                      Tag: {tag}
                    </span>
                  )}

                  {priority && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#4361ee]">
                      Priority: {priority}
                    </span>
                  )}

                  {query && (
                    <span className="max-w-[250px] truncate rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                      Search: {query}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="ml-auto text-xs font-medium text-red-500 transition hover:underline"
                  >
                    Clear filters
                  </button>

                </div>
              )}

              {/* EMPTY TRASH */}

              {filter === "trash" &&
                counts.trash > 0 && (
                  <div className="flex shrink-0 justify-end border-b border-[#e8ebef] px-4 py-3">

                    <button
                      type="button"
                      onClick={() => setEmptyTrashConfirmOpen(true)}
                      className="text-sm font-medium text-rose-500 transition hover:text-rose-600 hover:underline"
                    >
                      Empty Trash
                    </button>
                  </div>
                )}

              {/* TASK LIST */}

              {pageLoading || waitingForSearch ? (
                <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-[#8791a5]">
                  Loading tasks…
                </div>
              ) : pageError ? (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
                  <p role="alert" className="text-sm text-red-600">
                    {pageError}
                  </p>
                  <button
                    type="button"
                    onClick={retryPage}
                    className="mt-3 rounded-md bg-[#4361ee] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3451d1]"
                  >
                    Retry
                  </button>
                </div>
              ) : currentTasks.length > 0 ? (
                <div className="modern-scrollbar min-h-0 flex-1 overflow-auto">

                  <div className="min-w-0 w-full">

                    {currentTasks.map(
                      (task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggleDone={
                            toggleDone
                          }
                          onToggleStar={
                            toggleStar
                          }
                          onTrash={trash}
                          onRestore={restore}
                          onEdit={
                            openEditModal
                          }
                          onRemove={remove}
                          onView={(t) => setViewingTask(t)}
                        />
                      )
                    )}

                  </div>

                </div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 text-center">

                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f1f3f5] text-[#94a3b8]">
                    <FiFileText
                      size={25}
                      strokeWidth={1.7}
                    />
                  </div>

                  <h3 className="text-base font-semibold text-[#1b2438]">
                    No tasks found
                  </h3>

                  <p className="mt-1 max-w-sm text-sm text-[#94a3b8]">
                    {query
                      ? "No tasks match your search."
                      : filter === "trash"
                      ? "Your trash is empty."
                      : filter === "done"
                      ? "You have no completed tasks yet."
                      : filter === "important"
                      ? "You have no important tasks."
                      : tag
                      ? `No tasks found with the ${tag} tag.`
                      : priority
                      ? `No ${priority} priority tasks found.`
                      : "There are no tasks in this section."}
                  </p>

                  {filter !== "trash" && (
                    <button
                      type="button"
                      onClick={openAddModal}
                      className="mt-4 rounded-md bg-[#4361ee] px-5 py-2.5 text-sm font-medium text-white shadow-[0_10px_20px_-10px_#4361ee] transition hover:bg-[#3451d1] active:scale-[0.98]"
                    >
                      Add New Task
                    </button>
                  )}

                </div>
              )}

              {/* PAGINATION */}

              {totalPages > 1 && (
                <div className="flex shrink-0 items-center justify-center gap-2 border-t border-[#e8ebef] bg-white px-4 py-4">

                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(
                          1,
                          current - 1
                        )
                      )
                    }
                    className="h-8 rounded-md bg-[#f4f6f8] px-3 text-sm text-[#64748b] transition hover:bg-[#e9edf2] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {Array.from(
                    {
                      length: totalPages,
                    },
                    (_, index) =>
                      index + 1
                  ).map((number) => (
                    <button
                      key={number}
                      type="button"
                      onClick={() =>
                        setPage(number)
                      }
                      className={`h-8 min-w-8 rounded-md px-2 text-sm transition ${
                        page === number
                          ? "bg-[#4361ee] text-white shadow-sm"
                          : "bg-[#f4f6f8] text-[#64748b] hover:bg-[#e9edf2]"
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={
                      page === totalPages
                    }
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          totalPages,
                          current + 1
                        )
                      )
                    }
                    className="h-8 rounded-md bg-[#f4f6f8] px-3 text-sm text-[#64748b] transition hover:bg-[#e9edf2] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>

                </div>
              )}

                </>
              )}

            </section>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="hidden shrink-0 px-5 py-3 text-xs text-[#888ea8] dark:text-[#506690] sm:block">
          © 2026. Vristo All rights reserved.
        </footer>

      </div>

      {/* VIEW TASK DETAIL MODAL */}
      {viewingTask && (
        <TaskViewModal
          task={viewingTask}
          onClose={() => setViewingTask(null)}
          onEdit={(t) => {
            setViewingTask(null);
            openEditModal(t);
          }}
        />
      )}

      {/* ADD / EDIT MODAL */}
      {modal && (
        <TaskModal
          task={modal === "new" ? null : modal}
          onSave={saveTask}
          onClose={() => setModal(null)}
        />
      )}

      {/* EMPTY TRASH CONFIRMATION MODAL */}
      <ConfirmModal
        open={emptyTrashConfirmOpen}
        title="Empty Trash?"
        message="Permanently delete all trashed tasks? This action cannot be undone."
        confirmText="Empty Trash"
        variant="danger"
        onClose={() => setEmptyTrashConfirmOpen(false)}
        loading={emptyTrashLoading}
        onConfirm={async () => {
          setEmptyTrashLoading(true);
          try {
            if (await emptyTrash()) {
              setPage(1);
              setEmptyTrashConfirmOpen(false);
            }
          } finally {
            setEmptyTrashLoading(false);
          }
        }}
      />
    </div>
  );
};

export default TodoDashboard;