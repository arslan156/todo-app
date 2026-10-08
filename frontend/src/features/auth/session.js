/*
  The login token lives in an httpOnly cookie the page can't read.
  The signed-in user's public details are kept here for the UI, and
  the id is what the feature pages send as userId (the backend checks
  it against the cookie).
*/
const USER_KEY = "loggedInUser";
export const LAST_ACTIVITY_KEY = "lastSessionActivity";
export const SESSION_CHANGED_EVENT = "todo:session-changed";
export const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

const notifySessionChanged = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
  }
};

export const readSessionUser = () => {
  try {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const saveSession = (user, { resetActivity = false } = {}) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  sessionStorage.setItem("id", user._id);
  if (resetActivity) markSessionActivity();
  notifySessionChanged();
};

export const clearSession = ({ preserveActivity = false } = {}) => {
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem("id");
  if (!preserveActivity) localStorage.removeItem(LAST_ACTIVITY_KEY);
  notifySessionChanged();
};

export const getLastSessionActivity = () => {
  const value = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
  return Number.isFinite(value) && value > 0 ? value : null;
};

export const markSessionActivity = (now = Date.now()) => {
  localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
};

export const initializeSessionActivity = () => {
  if (getLastSessionActivity() === null) markSessionActivity();
};

export const isSessionIdleExpired = (now = Date.now()) => {
  const lastActivity = getLastSessionActivity();
  return lastActivity !== null && now - lastActivity >= IDLE_TIMEOUT_MS;
};
