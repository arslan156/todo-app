import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function NotificationToast() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const handleNotification = (event) => {
      if (!event.detail) return;
      setNotification(event.detail);
    };

    window.addEventListener("todo:notification", handleNotification);
    return () =>
      window.removeEventListener("todo:notification", handleNotification);
  }, []);

  useEffect(() => {
    if (!notification) return undefined;
    const timeout = window.setTimeout(() => setNotification(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [notification]);

  if (!notification) return null;

  const isError = notification.variant === "error";

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-1 z-[9999] flex justify-center px-4">
      <div
        role={isError ? "alert" : "status"}
        className={`notification-card-in flex w-fit max-w-full items-center gap-3 rounded-md bg-[#3d4164] px-5 py-4 text-white shadow-xl ${
          isError ? "ring-1 ring-rose-400/40" : ""
        }`}
      >
        <span
          className={`notification-circle flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] ${
            isError
              ? "border-rose-400 text-rose-300"
              : "border-emerald-400 text-emerald-300"
          }`}
        >
          {isError ? (
            <span className="text-lg font-bold leading-none">!</span>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline className="notification-tick" points="5 12 10 17 20 7" />
            </svg>
          )}
        </span>
        <div className="notification-text min-w-0">
          <p className="text-base font-semibold leading-snug">
            {notification.message || notification.title}
          </p>
          {notification.message && notification.title !== notification.message && (
            <p className="mt-0.5 text-xs text-slate-200/80">
              {notification.title}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
