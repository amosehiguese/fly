"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminLoginRequestBody } from "@/api/interfaces/auth/login";
import { PasswordInput } from "@/components/PasswordInput";
import { useAdminLogin } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";
import Link from "next/link";

const LoginForm = () => {
  const [formData, setFormData] = useState<AdminLoginRequestBody>({
    username: "",
    password: "",
  });
  const login = useAdminLogin();
  const t = useTranslations("admin.auth");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login.mutate(formData);
  };

  return (
    <div className="md:w-[35%] w-[80%] bg-white my-8 py-8 px-8 rounded-[20px] flex flex-col items-center shadow-lg">
      <h1 className="text-[30px] mb-2 font-bold text-title">
        {t("login.title")}
      </h1>
      <h3 className="text-subtitle">{t("login.subtitle")}</h3>

      <form
        onSubmit={(e) => handleSubmit(e)}
        className="space-y-4 w-full mt-8"
      >
        <Input
          placeholder={t("placeholders.username")}
          onChange={(e) =>
            setFormData((prevState) => ({
              ...prevState,
              username: e.target.value,
            }))
          }
          required
          className=" focus-visible:ring-primary rounded-[12px] border-[#D9D9D9]"
          value={formData.username}
        />
        <PasswordInput
          placeholder={t("placeholders.password")}
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
          className=" focus-visible:ring-primary rounded-[12px] border-[#D9D9D9]"
        />

        <div className="flex justify-between items-center text-[14px] mt-2">
          <p className="font-semibold text-subtitle">
            {t("login.troubleSigningIn")}
          </p>
          <Link
            href="/admin/settings/request-password-reset"
            className="text-primary hover:underline font-medium"
          >
            {t("login.forgotPassword")}
          </Link>
        </div>

        <Button
          type="submit"
          className="mt-6 w-full text-[18px] font-bold bg-black hover:bg-black/[0.9]"
          disabled={login.isPending}
        >
          {login.isPending
            ? t("login.buttons.signingIn")
            : t("login.buttons.signIn")}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
