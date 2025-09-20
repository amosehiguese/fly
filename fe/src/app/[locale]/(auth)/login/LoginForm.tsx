"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoginRequestBody } from "@/api/interfaces/auth/login";
import { PasswordInput } from "@/components/PasswordInput";
import { useLogin } from "@/hooks/useAuth";
import Link from "next/link";
import { useTranslations } from "next-intl";

const LoginForm = () => {
  const [formData, setFormData] = useState<LoginRequestBody>({
    identifier: "",
    password: "",
  });

  const t = useTranslations("auth.login");
  const { mutate: login, isPending } = useLogin();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="md:w-[35%] w-[90%] xl:w-[30%] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white my-8 py-8 md:px-8 px-4 rounded-[20px] flex flex-col items-center shadow-lg">
      <h1 className="text-[30px] mb-2 font-bold text-title">{t("title")}</h1>
      <h3 className="text-subtitle">{t("subtitle")}</h3>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full mt-8"
      >
        <Input
          placeholder={t("emailPlaceholder")}
          onChange={(e) =>
            setFormData((prevState) => ({
              ...prevState,
              identifier: e.target.value,
            }))
          }
          required
          className="focus-visible:ring-primary rounded-[12px] border-[#D9D9D9]"
          value={formData.identifier}
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
          <p className="font-semibold text-subtitle">{t("troubleSigningIn")}</p>
          <Link
            href="/forgot-password"
            className="text-primary hover:underline font-medium"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        <Button
          type="submit"
          className="mt-6 w-full text-[18px] font-bold"
          disabled={isPending}
        >
          {isPending ? t("signingIn") : t("signIn")}
        </Button>

        <Link
          href="/customer-signup"
          className="flex gap-x-1 text-[14px] items-center mt-4"
        >
          <p className="text-subtitle font-medium text-center">
            {t("noAccount")}
          </p>
          <span className="text-yellow-500">{t("signUp")}</span>
        </Link>
      </form>
    </div>
  );
};

export default LoginForm;
