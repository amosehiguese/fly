/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  CalendarIcon,
  ChevronRightIcon,
  Loader2,
  ShieldCheckIcon,
  StarIcon,
  TruckIcon,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "@/i18n/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { useDistanceCalculation } from "@/hooks/useDistanceCalculation";
import { useLocale, useTranslations } from "next-intl";
import { formatDateLocale } from "@/lib/formatDateLocale";

const GetQuote = ({ className = "" }: { className?: string }) => {
  const t = useTranslations("home.getQuote");
  const t2 = useTranslations("offerRequest");
  const locale = useLocale();

  const router = useRouter();
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const quotationTypes = [
    { value: "private-move", label: t("services.privateMove") },
    { value: "company-relocation", label: t("services.companyRelocation") },
    { value: "move-out-cleaning", label: t("services.moveOutCleaning") },
    // { value: "storage", label: "Storage" },
    { value: "heavy-lifting", label: t("services.heavyLifting") },
    // { value: "carrying-assistance", label: "Carrying Assistance" },
    // { value: "junk-removal", label: "Junk Removal" },
    { value: "estate-clearance", label: t("services.estateClearance") },
    { value: "evacuation-move", label: t("services.evacuationMove") },
    { value: "secrecy-move", label: t("services.secrecyMove") },

    // { value: "moving-service,moving_abroad", label: "Moving Abroad" },
    // { value: "moving-service,long_distance_move", label: "Long Distance Move" },
    // { value: "moving-service,local_move", label: "Local Move" },
  ];

  const formSchema = z.object({
    from_city: z.string().optional(),
    to_city: z.string().optional(),
    pickup_address: z.string().min(1, t("validation.pickupAddressRequired")),
    delivery_address: z
      .string()
      .min(1, t("validation.deliveryAddressRequired")),
    date: z.string().min(1, t("validation.moveDateRequired")),
    latest_date: z.string().min(1, t("validation.latestDateRequired")),
    service_type: z.string().min(1, t("validation.serviceTypeRequired")),
    distance: z.number().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from_city: "",
      to_city: "",
      pickup_address: undefined,
      delivery_address: undefined,
      date: undefined,
      latest_date: undefined,
      service_type: "",
    },
  });

  const selectedService = form.watch("service_type");
  const fromAddress = form.watch("pickup_address");
  const toAddress = form.watch("delivery_address");
  // const startDate = form.watch("move_start_date");

  const { distance, originCity, destinationCity, isLoading, error } =
    useDistanceCalculation({
      origin: fromAddress,
      destination: toAddress,
    });
  // console.log(originCity, destinationCity);

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsButtonLoading(true);
    const params = new URLSearchParams({
      from_city: originCity,
      to_city: destinationCity,
      pickup_address: data.pickup_address,
      delivery_address: data.delivery_address,
      date: data.date,
      latest_date: data.latest_date,
      service_type: data.service_type.split(",")[0],
      sub_type: data.service_type.split(",")[1],
      stage: "2",
      distance: distance?.toString() || "",
    });

    router.push(`/visitor/get-quotation?${params.toString()}`);
    setIsButtonLoading(false);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedService === "move-out-cleaning") {
      form.setValue("delivery_address", "n/a");
      form.setValue("to_city", "n/a");
      form.setValue("distance", 0);
    } else {
      form.setValue("delivery_address", "");
      form.setValue("to_city", "");
      form.setValue("distance", 0);
    }
  }, [selectedService]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "relative flex justify-center  w-full z-0 bg-[url(/01.jpg)] bg-cover bg-center bg-no-repeat",
        className
      )}
      id="get-quote"
    >
      <div className=" bg-black/[0.5]  bg-cover bg-center bg-no-repeat w-full h-full">
        <div className=" w-full max-w-[1280px] mx-auto px-6 lg:px-8 py-24">
          <div className="w-full justify-center items-center flex flex-col lg:space-x-24 lg:flex-row ">
            <div className="lg:w-1/2 flex flex-col justify-center p-0 mb-6 lg:mb-0 lg:p-6 text-white">
              <h1 className="font-livvic text-2xl lg:text-3xl font-bold mb-4 text-shadow">
                {t2("title")}
              </h1>
              <p className="mb-6 text-lg text-shadow-sm">{t2("subtitle")}</p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="bg-white/30 p-2 rounded-full mr-3">
                    <TruckIcon size={24} className="text-white" />
                  </div>
                  <span className="font-medium text-shadow-sm">
                    {t2("features.quickService")}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="bg-white/30 p-2 rounded-full mr-3">
                    <ShieldCheckIcon size={24} className="text-white" />
                  </div>
                  <span className="font-medium text-shadow-sm">
                    {t2("features.insuredTransport")}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="bg-white/30 p-2 rounded-full mr-3">
                    <StarIcon size={24} className="text-white" />
                  </div>
                  <span className="font-medium text-shadow-sm">
                    {t2("features.professionalTeam")}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white lg:w-1/2 px-4 lg:px-8 py-6 rounded-[10px] shadow-sm">
              <h2 className="font-livvic font-semibold text-[20px] my-4 text-title">
                {t("title")}
              </h2>
              {/* <p className="mb-4">{t("subtitle")}</p> */}

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-y-4 "
                >
                  <FormField
                    control={form.control}
                    name="service_type"
                    render={({ field }) => (
                      <FormItem className="w-full space-y-0">
                        <FormLabel>{t("form.serviceType")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("form.selectService")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {quotationTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pickup_address"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel>
                          {selectedService === "move-out-cleaning"
                            ? t("form.address")
                            : t("form.pickupAddress")}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Image
                                width={50}
                                height={50}
                                src="/car-icon.png"
                                alt={t("form.fromIconAlt")}
                                className="h-5 w-7"
                              />
                            </div>
                            <GooglePlacesAutocomplete
                              apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY}
                              debounce={400}
                              minLengthAutocomplete={2}
                              apiOptions={{
                                region: "se",
                                language: locale,
                              }}
                              autocompletionRequest={{
                                componentRestrictions: {
                                  country: [
                                    "se",
                                    "no",
                                    "fi",
                                    "dk",
                                    "de",
                                    "fr",
                                    "es",
                                    "it",
                                    "nl",
                                    "be",
                                    "pl",
                                    "cz",
                                    "at",
                                    "ch",
                                    "uk",
                                    "ie",
                                    "pt",
                                    "gr",
                                    "hu",
                                    "ro",
                                    "bg",
                                    "hr",
                                    "ee",
                                    "lv",
                                    "lt",
                                    "lu",
                                    "mt",
                                    "sk",
                                    "si",
                                    "cy",
                                  ],
                                },
                              }}
                              selectProps={{
                                value: value ? { label: value, value } : null,
                                onChange: (option: any) =>
                                  onChange(option?.label || undefined),
                                placeholder:
                                  selectedService === "move-out-cleaning"
                                    ? t("form.enterAddress")
                                    : t("form.enterPickupLocation"),
                                name: field.name,
                                onBlur: field.onBlur,
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                ref: field.ref,
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="delivery_address"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem
                        className={`${selectedService === "move-out-cleaning" && "hidden"}`}
                      >
                        <FormLabel>{t("form.deliveryAddress")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Image
                                width={50}
                                height={50}
                                src="/car-icon.png"
                                alt={t("form.toIconAlt")}
                                className="h-5 w-7"
                              />
                            </div>
                            <GooglePlacesAutocomplete
                              apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY}
                              debounce={400}
                              minLengthAutocomplete={2}
                              apiOptions={{
                                region: "se",
                                language: locale,
                              }}
                              autocompletionRequest={{
                                componentRestrictions: {
                                  country: [
                                    "se",
                                    "no",
                                    "fi",
                                    "dk",
                                    "de",
                                    "fr",
                                    "es",
                                    "it",
                                    "nl",
                                    "be",
                                    "pl",
                                    "cz",
                                    "at",
                                    "ch",
                                    "uk",
                                    "ie",
                                    "pt",
                                    "gr",
                                    "hu",
                                    "ro",
                                    "bg",
                                    "hr",
                                    "ee",
                                    "lv",
                                    "lt",
                                    "lu",
                                    "mt",
                                    "sk",
                                    "si",
                                    "cy",
                                  ],
                                },
                              }}
                              selectProps={{
                                value: value ? { label: value, value } : null,
                                onChange: (option: any) =>
                                  onChange(option?.label || undefined),
                                placeholder: t("form.enterDestination"),
                                name: field.name,
                                onBlur: field.onBlur,
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                ref: field.ref,
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                        {isLoading && (
                          <div className="text-sm text-gray-600 mt-2">
                            {t("distance.calculating")}
                          </div>
                        )}
                        {error && (
                          <div className="text-sm text-red-600 mt-2">
                            {error}
                          </div>
                        )}
                        {distance && !isLoading && !error && (
                          <div className="text-sm text-gray-600 mt-2">
                            {t("distance.label")}: {distance}km
                          </div>
                        )}
                      </FormItem>
                    )}
                  />

                  <div className="flex mt-1 space-x-4 justify-between">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col">
                          <FormLabel>{t("form.pickupDate")}</FormLabel>
                          <FormControl>
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
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={
                                    field.value
                                      ? new Date(field.value)
                                      : undefined
                                  }
                                  onSelect={(date) =>
                                    field.onChange(
                                      date ? format(date, "yyyy-MM-dd") : ""
                                    )
                                  }
                                  disabled={(date) =>
                                    date < new Date() ||
                                    date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="latest_date"
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col">
                          <FormLabel>{t("form.latestDate")}</FormLabel>
                          <FormControl>
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
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={
                                    field.value
                                      ? new Date(field.value)
                                      : undefined
                                  }
                                  onSelect={(date) =>
                                    field.onChange(
                                      date ? format(date, "yyyy-MM-dd") : ""
                                    )
                                  }
                                  disabled={(date: Date): boolean =>
                                    date < new Date() ||
                                    date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="w-full space-x-4 flex mt-2 justify-center">
                    <Button type="submit" className="mt-4 px-8 font-semibold">
                      {isButtonLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        t("form.submit")
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="mt-4 px-8 font-semibold"
                    >
                      <a
                        href="mailto:support@flyttman.se"
                        className="hover:text-primary transition-colors"
                      >
                        {t("getInTouch")}
                      </a>
                      <ChevronRightIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            {/* <div className="lg:w-[50%] flex justify-end items-center rounded-[16px]">
            <AnimatedImage
              src="/get-quote.png"
              width={1000}
              height={1000}
              className="w-[200px] h-[200px]  lg:w-[400px] lg:h-[400px] lg:w-[500px] lg:h-[500px] object-contain"
              alt="homepage image"
            />
          </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetQuote;
