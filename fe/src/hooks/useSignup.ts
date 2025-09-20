import { useMutation } from "@tanstack/react-query";
import { customerSignup, moverSignup } from "@/api/auth";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import {
  CustomerSignupRequestBody,
  MoverSignupRequestBody,
  SignupResponse,
} from "@/api/interfaces/auth/signup";
import { ErrorResponse, handleMutationError } from "@/api";
import { AxiosError } from "axios";
import { useLocale } from "next-intl";
import { useTranslations } from "use-intl";

export const useCustomerSignup = () => {
  const router = useRouter();

  return useMutation<
    SignupResponse,
    AxiosError<ErrorResponse>,
    CustomerSignupRequestBody
  >({
    mutationFn: customerSignup,
    onSuccess: (data) => {
      toast.success(data.message || "Account created successfully!");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(
        error.response?.data.message ||
          error.response?.data.error ||
          error.message ||
          "Something went wrong"
      );
    },
  });
};

export const useMoverSignup = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth.supplierSignup");

  return useMutation<
    SignupResponse,
    AxiosError<ErrorResponse>,
    MoverSignupRequestBody
  >({
    mutationFn: moverSignup,
    onSuccess: (data) => {
      const displayMessage =
        (locale === "sv" ? data.messageSv : data.message) || t("success");
      toast.success(displayMessage);
      router.push("/login");
    },
    onError: (error) => handleMutationError(error, locale),
  });
};
