import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "/api/v1",
  timeout: 10000,
  responseType: "json",
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (exception) => {
    exception.message =
      exception.response?.data?.message ||
      "Cannot reach the server. Check that the Express API is running, then try again.";
    return Promise.reject(exception);
  },
);

export default axiosInstance;
