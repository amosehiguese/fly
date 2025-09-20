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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrivacyMove, createSecrecyMoveSchema } from "../i18n-schema";
import { useCustomerDashboard } from "@/hooks/customer/useCustomerDashboard";
import { UseMutationResult } from "@tanstack/react-query";
import { LogisticsForm, ContactForm, FormWrapper } from "./BaseQuotationForm";
import { QuotationSummary } from "../components/QuotationSummary";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { FileUploader } from "../components/FileUploader";
// import { useFormPersist } from "@/hooks/useFormPersist";

interface SecrecyMoveFormProps {
  onSubmit: (data: PrivacyMove) => void;
  mutation: UseMutationResult<unknown, unknown, unknown>;
  formStage: number;
  handleNext: () => void;
}

const SecrecyMoveDetailsForm = ({ form, handleNext }: any) => {
  const t = useTranslations("quotation.secrecyMove");
  const tCommon = useTranslations("quotation.common");

  const handleClick = async () => {
    const isValid = await form.trigger([
      "move_type",
      "from_rok",
      "to_rok",
      "from_floor",
      "to_floor",
      "from_elevator",
      "to_elevator",
      "property_size",
      "home_description",
      "expectations",
      "extent",
      "garage",
      "storage",
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

  const services = [
    { value: "transport", label: t("services.transport") },
    { value: "packing", label: t("services.packing") },
    { value: "unpacking", label: t("services.unpacking") },
    { value: "furniture-assembly", label: t("services.furnitureAssembly") },
    { value: "cleaning", label: t("services.moveCleaning") },
  ];
  const needsRUT = form.watch("rut_discount");

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
                <SelectItem value="apartment">
                  {t("moveTypes.apartment")}
                </SelectItem>
                <SelectItem value="house">{t("moveTypes.house")}</SelectItem>
                <SelectItem value="other">{t("moveTypes.other")}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* From ROK */}
        <FormField
          control={form.control}
          name="from_rok"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fromRok")}</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(val) => field.onChange(parseInt(val))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectNumberOfRooms")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, "9+"].map((num) => (
                      <>
                        <SelectItem key={num} value={num.toString()}>
                          {num} {t("rok")}
                        </SelectItem>
                        {/* <SelectItem value="others">others</SelectItem> */}
                      </>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* To ROK */}
        <FormField
          control={form.control}
          name="to_rok"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("toRok")}</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(val) => field.onChange(parseInt(val))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectNumberOfRooms")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {t("rok")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* From Floor */}
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
                    placeholder={t("floor")}
                    className="w-full"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* To Floor */}
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
                    placeholder={t("floor")}
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
        name="property_size"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("propertySize")}</FormLabel>
            <FormControl>
              <Input
                type="number"
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                placeholder={t("enterPropertySize")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="home_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("homeDescription")}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectDescription")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="finer">
                  {t("homeDescriptions.finer")}
                </SelectItem>
                <SelectItem value="normal">
                  {t("homeDescriptions.normal")}
                </SelectItem>
                <SelectItem value="simpler">
                  {t("homeDescriptions.simpler")}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="expectations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("expectations")}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectExpectations")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="price">
                  {t("expectationOptions.price")}
                </SelectItem>
                <SelectItem value="balance">
                  {t("expectationOptions.balance")}
                </SelectItem>
                <SelectItem value="quality">
                  {t("expectationOptions.quality")}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="extent"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("extent")}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectExtent")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="well">{t("extentOptions.well")}</SelectItem>
                <SelectItem value="normal">
                  {t("extentOptions.normal")}
                </SelectItem>
                <SelectItem value="sparsely">
                  {t("extentOptions.sparsely")}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Garage */}
      <FormField
        control={form.control}
        name="garage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("garage")}</FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value ? t("yes") : t("no")}
                onValueChange={(value) => field.onChange(value === t("yes"))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={t("yes")} id="garage-yes" />
                  <Label htmlFor="garage-yes">{t("yes")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={t("no")} id="garage-no" />
                  <Label htmlFor="garage-no">{t("no")}</Label>
                </div>
              </RadioGroup>
            </FormControl>
            {field.value && (
              <FormField
                control={form.control}
                name="garage_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("garageDescription")}</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Storage */}
      <FormField
        control={form.control}
        name="storage.needed"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("storage")}</FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value ? t("yes") : t("no")}
                onValueChange={(value) => field.onChange(value === t("yes"))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={t("yes")} id="storage-yes" />
                  <Label htmlFor="storage-yes">{t("yes")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={t("no")} id="storage-no" />
                  <Label htmlFor="storage-no">{t("no")}</Label>
                </div>
              </RadioGroup>
            </FormControl>
            {field.value && (
              <FormField
                control={form.control}
                name="storage.description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("storageDescription")}</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="services"
        render={() => (
          <FormItem>
            <FormLabel>{t("services.title")}</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {services.map((service) => (
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
                              ? [...(field.value || []), service.value]
                              : field.value?.filter(
                                  (val: string) => val !== service.value
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* RUT Discount */}
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

        {/* Extra Insurance */}
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
                <Input {...field} placeholder={t("ssnPlaceholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

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

export const SecrecyMoveForm: React.FC<SecrecyMoveFormProps> = ({
  onSubmit,
  mutation,
  formStage,
  handleNext,
}) => {
  const { data: userDashboard } = useCustomerDashboard();
  const t = useTranslations("common");
  const form = useForm<PrivacyMove>({
    resolver: zodResolver(createSecrecyMoveSchema(t)),
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
      type_of_service: "Secrecy Move",
      service_type: "Secrecy Move",
      move_type: "apartment",
      from_rok: 1,
      to_rok: 1,
      from_floor: "",
      to_floor: "",
      property_size: undefined,
      home_description: "",
      expectations: "",
      extent: "",
      garage: false,
      garage_description: "",
      storage: {
        needed: false,
        description: "",
      },
      services: ["transport"],
      other: "",
      rut_discount: false,
      extra_insurance: false,
      photos: [] as File[],
    },
  });

  // useFormPersist(form, "privacyMoveForm", ["photos"]);

  return (
    <FormWrapper form={form} onSubmit={onSubmit}>
      {formStage === 1 ? (
        <LogisticsForm form={form} handleNext={handleNext} />
      ) : formStage === 2 ? (
        <SecrecyMoveDetailsForm form={form} handleNext={handleNext} />
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
