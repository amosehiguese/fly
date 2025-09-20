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
import { useCustomerDashboard } from "@/hooks/customer/useCustomerDashboard";
import { LogisticsForm, ContactForm, FormWrapper } from "./BaseQuotationForm";
import { QuotationSummary } from "../components/QuotationSummary";
import { FileUpload } from "@/components/ui/file-upload";
import { useFormPersist } from "@/hooks/useFormPersist";
import { Textarea } from "@/components/ui/textarea";

interface JunkRemovalFormProps {
  onSubmit: (data: JunkRemoval) => void;
  mutation: UseMutationResult<unknown, unknown, unknown>;
  formStage: number;
  handleNext: () => void;
}

const JunkRemovalDetailsForm = ({ form, handleNext }: any) => {
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
    "Furniture",
    "Electronics",
    "Construction Debris",
    "Yard Waste",
    "Household Items",
    "Appliances",
    "Mattresses",
    "Tires",
  ];

  const disposalMethods = [
    { label: "Standard Disposal", value: "Standard" },
    { label: "Eco-Friendly Disposal", value: "Eco-Friendly" },
    { label: "Recycling", value: "Recycling" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <FormField
        control={form.control}
        name="type_of_junk"
        render={() => (
          <FormItem>
            <FormLabel>Types of Junk</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {junkTypes.map((type) => (
                <FormField
                  key={type}
                  control={form.control}
                  name="type_of_junk"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(type)}
                          onCheckedChange={(checked) => {
                            const updatedTypes = checked
                              ? [...field.value, type]
                              : field.value?.filter((val: any) => val !== type);
                            field.onChange(updatedTypes);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        {type}
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
            <FormLabel>Volume of Junk</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter approximate volume" />
            </FormControl>
            <FormDescription>
              e.g., &quot;Small room full&quot;, &quot;Half a truck&quot;,
              &quot;10 cubic meters&quot;
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="junk_requirements"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Disposal Requirements</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Please provide details about your junk removal needs"
                className="min-h-[120px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="hazardous_materials"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Hazardous Materials</FormLabel>
              <FormDescription>
                Check if your junk includes any hazardous materials (e.g.,
                chemicals, batteries, paint)
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location_accessibility"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location Accessibility</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Describe the accessibility of the junk location (e.g., stairs, elevator, parking)"
                className="min-h-[100px]"
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
            <FormLabel>Preferred Disposal Method</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select disposal method" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {disposalMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
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
        name="photos"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Upload Photos (Optional)</FormLabel>
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
            <FormDescription>
              Upload up to 5 photos (max 25MB total) to help us better
              understand your junk removal needs.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-center">
        <Button onClick={handleClick} className="mt-8 px-16">
          Next
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
  const { data: userDashboard } = useCustomerDashboard();
  const form = useForm<JunkRemoval>({
    resolver: zodResolver(junkRemovalSchema),
    defaultValues: {
      name: userDashboard?.user?.fullname || "",
      from_city: "",
      to_city: "",
      pickup_address: "",
      delivery_address: "",
      date: "",
      latest_date: "",
      email: userDashboard?.user?.email || "",
      phone: userDashboard?.user?.phone_number || "",
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

  useFormPersist(form, "junkRemovalForm", ["photos"]);

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
