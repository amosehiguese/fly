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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { HeavyLifting, createHeavyLiftingSchema } from "../i18n-schema";
import { UseMutationResult } from "@tanstack/react-query";
import { useCustomerDashboard } from "@/hooks/customer/useCustomerDashboard";
import { LogisticsForm, ContactForm, FormWrapper } from "./BaseQuotationForm";
import { QuotationSummary } from "../components/QuotationSummary";
import { useTranslations } from "next-intl";
// import { useFormPersist } from "@/hooks/useFormPersist";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "../components/FileUploader";

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
      "from_elevator",
      "to_floor",
      "to_elevator",
      "services",
      "other",
      "rut_discount",
      "extra_insurance",
      "additional_insurance",
      "photos",
      "ssn",
    ]);
    if (isValid) handleNext();
  };

  const needsRUT = form.watch("rut_discount");

  return (
    <div className="flex flex-col gap-6">
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
                <SelectItem value="piano">{t("itemTypes.piano")}</SelectItem>
                <SelectItem value="grandPiano">
                  {t("itemTypes.grandPiano")}
                </SelectItem>
                <SelectItem value="heavyFurniture">
                  {t("itemTypes.heavyFurniture")}
                </SelectItem>
                <SelectItem value="others">{t("itemTypes.others")}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="item_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("itemCount")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  placeholder={t("enterItemCount")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="item_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("itemValue")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  placeholder={t("enterItemValue")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="item_weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("itemWeight")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  placeholder={t("enterItemWeight")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="from_floor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fromFloor")}</FormLabel>
              <div className="flex gap-2 items-center">
                <FormControl>
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t("enterFloorNumber")}
                    className="w-full"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="to_floor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("toFloor")}</FormLabel>
              <div className="flex gap-2 items-center">
                <FormControl>
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t("enterFloorNumber")}
                    className="w-full"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="services"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("services.title")}</FormLabel>
            <div className="grid grid-cols-2 gap-4">
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value?.includes("transport")}
                    onCheckedChange={(checked) => {
                      const service = "transport";
                      const updatedServices = checked
                        ? [...field.value, service]
                        : field.value?.filter((val: any) => val !== service);
                      field.onChange(updatedServices);
                    }}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  {t("services.transport")}
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value?.includes("packaging")}
                    onCheckedChange={(checked) => {
                      const service = "packaging";
                      const updatedServices = checked
                        ? [...field.value, service]
                        : field.value?.filter((val: any) => val !== service);
                      field.onChange(updatedServices);
                    }}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  {t("services.packaging")}
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value?.includes("packaged")}
                    onCheckedChange={(checked) => {
                      const service = "packaged";
                      const updatedServices = checked
                        ? [...field.value, service]
                        : field.value?.filter((val: any) => val !== service);
                      field.onChange(updatedServices);
                    }}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  {t("services.packaged")}
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value?.includes("extraSensitive")}
                    onCheckedChange={(checked) => {
                      const service = "extraSensitive";
                      const updatedServices = checked
                        ? [...field.value, service]
                        : field.value?.filter((val: any) => val !== service);
                      field.onChange(updatedServices);
                    }}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  {t("services.extraSensitive")}
                </FormLabel>
              </FormItem>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="other"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("other")}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t("otherPlaceholder")}
                className="min-h-[100px]"
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
                maxSize={1024 * 1024 * 10}
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

      {needsRUT && (
        <FormField
          control={form.control}
          name="ssn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("ssn")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="12345" />
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
  const { data: userDashboard } = useCustomerDashboard();
  const form = useForm<HeavyLifting>({
    resolver: zodResolver(createHeavyLiftingSchema(t)),
    defaultValues: {
      name: userDashboard?.user?.fullname || "",
      from_city: "",
      to_city: "",
      pickup_address: "",
      delivery_address: "",
      distance: "",
      date: "",
      latest_date: "",
      email: userDashboard?.user?.email || "",
      phone: userDashboard?.user?.phone_number || "",
      type_of_service: "Heavy Lifting",
      service_type: "Heavy Lifting",
      item_type: "",
      item_count: 1,
      item_value: 0,
      item_weight: 0,
      from_floor: "",
      to_floor: "",
      services: [],
      other: "",
      rut_discount: false,
      extra_insurance: false,
      photos: [] as File[],
    },
  });

  // useFormPersist(form, "heavyLiftingForm", ["photos"]);

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
