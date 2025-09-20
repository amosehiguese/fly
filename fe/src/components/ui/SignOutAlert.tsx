"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import api, { ErrorResponse, handleMutationError } from "@/api/index";
import { useMutation } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { AxiosError } from "axios";

type AccountType = "admin" | "supplier" | "customer";

interface SignOutAlertProps {
  accountType: AccountType;
  children?: React.ReactNode;
}

export function SignOutAlert({ accountType, children }: SignOutAlertProps) {
  const router = useRouter();
  const t = useTranslations("common.signOut");
  const locale = useLocale();

  const { mutate: logout, isPending } = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/api/${accountType}s/logout`);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t("success"));
      localStorage.removeItem("token");
      router.push(accountType === "admin" ? "/admin-login" : "/login");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: AxiosError<ErrorResponse, any>) => {
      // toast.error(t("error"));
      handleMutationError(error, locale);
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="ghost" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t("button")}</span>
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[80%] md:w-[400px] rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              logout();
            }}
            disabled={isPending}
            className="bg-red-500 hover:bg-red-600"
          >
            {isPending ? t("loggingOut") : t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
