import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_PROXY,
  timeout: 30000, // Set a timeout of 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if(token) {
      // If token exists, set it in the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // If unauthorized, you can refresh the token or redirect to login
      originalRequest._retry = true; // Prevent infinite loop
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const response = await axiosClient.post("/api/auth/refresh-token", { refreshToken: refreshToken });
          // Assuming the response contains the new token
          if (!response.data.success) {
            throw new Error("Token refresh failed");
          }

          const newToken = response.data.data.token;

          // Save the new token
          localStorage.setItem("token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Retry the original request with the new token
          return axiosClient(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");

          console.error("Token refresh failed:", refreshError);
          // Optionally, redirect to login or handle it accordingly
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
