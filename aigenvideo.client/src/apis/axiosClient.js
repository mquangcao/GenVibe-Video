import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_PROXY,
  timeout: 10000, // Set a timeout of 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
});


export default apiClient;
