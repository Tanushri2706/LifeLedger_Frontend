import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { env } from "./env";
import type { ApiResponse, AuthResponseData } from "@/types";

export interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  code?: string;
  error?: Record<string, unknown> | string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  errors?: Record<string, string[]>;
  raw?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    errors?: Record<string, string[]>,
    raw?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.raw = raw;
  }
}

/**
 * Access token memory store (in-memory only; refresh tokens are stored in HttpOnly cookies).
 */
let inMemoryAccessToken: string | null = null;
let sessionExpireListeners: Array<() => void> = [];

export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

export const onSessionExpired = (listener: () => void) => {
  sessionExpireListeners.push(listener);
  return () => {
    sessionExpireListeners = sessionExpireListeners.filter((l) => l !== listener);
  };
};

const notifySessionExpired = () => {
  inMemoryAccessToken = null;
  sessionExpireListeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error("Error in session expiry listener", e);
    }
  });
};

/**
 * Centralized Axios HTTP Client
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Required for HttpOnly refresh-token cookies
  timeout: 30000,
});

// Request interceptor: attach in-memory access token if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (inMemoryAccessToken && config.headers) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Concurrency lock and queue for silent token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
  config: InternalAxiosRequestConfig;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      if (token && prom.config.headers) {
        prom.config.headers.Authorization = `Bearer ${token}`;
      }
      prom.resolve(apiClient(prom.config));
    }
  });
  failedQueue = [];
};

// Response interceptor: handle 401 token refresh queue & parse errors consistently
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response) {
      const data = error.response.data;
      const status = error.response.status;

      // Check if 401 and should attempt silent refresh
      const isAuthEndpoint =
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/signup") ||
        originalRequest.url?.includes("/auth/refresh-token") ||
        originalRequest.url?.includes("/auth/logout") ||
        originalRequest.url?.includes("/auth/verify-email") ||
        originalRequest.url?.includes("/auth/forgot-password") ||
        originalRequest.url?.includes("/auth/reset-password");

      if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, config: originalRequest });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Call backend refresh endpoint (passes HttpOnly refreshToken cookie automatically)
          const response = await axios.post<ApiResponse<AuthResponseData>>(
            `${env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
            {},
            { withCredentials: true }
          );

          const newAccessToken = response.data?.data?.accessToken || null;
          setAccessToken(newAccessToken);

          processQueue(null, newAccessToken);

          if (newAccessToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          notifySessionExpired();
          return Promise.reject(
            new ApiError(
              "Session expired. Please sign in again.",
              401,
              "SESSION_EXPIRED",
              undefined,
              refreshError
            )
          );
        } finally {
          isRefreshing = false;
        }
      }

      const message =
        data?.message ||
        (typeof data?.error === "string" ? data.error : undefined) ||
        error.message ||
        "An unexpected error occurred";
      const code = data?.code;
      const errors = data?.errors;

      return Promise.reject(new ApiError(message, status, code, errors, data));
    } else if (error.request) {
      return Promise.reject(
        new ApiError("Network error: Unable to reach the server", 0, "NETWORK_ERROR", undefined, error.request)
      );
    }
    return Promise.reject(new ApiError(error.message, 500, "CLIENT_ERROR", undefined, error));
  }
);

/**
 * Typed HTTP helpers
 */
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => res.data),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
};
