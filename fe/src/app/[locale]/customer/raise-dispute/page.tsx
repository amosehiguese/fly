/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DisputeForm, disputeSchema } from "./schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { FileUpload } from "./components/FileUpload";
import { raiseDispute } from "@/api/customers";
import { Suspense } from "react";
import { useTranslations } from "next-intl";

// Separate component that uses useSearchParams
function RaiseDisputeContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();
  const t = useTranslations("customers.raiseDispute");
  const tCommon = useTranslations("common");

  const form = useForm<DisputeForm>({
    resolver: zodResolver(disputeSchema),
    defaultValues: {
      order_id: orderId || "",
      issue_type: "damaged",
      description: "",
      desired_resolution: "refund",
      confirmation: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: DisputeForm) => {
      const formData = new FormData();
      formData.append("order_id", data.order_id);
      formData.append("reason", data.issue_type);
      formData.append("request_details", data.description);
      formData.append("desired_resolution", data.desired_resolution);

      // Append files if they exist
      files.forEach((file) => {
        formData.append(`images`, file);
      });

      return raiseDispute(formData);
    },
    onSuccess: () => {
      toast.success("Dispute submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["my-disputes"] });
      queryClient.invalidateQueries({ queryKey: ["user-dashboard"] });
      router.push("/customer/disputes");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response.data.error ||
          "Failed to submit dispute"
      );
    },
  });

  const onSubmit = (data: DisputeForm) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold">{t("title")}</h1>
        </div>

        <p className="text-gray-600 text-sm sm:text-base mb-8">
          {t("description")}
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              disabled={!!orderId}
              name="order_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base sm:text-lg font-medium">
                    {t("orderId")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className=" h-12 sm:h-14 text-base sm:text-lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="issue_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base sm:text-lg font-medium">
                    {t("disputeIssue")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full h-12 sm:h-14 text-base sm:text-lg">
                        <SelectValue placeholder={t("selectIssueType")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="damaged">
                        {t("damagedItems")}
                      </SelectItem>
                      <SelectItem value="missing">
                        {t("missingItems")}
                      </SelectItem>
                      <SelectItem value="delay">
                        {t("delayInService")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base sm:text-lg font-medium">
                    {t("description")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t("descriptionPlaceholder")}
                      className="min-h-[120px] text-base sm:text-lg resize-none "
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="desired_resolution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base sm:text-lg font-medium">
                    {t("desiredResolution")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full h-12 sm:h-14 text-base sm:text-lg">
                        <SelectValue placeholder={t("selectResolution")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="refund">{t("refund")}</SelectItem>
                      <SelectItem value="replacement">
                        {t("replacement")}
                      </SelectItem>
                      <SelectItem value="repair">{t("repair")}</SelectItem>
                      <SelectItem value="compensation">
                        {t("compensation")}
                      </SelectItem>
                      <SelectItem value="order_cancellation">
                        {t("orderCancellation")}
                      </SelectItem>
                      <SelectItem value="reschedule_delivery">
                        {t("rescheduleDelivery")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmation"
              render={({ field }) => (
                <FormItem className="flex items-center space-y-0 space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className=" leading-none">
                    <FormLabel className="">{t("confirmationText")}</FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-base sm:text-lg font-medium">
                {t("uploadEvidence")}
              </label>
              <p className="text-gray-600 text-xs sm:text-sm">
                {t("uploadEvidenceDescription")}
              </p>
              <FileUpload
                files={files}
                setFiles={setFiles}
                maxFiles={3}
                maxSize={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 sm:h-14 border-red-500 text-red-500 hover:bg-red-50 text-base sm:text-lg"
                onClick={() => router.back()}
              >
                {tCommon("buttons.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full h-12 sm:h-14 bg-black hover:bg-gray-800 text-base sm:text-lg"
              >
                {mutation.isPending
                  ? t("submitting")
                  : tCommon("buttons.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function RaiseDispute() {
  return (
    <Suspense fallback={<div>Loading dispute form...</div>}>
      <RaiseDisputeContent />
    </Suspense>
  );
}
