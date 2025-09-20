"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import StarRating from "@/components/StarRating";
import { useFetchBidById } from "@/hooks/admin/useFetchBids";
import { useFetchQuotationById } from "@/hooks/admin/useFetchQuotations";
import { QuotationDetails } from "@/components/admin/QuotationDetails";
import { formatNumber } from "@/lib/formatNumber";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveBid } from "@/api/admin";
import { toast } from "sonner";
import { handleQueryError } from "@/api";
import { parseArrayField } from "@/lib/parseArrayField";
import { useLocale, useTranslations } from "next-intl";
import { formatDateLocale } from "@/lib/formatDateLocale";
import { useParams } from "next/navigation";

export default function BidDetails() {
  const t = useTranslations("common.bidDetails");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const bidId = params.id;
  const [movingCost, setMovingCost] = useState<number>(0);
  const [additionalServicesCost, setAdditionalServicesCost] =
    useState<number>(0);
  const [truckCost, setTruckCost] = useState<number>(0);

  const { data } = useFetchBidById(bidId);
  const bid = data?.data;

  const { data: quoteData } = useFetchQuotationById(
    bid?.quotation_id.toString() || "",
    bid?.quotation_type || ""
  );
  const quote = quoteData?.data;

  const additionalServicesCostShare =
    additionalServicesCost === 0
      ? 0
      : (Number(bid?.additional_services) || 0) * additionalServicesCost * 0.01;
  const movingCostShare =
    movingCost === 0 ? 0 : (Number(bid?.moving_cost) || 0) * movingCost * 0.01;
  const totalMovingCost =
    Number(movingCostShare) + Number(bid?.moving_cost || 0);

  const totalAdditionalServicesCost =
    Number(additionalServicesCostShare) + Number(bid?.additional_services || 0);
  const truckCostShare =
    truckCost === 0 ? 0 : (Number(bid?.truck_cost) || 0) * truckCost * 0.01;
  const totalTruckCost = Number(truckCostShare) + Number(bid?.truck_cost || 0);

  const mutation = useMutation({
    mutationKey: ["approve-bid", bid?.bid_id],
    mutationFn: () =>
      approveBid({
        bid_id: Number(bid?.bid_id),
        moving_price_percentage: movingCost,
        additional_service_percentage: additionalServicesCost,
        truck_cost_percentage: truckCost,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bids"] });
      queryClient.invalidateQueries({ queryKey: ["bid", bid?.bid_id] });
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation", quote?.id] });

      queryClient.invalidateQueries({ queryKey: ["quotation-bids"] });
      toast.success(
        data.message ||
          "Bid approved successfully and and Invoice sent to the Customer"
      );
      router.replace("/admin/quotes-bids?focused=bids");
    },
    onError: handleQueryError,
  });

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {t("title")}
          {bidId}
        </h1>
        <button onClick={() => router.back()} className="text-red-500">
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Accept Bid Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">{t("acceptBid")}</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span>
                    {t("costs.movingCost")} SEK {formatNumber(totalMovingCost)}
                  </span>
                  <span>
                    {t("costs.youGet")} SEK{" "}
                    {formatNumber(Number(movingCostShare) || 0)}
                  </span>
                </div>
                <div className="flex">
                  <div className="w-32 mr-2">
                    <Input
                      disabled={
                        bid?.bid_status === "accepted" ||
                        bid?.bid_status === "rejected" ||
                        bid?.bid_status === "approved"
                      }
                      value={movingCost}
                      onChange={(e) => setMovingCost(Number(e.target.value))}
                    />
                  </div>
                  <div className="w-10 bg-gray-100 rounded flex items-center justify-center">
                    %
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span>
                    {t("costs.additionalServices")} SEK{" "}
                    {formatNumber(totalAdditionalServicesCost)}
                  </span>
                  <span>
                    {t("costs.youGet")} SEK{" "}
                    {formatNumber(Number(additionalServicesCostShare) || 0)}
                  </span>
                </div>
                <div className="flex">
                  <div className="w-32 mr-2">
                    <Input
                      disabled={
                        bid?.bid_status === "accepted" ||
                        bid?.bid_status === "rejected" ||
                        bid?.bid_status === "approved"
                      }
                      value={additionalServicesCost}
                      onChange={(e) =>
                        setAdditionalServicesCost(Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="w-10 bg-gray-100 rounded flex items-center justify-center">
                    %
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span>
                    {t("costs.truckCost")} SEK{" "}
                    {formatNumber(Number(totalTruckCost) || 0)}
                  </span>
                  <span>
                    {t("costs.youGet")} SEK{" "}
                    {formatNumber(Number(truckCostShare) || 0)}
                  </span>
                </div>
                <div className="flex">
                  <div className="w-32 mr-2">
                    <Input
                      disabled={
                        bid?.bid_status === "accepted" ||
                        bid?.bid_status === "rejected" ||
                        bid?.bid_status === "approved"
                      }
                      value={truckCost}
                      onChange={(e) => setTruckCost(Number(e.target.value))}
                    />
                  </div>
                  <div className="w-10 bg-gray-100 rounded flex items-center justify-center">
                    %
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <span className="font-semibold">{t("costs.totalPrice")}</span>
                <span className="text-blue-500 font-semibold">
                  SEK{" "}
                  {formatNumber(
                    Number(
                      movingCost * 0.01 * (Number(bid?.moving_cost) || 0)
                    ) +
                      Number(
                        additionalServicesCost *
                          0.01 *
                          (Number(bid?.additional_services) || 0)
                      ) +
                      Number(
                        truckCost * 0.01 * (Number(bid?.truck_cost) || 0)
                      ) +
                      Number(bid?.truck_cost) +
                      Number(bid?.moving_cost) +
                      Number(bid?.additional_services)
                  )}
                </span>
              </div>

              <div className="flex gap-4 mt-6">
                {bid?.bid_status === "accepted" ||
                bid?.bid_status === "rejected" ||
                bid?.bid_status === "approved" ? (
                  <div className="flex-1 text-purple-500">
                    {t("buttons.bidAlready")} {bid?.bid_status}
                  </div>
                ) : (
                  <Button
                    onClick={() => mutation.mutate()}
                    disabled={
                      mutation.isPending ||
                      movingCost === 0 ||
                      additionalServicesCost === 0 ||
                      truckCost === 0
                    }
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    {mutation.isPending
                      ? t("buttons.accepting")
                      : t("buttons.accept")}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mover Details Section */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="status">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="status" className="flex-1">
                  {t("status.title")}
                </TabsTrigger>
                <TabsTrigger value="mover" className="flex-1">
                  {t("status.moverDetails")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="status">
                <div className="text-center p-4 space-y-4">
                  <div className="flex items-center gap-x-4">
                    <div>{t("status.status")}</div>
                    <div>{tCommon(`status.${bid?.bid_status}`)}</div>
                  </div>
                  <div className="flex items-center gap-x-4">
                    <div>{t("status.bidSubmittedAt")}</div>
                    <div>
                      {bid?.bid_created_at &&
                        formatDateLocale(bid?.bid_created_at, locale)}
                    </div>
                  </div>
                  <div className="flex items-center gap-x-4">
                    <div>{t("status.initialPaymentDate")}</div>
                    <div>
                      {bid?.initial_payment_date
                        ? formatDateLocale(bid?.initial_payment_date, locale)
                        : "N/A"}
                    </div>
                  </div>
                  <div className="flex items-center gap-x-4">
                    <div>{t("status.remainingPaymentDate")}</div>
                    <div>
                      {bid?.remaining_payment_date
                        ? formatDateLocale(bid?.remaining_payment_date, locale)
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="mover">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">{bid?.supplier_name}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                        />
                      </svg>
                    </div>
                    <span>{bid?.supplier_email}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                        />
                      </svg>
                    </div>
                    <span>{bid?.supplier_phone}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                      </svg>
                    </div>
                    <span>{bid?.supplier_address}</span>
                  </div>

                  <div className="mt-6">
                    <div className="font-medium mb-2">{t("status.rating")}</div>
                    <div className="flex items-center gap-2">
                      <span>
                        {formatNumber(Number(bid?.avg_rating) || 0)}/5
                      </span>
                      <StarRating rating={Number(bid?.avg_rating)} />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Quote Details Section */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-6">{t("quoteDetails")}</h2>

        <Tabs defaultValue="logistics">
          <TabsList className="w-full max-w-md mb-6">
            <TabsTrigger value="logistics" className="flex-1">
              {t("status.logistics")}
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex-1">
              {t("status.documents")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logistics">
            {quote && <QuotationDetails quotation={quote} />}
          </TabsContent>

          <TabsContent value="documents">
            <div className="p-4 text-center">
              {quote && parseArrayField(quote?.file_paths).length > 0 ? (
                parseArrayField(quote?.file_paths).map((file) => (
                  <a
                    key={file}
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {file}
                  </a>
                ))
              ) : (
                <div>{t("status.noDocuments")}</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
