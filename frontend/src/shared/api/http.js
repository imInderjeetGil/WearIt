import axios from "axios";
import toast from "react-hot-toast";

import {
  getToken,
  logoutUser,
} from "../../features/auth/api/auth";

const api = axios.create({
  baseURL:
    //import.meta.env.VITE_API_URL ||
    "http://localhost:8000",
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