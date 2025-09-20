import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import {
  DriverLoginCredentials,
  DriverLoginResponse,
  DriverRegisterData,
} from "./types";
import { toast } from "sonner";
import api, { ErrorResponse, handleDriverMutationError } from "@/api";
import { useRouter } from "@/i18n/navigation";
import { useDriverStore } from "@/store/driverStore";

/**
 * Hook for driver authentication operations
 */
export const useDriverAuth = () => {
  const queryClient = useQueryClient();
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.flyttman.se/";
  const router = useRouter();

  // Driver registration mutation
  const registerDriver = useMutation({
    mutationFn: async (data: DriverRegisterData) => {
      // Need to use FormData as it includes file uploads
      const formData = new FormData();

      // Append all text fields
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Use public axios instance as this is an open endpoint
      const response = await axios.post(
        `${baseUrl}api/drivers/register`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    },
    onSuccess: (data) => {
      toast(
        data.messageSv || "Du har framgångsrikt registrerat dig som förare"
      );
    },
    onError: handleDriverMutationError,
  });

  const { login: setDriverLogin, logout: driverLogout } = useDriverStore();

  // Driver login mutation
  const loginDriver = useMutation<
    DriverLoginResponse,
    AxiosError<ErrorResponse>,
    DriverLoginCredentials
  >({
    mutationFn: async (credentials: DriverLoginCredentials) => {
      const response = await axios.post<DriverLoginResponse>(
        `${baseUrl}api/driver-login`,
        credentials
      );
      return response.data;
    },
    onSuccess: (data) => {
      // console.log(data);
      if (data.token && data.user) {
        // Update the store with driver data and token
        setDriverLogin({
          driver: data.user,
          token: data.token,
        });
        localStorage.setItem("token", data.token);

        toast.success("Inloggning lyckades!");
        router.replace("/driver");
      } else {
        throw new Error("Invalid response from server");
      }
    },
    onError: handleDriverMutationError,
  });

  // Logout function
  const logoutDriver = () => {
    // Clear the store
    driverLogout();

    // Clear any driver-related cache
    queryClient.invalidateQueries({ queryKey: ["driver"] });
    queryClient.invalidateQueries({ queryKey: ["driver-orders"] });
    queryClient.invalidateQueries({ queryKey: ["driver-chats"] });

    // Clear localStorage completely
    localStorage.removeItem("driver-storage");
  };

  return {
    registerDriver,
    loginDriver,
    logoutDriver,
  };
};
