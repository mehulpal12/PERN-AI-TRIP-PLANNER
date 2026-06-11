import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { useAuthStore } from "@/lib/authStore";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // 1. Next.js Guard: Ensure this code only runs in the client browser environment
    if (typeof window === "undefined") return config;

    // 2. Try fetching from Zustand store in memory first
    let token = useAuthStore.getState().accessToken;

    // 3. Fallback: Parse from localStorage if Zustand has not hydrated yet
    if (!token) {
      const storageKey = process.env.NEXT_PUBLIC_AUTH_STORAGE_KEY || "trip_planner_auth";
      const authStorage = localStorage.getItem(storageKey);

      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          token = parsed?.state?.accessToken;
        } catch (error) {
          console.error("Failed to parse API Gateway auth tokens from localStorage:", error);
        }
      }
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);