"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import api, { ErrorResponse } from "@/api";
import { handleMutationError } from "@/api";
import { toast } from "sonner";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSupplierDashboard } from "@/hooks/supplier";
import { AxiosError } from "axios";

export default function RequestOtpPage() {
  const t = useTranslations("common");
  const t2 = useTranslations("messages");
  const router = useRouter();
  const { data: supplier } = useSupplierDashboard();
  const locale = useLocale();

  // Create schema with translations
  const schema = z.object({
    email: z.string().email(t("validation.invalidEmail")),
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: supplier?.data.supplier_details.email,
    },
  });

  const requestCode = useMutation({
    mutationFn: (data: FormValues) => {
      return api.post("api/forgot-password/send-code", {
        email: data.email,
      });
    },
    onSuccess: () => {
      toast.success(t2("otpSent"));
      // Redirect to reset password page
      router.push("/supplier/settings/security/change-password/reset-password");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: AxiosError<ErrorResponse, any>) =>
      handleMutationError(error, locale),
  });

  const onSubmit = (data: FormValues) => {
    requestCode.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("labels.requestOtp")}</CardTitle>
          <CardDescription>{t2("enterEmailForReset")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("labels.email")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("labels.enterEmail")}
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={requestCode.isPending}
              >
                {requestCode.isPending
                  ? t("buttons.sending")
                  : t("buttons.sendOtp")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
