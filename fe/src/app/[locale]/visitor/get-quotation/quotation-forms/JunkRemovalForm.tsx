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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JunkRemoval, junkRemovalSchema } from "../schema";
import { Button } from "@/components/ui/button";
import { UseMutationResult } from "@tanstack/react-query";
import { LogisticsForm, ContactForm, FormWrapper } from "./BaseQuotationForm";
import { QuotationSummary } from "../components/QuotationSummary";
import { FileUpload } from "@/components/ui/file-upload";
import { useTranslations } from "next-intl";

interface JunkRemovalFormProps {
  onSubmit: (data: JunkRemoval) => void;
  mutation: UseMutationResult<unknown, unknown, unknown>;
  formStage: number;
  handleNext: () => void;
}

const JunkRemovalDetailsForm = ({ form, handleNext }: any) => {
  const t = useTranslations("quotation.junkRemoval");
  const tCommon = useTranslations("quotation.common");

  const handleClick = async () => {
    const isValid = await form.trigger([
      "type_of_junk",
      "junk_volume",
      "junk_requirements",
      "hazardous_materials",
      "location_accessibility",
      "preferred_disposal_method",
      "photos",
    ]);
    if (isValid) handleNext();
  };

  const junkTypes = [
    { value: "Furniture", label: t("junkTypes.furniture") },
    { value: "Electronics", label: t("junkTypes.electronics") },
    { value: "Construction Debris", label: t("junkTypes.construction") },
    { value: "Yard Waste", label: t("junkTypes.garden") },
    { value: "Household Items", label: t("junkTypes.household") },
    { value: "Appliances", label: t("junkTypes.appliances") },
    { value: "Office Equipment", label: t("junkTypes.officeEquipment") },
    { value: "Metal", label: t("junkTypes.metal") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <FormField
        control={form.control}
        name="type_of_junk"
        render={() => (
          <FormItem className="col-span-2">
            <FormLabel>{t("typeOfJunk")}</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {junkTypes.map((item) => (
                <FormField
                  key={item.value}
                  control={form.control}
                  name="type_of_junk"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(item.value)}
                          onCheckedChange={(checked) => {
                            const updatedItems = checked
                              ? [...field.value, item.value]
                              : field.value?.filter(
                                  (val: any) => val !== item.value
                                );
                            field.onChange(updatedItems);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        {item.label}
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
        name="junk_volume"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("volumeOfItems")}</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("volumePlaceholder", {
                  defaultMessage: "e.g., 10 cubic meters",
                })}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="preferred_disposal_method"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("disposalMethod", {
                defaultMessage: "Preferred Disposal Method",
              })}
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("selectDisposalMethod", {
                      defaultMessage: "Select disposal method",
                    })}
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Standard">
                  {t("standard", { defaultMessage: "Standard" })}
                </SelectItem>
                <SelectItem value="Eco-Friendly">
                  {t("ecoFriendly", { defaultMessage: "Eco-Friendly" })}
                </SelectItem>
                <SelectItem value="Recycling">
                  {t("recycling", { defaultMessage: "Recycling" })}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="hazardous_materials"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel>
              {t("hazardousMaterials", {
                defaultMessage: "Contains Hazardous Materials",
              })}
            </FormLabel>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location_accessibility"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("accessibility", { defaultMessage: "Location Accessibility" })}
            </FormLabel>
            <FormControl>
              <textarea
                {...field}
                className="w-full min-h-[100px] p-2 border rounded-md"
                placeholder={t("accessibilityPlaceholder", {
                  defaultMessage:
                    "Describe how to access the junk (parking, stairs, etc.)",
                })}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="junk_requirements"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("specialRequirements", {
                defaultMessage: "Special Requirements",
              })}
            </FormLabel>
            <FormControl>
              <textarea
                {...field}
                className="w-full min-h-[100px] p-2 border rounded-md"
                placeholder={t("requirementsPlaceholder", {
                  defaultMessage:
                    "Any specific requirements for junk removal...",
                })}
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
              <FileUpload
                selectedFiles={field.value || []}
                onFilesSelected={(files) => {
                  const newFiles = [...(field.value || []), ...files];
                  field.onChange(newFiles);
                }}
                onFileRemove={(index) => {
                  const newFiles = [...(field.value || [])];
                  newFiles.splice(index, 1);
                  field.onChange(newFiles);
                }}
              />
            </FormControl>
            <FormDescription>{t("photosDescription")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-center">
        <Button onClick={handleClick} className="mt-8 px-16">
          {tCommon("next")}
        </Button>
      </div>
    </div>
  );
};

export const JunkRemovalForm: React.FC<JunkRemovalFormProps> = ({
  onSubmit,
  mutation,
  formStage,
  handleNext,
}) => {
  const form = useForm<any>({
    resolver: zodResolver(junkRemovalSchema),
    defaultValues: {
      name: "",
      from_city: "",
      to_city: "",
      pickup_address: "",
      delivery_address: "",
      date: "",
      latest_date: "",
      email: "",
      phone: "",
      type_of_service: "Junk Removal",
      type_of_junk: [],
      junk_volume: "",
      junk_requirements: "",
      hazardous_materials: false,
      location_accessibility: "",
      preferred_disposal_method: "Standard",
      photos: [] as File[],
    },
  });

  return (
    <FormWrapper form={form} onSubmit={onSubmit}>
      {formStage === 1 ? (
        <LogisticsForm form={form} handleNext={handleNext} />
      ) : formStage === 2 ? (
        <JunkRemovalDetailsForm form={form} handleNext={handleNext} />
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
