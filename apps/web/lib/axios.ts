import axios from "axios";
import { getSession } from "next-auth/react";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
axios.defaults.withCredentials = true;

// Add request interceptor to include JWT token
axios.interceptors.request.use(async (config) => {
  try {
    const session = await getSession();
    if (session && session.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
  } catch (error) {
    // Ignore session errors to prevent breaking requests
  }
  return config;
});

export default axios;
