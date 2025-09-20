"use client";

import { baseUrl, handleQueryError } from "@/api";
import { updateDispute } from "@/api/admin";
import { DisputeStatus } from "@/api/interfaces/admin/disputes";
import { Button } from "@/components/ui/button";
import { useFetchDisputeById } from "@/hooks/admin/useFetchDisputeById";
import { formatNumber } from "@/lib/formatNumber";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { formatDateLocale } from "@/lib/formatDateLocale";

const Page = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useFetchDisputeById(id);
  const queryClient = useQueryClient();
  const dispute = data?.data;

  const [form, setForm] = useState<DisputeStatus>("pending");

  const mutation = useMutation({
    mutationKey: ["update-dispute", id],
    mutationFn: () => updateDispute(id, form),
    onError: handleQueryError,
    onSuccess: (data) => {
      toast(data.message || "Dispute status updated sucessfully");
      queryClient.invalidateQueries({ queryKey: ["dispute", id] });
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
    },
  });

  const handleSubmit = () => {
    mutation.mutate();
  };

  const t = useTranslations("admin.disputeDetails");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <div className="flex flex-col md:flex-row bg-[#FCFCFC] dark:bg-black gap-6 p-4">
      {/* Left Section */}
      <div className="w-full md:w-1/3 bg-white dark:bg-black border border-[#C4C4C4] shadow rounded-[10px] py-6">
        <h2 className=" font-medium text-subtitle dark:text-white px-6 mb-4 pb-4 border-b border-[#C4C4C4]">
          {t("details.title")}
        </h2>
        <div className="space-y-4 px-6">
          <div className="space-y-[6px]">
            <p className="text-sm text-subtitle dark:text-white font-light">
              {t("details.serviceType")}
            </p>
            <p className="font-medium text-[16px] text-subtitle dark:text-white">
              {tCommon(`quotationTypes.${dispute?.quotation_type}`)}
            </p>
          </div>
          <div className="space-y-[6px]">
            <p className="text-sm text-subtitle dark:text-white font-light">
              {t("details.disputeId")}
            </p>
            <p className="font-medium text-[16px] text-subtitle dark:text-white">
              {dispute?.dispute_id}
            </p>
          </div>
          <div className="space-y-[6px]">
            <p className="text-sm text-subtitle dark:text-white font-light">
              {t("details.submittedBy")}
            </p>
            <p className="font-medium text-[16px] text-subtitle dark:text-white">
              {dispute?.submitted_by}
            </p>
          </div>
          <div className="space-y-[6px]">
            <p className="text-sm text-subtitle dark:text-white font-light">
              {t("details.against")}
            </p>
            <p className="font-medium text-[16px] text-subtitle dark:text-white">
              {dispute?.supplier_name}
            </p>
          </div>
          <div className="space-y-[6px]">
            <p className="text-sm text-subtitle dark:text-white font-light">
              {t("details.transactionAmount")}
            </p>
            <p className="font-medium text-[16px] text-subtitle dark:text-white">
              {formatNumber(Number(dispute?.transaction_amount))} SEK
            </p>
          </div>
          <div className="space-y-[6px]">
            <p className="text-sm text-subtitle dark:text-white font-light">
              {t("details.disputeReason")}
            </p>
            <p className="font-medium text-[16px] text-subtitle dark:text-white">
              {dispute?.reason}
            </p>
          </div>
          <div className="space-y-[6px]">
            <p className="text-sm text-subtitle dark:text-white font-light">
              {t("details.requestDetails")}
            </p>
            <p className="font-medium text-[16px] text-subtitle dark:text-white">
              {dispute?.request_details}
            </p>
          </div>
          <div>
            <p className="text-sm text-subtitle dark:text-white mb-2">
              {t("details.proofUploaded")}
            </p>
            <div className="flex items-center gap-2">
              {dispute?.images.map((item, index) => (
                <button
                  key={index}
                  onClick={() =>
                    window.open(
                      baseUrl.slice(0, baseUrl.length - 1) + item,
                      "_blank"
                    )
                  }
                  className="px-2 py-1 items-center gap-x-2 flex bg-[#C4C4C4] rounded-[10px]"
                >
                  <FileText color="#2E7D32" size={16} />
                  <div className="text-subtitle dark:text-white text-[12px] font-medium">
                    ..{item.slice(-8)}
                  </div>
                </button>
              ))}

              {/* <button className="px-3 py-1 text-sm font-medium text-subtitle dark:text-white bg-[#C4C4C4] rounded-[10px]">
                +3
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-2/3 bg-white dark:bg-black shadow border border-[#C4C4C4] rounded-lg py-6">
        <h2 className=" font-medium text-subtitle dark:text-white px-6 mb-4 pb-4 border-b border-[#C4C4C4]">
          {t("resolution.title")}
        </h2>
        <div className="space-y-4 px-6">
          <div className="grid grid-cols-3">
            <div>
              <p className="text-sm text-subtitle dark:text-white font-light">
                {t("resolution.disputeId")}
              </p>
              <p className="font-medium">{dispute?.dispute_id}</p>
            </div>
            <div>
              <p className="text-sm text-subtitle dark:text-white font-light">
                {t("resolution.dateSubmitted")}
              </p>
              <p className="font-medium">
                {dispute?.created_at &&
                  formatDateLocale(dispute?.created_at, locale)}
              </p>
            </div>
            <div>
              <p className="text-sm text-subtitle dark:text-white font-light">
                {t("resolution.resolutionStatus")}
              </p>
              <p
                className={`font-medium  ${
                  dispute?.status === "pending"
                    ? "text-yellow-500"
                    : dispute?.status === "under_review"
                      ? "text-blue-500"
                      : dispute?.status === "resolved"
                        ? "text-green-500"
                        : "text-yellow-500"
                }`}
              >
                {tCommon(`status.${dispute?.status}`)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3">
            <div>
              <p className="text-sm text-subtitle dark:text-white font-light">
                {t("resolution.amountToBeRefunded")}
              </p>
              <p className="font-medium text-center">-</p>
            </div>
            <div>
              <p className="text-sm text-subtitle dark:text-white font-light">
                {t("resolution.resolutionReached")}
              </p>
              <p className="font-medium text-center">-</p>
            </div>
            <div></div>
          </div>
          <div>
            <label
              htmlFor="adminAction"
              className="block text-sm text-gray-500 dark:text-white mb-1"
            >
              {t("resolution.adminAction")}
            </label>
            <select
              id="adminAction"
              value={form}
              onChange={(e) => setForm(e.target.value as DisputeStatus)}
              className="w-full border border-gray-300 rounded-lg px-3 bg-white dark:bg-black py-2"
            >
              <option value="pending">{tCommon("status.pending")}</option>
              {/* <option value="under_review">Under Review</option> */}
              <option value="resolved">{tCommon("status.resolved")}</option>
            </select>
          </div>
          <div className="flex justify-around mt-4">
            <Button
              className="px-4 py-2 border-[#373737] font-bold"
              variant={"outline"}
            >
              {t("resolution.buttons.cancel")}
            </Button>
            <Button
              disabled={mutation.isPending}
              onClick={handleSubmit}
              className="px-4 py-2 border text-white bg-black font-bold"
            >
              {mutation.isPending
                ? t("resolution.buttons.submitting")
                : t("resolution.buttons.confirm")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
