// import axios, {
//     AxiosError,
//     AxiosInstance,
//     AxiosRequestConfig,
//     AxiosResponse,
//     InternalAxiosRequestConfig,
//   } from "axios";
//   import { toast } from "sonner";

//   // Types
//   interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
//     _retry?: boolean;
//   }

//   interface ErrorResponse {
//     error: string;
//     message: string;
//     status: number;
//   }

//   interface RefreshTokenResponse {
//     token: string;
//     refreshToken: string;
//   }

//   export const baseUrl =
//     process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/";

//   // Create axios instance
//   const api: AxiosInstance = axios.create({
//     baseURL: baseUrl,
//     timeout: 10000,
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });

//   // Request interceptor
//   api.interceptors.request.use(
//     async (config: CustomAxiosRequestConfig) => {
//       const token = localStorage.getItem("token");

//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }

//       config.headers["Accept-Language"] =
//         localStorage.getItem("language") || "en";

//       return config;
//     },
//     (error: AxiosError) => {
//       return Promise.reject(error);
//     }
//   );

//   // Response interceptor
//   api.interceptors.response.use(
//     (response) => {
//       return response;
//     },
//     async (error: AxiosError<ErrorResponse>) => {
//       const originalRequest = error.config as CustomAxiosRequestConfig;

//       if (error.response) {
//         switch (error.response.status) {
//           case 401: {
//             if (!originalRequest._retry) {
//               originalRequest._retry = true;

//               try {
//                 const refreshToken = localStorage.getItem("refreshToken");
//                 const response = await api.post<RefreshTokenResponse>(
//                   "/auth/refresh",
//                   { refreshToken }
//                 );

//                 if (response.data.token) {
//                   localStorage.setItem("token", response.data.token);
//                   originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
//                   return api(originalRequest);
//                 }
//               } catch (refreshError) {
//                 localStorage.removeItem("token");
//                 localStorage.removeItem("refreshToken");
//                 window.location.href = "/login";
//                 return Promise.reject(refreshError);
//               }
//             }
//             break;
//           }

//           case 403:
//             toast.error("You do not have permission to perform this action");
//             break;

//           case 404:
//             toast.error("Resource not found");
//             break;

//           case 422:
//             toast.error(error.response.data.message || "Validation failed");
//             break;

//           case 429:
//             toast.error("Too many requests. Please try again later");
//             break;

//           case 500:
//             toast.error("Internal server error. Please try again later");
//             break;

//           default:
//             toast.error("An unexpected error occurred");
//         }
//       } else if (error.request) {
//         toast.error("No response received from server");
//       } else {
//         toast.error("Error in request configuration");
//       }

//       return Promise.reject(error);
//     }
//   );

//   // API request helpers with generic types
//   export const apiRequest = {
//     get: <TResponse>(
//       url: string,
//       config?: AxiosRequestConfig
//     ): Promise<TResponse> =>
//       api
//         .get<TResponse>(url, config)
//         .then((response: AxiosResponse<TResponse>) => response.data),

//     post: <TResponse, TRequest = Record<string, unknown>>(
//       url: string,
//       data?: TRequest,
//       config?: AxiosRequestConfig
//     ): Promise<TResponse> =>
//       api
//         .post<TResponse>(url, data, config)
//         .then((response: AxiosResponse<TResponse>) => response.data),

//     put: <TResponse, TRequest = Record<string, unknown>>(
//       url: string,
//       data?: TRequest,
//       config?: AxiosRequestConfig
//     ): Promise<TResponse> =>
//       api
//         .put<TResponse>(url, data, config)
//         .then((response: AxiosResponse<TResponse>) => response.data),

//     patch: <TResponse, TRequest = Record<string, unknown>>(
//       url: string,
//       data?: TRequest,
//       config?: AxiosRequestConfig
//     ): Promise<TResponse> =>
//       api
//         .patch<TResponse>(url, data, config)
//         .then((response: AxiosResponse<TResponse>) => response.data),

//     delete: <TResponse>(
//       url: string,
//       config?: AxiosRequestConfig
//     ): Promise<TResponse> =>
//       api
//         .delete<TResponse>(url, config)
//         .then((response: AxiosResponse<TResponse>) => response.data),
//   };

//   // Custom error handler for React Query
//   export const handleQueryError = (error: AxiosError<ErrorResponse>) => {
//     if (axios.isAxiosError(error)) {
//       toast.error(
//         error.response?.data.error ||
//           error.response?.data.message ||
//           error.message,
//         { position: "top-right" }
//       );
//       return {
//         message: error.response?.data?.message || "An error occurred",
//         status: error.response?.status || 500,
//       };
//     }
//     return { message: "An unexpected error occurred", status: 500 };
//   };

//   export default api;
