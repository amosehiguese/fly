/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, SquareAsterisk } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BackHeader from "@/components/BackHeader";
import { useMutation } from "@tanstack/react-query";
import api, { ErrorResponse, handleMutationError } from "@/api";
import { toast } from "sonner";
import { useCustomerDashboard } from "@/hooks/customer/useCustomerDashboard";
import { useRouter } from "@/i18n/navigation";
import { AxiosError } from "axios";

export default function ChangePasswordPage() {
  const t = useTranslations("common");
  const t2 = useTranslations("messages");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: customer } = useCustomerDashboard();
  const router = useRouter();
  const formattedOtp = code.replace(/^(.{2})(.{2})(.{2})$/, "$1 $2 $3");
  const locale = useLocale();

  const resetPassword = useMutation({
    mutationFn: () => {
      const response = api.post("api/forgot-password/reset", {
        email: customer?.user.email,
        code: formattedOtp,
        newPassword,
      });
      return response;
    },
    onSuccess: () => {
      toast.success(t2("passwordResetSuccess"));
      router.push("/customer/");
    },
    onError: (error: AxiosError<ErrorResponse, any>) =>
      handleMutationError(error, locale),
  });

  const onSubmit = () => {
    if (code.length !== 6) {
      toast.error(t("validation.codeMustBeSixDigits"));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t("validation.passwordMinLength"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("validation.passwordsDoNotMatch"));
      return;
    }
    resetPassword.mutate();
  };

  return (
    <div>
      <BackHeader title={t("labels.changePassword")} />
      <div className="p-6">
        <p className="text-lg mb-8">{t2("passwordSecurityNotice")}</p>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              {t("labels.code")}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/3 -translate-y-1/2">
                <SquareAsterisk className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                type="text"
                className="pl-10 pr-10"
                placeholder={t("labels.enterCode")}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t2("enterSixDigitCode")}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              {t("labels.newPassword")}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                type={showPasswords.new ? "text" : "password"}
                className="pl-10 pr-10"
                placeholder={t("labels.enterNewPassword")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                }
              >
                {showPasswords.new ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              {t("labels.confirmPassword")}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                type={showPasswords.confirm ? "text" : "password"}
                className="pl-10 pr-10"
                placeholder={t("labels.confirmYourPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <Button
            className="w-full bg-red-500 hover:bg-red-600 text-white"
            size="lg"
            onClick={onSubmit}
            disabled={resetPassword.isPending}
          >
            {resetPassword.isPending ? t("buttons.saving") : t("buttons.save")}
          </Button>
        </form>
      </div>
    </div>
  );
}
