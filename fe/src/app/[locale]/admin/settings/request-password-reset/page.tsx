"use client";

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
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset } from "@/api/admin";
import { toast } from "sonner";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

const RequestPasswordResetPage = () => {
  const t = useTranslations("admin.settings.requestPasswordReset");
  const locale = useLocale();
  const router = useRouter();
  const formSchema = z.object({
    email: z.string().email("Invalid email address"),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationKey: ["request-password-reset"],
    mutationFn: (data: FormValues) => requestPasswordReset(data.email),
    onSuccess: (data, variables) => {
      const message =
        locale === "en"
          ? data.message || "Reset code sent successfully"
          : data.messageSv || "Återställningskod skickad";
      toast.success(message);
      form.reset();
      router.push(`/admin/settings/reset-password?email=${variables.email}`);
    },
    onError: () => {
      toast.error("Failed to send reset code. Please try again.");
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-50 dark:bg-gray-900">
      <div className="md:max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {t("title")}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t("cardTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.email")}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t("form.emailPlaceholder")}
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
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? t("form.sending") : t("form.sendReset")}
                </Button>
              </form>
            </Form>

            {/* <div className="mt-6 text-center">
              <Link
                href="/admin-login"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("form.backToLogin")}
              </Link>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RequestPasswordResetPage;
