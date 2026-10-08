import axios from "axios";
import { clearSession } from "../features/auth/session";
import { startLoading, stopLoading } from "../shared/loading/loadingTracker";

const baseURL =
  process.env.REACT_APP_API_URL || "http://localhost:1000/api";

// withCredentials sends the httpOnly login cookie with every request.
const createApi = (version) =>
  axios.create({
    baseURL: `${baseURL}/${version}`,
    withCredentials: true,
  });

export const authApi = createApi("v1");
export const taskApi = createApi("v2");
export const notesApi = createApi("v3");
export const chatApi = createApi("v4");
export const mailboxApi = createApi("v5");

export const signInRequest = ({ email, password, remember }) =>
  authApi.post("/signin", { email, password, remember });

export const registerRequest = ({ email, username, password }) =>
  authApi.post("/register", { email, username, password });

export const apiErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  (error.response
    ? fallback
    : "Unable to connect to the server. Make sure the backend is running.");

// Show the global loader while any add / update / delete request is running.
const LOADER_METHODS = ["post", "put", "patch", "delete"];
[authApi, taskApi, notesApi, chatApi, mailboxApi].forEach((api) => {
  api.interceptors.request.use((config) => {
    if (LOADER_METHODS.includes(config.method)) {
      config.showsGlobalLoader = true;
      startLoading();
    }
    return config;
  });
  api.interceptors.response.use(
    (response) => {
      if (response.config?.showsGlobalLoader) stopLoading();
      return response;
    },
    (error) => {
      if (error.config?.showsGlobalLoader) stopLoading();
      return Promise.reject(error);
    }
  );
});

// When a session expires mid-use, send the person back to sign in.
[taskApi, notesApi, chatApi, mailboxApi].forEach((api) =>
  api.interceptors.response.use(undefined, (error) => {
    if (error.response?.status === 401) {
      clearSession();
      if (window.location.pathname !== "/signin") {
        window.location.assign("/signin?expired=1");
      }
    }
    return Promise.reject(error);
  })
);
