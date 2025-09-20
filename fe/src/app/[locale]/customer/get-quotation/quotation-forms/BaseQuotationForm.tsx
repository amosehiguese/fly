/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from "react";
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
import {
  CompanyRelocation,
  MoveOutCleaning,
  Storage,
  HeavyLifting,
  EstateClearance,
  EvacuationMove,
  CarryingAssistance,
  JunkRemoval,
  MovingService,
  PrivacyMove,
  SecrecyMove,
} from "../schema";
import { useDistanceCalculation } from "@/hooks/useDistanceCalculation";
import Image from "next/image";
import LocationInputWrapper from "@/components/LocationInputWrapper";
import { useLocale, useTranslations } from "next-intl";
import { formatDateLocale } from "@/lib/formatDateLocale";

export type QuotationFormData =
  | CompanyRelocation
  | MoveOutCleaning
  | Storage
  | HeavyLifting
  | EstateClearance
  | EvacuationMove
  | CarryingAssistance
  | JunkRemoval
  | MovingService
  | PrivacyMove
  | SecrecyMove;

interface BaseQuotationFormProps {
  form: UseFormReturn<any>;
  handleNext: () => void;
}

export const LogisticsForm = ({ form, handleNext }: BaseQuotationFormProps) => {
  const handleClick = async () => {
    const isValid = await form.trigger([
      "from_city",
      "to_city",
      "date",
      "pickup_address",
      ...(selectedService !== "Moving & Cleaning" ? ["delivery_address"] : []),
    ]);
    if (isValid) handleNext();
  };

  const selectedService = form.watch("service_type");
  const pickupAddress = form.watch("pickup_address");
  const deliveryAddress = form.watch("delivery_address");

  const { distance, isLoading, error, originCity, destinationCity } =
    useDistanceCalculation({
      origin: pickupAddress,
      destination: deliveryAddress,
    });

  useEffect(() => {
    if (selectedService !== "Moving & Cleaning") {
      form.setValue("distance", distance?.toString());
    }
    form.setValue("from_city", originCity);
  }, [originCity]);

  useEffect(() => {
    if (selectedService !== "Moving & Cleaning") {
      form.setValue("to_city", destinationCity);
      form.setValue("distance", distance?.toString());
    }
  }, [destinationCity]);

  // console.log("ss", selectedService);
  console.log("form errors", form.formState.errors);

  useEffect(() => {
    if (selectedService === "Moving & Cleaning") {
      form.setValue("delivery_address", "n/a");
      form.setValue("to_city", "n/a");
      form.setValue("distance", "0");
    }
  }, [selectedService]);

  const t = useTranslations("home.getQuote");
  const tCommon = useTranslations("quotation.common");
  const locale = useLocale();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
      <FormField
        control={form.control}
        name="pickup_address"
        render={({ field: { onChange, value, ...field } }) => (
          <FormItem>
            <FormLabel>
              {selectedService === "Moving & Cleaning"
                ? t("form.address")
                : t("form.pickupAddress")}
            </FormLabel>
            <FormControl>
              <LocationInputWrapper
                value={value}
                onChange={onChange}
                placeholder={
                  selectedService === "Moving & Cleaning"
                    ? t("form.enterAddress")
                    : t("form.enterPickupLocation")
                }
                name={field.name}
                onBlur={field.onBlur}
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY}
                debounce={400}
                minLengthAutocomplete={2}
                icon={
                  <Image
                    width={50}
                    height={50}
                    src="/car-icon.png"
                    alt="From Icon"
                    className="h-5 w-7"
                  />
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedService !== "Moving & Cleaning" && (
        <FormField
          control={form.control}
          name="delivery_address"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem
              className={`${selectedService === "Moving & Cleaning" && "hidden"}`}
            >
              <FormLabel>{t("form.deliveryAddress")}</FormLabel>
              <FormControl>
                <LocationInputWrapper
                  value={value}
                  onChange={onChange}
                  placeholder={t("form.enterDestination")}
                  name={field.name}
                  onBlur={field.onBlur}
                  apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY}
                  debounce={400}
                  minLengthAutocomplete={2}
                  icon={
                    <Image
                      width={50}
                      height={50}
                      src="/car-icon.png"
                      alt={t("form.fromIconAlt")}
                      className="h-5 w-7"
                    />
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="from_city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {selectedService === "Moving & Cleaning"
                ? t("form.city")
                : t("form.fromCity")}
            </FormLabel>
            <FormControl>
              <Input {...field} disabled />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="to_city"
        render={({ field }) => (
          <FormItem
            className={`${selectedService === "Moving & Cleaning" && "hidden"}`}
          >
            <FormLabel>{t("form.toCity")}</FormLabel>
            <FormControl>
              <Input {...field} disabled />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t("form.pickupDate")}</FormLabel>
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

      <FormField
        control={form.control}
        name="latest_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t("form.latestDate")}</FormLabel>
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

      <FormField
        control={form.control}
        name="distance"
        render={({ field }) => (
          <FormItem
            className={`${selectedService === "Moving & Cleaning" && "hidden"}`}
          >
            <FormLabel>{t("distance.label")}(km)</FormLabel>
            <FormControl>
              <Input
                className={`${error ? "border-red-500" : ""}`}
                {...field}
                placeholder={t("distance.label")}
                disabled
                // value={distance || 0}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isLoading && (
        <div
          className={`text-sm text-gray-600 mt-2 ${selectedService === "Moving & Cleaning" && "hidden"}`}
        >
          {t("distance.calculating")}
        </div>
      )}
      {error && (
        <div
          className={`text-sm text-red-600 mt-2 ${selectedService === "Moving & Cleaning" && "hidden"}`}
        >
          {error}
        </div>
      )}
      {/* {distance && !isLoading && !error && (
        <div className="text-sm text-gray-600 md:mt-8">
          Distance: {distance}
        </div>
      )} */}
      <div className="flex justify-center md:col-span-2">
        <Button onClick={handleClick} className="mt-8 px-16">
          {tCommon("next")}
        </Button>
      </div>
    </div>
  );
};

export const ContactForm = ({ form, handleNext }: BaseQuotationFormProps) => {
  const handleClick = async () => {
    const isValid = await form.trigger(["name", "email", "phone"]);
    console.log("is valid", isValid);
    if (isValid) handleNext();
  };
  const t = useTranslations("home.getQuote");
  const t2 = useTranslations("quotation");
  const tCommon = useTranslations("quotation.common");

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:w-[70%]">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.name")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type=""
                  placeholder=""
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
                <FormLabel>{t2("form.companyName")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type=""
                    placeholder={t2("form.enterCompanyName")}
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
              <FormLabel>{t("form.email")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder=""
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
              <FormLabel>{t("form.phone")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="tel"
                  placeholder=""
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
          {tCommon("next")}
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
  onSubmit,
}) => {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit || (() => {}))}
        className="space-y-8 animate-in fade-in-50 duration-300"
      >
        {children}
      </form>
    </Form>
  );
};
