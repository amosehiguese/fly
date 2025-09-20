"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCustomerDashboard } from "@/hooks/customer/useCustomerDashboard";
import api, { ErrorResponse, handleMutationError } from "@/api";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { AxiosError } from "axios";

export default function UpdateUserInfo() {
  const t = useTranslations("common");
  const t2 = useTranslations("messages");
  const { data: userDashboard, refetch } = useCustomerDashboard();
  const router = useRouter();
  const locale = useLocale();

  // Form validation schema with translations
  const userUpdateSchema = z.object({
    fullname: z.string().min(3, t("validation.fullNameMinLength")),
    password: z
      .string()
      .min(6, t("validation.passwordMinLength"))
      .optional()
      .or(z.literal("")),
    phone_number: z
      .string()
      .min(10, t("validation.phoneNumberMinLength"))
      .regex(/^\+?[0-9\s-()]+$/, t("validation.invalidPhoneFormat")),
    order_pin: z
      .string()
      .length(4, t("validation.pinMustBeFourDigits"))
      .regex(/^\d+$/, t("validation.pinMustBeDigits")),
  });

  type UserUpdateFormValues = z.infer<typeof userUpdateSchema>;

  // Setup the form with existing user data
  const form = useForm<UserUpdateFormValues>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      fullname: userDashboard?.user?.fullname || "",
      password: "",
      phone_number: userDashboard?.user?.phone_number || "",
      order_pin: "",
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: UserUpdateFormValues) => {
      const response = await api.post("api/customers/update-user", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t2("profileUpdated"));
      // Refresh user data
      refetch();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: AxiosError<ErrorResponse, any>) =>
      handleMutationError(error, locale),
  });

  // Handle form submission
  const onSubmit = (data: UserUpdateFormValues) => {
    // If password field is empty, remove it from the request
    if (!data.password) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...restData } = data;
      updateUserMutation.mutate(restData);
    } else {
      updateUserMutation.mutate(data);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between my-4 pb-4 border-b">
        <button className="" onClick={() => router.back()}>
          <ArrowLeft />
        </button>
        <div className="mx-auto font-bold">{t("labels.updateProfile")}</div>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t("labels.updateProfileInfo")}</CardTitle>
          <CardDescription>{t2("changeProfileDetails")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("labels.fullName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("labels.enterFullName")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("labels.phoneNumber")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("labels.enterPhoneNumber")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order_pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("labels.orderPin")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("labels.enterFourDigitPin")}
                        maxLength={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("labels.newPasswordOptional")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("labels.enterNewPassword")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <Button
                type="submit"
                className="w-full"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending
                  ? t("buttons.updating")
                  : t("buttons.updateProfile")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
