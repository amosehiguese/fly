import { useMutation, useQuery } from "@tanstack/react-query";
import api, { handleDriverMutationError } from "@/api";
import { toast } from "sonner";
import { DriverRegisterData } from "../driver/types";
import {
  DriverDetailResponse,
  DriversLocationResponse,
  DriversResponse,
} from "@/api/interfaces/suppliers/drivers";

export const useFetchDrivers = () => {
  return useQuery({
    queryKey: ["supplier-drivers"],
    queryFn: async () => {
      const response = await api.get("api/suppliers/drivers");
      return response.data as DriversResponse;
    },
  });
};

export const useFetchDriverById = (id: string) => {
  return useQuery({
    queryKey: ["supplier-driver", id],
    queryFn: async () => {
      const response = await api.get(`api/suppliers/drivers/${id}`);
      return response.data as DriverDetailResponse;
    },
    enabled: !!id,
  });
};

export const useFetchDriversLocation = () => {
  return useQuery({
    queryKey: ["supplier-drivers-location"],
    queryFn: async () => {
      const response = await api.get(`api/location/driver-locations`);
      return response.data as DriversLocationResponse;
    },
    refetchInterval: 60000,
  });
};

export const useRegisterDriver = () => {
  return useMutation({
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
      const response = await api.post(`api/drivers/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: (data) => {
      toast(
        data.messageSv || "Du har framgångsrikt registrerat dig som förare"
      );
    },
    onError: handleDriverMutationError,
  });
};

export const useAssignDriver = () => {
  return useMutation({
    mutationFn: async ({
      order_id,
      driver_id,
    }: {
      order_id: string;
      driver_id: string;
    }) => {
      const response = await api.post(
        `api/suppliers/drivers/${order_id}/${driver_id}/assign`
      );

      return response.data;
    },

    onError: handleDriverMutationError,
  });
};
