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
import { HeavyLifting, createHeavyLiftingSchema } from "../i18n-schema";
import { UseMutationResult } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LogisticsForm, ContactForm, FormWrapper } from "./BaseQuotationForm";
import { QuotationSummary } from "../components/QuotationSummary";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUploader } from "../components/FileUploader";
import { useTranslations } from "next-intl";

interface HeavyLiftingFormProps {
  onSubmit: (data: HeavyLifting) => void;
  mutation: UseMutationResult<unknown, unknown, unknown>;
  formStage: number;
  handleNext: () => void;
}

const HeavyLiftingDetailsForm = ({ form, handleNext }: any) => {
  const t = useTranslations("quotation.heavyLifting");
  const tCommon = useTranslations("quotation.common");

  const handleClick = async () => {
    const isValid = await form.trigger([
      "item_type",
      "item_count",
      "item_value",
      "item_weight",
      "from_floor",
      "to_floor",
      "services",
      "other",
      "rut_discount",
      "extra_insurance",
      "photos",
      "ssn",
    ]);

    if (isValid) handleNext();
  };

  const itemTypes = [
    { value: "piano", label: t("itemTypes.piano") },
    { value: "grandPiano", label: t("itemTypes.grandPiano") },
    { value: "heavyFurniture", label: t("itemTypes.heavyFurniture") },
    { value: "others", label: t("itemTypes.others") },
  ];

  const services = [
    { value: "transport", label: t("services.transport") },
    { value: "packaging", label: t("services.packaging") },
    { value: "packaged", label: t("services.packaged") },
    { value: "extraSensitive", label: t("services.extraSensitive") },
  ];

  const needsRUT = form.watch("rut_discount");

  return (
    <div className="space-y-6">
      {/* Item Type */}
      <FormField
        control={form.control}
        name="item_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("itemType")}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectItemType")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {itemTypes.map((type) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Item Count */}
        <FormField
          control={form.control}
          name="item_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("itemCount")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t("enterItemCount")}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Item Value */}
        <FormField
          control={form.control}
          name="item_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("itemValue")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={t("enterItemValue")}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Item Weight */}
        <FormField
          control={form.control}
          name="item_weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("itemWeight")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={t("enterItemWeight")}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* From Floor & Elevator */}
        <FormField
          control={form.control}
          name="from_floor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fromFloor")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("enterFloorNumber")}
                  {...field}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* To Floor & Elevator */}
        <FormField
          control={form.control}
          name="to_floor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("toFloor")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("enterFloorNumber")}
                  {...field}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Services */}
      <FormField
        control={form.control}
        name="services"
        render={() => (
          <FormItem>
            <FormLabel>{t("services.title")}</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              {services?.map((service) => (
                <FormField
                  key={service.value}
                  control={form.control}
                  name="services"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(service.value)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, service.value])
                              : field.onChange(
                                  field.value?.filter(
                                    (value: string) => value !== service.value
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {service.label}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Other Information */}
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

      {/* Insurance Options */}
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

        <FormField
          control={form.control}
          name="extra_insurance"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t("insurance")}</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* File Upload */}
      <FormField
        control={form.control}
        name="photos"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("photos")}</FormLabel>
            <FormControl>
              <FileUploader
                value={field.value}
                onChange={field.onChange}
                maxFiles={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {needsRUT && (
        <FormField
          control={form.control}
          name="ssn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("ssn")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="" />
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

export const HeavyLiftingForm: React.FC<HeavyLiftingFormProps> = ({
  onSubmit,
  mutation,
  formStage,
  handleNext,
}) => {
  const t = useTranslations("common");
  const form = useForm<HeavyLifting>({
    resolver: zodResolver(createHeavyLiftingSchema(t)),
    defaultValues: {
      service_type: "Heavy Lifting",
      type_of_service: "Heavy Lifting",
      name: "",
      from_city: "",
      to_city: "",
      date: "",
      email: "",
      phone: "",
      pickup_address: "",
      delivery_address: "",
      latest_date: "",
      item_type: "",
      item_count: undefined,
      item_value: undefined,
      item_weight: undefined,
      from_floor: "",
      to_floor: "",
      services: ["transport"],
      other: "",
      rut_discount: false,
      extra_insurance: false,
      photos: [],
      ssn: "",
    },
  });

  // Save form state to localStorage when it changes
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(
        "quotationFormData-heavylifting",
        JSON.stringify(value)
      );
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <FormWrapper form={form} onSubmit={onSubmit}>
      {formStage === 1 ? (
        <LogisticsForm form={form} handleNext={handleNext} />
      ) : formStage === 2 ? (
        <HeavyLiftingDetailsForm form={form} handleNext={handleNext} />
      ) : formStage === 3 ? (
        <ContactForm form={form} handleNext={handleNext} />
      ) : (
        <QuotationSummary
          formData={form.getValues()}
          onSubmit={onSubmit}
          isPending={mutation.isPending}
        />
      )}
    </FormWrapper>
  );
};

export default HeavyLiftingForm;
