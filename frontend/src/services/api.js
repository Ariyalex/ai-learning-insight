import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => {
    if (error) p.reject(error);
    else p.resolve(token);
  });

  failedQueue = [];
};

// === Request Interceptor ===
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// === Response Interceptor ===
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Abaikan kalau ini sendiri /auth/refresh → biarin fail
    if (originalRequest.url.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // Kalau 401 + belum retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // Kalau refresh token lagi diproses → queue request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = "Bearer " + token;
              resolve(api(originalRequest));
            },
            reject: (err) => reject(err)
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await api.post("/auth/refresh", { refreshToken });

        const newAccess = res.data.data.accessToken;
        const newRefresh = res.data.data.refreshToken;

        // SIMPAN refresh token baru
        localStorage.setItem("accessToken", newAccess);
        localStorage.setItem("refreshToken", newRefresh);

        // Update header global
        api.defaults.headers.Authorization = `Bearer ${newAccess}`;
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        processQueue(null, newAccess);

        return api(originalRequest);

      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
