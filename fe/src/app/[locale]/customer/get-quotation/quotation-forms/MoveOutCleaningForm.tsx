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
import { MoveOutCleaning, createMoveOutCleaningSchema } from "../i18n-schema";
import { UseMutationResult } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import { FileUploader } from "../components/FileUploader";

interface MoveOutCleaningFormProps {
  onSubmit: (data: MoveOutCleaning) => void;
  mutation: UseMutationResult<unknown, unknown, unknown>;
  formStage: number;
  handleNext: () => void;
}

const MoveOutCleaningDetailsForm = ({ form, handleNext }: any) => {
  const t = useTranslations("quotation.moveOutCleaning");
  const tCommon = useTranslations("quotation.common");

  const handleClick = async () => {
    const isValid = await form.trigger([
      "service_type",
      "move_type",
      "apartment",
      "villa",
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
  const needsRUT = form.watch("rut_discount");

  const availableServices = [
    // { label: t("services.basic"), value: "basic" },
    // { label: t("services.deep"), value: "deep" },
    { label: t("services.moveCleaning"), value: "moveCleaning" },
    { label: t("services.window"), value: "window" },
    // { label: t("services.kitchen"), value: "kitchen" },
    // { label: t("services.bathroom"), value: "bathroom" },
    { label: t("services.sanitization"), value: "sanitization" },
    { value: "waste", label: t("services.waste") },
    { value: "singleToilet", label: t("services.singleToilet") },
    { value: "multipleToilets", label: t("services.multipleToilets") },
    // { label: t("services.floor"), value: "floor" },
    // { label: t("services.garbage"), value: "garbage" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <FormField
        control={form.control}
        name="move_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("propertyType")}</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
              }}
              defaultValue={field.value}
            >
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="pickup_property_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("propertySize")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  placeholder={t("propertySize")}
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
                  {...field}
                  type="number"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  placeholder={t("selectRok")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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

      {/* <FormField
        control={form.control}
        name="storage.needed"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  if (!checked) {
                    form.setValue("storage.description", "");
                  }
                }}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>{t("storage")}</FormLabel>
            </div>
          </FormItem>
        )}
      /> */}

      {/* {form.watch("storage.needed") && (
        <FormField
          control={form.control}
          name="storage.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Describe your storage needs" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )} */}

      <FormField
        control={form.control}
        name="services"
        render={() => (
          <FormItem>
            <FormLabel>{t("services.title")}</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableServices.map((service) => (
                <FormField
                  key={service.value}
                  control={form.control}
                  name="services"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(service.value)}
                          onCheckedChange={(checked) => {
                            const updatedServices = checked
                              ? [...field.value, service.value]
                              : field.value?.filter(
                                  (val: any) => val !== service.value
                                );
                            field.onChange(updatedServices);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
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

      <FormField
        control={form.control}
        name="other"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("other")}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t("otherPlaceholder")} />
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
      </div>

      {needsRUT && (
        <FormField
          control={form.control}
          name="ssn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("ssn")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("ssn")} />
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
  const { data: userDashboard } = useCustomerDashboard();
  const form = useForm<MoveOutCleaning>({
    resolver: zodResolver(createMoveOutCleaningSchema(t)),
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
      type_of_service: "Moving & Cleaning",
      service_type: "Moving & Cleaning",
      move_type: "apartment",
      apartment: true,
      villa: false,
      pickup_property_size: 0,
      rok: 0,
      garage: false,
      storage: {
        needed: false,
        description: "",
      },
      services: [],
      other: "",
      rut_discount: false,
      ssn: "",
      photos: [] as File[],
    },
  });

  // useFormPersist(form, "moveOutCleaningForm", ["photos"]);

  return (
    <FormWrapper form={form} onSubmit={onSubmit}>
      {formStage === 1 ? (
        <LogisticsForm form={form} handleNext={handleNext} />
      ) : formStage === 2 ? (
        <MoveOutCleaningDetailsForm form={form} handleNext={handleNext} />
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
