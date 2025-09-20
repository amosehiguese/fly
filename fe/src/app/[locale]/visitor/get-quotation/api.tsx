import { AxiosError } from "axios";
import api, { ErrorResponse, handleMutationError } from "@/api";
import { ApiResponse } from "./schema";

export const quotationService = {
  submitQuotation: async <T extends Record<string, unknown>>(
    type: string,
    data: T,
    locale: "en" | "sv" = "sv"
  ): Promise<ApiResponse> => {
    const formData = new FormData();
    const qType = type === "move-out-cleaning" ? "moving-cleaning" : type;

    // Handle files and other data
    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return; // Skip null/undefined values
      }

      // Handle file arrays (photos)
      if (key === "photos" && Array.isArray(value)) {
        value.forEach((file: File) => {
          if (file instanceof File) {
            formData.append(`files`, file);
          }
        });
        return;
      }

      // Handle services array - backend expects JSON string
      if (key === "services" && Array.isArray(value)) {
        formData.append("services", JSON.stringify(value));
        return;
      }

      // Handle storage object - backend expects JSON string
      if (key === "storage" && typeof value === "object" && value !== null) {
        formData.append("storage", JSON.stringify(value));
        return;
      }

      // Handle single file
      if (value instanceof File) {
        formData.append(key, value);
        return;
      }

      if (typeof value === "boolean") {
        formData.append(key, value === true ? "1" : "0");
        return;
      }

      // Handle all other values
      formData.append(key, String(value));
    });

    try {
      const response = await api.post(`api/quotations/${qType}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error submitting quotation:", error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handleMutationError(error as AxiosError<ErrorResponse, any>, locale);

      throw error;
    }
  },
};
