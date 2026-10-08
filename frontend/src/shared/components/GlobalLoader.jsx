import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { subscribeLoading } from "../loading/loadingTracker";

// Keep the loader on screen long enough to be seen, even for fast requests.
const MIN_VISIBLE_MS = 600;

export default function GlobalLoader() {
  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef(0);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeLoading((pending) => {
      if (pending > 0) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
        setVisible((wasVisible) => {
          if (!wasVisible) shownAtRef.current = Date.now();
          return true;
        });
        return;
      }

      const elapsed = Date.now() - shownAtRef.current;
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => {
        hideTimerRef.current = null;
        setVisible(false);
      }, remaining);
    });

    return () => {
      unsubscribe();
      window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!visible) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/20"
    >
      <span className="sr-only">Loading...</span>
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/40 border-t-[#7367f0]" />
    </div>,
    document.body
  );
}
