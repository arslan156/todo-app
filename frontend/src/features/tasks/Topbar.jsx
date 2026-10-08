import React, { useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiEdit3,
  FiMessageSquare,
  FiSearch,
  FiSun,
  FiMoon,
  FiBell,
  FiMail,
  FiX,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiClock,
  FiStar,
} from "react-icons/fi";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "./notificationUtils";

const IconButton = ({ children, onClick, title, active = false }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-150 ${
      active
        ? "bg-[#eef2ff] dark:bg-[#1b2e4b] text-[#4361ee]"
        : "text-[#3b3f5c] dark:text-[#888ea8] hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b] hover:text-[#4361ee]"
    }`}
  >
    {children}
  </button>
);

const SquareIconButton = ({ children, onClick, title, active = false }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e0e6ed] dark:border-[#1b2e4b] transition-all duration-150 ${
      active
        ? "border-[#4361ee] bg-[#eef2ff] dark:bg-[#1b2e4b] text-[#4361ee]"
        : "bg-white dark:bg-[#0e1726] text-[#3b3f5c] dark:text-[#888ea8] hover:border-[#4361ee] hover:text-[#4361ee]"
    }`}
  >
    {children}
  </button>
);

export default function Topbar({
  sidebarOpen = true,
  onToggleSidebar,
  searchQuery = "",
  searchTasks = [],
  searchResults = [],
  searchLoading = false,
  searchError = "",
  onSearch,
  onTaskSelect,
  onCalendar,
  onCompose,
  onChat,
  onMailbox,
  onTheme,
  theme = "light",
  user = null,
  onLogout,
  onProfile,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState(getNotifications());

  useEffect(() => {
    const handleNotification = () => {
      setNotifications(getNotifications());
    };
    window.addEventListener("todo:notification", handleNotification);
    return () =>
      window.removeEventListener("todo:notification", handleNotification);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasUnread = unreadCount > 0;

  const displayName = user?.username || user?.name || "Vristo User";
  const userInitial = displayName.trim().charAt(0).toUpperCase() || "V";

  return (
    <>
      {/* Topbar Header */}
      <header className="relative z-30 flex h-[62px] shrink-0 items-center justify-between border-b border-[#e0e6ed] dark:border-[#1b2e4b] bg-white dark:bg-[#0e1726] px-4 sm:px-6">
        {/* Left: Collapse toggle + 3 Shortcuts + Search */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {!sidebarOpen && (
            <IconButton onClick={onToggleSidebar} title="Open sidebar">
              <FiMenu size={18} />
            </IconButton>
          )}

          {/* Quick Action Shortcuts */}
          <div className="flex items-center gap-1.5">
            <SquareIconButton
              onClick={onCalendar}
              title="Calendar"
            >
              <FiCalendar size={17} />
            </SquareIconButton>

            <SquareIconButton
              onClick={onCompose}
              title="Add Task / Note"
            >
              <FiEdit3 size={17} />
            </SquareIconButton>

            <SquareIconButton
              onClick={onChat}
              title="Chat"
            >
              <FiMessageSquare size={17} />
            </SquareIconButton>
          </div>

          {/* Center Search Pill */}
          <div className="relative ml-1 hidden w-[210px] md:block lg:w-[260px]">
            <FiSearch
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888ea8]"
            />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => {
                if (searchQuery.trim()) setSearchOpen(true);
              }}
              onChange={(e) => {
                onSearch?.(e.target.value);
                setSearchOpen(e.target.value.trim().length > 0);
              }}
              placeholder="Search..."
              className="h-9 w-full rounded-full border border-[#e0e6ed] dark:border-[#1b2e4b] bg-white dark:bg-[#1b2e4b]/40 pl-9 pr-8 text-[13px] text-[#0e1726] dark:text-[#e0e6ed] placeholder-[#888ea8] outline-none transition focus:border-[#4361ee]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearch?.("");
                  setSearchOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888ea8] hover:text-[#0e1726] dark:hover:text-[#e0e6ed]"
              >
                <FiX size={14} />
              </button>
            )}

            {/* Search Dropdown */}
            {searchOpen && searchQuery.trim() && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setSearchOpen(false)}
                />
                <div className="absolute left-0 top-11 z-50 w-[320px] overflow-hidden rounded-xl border border-[#e0e6ed] dark:border-[#1b2e4b] bg-white dark:bg-[#0e1726] shadow-xl">
                  <div className="border-b border-[#f1f2f3] dark:border-[#1b2e4b] px-4 py-2.5">
                    <p className="text-xs text-[#888ea8]">
                      Search results for "{searchQuery}"
                    </p>
                  </div>
                  <div className="max-h-[280px] overflow-y-auto">
                    {searchLoading ? (
                      <p className="p-4 text-center text-xs text-[#888ea8]">
                        Searching...
                      </p>
                    ) : searchResults.length > 0 ? (
                      searchResults.slice(0, 6).map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => {
                            onTaskSelect?.(task);
                            setSearchOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 border-b border-[#f1f2f3] dark:border-[#1b2e4b] px-4 py-2.5 text-left transition hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b]"
                        >
                          <FiCheckCircle
                            size={14}
                            className={
                              task.done ? "text-emerald-500" : "text-[#888ea8]"
                            }
                          />
                          <span className="truncate text-xs font-medium text-[#0e1726] dark:text-[#e0e6ed]">
                            {task.title}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-center text-xs text-[#888ea8]">
                        No matching tasks found
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Controls: Theme, Mail, Bell, Avatar */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Theme switcher */}
          <button
            type="button"
            onClick={onTheme}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e0e6ed] dark:border-[#1b2e4b] bg-white dark:bg-[#0e1726] text-[#888ea8] hover:text-[#4361ee] transition"
          >
            {theme === "dark" ? (
              <FiSun size={17} className="text-[#e2a03f]" />
            ) : (
              <FiMoon size={17} />
            )}
          </button>

          {/* Mail icon shortcut */}
          <button
            type="button"
            onClick={onMailbox}
            title="Mailbox"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-[#888ea8] hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b] hover:text-[#4361ee] transition"
          >
            <FiMail size={18} />
          </button>

          {/* Bell Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationOpen((prev) => !prev)}
              title="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#888ea8] hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b] hover:text-[#4361ee] transition"
            >
              <FiBell size={18} />
              {/* Active green dot */}
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#00ab55] ring-2 ring-white dark:ring-[#0e1726]" />
            </button>

            {notificationOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotificationOpen(false)}
                />
                <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-[#e0e6ed] dark:border-[#1b2e4b] bg-white dark:bg-[#0e1726] shadow-2xl animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-[#f1f2f3] dark:border-[#1b2e4b] px-4 py-3">
                    <h4 className="text-sm font-semibold text-[#0e1726] dark:text-[#e0e6ed]">
                      Notification
                    </h4>
                    {hasUnread && (
                      <button
                        type="button"
                        onClick={() => {
                          markAllNotificationsRead();
                          setNotifications(getNotifications());
                        }}
                        className="text-xs text-[#4361ee] hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto divide-y divide-[#f1f2f3] dark:divide-[#1b2e4b]">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            setNotifications(getNotifications());
                          }}
                          className={`cursor-pointer px-4 py-3 transition hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b] ${
                            !n.read ? "bg-[#f8fafc] dark:bg-[#1b2e4b]/30" : ""
                          }`}
                        >
                          <p className="text-xs font-semibold text-[#0e1726] dark:text-[#e0e6ed]">
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[#888ea8]">
                            {n.message}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="p-4 text-center text-xs text-[#888ea8]">
                        No notifications
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#e0e6ed] dark:border-[#1b2e4b] bg-[#e8edf4] dark:bg-[#1b2e4b] font-semibold text-[#4361ee] shadow-sm transition hover:ring-2 hover:ring-[#4361ee]/30"
              title={displayName}
            >
              {userInitial}
            </button>

            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-xl border border-[#e0e6ed] dark:border-[#1b2e4b] bg-white dark:bg-[#0e1726] shadow-xl animate-fadeIn">
                  <div className="border-b border-[#f1f2f3] dark:border-[#1b2e4b] px-4 py-3">
                    <p className="truncate text-sm font-semibold text-[#0e1726] dark:text-[#e0e6ed]">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-[#888ea8]">
                      {user?.email || "user@vristo.com"}
                    </p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onProfile?.();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#3b3f5c] dark:text-[#e0e6ed] hover:bg-[#f4f5f8] dark:hover:bg-[#1b2e4b]"
                    >
                      <FiUser size={15} />
                      <span>Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onLogout?.();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#e7515a] hover:bg-[#e7515a]/10"
                    >
                      <FiLogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}