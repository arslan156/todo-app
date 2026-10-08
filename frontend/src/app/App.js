import React, { useCallback, useEffect, useRef, useState } from "react";

import Navbar from "../shared/layout/Navbar";
import Home from "../features/home/Home";
import Footer from "../shared/layout/Footer";
import About from "../features/about/About";
import Signup from "../features/auth/Signup";
import SignIn from "../features/auth/SignIn";
import ForgotPassword from "../features/auth/ForgotPassword";
import ResetPassword from "../features/auth/ResetPassword";
import TodoDashboard from "../features/tasks/TodoDashboard";
import { authApi } from "../services/api";
import {
  clearSession,
  getLastSessionActivity,
  IDLE_TIMEOUT_MS,
  initializeSessionActivity,
  isSessionIdleExpired,
  LAST_ACTIVITY_KEY,
  markSessionActivity,
  readSessionUser,
  saveSession,
  SESSION_CHANGED_EVENT,
} from "../features/auth/session";

import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useDispatch } from "react-redux";
import { authActions } from "./store";

const TODO_PATHS = [
  "/todo",
  "/todo/dashboard",
  "/todo/scrumboard",
  "/todo/calendar",
  "/todo/notes",
  "/todo/mailbox",
  "/todo/chat",
  "/todo/profile",
];

// Pages that need a signed-in user.
const RequireAuth = ({ children }) => {
  const location = useLocation();
  if (!readSessionUser()) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }
  return children;
};

// Sign in / sign up are skipped when already signed in.
const GuestOnly = ({ children }) =>
  readSessionUser() ? <Navigate to="/todo" replace /> : children;

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const dispatch = useDispatch();
  const [checkingSession, setCheckingSession] = useState(true);

  const expireSession = useCallback(() => {
    const expiredAt = getLastSessionActivity();
    clearSession({ preserveActivity: true });
    dispatch(authActions.logout());
    navigateRef.current("/signin?expired=1", { replace: true });

    authApi
      .post("/logout")
      .then(() => {
        if (getLastSessionActivity() === expiredAt) {
          localStorage.removeItem(LAST_ACTIVITY_KEY);
        }
      })
      .catch((error) => {
        console.warn(
          "Unable to clear the server session after inactivity:",
          error.message
        );
      });
  }, [dispatch]);

  const isTodoPage =
    location.pathname === "/todo" ||
    location.pathname.startsWith("/todo/");
  // These pages have their own full-screen layout.
  const isAuthPage = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ].includes(location.pathname);
  const showSiteChrome = !isTodoPage && !isAuthPage;

  // The login cookie is the source of truth; refresh the stored user from it.
  useEffect(() => {
    let active = true;

    if (isSessionIdleExpired()) {
      expireSession();
      setCheckingSession(false);
      return () => {
        active = false;
      };
    }

    authApi
      .get("/me")
      .then(({ data }) => {
        if (!active) return;
        initializeSessionActivity();
        saveSession(data.user);
        dispatch(authActions.login());
      })
      .catch(() => {
        if (!active) return;
        clearSession();
        dispatch(authActions.logout());
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });
    return () => {
      active = false;
    };
  }, [dispatch, expireSession]);

  useEffect(() => {
    if (checkingSession) return undefined;

    let timeoutId;
    let lastRecordedActivity = 0;
    let hasSession = Boolean(readSessionUser());

    const clearIdleTimer = () => {
      window.clearTimeout(timeoutId);
    };

    const scheduleIdleTimer = () => {
      clearIdleTimer();
      if (!readSessionUser()) return;

      const lastActivity = getLastSessionActivity();
      if (lastActivity === null) {
        initializeSessionActivity();
        scheduleIdleTimer();
        return;
      }

      const remaining = IDLE_TIMEOUT_MS - (Date.now() - lastActivity);
      if (remaining <= 0) {
        expireSession();
        return;
      }
      timeoutId = window.setTimeout(expireSession, remaining);
    };

    const onActivity = () => {
      if (!readSessionUser()) return;
      if (isSessionIdleExpired()) {
        expireSession();
        return;
      }

      const now = Date.now();
      if (now - lastRecordedActivity >= 1000) {
        markSessionActivity(now);
        lastRecordedActivity = now;
      }
      scheduleIdleTimer();
    };

    const syncSession = () => {
      const signedIn = Boolean(readSessionUser());
      if (!signedIn && hasSession) {
        clearIdleTimer();
        sessionStorage.removeItem("id");
        navigate("/signin?expired=1", { replace: true });
      } else if (signedIn) {
        scheduleIdleTimer();
      }
      hasSession = signedIn;
    };

    const onResume = () => {
      if (isSessionIdleExpired()) {
        expireSession();
      } else {
        scheduleIdleTimer();
      }
    };

    const activityEvents = [
      "pointerdown",
      "pointermove",
      "keydown",
      "touchstart",
      "scroll",
    ];
    activityEvents.forEach((eventName) =>
      document.addEventListener(eventName, onActivity, { passive: true })
    );
    document.addEventListener("visibilitychange", onResume);
    window.addEventListener("focus", onResume);
    window.addEventListener("pageshow", onResume);
    window.addEventListener("storage", syncSession);
    window.addEventListener(SESSION_CHANGED_EVENT, syncSession);
    scheduleIdleTimer();

    return () => {
      clearIdleTimer();
      activityEvents.forEach((eventName) =>
        document.removeEventListener(eventName, onActivity)
      );
      document.removeEventListener("visibilitychange", onResume);
      window.removeEventListener("focus", onResume);
      window.removeEventListener("pageshow", onResume);
      window.removeEventListener("storage", syncSession);
      window.removeEventListener(SESSION_CHANGED_EVENT, syncSession);
    };
  }, [checkingSession, expireSession, navigate]);

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div>
      {showSiteChrome && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        {TODO_PATHS.map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <RequireAuth>
                <TodoDashboard />
              </RequireAuth>
            }
          />
        ))}
        <Route
          path="/signup"
          element={
            <GuestOnly>
              <Signup />
            </GuestOnly>
          }
        />
        <Route
          path="/signin"
          element={
            <GuestOnly>
              <SignIn />
            </GuestOnly>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>

      {showSiteChrome && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
