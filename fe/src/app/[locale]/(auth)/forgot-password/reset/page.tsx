"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import Nav from "../../login/Nav";
import { useResetPassword } from "@/hooks/useAuth";
import { forgotPasswordResetSchema, ForgotPasswordResetValues } from "@/schemas/forgotPassword";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const searchParams = useSearchParams();
  const t = useTranslations("auth.forgotPassword");
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

  const { mutate: resetPassword, isPending } = useResetPassword();

  const onSubmit = (data: ForgotPasswordResetValues) => {
    resetPassword({
      email: data.email,
      code: data.code,
      newPassword: data.newPassword,
    });
  };

  return (
    <div className="h-screen">
      <Nav/>
      <div className="flex flex-col items-center h-full flex-1 overflow-y-hidden bg-[url('/1.jpg')] bg-cover bg-no-repeat bg-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("resetTitle")}</CardTitle>
            <CardDescription>{t("resetDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          className="focus-visible:ring-primary rounded-[12px] border-[#D9D9D9]"
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
                          className="focus-visible:ring-primary rounded-[12px] border-[#D9D9D9]"
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
                            className="focus-visible:ring-primary rounded-[12px] border-[#D9D9D9] pr-10"
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
                            className="focus-visible:ring-primary rounded-[12px] border-[#D9D9D9] pr-10"
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
                  className="w-full"
                  disabled={isPending}
                >
                  {isPending ? t("resetting") : t("resetPassword")}
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t("noCodeReceived")}{" "}
                <Link
                  href="/forgot-password"
                  className="text-primary hover:underline font-medium"
                >
                  {t("sendAgain")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
