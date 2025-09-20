"use client";

import Link from "next/link";
import { FullPageLoader } from "@/components/ui/loading/FullPageLoader";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Box } from "lucide-react";
import { useSupplierDisputeById } from "@/hooks/supplier/useSupplierDisputeById";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { formatDateLocale } from "@/lib/formatDateLocale";
import { useParams } from "next/navigation";

export default function SupplierDisputesPage() {
  const t = useTranslations("common");
  const locale = useLocale();
  const { id } = useParams<{ id: string }>();
  const { data, isPending } = useSupplierDisputeById(id);
  const dispute = data?.data;
  const router = useRouter();

  if (isPending) return <FullPageLoader />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#EC1B25] sticky top-0 z-50 backdrop-blur-sm md:rounded-[10px] rounded-b-[24px] p-2 md:p-4 mb-6 text-white">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Dispute Info */}
        <div className="flex md:flex-row flex-col md:items-center mb-6 md:mb-8">
          <div className="flex gap-x-4 items-start justify-start">
            <div className="bg-white flex justify-center items-center rounded-full w-12 h-12">
              <Box size={24} color="red" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {t("labels.disputeId")}: {dispute?.dispute_details.dispute_id}
              </h2>
              <p className="font-bold text-[32px]">
                {t(`status.${dispute?.dispute_details.status}`)}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "ml-auto px-4 py-1 rounded-full",
              dispute?.dispute_details.status === "resolved"
                ? "bg-green-100 text-green-600"
                : "bg-yellow-100 text-yellow-600"
            )}
          >
            {dispute?.dispute_details.status === "resolved"
              ? t("status.completed")
              : t("status.inProgress")}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Subject */}
        <div>
          <h2 className="text-gray-600">{t("labels.subject")}:</h2>
          <p className="font-medium">
            {t("messages.disputeRaised")} #{dispute?.order_details.order_id}
          </p>
        </div>

        {/* Dates */}
        <div className="space-y-4">
          <div>
            <h2 className="text-gray-600">{t("labels.dateRaised")}:</h2>
            <p className="font-medium">
              {dispute?.dispute_details.created_at &&
                formatDateLocale(dispute?.dispute_details.created_at, locale)}
            </p>
          </div>
          <div>
            <h2 className="text-gray-600">{t("labels.orderId")}:</h2>
            <p className="font-medium">#{dispute?.order_details.order_id}</p>
          </div>
          <div>
            <h2 className="text-gray-600">{t("labels.updated")}:</h2>

            <p className="font-medium">
              {dispute?.dispute_details.updated_at &&
                formatDateLocale(dispute?.dispute_details.updated_at, locale)}
            </p>
          </div>
        </div>

        {/* Dispute Summary */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {t("labels.disputeSummary")}
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-gray-600">
                {t("labels.complaintDescription")}:
              </h3>
              <p className="mt-1">{dispute?.dispute_details.reason}</p>
            </div>
            <div>
              <h3 className="text-gray-600">{t("labels.requestedAction")}</h3>
              <p className="mt-1">{dispute?.dispute_details.reason}</p>
            </div>
          </div>
        </div>

        {/* Resolution Outcome - Only show if resolved */}
        {dispute?.dispute_details.status === "resolved" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              {t("labels.resolutionOutcome")}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-600">{t("labels.decision")}</h3>
                <p className="mt-1">{t("messages.partialRefundApproved")}</p>
              </div>
              <div>
                <h3 className="text-gray-600">{t("labels.refundedAmount")}</h3>
                <p className="mt-1">SEK {dispute?.order_details.total_price}</p>
              </div>
              <div>
                <h3 className="text-gray-600">{t("labels.comments")}</h3>
                <p className="mt-1">{dispute?.dispute_details.reason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Evidence */}
        {/* <div>
          <h2 className="text-lg font-semibold mb-4">{t("labels.evidenceSummary")}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-gray-600 mb-2">{t("labels.evidence")}</h3>
              <div className="flex flex-wrap gap-2">
                    {dispute?.dispute_details?.map((image, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-100 p-2 rounded"
                  >
                    {image.endsWith(".pdf") ? (
                      <button
                        key={index}
                        onClick={() =>
                          window.open(
                            baseUrl.slice(0, baseUrl.length - 1) + image,
                            "_blank"
                          )
                        }
                        className="px-2 py-1 items-center gap-x-2 flex bg-[#C4C4C4] rounded-[10px]"
                      >
                        <FileText color="#2E7D32" size={16} />
                        <div className="text-subtitle dark:text-white text-[12px] font-medium">
                          ..{image.slice(-8)}
                        </div>
                      </button>
                    ) : (
                      <button
                        key={index}
                        onClick={() =>
                          window.open(
                            baseUrl.slice(0, baseUrl.length - 1) + image,
                            "_blank"
                          )
                        }
                        className="px-2 py-1 items-center gap-x-2 flex bg-[#C4C4C4] rounded-[10px]"
                      >
                        <ImageIcon className="h-5 w-5" />
                        <div className="text-subtitle dark:text-white text-[12px] font-medium">
                          ..{image.slice(-8)}
                        </div>
                      </button>
                    )}
                    <span>
                      evidence_{index + 1}
                      {image.split(".").pop()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
           
          </div>
        </div> */}
      </div>
      {dispute?.dispute_details.status !== "resolved" && (
        <Button className="mb-8 mx-12 md:mx-24 font-semibold">
          <Link href={`/supplier/dispute-chat/${id}`}>
            {t("buttons.message")}
          </Link>
        </Button>
      )}
    </div>
  );
}
