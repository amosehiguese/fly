/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { format } from "date-fns";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { formatDateLocale } from "@/lib/formatDateLocale";

interface BaseQuotationFormProps {
  form: UseFormReturn<any>;
  handleNext: () => void;
}

export const LogisticsForm = ({ form, handleNext }: BaseQuotationFormProps) => {
  const t = useTranslations("quotation");
  const locale = useLocale();

  const handleClick = async () => {
    const isValid = await form.trigger(["from_city", "to_city", "move_date"]);
    if (isValid) handleNext();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="from_city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("form.fromCity")}</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("form.enterOriginCity")}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="to_city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("form.toCity")}</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("form.enterDestinationCity")}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="move_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t("form.moveDate")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      formatDateLocale(field.value, locale)
                    ) : (
                      <span>{t("form.pickDate")}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) =>
                    field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                  }
                  disabled={(date) =>
                    date < new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex justify-center md:col-span-2">
        <Button onClick={handleClick} className="mt-8 px-16">
          {t("common.next")}
        </Button>
      </div>
    </div>
  );
};

export const ContactForm = ({ form, handleNext }: BaseQuotationFormProps) => {
  const t = useTranslations("quotation");
  const searchParams = useSearchParams();
  const moveDate = searchParams.get("date") as string | null;
  const latestDate = searchParams.get("latest_date") as string | null;
  const fromCity = searchParams.get("from_city") as string | null;
  const toCity = searchParams.get("to_city") as string | null;
  const pickupAddress = searchParams.get("pickup_address") as string | null;
  const deliveryAddress = searchParams.get("delivery_address") as string | null;
  const distance = searchParams.get("distance") as string | null;

  const handleClick = async () => {
    const isValid = await form.trigger(["full_name", "email", "phone"]);
    if (isValid) {
      form.setValue("date", moveDate);
      form.setValue("latest_date", latestDate);
      form.setValue("from_city", fromCity);
      form.setValue("to_city", toCity);
      form.setValue("pickup_address", pickupAddress);
      form.setValue("delivery_address", deliveryAddress);
      form.setValue("distance", distance);
      handleNext();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:w-[95%]">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.fullName")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type=""
                  placeholder={t("form.enterFullName")}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.getValues().service_type === "Company Relocation" && (
          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.companyName")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type=""
                    placeholder={t("form.enterCompanyName")}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.emailAddress")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder={t("form.enterEmailAddress")}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.phoneNumber")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="tel"
                  placeholder={t("form.enterPhoneNumber")}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="flex justify-center">
        <Button onClick={handleClick} className="mt-8 px-16">
          {t("common.next")}
        </Button>
      </div>
    </div>
  );
};

interface FormWrapperProps {
  children: React.ReactNode;
  form: UseFormReturn<any>;
  onSubmit?: (data: any) => void;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({
  children,
  form,
  // onSubmit,
}) => {
  // Save form values to localStorage whenever they change
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem("quotationFormData", JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="space-y-6"
      >
        {children}
      </form>
    </Form>
  );
};
