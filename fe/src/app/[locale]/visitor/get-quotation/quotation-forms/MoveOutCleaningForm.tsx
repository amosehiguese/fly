/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MoveOutCleaning, createMoveOutCleaningSchema } from "../i18n-schema";
import { UseMutationResult } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LogisticsForm, ContactForm, FormWrapper } from "./BaseQuotationForm";
import { QuotationSummary } from "../components/QuotationSummary";
import { FileUploader } from "../components/FileUploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";

interface MoveOutCleaningFormProps {
  onSubmit: (data: MoveOutCleaning) => void;
  mutation: UseMutationResult<unknown, unknown, unknown>;
  formStage: number;
  handleNext: () => void;
}

const CleaningDetailsForm = ({ form, handleNext }: any) => {
  const t = useTranslations("quotation.moveOutCleaning");
  const tCommon = useTranslations("quotation.common");

  const cleaningServicesList = [
    // { id: "basic", label: t("services.basic") },
    // { id: "deep", label: t("services.deep") },
    { id: "moveCleaning", label: t("services.moveCleaning") },
    { id: "window", label: t("services.window") },
    // { id: "garbage", label: t("services.garbage") },
    { id: "sanitization", label: t("services.sanitization") },
    { id: "waste", label: t("services.waste") },
    { id: "singleToilet", label: t("services.singleToilet") },
    { id: "multipleToilets", label: t("services.multipleToilets") },
    // { id: "floor", label: t("services.floor") },
    // { id: "kitchen", label: t("services.kitchen") },
    // { id: "bathroom", label: t("services.bathroom") },
  ];

  const needsRUT = form.watch("rut_discount");

  const handleClick = async () => {
    const isValid = await form.trigger([
      "move_type",
      "pickup_property_size",
      "rok",
      "garage",
      "storage",
      "services",
      "other",
      "rut_discount",
      "photos",
      "ssn",
    ]);
    if (isValid) handleNext();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="move_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("propertyType")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectPropertyType")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="villa">
                    {t("propertyTypes.villa")}
                  </SelectItem>
                  <SelectItem value="townHouse">
                    {t("propertyTypes.townHouse")}
                  </SelectItem>
                  <SelectItem value="apartment">
                    {t("propertyTypes.apartment")}
                  </SelectItem>

                  {/* <SelectItem value="movingAbroad">
                    {t("propertyTypes.movingAbroad")}
                  </SelectItem> */}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pickup_property_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("propertySize")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  placeholder={t("enterSize")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rok"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("rok")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  placeholder={t("selectRok")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="garage"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t("includesGarageOrStorage")}</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* <FormField
        control={form.control}
        name="storage.needed"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("storage")}</FormLabel>
            <div className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </div>
            {field.value && (
              <FormField
                control={form.control}
                name="storage.description"
                render={({ field }) => (
                  <FormItem className="mt-2">
                    <FormControl>
                      <Textarea
                        placeholder={t("storageDescription")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormMessage />
          </FormItem>
        )}
      /> */}

      <div>
        <FormLabel className="text-base">{t("services.title")}</FormLabel>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {cleaningServicesList.map((service) => (
            <FormField
              key={service.id}
              control={form.control}
              name="services"
              render={({ field }) => {
                return (
                  <FormItem
                    key={service.id}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(service.label)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...field.value, service.label])
                            : field.onChange(
                                field.value?.filter(
                                  (value: string) => value !== service.label
                                )
                              );
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {service.label}
                    </FormLabel>
                  </FormItem>
                );
              }}
            />
          ))}
        </div>
        <FormMessage />
      </div>

      <FormField
        control={form.control}
        name="other"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("other")}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("otherPlaceholder")}
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="photos"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("photos")}</FormLabel>
            <FormControl>
              <FileUploader
                value={field.value || []}
                onChange={field.onChange}
                maxFiles={5}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="rut_discount"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t("rut")}</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>

      {needsRUT && (
        <FormField
          control={form.control}
          name="ssn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("ssn")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="YYYYMMDD-XXXX" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="flex justify-center">
        <Button onClick={handleClick} className="mt-8 px-16">
          {tCommon("next")}
        </Button>
      </div>
    </div>
  );
};

export const MoveOutCleaningForm: React.FC<MoveOutCleaningFormProps> = ({
  onSubmit,
  mutation,
  formStage,
  handleNext,
}) => {
  const t = useTranslations("common");
  const savedData = React.useMemo(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("move-out-cleaning-form");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  }, []);

  const form = useForm<MoveOutCleaning>({
    resolver: zodResolver(createMoveOutCleaningSchema(t)),
    defaultValues: {
      name: "",
      from_city: "",
      to_city: "",
      date: "",
      email: "",
      phone: "",
      type_of_service: "Moving & Cleaning",
      pickup_address: "",
      delivery_address: "",
      service_type: "Moving & Cleaning",
      latest_date: "",
      move_type: "localMove",
      pickup_property_size: undefined,
      rok: undefined,
      garage: false,
      storage: {
        needed: savedData?.storage?.needed || false,
        description: savedData?.storage?.description || "",
      },
      services: [],
      other: savedData?.other || "",
      rut_discount: false,
      photos: [],
      ssn: "",
      distance: "",
    },
  });

  React.useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem("move-out-cleaning-form", JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleFormSubmit = (data: MoveOutCleaning) => {
    onSubmit(data);
  };

  return (
    <FormWrapper form={form} onSubmit={handleFormSubmit}>
      {formStage === 1 ? (
        <LogisticsForm form={form} handleNext={handleNext} />
      ) : formStage === 2 ? (
        <CleaningDetailsForm form={form} handleNext={handleNext} />
      ) : formStage === 3 ? (
        <ContactForm form={form} handleNext={handleNext} />
      ) : (
        <QuotationSummary
          formData={form.getValues()}
          onSubmit={handleFormSubmit}
          isPending={mutation.isPending}
        />
      )}
    </FormWrapper>
  );
};

export default MoveOutCleaningForm;
