import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { DriverProfileResponse, DriverSupplierResponse } from "./types";

interface EditDriverProfileData {
  phoneNumber?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

interface EditDriverProfileResponse {
  success: boolean;
  message: string;
  messageSv: string;
}

/**
 * Hook for managing driver profile data
 */
export const useDriverProfile = () => {
  const queryClient = useQueryClient();

  // Fetch current driver's profile
  const useProfile = () => {
    return useQuery<DriverProfileResponse>({
      queryKey: ["driver-profile"],
      queryFn: async () => {
        const response = await api.get("api/drivers/profile");
        return response.data;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  const useSupplierDetails = () => {
    return useQuery<DriverSupplierResponse>({
      queryKey: ["driver-assignedSupplier"],
      queryFn: async () => {
        const response = await api.get("api/drivers/assigned-supplier");
        return response.data;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  // Edit driver profile mutation
  const useEditProfile = () => {
    return useMutation<EditDriverProfileResponse, Error, EditDriverProfileData>(
      {
        mutationFn: async (data: EditDriverProfileData) => {
          const response = await api.put("api/drivers/edit", data);
          return response.data;
        },
        onSuccess: () => {
          // Invalidate and refetch profile data
          queryClient.invalidateQueries({ queryKey: ["driver-profile"] });
        },
      }
    );
  };

  return {
    useProfile,
    useSupplierDetails,
    useEditProfile,
  };
};
