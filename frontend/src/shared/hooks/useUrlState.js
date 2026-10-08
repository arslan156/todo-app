import { useCallback, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

/*
  True while the URL has already been changed in the current tick.
  One click often updates several params (filter + tag + page), so
  every update after the first replaces the history entry instead of
  pushing a new one, and Back undoes the whole click.
*/
let urlChangedThisTick = false;

/*
  Like useState, but the value lives in the URL query string.

  pathname: the page the param belongs to. When set, updating the
  value also navigates to that page (starting with clean params when
  coming from another page). When omitted, the param belongs to the
  page this component was rendered on, and updates are ignored once
  the user has moved to another page (e.g. a late API response).
*/
export default function useUrlState(key, defaultValue = null, pathname) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetPath = pathname || location.pathname;
  const value = searchParams.get(key) ?? defaultValue;

  // Keep the setter stable (navigate changes on every URL change).
  const latest = useRef();
  latest.current = { key, defaultValue, pathname, targetPath, navigate };

  const setValue = useCallback(
    (nextValue, { replace = false } = {}) => {
      const { key, defaultValue, pathname, targetPath, navigate } =
        latest.current;
      const onTargetPage = window.location.pathname === targetPath;
      if (!onTargetPage && !pathname) return;

      // Read the live URL so several updates in one tick are all kept.
      const params = new URLSearchParams(
        onTargetPage ? window.location.search : ""
      );
      const currentValue = params.get(key) ?? defaultValue;
      const resolvedValue =
        typeof nextValue === "function" ? nextValue(currentValue) : nextValue;

      if (
        resolvedValue === null ||
        resolvedValue === undefined ||
        resolvedValue === "" ||
        String(resolvedValue) === String(defaultValue)
      ) {
        params.delete(key);
      } else {
        params.set(key, String(resolvedValue));
      }

      const search = params.toString();
      if (onTargetPage && `?${search}` === (window.location.search || "?")) {
        return;
      }

      navigate(
        { pathname: targetPath, search: search ? `?${search}` : "" },
        { replace: replace || urlChangedThisTick }
      );

      if (!urlChangedThisTick) {
        urlChangedThisTick = true;
        queueMicrotask(() => {
          urlChangedThisTick = false;
        });
      }
    },
    []
  );

  return [value, setValue];
}
