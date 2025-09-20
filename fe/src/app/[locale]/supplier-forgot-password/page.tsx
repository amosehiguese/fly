"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
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
import { useSupplierSendForgotPasswordCode } from "@/hooks/useAuth";
import { forgotPasswordRequestSchema, ForgotPasswordRequestValues } from "@/schemas/forgotPassword";

export default function SupplierForgotPasswordPage() {
  const t = useTranslations("auth.supplierForgotPassword");
  const locale = useLocale();

  const form = useForm<ForgotPasswordRequestValues>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate: requestCode, isPending } = useSupplierSendForgotPasswordCode();

  const onSubmit = (data: ForgotPasswordRequestValues) => {
    requestCode({ email: data.email });
  };

  return (
    <div className="container flex h-screen items-center justify-center lg:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted md:p-10 text-white lg:flex dark:border-r overflow-hidden">
        <div className="absolute inset-0 p-8">
          <div className="relative h-full w-full overflow-hidden rounded-lg">
            <Image
              src={locale === "en" ? "/12-1.jpg" : "/13-1.jpg"}
              alt="Forgot password background"
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
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("description")}
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
                      />
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
                {isPending ? t("sending") : t("sendResetCode")}
              </Button>
            </form>
          </Form>

          <p className="px-8 text-center text-sm text-muted-foreground">
            {t("rememberPassword")}{" "}
            <Link
              href="/supplier-login"
              className="underline underline-offset-4 hover:text-primary"
            >
              {t("backToLogin")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
