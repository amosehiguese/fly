"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";
import Link from "next/link";
import { DriverLoginCredentials } from "@/hooks/driver/types";
import { useDriverAuth } from "@/hooks/driver";
import { useTranslations } from "next-intl";

const DriverLoginForm = () => {
  const [formData, setFormData] = useState<DriverLoginCredentials>({
    email: "",
    password: "",
  });

  const { loginDriver } = useDriverAuth();
  const t = useTranslations("driver.auth");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginDriver.mutate(formData);
  };

  return (
    <div className="md:w-[35%] w-[90%] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white my-8 py-8 md:px-8 px-4 rounded-[20px] flex flex-col items-center shadow-lg">
      <h1 className="text-[30px] mb-2 font-bold text-title">
        {t("loginTitle")}
      </h1>
      <h3 className="text-subtitle">{t("loginSubtitle")}</h3>

      <form onSubmit={handleSubmit} className="space-y-4 w-full mt-8">
        <Input
          placeholder={t("emailPlaceholder")}
          onChange={(e) =>
            setFormData((prevState) => ({
              ...prevState,
              email: e.target.value,
            }))
          }
          required
          className="focus-visible:ring-primary rounded-[12px] border-[#D9D9D9]"
          value={formData.email}
          type="email"
        />
        <PasswordInput
          placeholder={t("passwordPlaceholder")}
          onChange={(e) =>
            setFormData((prevState) => ({
              ...prevState,
              password: e.target.value,
            }))
          }
          required
          value={formData.password}
          error={false}
          showToggle={true}
          className="focus-visible:ring-primary rounded-[12px] border-[#D9D9D9]"
        />

        <div className="flex justify-between items-center text-[14px] mt-2">
          <p className="font-semibold text-subtitle">{t("loginProblem")}</p>
          <Link
            href="/driver-forgot-password"
            className="text-primary hover:underline font-medium"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        <Button
          type="submit"
          className="mt-6 w-full text-[18px] font-bold"
          disabled={loginDriver.isPending}
        >
          {loginDriver.isPending ? t("loggingIn") : t("login")}
        </Button>

        <div className="flex flex-col gap-y-2 mt-4">
          <Link
            href="/driver-signup"
            className="flex gap-x-1 text-[14px] items-center justify-center"
          >
            <p className="text-subtitle font-medium">{t("noAccount")}</p>
            <span className="text-yellow-500">{t("register")}</span>
          </Link>

          <Link
            href="/login"
            className="flex gap-x-1 text-[14px] items-center justify-center"
          >
            <p className="text-subtitle font-medium">{t("notDriver")}</p>
            <span className="text-yellow-500">{t("regularLogin")}</span>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default DriverLoginForm;
