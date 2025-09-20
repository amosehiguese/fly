/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  CompanyRelocation,
  createCompanyRelocationSchema,
} from "../i18n-schema";
import { UseMutationResult } from "@tanstack/react-query";
import { ContactForm, LogisticsForm, FormWrapper } from "./BaseQuotationForm";
import { QuotationSummary } from "../components/QuotationSummary";
import { FileUploader } from "../components/FileUploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

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
    ]);
    if (isValid) handleNext();
  };

  const availableServices = [
    // { value: "furnitureRemoval", label: t("services.furnitureRemoval") },
    { value: "transport", label: t("services.transport") },
    { value: "cleaning", label: t("services.cleaning") },
    // { value: "donationHandling", label: t("services.donationHandling") },
    { value: "itEquipment", label: t("services.itEquipment") },
    { value: "driveToDump", label: t("services.driveToDump") },
    // { value: "packing", label: t("services.packing") },
    // { value: "storage", label: t("services.storage") },
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
    <div className="space-y-6">
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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(service.value)}
                          onCheckedChange={(checked) => {
                            const updatedServices = checked
                              ? [...field.value, service.value]
                              : field.value?.filter(
                                  (val: string) => val !== service.value
                                );
                            field.onChange(updatedServices);
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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(service.value)}
                          onCheckedChange={(checked) => {
                            const updatedServices = checked
                              ? [...field.value, service.value]
                              : field.value?.filter(
                                  (val: string) => val !== service.value
                                );
                            field.onChange(updatedServices);
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
              <textarea
                {...field}
                className="w-full min-h-[80px] p-2 border rounded-md"
                placeholder={t("otherPlaceholder")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Additional Information */}
      <FormField
        control={form.control}
        name="more_information"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("specialInstructions")}</FormLabel>
            <FormControl>
              <textarea
                {...field}
                className="w-full min-h-[100px] p-2 border rounded-md"
                placeholder={t("specialInstructionsPlaceholder")}
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
  const t = useTranslations("common");
  const form = useForm<CompanyRelocation>({
    resolver: zodResolver(createCompanyRelocationSchema(t)),
    defaultValues: {
      name: "",
      company_name: "",
      from_city: "",
      to_city: "",
      date: "",
      latest_date: "",
      move_type: "",
      services: [],
      pickup_address: "",
      delivery_address: "",
      email: "",
      phone: "",
      service_type: "Company Relocation",
      type_of_service: "Company Relocation",
      other: "",
      more_information: "",
      additional_services: [],
      distance: 0,
      photos: [],
    },
  });

  return (
    <FormWrapper form={form}>
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
