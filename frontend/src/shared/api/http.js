import axios from "axios";
import toast from "react-hot-toast";

import {
  getToken,
  logoutUser,
} from "../../features/auth/api/auth";

// API base URL resolution:
// - Production: served behind nginx, same origin, prefix /api/v1
//   (nginx strips /api/v1/ and proxies the rest to FastAPI).
// - Development: Vite dev server has no proxy, so point VITE_API_URL at the
//   local backend directly, e.g. VITE_API_URL=http://localhost:8000
//   (FastAPI routers carry no /api/v1 prefix; nginx is what adds it).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.trim() || "/api/v1",
});

let isRedirecting = false;

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    if (
      status === 401 &&
      getToken() &&
      !isRedirecting
    ) {
      isRedirecting = true;

      logoutUser();

      toast.error(
        "Your session has expired. Please login again."
      );

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    }

    return Promise.reject(error);
  }
);

export default api;