import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";

// Types
export interface ErrorResponse {
  error: string;
  errorSv?: string;
  message: string;
  messageSv?: string;
  status: number;
}

export const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.flyttman.se/";
// export const baseUrl = "http://localhost:3000/";

export const imageBaseUrl =
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "http://localhost:3000";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: baseUrl,
  // timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true, // Enables cookie-based session management
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.headers) {
      // Set language header
      config.headers["Accept-Language"] =
        localStorage.getItem("language") || "en";

      // Check if the request is for customer endpoints

      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ErrorResponse>) => {
    if (error.response?.status === 401) {
      console.log("error", error.response);
      const pathSegments = window.location.pathname.split("/"); // Split the URL into segments
      const mainSegment = pathSegments[2]; // Get the first segment (e.g., "customers" or "admin")

      if (mainSegment === "admin") {
        window.location.href = "/admin-login"; // Redirect to admin login
      } else if (mainSegment === "driver") {
        window.location.href = "/driver-login"; // Redirect to supplier login
      } else if (mainSegment === "/" || mainSegment === "new-homepage") {
      } else {
        window.location.href = "/login"; // Redirect to normal login
      }
    }
    return Promise.reject(error); // Pass error to handleQueryError
  }
);

// API request helpers
export const apiRequest = {
  get: <TResponse>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<TResponse> =>
    api
      .get<TResponse>(url, config)
      .then((response: AxiosResponse<TResponse>) => response.data),

  post: <TResponse, TRequest = Record<string, unknown>>(
    url: string,
    data?: TRequest,
    config?: AxiosRequestConfig
  ): Promise<TResponse> =>
    api
      .post<TResponse>(url, data, config)
      .then((response: AxiosResponse<TResponse>) => response.data),

  put: <TResponse, TRequest = Record<string, unknown>>(
    url: string,
    data?: TRequest,
    config?: AxiosRequestConfig
  ): Promise<TResponse> =>
    api
      .put<TResponse>(url, data, config)
      .then((response: AxiosResponse<TResponse>) => response.data),

  patch: <TResponse, TRequest = Record<string, unknown>>(
    url: string,
    data?: TRequest,
    config?: AxiosRequestConfig
  ): Promise<TResponse> =>
    api
      .patch<TResponse>(url, data, config)
      .then((response: AxiosResponse<TResponse>) => response.data),

  delete: <TResponse>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<TResponse> =>
    api
      .delete<TResponse>(url, config)
      .then((response: AxiosResponse<TResponse>) => response.data),
};

// Custom error handler for React Query
export const handleQueryError = (
  error: AxiosError<ErrorResponse>,
  locale: "sv" | "en" = "sv"
) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const genericMessage =
      locale === "sv" ? "Ett oväntat fel inträffade" : "An error occurred";
    const displayMessage =
      locale === "sv" && data?.messageSv
        ? data.messageSv
        : data?.error || data?.message || error.message || genericMessage;

    toast.error(displayMessage, { position: "top-right" });

    return {
      message: displayMessage,
      status: error.response?.status || 500,
    };
  }
  return {
    message:
      locale === "sv"
        ? "Ett oväntat fel inträffade"
        : "An unexpected error occurred",
    status: 500,
  };
};

export const handleDriverQueryError = (error: AxiosError<ErrorResponse>) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const genericMessage = "Ett oväntat fel inträffade";
    const displayMessage = data?.messageSv
      ? data.messageSv
      : data?.error || data?.message || error?.message || genericMessage;

    toast.error(displayMessage, { position: "top-right" });

    return {
      message: displayMessage,
      status: error.response?.status || 500,
    };
  }
  return {
    message: "Ett oväntat fel inträffade",
    status: 500,
  };
};

export const handleMutationError = (
  error: AxiosError<ErrorResponse>,
  locale: "sv" | "en" = "sv"
) => {
  const data = error?.response?.data;
  const genericMessage =
    locale === "sv"
      ? "Ett oväntat fel inträffade"
      : "An unexpected error occurred";
  const displayMessage =
    locale === "sv"
      ? data?.messageSv || data?.errorSv || genericMessage
      : data?.error || data?.message || error?.message || genericMessage;
  toast.error(displayMessage);
};

export const handleDriverMutationError = (error: AxiosError<ErrorResponse>) => {
  const data = error?.response?.data;
  const genericMessage = "Ett oväntat fel inträffade";
  const displayMessage = data?.messageSv || data?.errorSv || genericMessage;
  toast.error(displayMessage);
  console.log("err", data?.error);
};

export default api;
