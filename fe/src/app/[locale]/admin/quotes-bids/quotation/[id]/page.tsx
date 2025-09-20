"use client";

import React, { useRef, RefObject, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useParams, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { formatNumber } from "@/lib/formatNumber";
// import { useFetchQuotationById } from "@/hooks/useFetchQuotations";
import { Button } from "@/components/ui/button";
import { capitalizeWords } from "@/lib/capitalizeWords";
import { GripVertical, ExternalLink, X } from "lucide-react";
import { User } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Bid, BidApprovalRequestBody } from "@/api/interfaces/admin/bids";
import { useFetchQuotationBidsById } from "@/hooks/admin/useFetchQuotationBids";
import { exportAsPDF } from "@/lib/exportAsPdf";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveBid } from "@/api/admin";
import { toast } from "sonner";
import { handleQueryError } from "@/api";
import { format, parseISO } from "date-fns";
import { parseQuotation } from "@/lib/parseQuotations";
import { QuotationDetails } from "@/components/admin/QuotationDetails";
import { useLocale, useTranslations } from "next-intl";
import { formatDateLocale } from "@/lib/formatDateLocale";
import { formatToQuotationType } from "@/lib/formatToQuotationType";
import { dateLocale } from "@/lib/dateLocale";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const t = useTranslations("admin.quotationDetails");
  const tQuotation = useTranslations("common.quotationTypes");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [form, setForm] = useState<BidApprovalRequestBody>({
    bid_id: 1,
    commission_percentage: 0,
  });
  const [open, setOpen] = useState(false);
  const [currentBid, setCurrentBid] = useState<Bid | null>();
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const typeParam = searchParams
    .get("type")
    ?.replaceAll("\\", "")
    .replace("&_", "")
    .toLowerCase();
  // console.log("type", typeParam);
  const queryClient = useQueryClient();
  const contentDownloadRef: RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);

  const { data: bidData } = useFetchQuotationBidsById(
    id.toString() || "",
    typeParam || ""
  );
  const bid = bidData?.data.bids;

  // const { data: quotationData } = useFetchQuotationById(
  //   id.toString() || "",
  //   typeParam || ""
  // );

  const totalAmountBidded =
    bid?.reduce((acc, { moving_cost }) => acc + +moving_cost, 0) || 0;
  const averageAmountBidded =
    bid && bid.length ? totalAmountBidded / bid.length : 0;

  const quotation = bidData?.data.quotation;

  const percentagePrice =
    Number(currentBid?.moving_cost) * (form?.commission_percentage / 100);
  const totalPrice = percentagePrice + Number(currentBid?.moving_cost);

  const handleBidClick = (bid: Bid) => {
    setCurrentBid(bid);
    setOpen(true);
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prevForm) => ({
      ...prevForm,
      commission_percentage: Number(e.target.value),
    }));
  };

  const downloadPdf = () =>
    exportAsPDF(contentDownloadRef, `quotation-bid-${currentBid?.bid_id}`);

  const mutation = useMutation({
    mutationKey: ["approve-bid", currentBid?.bid_id],
    mutationFn: () => approveBid(form),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bids"] });
      queryClient.invalidateQueries({ queryKey: ["bid"] });
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation-bids"] });
      toast.success(data.message || "Bid approved successfully");
    },
    onError: handleQueryError,
  });

  const parsedQuotation = useMemo(() => {
    return quotation ? parseQuotation(quotation) : null;
  }, [quotation]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="w-full">
        <div className="flex justify-between items-center">
          <h2 className="md:text-[20px] text-[16px] font-bold">
            {t("title", { id: quotation?.id || "" })}
          </h2>
          <Link
            href={{
              pathname: "/admin/quotes-bids",
              query: { focused: "quotes" },
            }}
            className="text-white dark:text-black p-2 items-center justify-center rounded-[10px] bg-black dark:bg-white"
          >
            {t("backToQuotes")}
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5  gap-6 mt-6">
          <Tabs
            defaultValue="quote"
            className="lg:col-span-3 border border-b-0 rounded-[8px] shadow-lg"
          >
            <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-black border-b rounded-none rounded-t data-[active]:">
              {[
                { title: t("tabs.quoteDetails"), value: "quote" },
                { title: t("tabs.bids"), value: "bids" },
              ].map((item, index) => (
                <TabsTrigger
                  key={index}
                  value={item.value}
                  className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 rounded-none border-black dark:border-gray-400"
                >
                  {item.title}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="bids">
              <Card className="rounded-t-none border-t-0">
                <CardHeader>
                  <CardTitle>{t("bidSection.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 font-semibold text-sm text-gray-600 dark:text-gray-300">
                      <div>{t("bidSection.columns.bidder")}</div>
                      <div>{t("bidSection.columns.amount")}</div>
                      <div>{t("bidSection.columns.serviceType")}</div>
                      <div>{t("bidSection.columns.bidDate")}</div>
                      <div>{t("bidSection.columns.actions")}</div>
                    </div>
                    {bid && bid.length > 0 ? (
                      bid?.map((item, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-5 items-center"
                        >
                          <div className="text-sm">
                            {item?.supplier_name || "Supplier"}
                          </div>
                          <div className="text-sm">
                            {formatNumber(Number(item?.moving_cost))} SEK
                          </div>
                          <div className="text-sm">
                            {tQuotation(item?.quotation_type)}
                          </div>
                          <div className="text-sm">
                            {item.bid_created_at
                              ? formatDateLocale(item.bid_created_at, locale)
                              : "N/A"}
                          </div>
                          {quotation?.status === "awarded" ? (
                            <div>-- --</div>
                          ) : (
                            <Button
                              variant={"outline"}
                              // onClick={() => handleBidClick(item)}
                              onClick={() => {
                                router.push(
                                  `/admin/quotes-bids/bid/${item.id}`
                                );
                              }}
                            >
                              {t("bidSection.approve")}
                            </Button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center">
                        {t("bidSection.noBids")}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quote">
              <Card className="rounded-t-none border-t-0">
                <CardHeader>
                  <CardTitle>{t("details.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className=" grid gap-4 grid-cols-2 mb-4">
                    <div className="">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {t("details.quotationType")}
                      </div>
                      <div className="text-sm font-medium">
                        {tCommon(
                          `quotationTypes.${formatToQuotationType(quotation?.service_type)}`
                        )}
                      </div>
                    </div>
                    <div className="">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {t("details.quoteDate")}
                      </div>
                      <div className="text-sm font-medium">
                        {quotation?.created_at
                          ? formatDateLocale(quotation?.created_at, locale)
                          : "N/A"}
                      </div>
                    </div>
                    <div className="">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {t("details.averageAmountBidded")}
                      </div>
                      <div className="text-sm font-medium">
                        {averageAmountBidded} SEK
                      </div>
                    </div>
                    <div className="">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {t("details.totalBidders")}
                      </div>
                      <div className="text-sm font-medium">{bid?.length}</div>
                    </div>
                    <div className="">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {t("details.status")}
                      </div>
                      <div className="text-sm font-medium">
                        {tCommon(`status.${quotation?.status}`)}
                      </div>
                    </div>
                    <div className="">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {t("details.moveDate")}
                      </div>
                      <div className="text-sm font-medium">
                        {quotation?.date
                          ? format(parseISO(quotation?.date), "dd MMM yyyy", {
                              locale: dateLocale(locale),
                            })
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                  {parsedQuotation && (
                    <QuotationDetails quotation={parsedQuotation} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>{t("customer.title")}</CardTitle>
            </CardHeader>
            <CardContent className="">
              <div className=" grid gap-4 lg:grid-cols-2 ">
                <div className="">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {t("customer.name")}
                  </div>
                  <div className="text-sm font-medium">{quotation?.name}</div>
                </div>

                <div className="">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {t("customer.email")}
                  </div>
                  <div className="text-sm font-medium break-words">
                    {quotation?.email}
                  </div>
                </div>
                <div className="">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {t("customer.phone")}
                  </div>
                  <div className="text-sm font-medium">{quotation?.phone}</div>
                </div>

                {/* <div className="">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Address:</div>
                  <div className="text-sm font-medium">
                    {customerDetails.address}
                  </div>
                </div> */}
                {/* <div className="">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Suburb/City:</div>
                  <div className="text-sm font-medium">
                    {customerDetails.suburb}
                  </div>
                </div> */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Popover onOpenChange={() => setOpen(!open)} open={open}>
        <PopoverTrigger className=""></PopoverTrigger>
        <PopoverContent
          ref={contentDownloadRef}
          className="rounded-md p-0 w-[350px] overflow-y-scroll "
        >
          {/* <Modal isOpen={open}> */}
          <div className="bg-black px-2 items-center rounded-t-md text-white flex justify-between max-h-[150vh] overflow-y-scroll ">
            <div className="flex items-center">
              <GripVertical size={20} />
              <div>
                {t("bidModal.order")} {currentBid?.bid_id}
              </div>
            </div>
            <div className="space-x-2 items-center">
              <Button className="bg-transparent hover:bg-transparent y p-0 hover:text-gray-400">
                <ExternalLink />
              </Button>
              <Button
                onClick={() => setOpen(false)}
                className="bg-transparent p-0 hover:bg-transparent hover:text-red-500"
              >
                <X />
              </Button>
            </div>
          </div>
          <div className="">
            <div className="my-2 px-4 border mx-2 rounded-[10px] py-2 text-subtitle dark:text-white space-y-2 font-semibold">
              <div className="flex text-[12px] items-center gap-x-2">
                <div className="">{t("bidModal.id")}</div>
                <div>{currentBid?.bid_id}</div>
              </div>
              <div className="flex text-[12px] items-center gap-x-2">
                <div>{t("bidModal.type")}</div>
                <div>{capitalizeWords(currentBid?.quotation_type)}</div>
              </div>
              <div className="flex text-[12px] items-center gap-x-2">
                <div>{t("bidModal.status")}</div>
                <div>{capitalizeWords(currentBid?.bid_status)}</div>
              </div>
              <div className="flex text-[12px] items-center gap-x-2">
                <div>{t("bidModal.dateSubmitted")}</div>
                <div>
                  {currentBid?.bid_created_at
                    ? format(
                        parseISO(currentBid?.bid_created_at),
                        "dd MMM yyyy"
                      )
                    : "N/A"}
                </div>
              </div>
              <div className="flex text-[12px] items-center gap-x-2">
                <div>{t("bidModal.price")}</div>
                <div>{formatNumber(Number(currentBid?.moving_cost))} SEK</div>
              </div>
            </div>

            <div className="border rounded-[10px] m-2 p-2">
              <div className="font-semibold text-[16px] text-subtitle dark:text-white">
                {t("bidModal.addAdjustment")}
              </div>
              <div className="mt-2">
                <label className="text-[14px] mb-1 font-medium text-subtitle dark:text-white">
                  {t("bidModal.addPercentage")}
                </label>
                <Input
                  type="number"
                  onChange={handlePercentageChange}
                  max={100}
                  min={1}
                  maxLength={3}
                />
              </div>
              <div className="mt-2">
                <label className="text-[14px] mb-1 font-medium text-subtitle dark:text-white">
                  {t("bidModal.addPrice")}
                </label>
                <Input value={percentagePrice + " SEK"} disabled />
              </div>

              <div className="mt-2 flex items-center gap-x-2 ">
                <div className="text-[14px] font-medium text-subtitle dark:text-white">
                  {t("bidModal.totalPrice")}
                </div>
                <div className="text-[14px] text-blue-500">
                  {totalPrice} SEK
                </div>
              </div>
            </div>

            <div className="border mx-2 rounded-[10px]">
              <div className="">
                <div className="my-2 px-4 text-subtitle dark:text-white space-y-2 font-semibold">
                  <div className="flex items-center gap-x-2 mb-4">
                    <User strokeWidth={3} size={14} />
                    <div className="text-[12px]">
                      {currentBid?.supplier_name}
                    </div>
                  </div>
                  {/* <div className="flex items-center gap-x-2">
                    <Mail strokeWidth={3} size={14} />
                    <div className="text-[12px]">{bid.</div>
                  </div> */}
                  {/* <div className="flex items-center gap-x-2">
                    <Phone strokeWidth={3} size={14} />
                    <div className="text-[12px]">+46(273) 647-7364</div>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <MapPin strokeWidth={3} size={14} />
                    <div className="text-[12px]">123 Main St, Cityville</div>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <div className="text-[12px]">Rating</div>
                    <StarRating rating={3.5} />
                  </div> */}
                </div>
                <div className="grid grid-cols-2 border-r w-full mt-2 py-2 ">
                  <button
                    disabled={
                      quotation?.status === "awardeds" ||
                      form.commission_percentage < 1 ||
                      mutation.isPending
                    }
                    onClick={() => mutation.mutate()}
                    className="flex justify-around items-center border-l border-r"
                  >
                    {mutation.isPending ? (
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4-4 1.79-4 4z"
                        ></path>
                      </svg>
                    ) : (
                      <div className="text-green-500">
                        {t("bidModal.approve")}
                      </div>
                    )}
                  </button>
                  {/* <button className="flex justify-around text-red-500 items-center border-r border-l bg-[#F4F5F5]">
                    Reject
                  </button> */}
                  <button
                    onClick={downloadPdf}
                    className="flex  justify-around items-center"
                  >
                    {t("bidModal.download")}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* </Modal> */}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Page;
