import { User } from "@/api/interfaces/auth/login";
import { useQuery } from "@tanstack/react-query";

export interface AdminUser {
  id: number;
  username: string;
  role: "super_admin" | "support_admin" | "financial_admin";
}

export const useUser = () => {
  return useQuery<User>({
    queryKey: ["user-customer"],
    staleTime: Infinity, // Keep the data fresh indefinitely
    gcTime: Infinity,
  });
};

export const useAdminUser = () => {
  return useQuery<AdminUser>({
    queryKey: ["user-admin"],
    staleTime: Infinity, // Keep the data fresh indefinitely
    gcTime: Infinity,
  });
};
