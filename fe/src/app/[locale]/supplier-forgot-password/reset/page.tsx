"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { useSupplierResetPassword } from "@/hooks/useAuth";
import { forgotPasswordResetSchema, ForgotPasswordResetValues } from "@/schemas/forgotPassword";

export default function SupplierResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const searchParams = useSearchParams();
  const t = useTranslations("auth.supplierForgotPassword");
  const locale = useLocale();
  const email = searchParams.get("email") || "";

  const form = useForm<ForgotPasswordResetValues>({
    resolver: zodResolver(forgotPasswordResetSchema),
    defaultValues: {
      email: email,
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { mutate: resetPassword, isPending } = useSupplierResetPassword();

  const onSubmit = (data: ForgotPasswordResetValues) => {
    resetPassword({
      email: data.email,
      code: data.code,
      newPassword: data.newPassword,
    });
  };

  return (
    <div className="container flex h-screen items-center justify-center lg:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted md:p-10 text-white lg:flex dark:border-r overflow-hidden">
        <div className="absolute inset-0 p-8">
          <div className="relative h-full w-full overflow-hidden rounded-lg">
            <Image
              src={locale === "en" ? "/12-1.jpg" : "/13-1.jpg"}
              alt="Reset password background"
              fill
              priority
              className="object-contain rounded-lg "
              style={{ clipPath: "inset(0 0 0 0, round, 10px)" }}
            />
          </div>
        </div>

        <Link
          href="/"
          className="relative z-30 flex items-center text-lg font-medium"
        >
          <Image
            src="/logo.png"
            alt="Logo"
            className="h-10"
            width={100}
            height={100}
          />
        </Link>

        <div className="relative z-30 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Join our network of professional movers and grow your business
              with Flyttman.
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("resetTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("resetDescription")}
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 w-full"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("emailPlaceholder")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("codePlaceholder")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("codePlaceholder")}
                        {...field}
                        maxLength={6}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("newPasswordPlaceholder")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder={t("newPasswordPlaceholder")}
                          type={showPassword ? "text" : "password"}
                          {...field}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("confirmPasswordPlaceholder")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder={t("confirmPasswordPlaceholder")}
                          type={showConfirmPassword ? "text" : "password"}
                          {...field}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isPending}
              >
                {isPending ? t("resetting") : t("resetPassword")}
              </Button>
            </form>
          </Form>

          <p className="px-8 text-center text-sm text-muted-foreground">
            {t("noCodeReceived")}{" "}
            <Link
              href="/supplier-forgot-password"
              className="underline underline-offset-4 hover:text-primary"
            >
              {t("sendAgain")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
