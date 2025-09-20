import { useMutation } from "@tanstack/react-query";
import { customerSignup } from "@/api/auth";
import { handleMutationError } from "@/api";
import { CustomerSignupRequest } from "@/api/interfaces/auth/signup";

export const useCustomerSignup = () => {
  return useMutation({
    mutationFn: (data: CustomerSignupRequest) => customerSignup(data),
    onError: handleMutationError,
  });
};
