import { useEffect, useState } from "react";
import {
  authApi,
  registerRequest,
  signInRequest,
} from "../../services/api";
import {
  clearSession,
  readSessionUser,
  saveSession,
  SESSION_CHANGED_EVENT,
} from "./session";

const useAuth = () => {
  const [user, setUser] = useState(readSessionUser);

  useEffect(() => {
    const syncSession = () => setUser(readSessionUser());
    window.addEventListener(SESSION_CHANGED_EVENT, syncSession);
    window.addEventListener("storage", syncSession);
    return () => {
      window.removeEventListener(SESSION_CHANGED_EVENT, syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  const login = (userData) => {
    if (userData?._id) saveSession(userData, { resetActivity: true });
    setUser(userData);
  };

  const completeAuthentication = ({ data }) => {
    login(data.user);
    return data;
  };

  const signIn = (credentials) =>
    signInRequest(credentials).then(completeAuthentication);

  const signUp = (credentials) =>
    registerRequest(credentials).then(completeAuthentication);

  // Clears the cookie on the server, then the local copy of the user.
  const logout = async () => {
    try {
      await authApi.post("/logout");
    } catch {
      // Still sign out locally if the server can't be reached.
    }
    clearSession();
    setUser(null);
  };

  return {
    user,
    login,
    signIn,
    signUp,
    logout,
    isLoggedIn: !!user,
  };
};

export default useAuth;
