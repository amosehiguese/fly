/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation } from "@tanstack/react-query";
import { adminLogin, login, sendForgotPasswordCode, resetPassword } from "@/api/auth";
import { toast } from "sonner";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  AdminUser,
  LoginRequestBody,
  User,
  AdminLoginRequestBody,
} from "@/api/interfaces/auth/login";
import { baseUrl, ErrorResponse, handleMutationError } from "@/api";
import axios, { AxiosError } from "axios";
import { useLocale, useTranslations } from "next-intl";

export interface LoginResponse {
  messge: string;
  messageSv?: string;
  token: string;
  user: User;
}

export interface AdminLoginResponse {
  message: string;
  messageSv?: string;
  token: string;
  admin: AdminUser;
}

export const useLogin = () => {
  // const queryClient = useQueryClient();
  const router = useRouter();
  const locale = useLocale();

  return useMutation<
    LoginResponse,
    AxiosError<ErrorResponse>,
    LoginRequestBody
  >({
    mutationFn: login,
    onSuccess: (data) => {
      axios.post(`${baseUrl}api/mailing/send-verification`, {
        email: data.user.email,
      });
      router.push(
        `/verify-email?email=${data.user.email}&role=${data.user.role}&token=${data.token}`
      );
    },
    // onSuccess: (data) => {
    //   queryClient.setQueryData<User>(["user-customer"], data.user);
    //   queryClient.setQueryDefaults(["user-customer"], {
    //     staleTime: Infinity,
    //     gcTime: Infinity,
    //   });
    //   // toast.success(data. || "Login successful");
    //   if (data.user.role === "customer") {
    //     // console.log("token", data.token);
    //     localStorage.setItem("token", data.token);
    //     router.replace("/customer");
    //     localStorage.setItem("token", data.token);
    //   } else {
    //     localStorage.setItem("token", data.token);
    //     router.replace("/supplier");
    //   }
    // },
    onError: (error) => handleMutationError(error, locale),
  });
};

export const useAdminLogin = () => {
  // const queryClient = useQueryClient();
  const router = useRouter();
  const locale = useLocale();

  return useMutation<
    AdminLoginResponse,
    AxiosError<ErrorResponse>,
    AdminLoginRequestBody
  >({
    mutationFn: adminLogin,
    onSuccess: (data) => {
      axios.post(`${baseUrl}api/mailing/send-verification`, {
        email: data.admin.email,
      });
      router.push(
        `/verify-email?email=${data.admin.email}&role=${data.admin.role}&token=${data.token}`
      );
    },
    // onSuccess: (data) => {
    //   // Save user data to React Query cache
    //   toast.success(data.message || "Login successful");
    //   localStorage.setItem("token", data.token);
    //   queryClient.setQueryData(["user-admin"], data.admin);
    //   console.log("dtf", data);
    //   router.replace("/choose-business");
    // },
    onError: (error) => handleMutationError(error, locale),
  });
};

export const useSendVerificationEmail = () => {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth.verifyEmail");

  return useMutation<
    { success: boolean; message: string; messageSv?: string },
    AxiosError<ErrorResponse>,
    { email: string }
  >({
    mutationFn: ({ email }) => {
      return axios.post(`${baseUrl}api/mailing/send-verification`, {
        email,
      });
    },
    onSuccess: (data) => {
      // console.log("pathname", pathname);
      const displayMessage =
        (locale === "sv" ? data.messageSv : data.message) || t("toast");
      toast.success(displayMessage);
      if (pathname.split("/")[1] !== "verify-email") {
        router.push("/verify-email");
      }
    },
    onError: (error) => handleMutationError(error, locale),
  });
};

export const useVerifyEmail = () => {
  const router = useRouter();
  const locale = useLocale();
  const successMessage =
    locale === "en" ? "Email verified" : "E-post verifierad";

  return useMutation<
    { success: boolean; message: string },
    AxiosError<ErrorResponse>,
    { token: string; email: string; role: string; code: string }
  >({
    mutationFn: ({ email, token, role, code }) => {
      return axios.post(`${baseUrl}api/mailing/verify-code`, {
        email,
        code,
      });
    },
    onSuccess: (data, variables) => {
      toast.success(successMessage);
      if (variables.role === "customer") {
        localStorage.setItem("token", variables.token);
        router.replace("/customer");
      } else if (variables.role === "supplier") {
        localStorage.setItem("token", variables.token);
        router.replace("/supplier");
      } else if (
        variables.role === "super_admin" ||
        variables.role === "financial_admin" ||
        variables.role === "support_admin"
      ) {
        localStorage.setItem("token", variables.token);
        router.replace("/choose-business");
      } else {
        toast.error(locale === "en" ? "Invalid role" : "ogiltig roll");
      }
    },
    onError: (error) => handleMutationError(error, locale),
  });
};

// Forgot Password hooks
export const useSendForgotPasswordCode = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth.forgotPassword");

  return useMutation<
    { success: boolean; message: string; messageSv?: string },
    AxiosError<ErrorResponse>,
    { email: string }
  >({
    mutationFn: ({ email }) => sendForgotPasswordCode(email),
    onSuccess: (data, variables) => {
      const displayMessage = 
        (locale === "sv" ? data.messageSv : data.message) || 
        (locale === "sv" ? "Återställningskod skickad framgångsrikt" : "Reset code sent successfully");
      toast.success(displayMessage);
      router.push(`/forgot-password/reset?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error) => handleMutationError(error, locale),
  });
};

export const useResetPassword = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth.forgotPassword");

  return useMutation<
    { success: boolean; message: string; messageSv?: string },
    AxiosError<ErrorResponse>,
    { email: string; code: string; newPassword: string }
  >({
    mutationFn: ({ email, code, newPassword }) => {
      const formattedCode = code.replace(/^(.{2})(.{2})(.{2})$/, "$1 $2 $3");
      return resetPassword({
        email,
        code: formattedCode,
        newPassword,
      });
    },
    onSuccess: (data) => {
      const displayMessage = 
        (locale === "sv" ? data.messageSv : data.message) || 
        (locale === "sv" ? "Lösenordet har återställts framgångsrikt" : "Password reset successfully");
      toast.success(displayMessage);
      router.push("/login");
    },
    onError: (error) => handleMutationError(error, locale),
  });
};

export const useDriverSendForgotPasswordCode = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth.driverForgotPassword");

  return useMutation<
    { success: boolean; message: string; messageSv?: string },
    AxiosError<ErrorResponse>,
    { email: string }
  >({
    mutationFn: ({ email }) => sendForgotPasswordCode(email),
    onSuccess: (data, variables) => {
      const displayMessage = 
        (locale === "sv" ? data.messageSv : data.message) || 
        (locale === "sv" ? "Återställningskod skickad framgångsrikt" : "Reset code sent successfully");
      toast.success(displayMessage);
      router.push(`/driver-forgot-password/reset?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error) => handleMutationError(error, locale),
  });
};

export const useDriverResetPassword = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth.driverForgotPassword");

  return useMutation<
    { success: boolean; message: string; messageSv?: string },
    AxiosError<ErrorResponse>,
    { email: string; code: string; newPassword: string }
  >({
    mutationFn: ({ email, code, newPassword }) => {
      const formattedCode = code.replace(/^(.{2})(.{2})(.{2})$/, "$1 $2 $3");
      return resetPassword({
        email,
        code: formattedCode,
        newPassword,
      });
    },
    onSuccess: (data) => {
      const displayMessage = 
        (locale === "sv" ? data.messageSv : data.message) || 
        (locale === "sv" ? "Lösenordet har återställts framgångsrikt" : "Password reset successfully");
      toast.success(displayMessage);
      router.push("/driver-login");
    },
    onError: (error) => handleMutationError(error, locale),
  });
};

export const useSupplierSendForgotPasswordCode = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth.supplierForgotPassword");

  return useMutation<
    { success: boolean; message: string; messageSv?: string },
    AxiosError<ErrorResponse>,
    { email: string }
  >({
    mutationFn: ({ email }) => sendForgotPasswordCode(email),
    onSuccess: (data, variables) => {
      const displayMessage = 
        (locale === "sv" ? data.messageSv : data.message) || 
        (locale === "sv" ? "Återställningskod skickad framgångsrikt" : "Reset code sent successfully");
      toast.success(displayMessage);
      router.push(`/supplier-forgot-password/reset?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error) => handleMutationError(error, locale),
  });
};

export const useSupplierResetPassword = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth.supplierForgotPassword");

  return useMutation<
    { success: boolean; message: string; messageSv?: string },
    AxiosError<ErrorResponse>,
    { email: string; code: string; newPassword: string }
  >({
    mutationFn: ({ email, code, newPassword }) => {
      const formattedCode = code.replace(/^(.{2})(.{2})(.{2})$/, "$1 $2 $3");
      return resetPassword({
        email,
        code: formattedCode,
        newPassword,
      });
    },
    onSuccess: (data) => {
      const displayMessage = 
        (locale === "sv" ? data.messageSv : data.message) || 
        (locale === "sv" ? "Lösenordet har återställts framgångsrikt" : "Password reset successfully");
      toast.success(displayMessage);
      router.push("/supplier-login");
    },
    onError: (error) => handleMutationError(error, locale),
  });
};
