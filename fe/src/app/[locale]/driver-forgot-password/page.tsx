"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

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
import { useDriverSendForgotPasswordCode } from "@/hooks/useAuth";
import { forgotPasswordRequestSchema, ForgotPasswordRequestValues } from "@/schemas/forgotPassword";

export default function DriverForgotPasswordPage() {
  const t = useTranslations("auth.driverForgotPassword");

  const form = useForm<ForgotPasswordRequestValues>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate: requestCode, isPending } = useDriverSendForgotPasswordCode();

  const onSubmit = (data: ForgotPasswordRequestValues) => {
    requestCode({ email: data.email });
  };

  return (
    <div className="min-h-screen bg-[url('/1.jpg')] bg-cover bg-center bg-fixed bg-no-repeat">
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
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
                          placeholder={t("emailPlaceholder")}
                          type="email"
                          {...field}
                          className="focus-visible:ring-primary rounded-[12px] border-[#D9D9D9]"
                        />
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
                  {isPending ? t("sending") : t("sendResetCode")}
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t("rememberPassword")}{" "}
                <Link
                  href="/driver-login"
                  className="text-primary hover:underline font-medium"
                >
                  {t("backToLogin")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}