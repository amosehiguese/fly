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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CompanyRelocation,
  createCompanyRelocationSchema,
} from "../i18n-schema";
import { Button } from "@/components/ui/button";
import { UseMutationResult } from "@tanstack/react-query";
import { useCustomerDashboard } from "@/hooks/customer/useCustomerDashboard";
import { LogisticsForm, ContactForm, FormWrapper } from "./BaseQuotationForm";
import { QuotationSummary } from "../components/QuotationSummary";
// import { useFormPersist } from "@/hooks/useFormPersist";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { FileUploader } from "../components/FileUploader";

interface CompanyRelocationFormProps {
  onSubmit: (data: CompanyRelocation) => void;
  mutation: UseMutationResult<unknown, unknown, unknown>;
  formStage: number;
  handleNext: () => void;
}

const CompanyDetailsForm = ({ form, handleNext }: any) => {
  const t = useTranslations("quotation.companyRelocation");
  const tCommon = useTranslations("quotation.common");

  const handleClick = async () => {
    const isValid = await form.trigger([
      "move_type",
      "services",
      "additional_services",
      "other",
      "more_information",
      "photos",
    ]);
    if (isValid) handleNext();
  };

  const availableServices = [
    // { label: t("services.furnitureRemoval"), value: "furnitureRemoval" },
    { value: "transport", label: t("services.transport") },
    { label: t("services.cleaning"), value: "cleaning" },
    // { label: t("services.donationHandling"), value: "donationHandling" },
    { label: t("services.itEquipment"), value: "itEquipment" },
    { value: "driveToDump", label: t("services.driveToDump") },
    // { label: t("services.packing"), value: "packing" },
    // { label: t("services.storage"), value: "storage" },
  ];

  const additionalServices = [
    {
      value: "packingMaterials",
      label: t("additionalServiceOptions.packingMaterials"),
    },
    {
      value: "dismantling",
      label: t("additionalServiceOptions.dismantling"),
    },
    {
      value: "reassembly",
      label: t("additionalServiceOptions.reassembly"),
    },
    {
      value: "packingOfLooseItems",
      label: t("additionalServiceOptions.packingOfLooseItems"),
    },
    {
      value: "unpackingOfLooseItems",
      label: t("additionalServiceOptions.unpackingOfLooseItems"),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Move Type */}
      <FormField
        control={form.control}
        name="move_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("moveType")}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectMoveType")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="office">{t("moveTypes.office")}</SelectItem>
                <SelectItem value="store">{t("moveTypes.store")}</SelectItem>
                {/* <SelectItem value="factory">
                  {t("moveTypes.factory")}
                </SelectItem>
                <SelectItem value="warehouse">
                  {t("moveTypes.warehouse")}
                </SelectItem>
                <SelectItem value="school">{t("moveTypes.school")}</SelectItem> */}
                <SelectItem value="officeStore">
                  {t("moveTypes.officeStore")}
                </SelectItem>
                <SelectItem value="other">{t("moveTypes.other")}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Services */}
      <FormField
        control={form.control}
        name="services"
        render={() => (
          <FormItem>
            <FormLabel>{t("servicesRequired")}</FormLabel>
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

      {/* Additional Services */}
      <FormField
        control={form.control}
        name="additional_services"
        render={() => (
          <FormItem>
            <FormLabel>{t("additionalServices")}</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {additionalServices.map((service) => (
                <FormField
                  key={service.value}
                  control={form.control}
                  name="additional_services"
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

      {/* Other */}
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

      {/* More information */}
      <FormField
        control={form.control}
        name="more_information"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("specialInstructions")}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t("specialInstructionsPlaceholder")}
                className="min-h-[100px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Photos */}
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

      <div className="flex justify-center">
        <Button onClick={handleClick} className="mt-8 px-16">
          {tCommon("next")}
        </Button>
      </div>
    </div>
  );
};

export const CompanyRelocationForm: React.FC<CompanyRelocationFormProps> = ({
  onSubmit,
  mutation,
  formStage,
  handleNext,
}) => {
  const { data: userDashboard } = useCustomerDashboard();
  const t = useTranslations("common");
  const form = useForm<CompanyRelocation>({
    resolver: zodResolver(createCompanyRelocationSchema(t)),
    defaultValues: {
      name: userDashboard?.user?.fullname || "",
      company_name: "",
      from_city: "",
      to_city: "",
      pickup_address: "",
      delivery_address: "",
      date: "",
      latest_date: "",
      email: userDashboard?.user?.email || "",
      phone: userDashboard?.user?.phone_number || "",
      type_of_service: "Company Relocation",
      service_type: "Company Relocation",
      move_type: "",
      services: [],
      additional_services: [],
      distance: "",
      other: "",
      more_information: "",
      photos: [] as File[],
    },
  });

  // useFormPersist(form, "companyRelocationForm", ["photos"]);

  return (
    <FormWrapper form={form} onSubmit={onSubmit}>
      {formStage === 1 ? (
        <LogisticsForm form={form} handleNext={handleNext} />
      ) : formStage === 2 ? (
        <CompanyDetailsForm form={form} handleNext={handleNext} />
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
