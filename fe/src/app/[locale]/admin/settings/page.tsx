"use client";

import { Button } from "@/components/ui/button";
import { useAdminUser } from "@/hooks/useUser";
import { Separator } from "@radix-ui/react-separator";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

const Page = () => {
  const { data: admin } = useAdminUser();
  const t = useTranslations("admin.settings.general");

  // Define the form schema using zod
  const formSchema = z.object({
    platformName: z.string().min(1, t("validation.platformNameRequired")),
    email: z.string().email(t("validation.invalidEmail")),
    phoneNumber: z.string().min(1, t("validation.phoneRequired")),
    address: z.string().min(1, t("validation.addressRequired")),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platformName: admin?.username || "",
      email: "",
      phoneNumber: "",
      address: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // TODO: Replace with your API call
      console.log("Form data:", values);
      // await updateBusinessDetails(values);
      // Add success toast/notification here
    } catch (error) {
      console.error("Error updating business details:", error);
      // Add error toast/notification here
    }
  }

  return (
    <div className="flex-col flex-1 dark:text-white p-2 min-h-full">
      <div className="border-l border-[#C4C4C4] p-2 h-full">
        <h2 className="text-[26px] dark:text-white font-semibold text-subtitle">
          {t("title")}
        </h2>
        <p className="text-subtitle">{t("subtitle")}</p>

        <Separator className="bg-[#C4C4C4] w-full h-[1px] my-4" />

        <div>
          <h3 className="font-semibold mb-4 dark:text-white text-subtitle">
            {t("businessDetails")}
          </h3>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="platformName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.platformName")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        className="dark:border-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.emailAddress")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        className="dark:border-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.phoneNumber")}</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        {...field}
                        className="dark:border-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.address")}</FormLabel>
                    <FormControl>
                      <Input {...field} className="dark:border-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="font-semibold text-white"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? t("form.updating")
                : t("form.applyNow")}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Page;
