import { ErrorResponse, handleMutationError } from "@/api";
import { adminLogOut } from "@/api/auth";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { AxiosError } from "axios";
import { useLocale, useTranslations } from "next-intl";

function LogOutAlert({
  sideEffectFunction,
}: {
  sideEffectFunction?: () => void;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations("common.signOut");
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationKey: ["logout"],
    mutationFn: adminLogOut,
    onSuccess: () => {
      queryClient.invalidateQueries();
      setOpen(false);
      router.replace("/admin-login");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: AxiosError<ErrorResponse, any>) =>
      handleMutationError(error, locale),
  });

  const handleLogOut = async () => {
    if (sideEffectFunction) sideEffectFunction();
    mutation.mutate();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="flex gap-x-3 justify-start text-black dark:text-white items-center w-full px-2 rounded-[10px] py-2 bg-transparent shadow-none hover:bg-[#F1D3CF]/[0.5]">
          <div className="w-6 ">
            <LogOut className="h-[42px] w-[42px]" />
          </div>
          <div className="font-medium">
            {mutation.isPending ? t("loggingOut") : t("button")}
          </div>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("button")}</AlertDialogTitle>
          <AlertDialogDescription>{t("title")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            className="text-white font-semibold"
            onClick={handleLogOut}
          >
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default LogOutAlert;
