import { clearAuthTokens, getAccessToken, getRefreshToken, getUsername } from '@/utils';
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_PROXY,
  timeout: 30000, // Set a timeout of 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

const handleRequestSuccess = async (config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

const handleRequestErr = (err) => {
  return Promise.reject(err);
};

const handleResponseSuccess = (res) => {
  return res;
};

const REFRESH_TOKEN_URL = 'api/auth/refresh-token';

const handleResponseErr = async (error) => {
  const originalRequest = error.config;

  if (error.response && error.response.status === 401 && !originalRequest.url.includes(REFRESH_TOKEN_URL)) {
    // If unauthorized, you can refresh the token or redirect to login
    let refreshTokenStore = getRefreshToken();
    let usernameStore = getUsername();

    if (!refreshTokenStore || !usernameStore) {
      return Promise.reject(error);
    }

    try {
      // Attempt to refresh the token
      const response = await axiosClient.post(REFRESH_TOKEN_URL, {
        refreshToken: refreshTokenStore,
        username: usernameStore,
      });
      // Assuming the response contains the new token
      if (!response.data.success) {
        throw new Error('Token refresh failed');
      }

      const { token, refreshToken } = response.data.data;

      // Save the new token
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      originalRequest.headers.Authorization = `Bearer ${token}`;

      // Retry the original request with the new token
      return axiosClient(originalRequest);
    } catch (refreshError) {
      clearAuthTokens();

      console.error('Token refresh failed:', refreshError);
      return Promise.reject(error);
      // Optionally, redirect to login or handle it accordingly
    }
  }
  return Promise.reject(error);
};

axiosClient.interceptors.request.use(
  (config) => handleRequestSuccess(config),
  (err) => handleRequestErr(err)
);

axiosClient.interceptors.response.use(
  (config) => handleResponseSuccess(config),
  (err) => handleResponseErr(err)
);

export default axiosClient;
