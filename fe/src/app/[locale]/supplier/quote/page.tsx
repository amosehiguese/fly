"use client";

import { useState, Suspense, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SuccessModal from "@/components/ui/success-modal";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SendBidRequest } from "@/api/interfaces/suppliers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendBid } from "@/api/suppliers";
import { useFetchQuotationById } from "@/hooks/supplier/useFetchQuotationById";
import { FullPageLoader } from "@/components/ui/loading/FullPageLoader";

import { QuotationDetails } from "@/components/supplier/QuotationDetails";
import { formatNumber } from "@/lib/formatNumber";
import { ErrorResponse, handleMutationError } from "@/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Quotation } from "@/api/interfaces/admin/quotations";
import { AxiosError } from "axios";
import { formatDateLocale } from "@/lib/formatDateLocale";
import { getQuotationTypeKey } from "@/lib/getQuotationTypeKey";

// Format dates for API in the YYYY-MM-DDThh:mm format
const formatDateForBackend = (date: Date | undefined): string => {
  if (!date) return "";

  // Get year, month, day, and hour
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // +1 because months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");

  // Format as YYYY-MM-DDThh:00
  return `${year}-${month}-${day}T${hours}:00`;
};

// Separate component that uses useSearchParams
function QuoteContent() {
  const t = useTranslations("supplier.quote");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const queryClient = useQueryClient();

  // Get ID from URL params
  const urlId = searchParams.get("id");
  const urlTableName = searchParams.get("table_name");

  // State to store the parameters internally
  const [internalId, setInternalId] = useState<string | null>(null);
  const [internalTableName, setInternalTableName] = useState<string | null>(
    null
  );

  // Use internal values or URL values as fallback
  const id = internalId || urlId;
  const table_name = (internalTableName || urlTableName)
    ?.replaceAll(" ", "_")
    ?.replaceAll("_&", "")
    ?.toLocaleLowerCase() as string;

  // Hide query parameters from URL but keep functionality
  useEffect(() => {
    if (urlId || urlTableName) {
      // Store parameters internally
      if (urlId) {
        setInternalId(urlId);
        sessionStorage.setItem("quote_id", urlId);
      }
      if (urlTableName) {
        setInternalTableName(urlTableName);
        sessionStorage.setItem("quote_table_name", urlTableName);
      }

      // Clean the URL by replacing it without query parameters
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    } else {
      // Try to get parameters from sessionStorage if not in URL
      const storedId = sessionStorage.getItem("quote_id");
      const storedTableName = sessionStorage.getItem("quote_table_name");
      if (storedId) setInternalId(storedId);
      if (storedTableName) setInternalTableName(storedTableName);
    }
  }, [urlId, urlTableName]);

  // Clean up sessionStorage when component unmounts
  useEffect(() => {
    return () => {
      sessionStorage.removeItem("quote_id");
      sessionStorage.removeItem("quote_table_name");
    };
  }, []);

  // Redirect to marketplace if no ID is found
  useEffect(() => {
    if (!urlId && !sessionStorage.getItem("quote_id") && !internalId) {
      // If no ID is available, redirect to marketplace
      router.push("/supplier");
    }
  }, [urlId, internalId, router]);

  const { data: quotationData, isLoading } = useFetchQuotationById(
    id as string,
    table_name as string
  );
  const quotation = quotationData?.quotation;

  const [movingCost, setMovingCost] = useState("");
  const [truckCost, setTruckCost] = useState("");
  const [additionalCost, setAdditionalCost] = useState("");
  const [estimatedPickupDateFrom, setEstimatedPickupDateFrom] = useState<
    Date | undefined
  >(undefined);
  const [estimatedPickupDateTo, setEstimatedPickupDateTo] = useState<
    Date | undefined
  >(undefined);
  const [estimatedDeliveryDateFrom, setEstimatedDeliveryDateFrom] = useState<
    Date | undefined
  >(undefined);
  const [estimatedDeliveryDateTo, setEstimatedDeliveryDateTo] = useState<
    Date | undefined
  >(undefined);
  const [showSuccess, setShowSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const totalCost =
    Number(movingCost) + Number(truckCost) + Number(additionalCost);

  const { mutate: submitBid, isPending } = useMutation({
    mutationFn: (data: SendBidRequest) => sendBid(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["supplier-dashboard"],
      });
      queryClient.invalidateQueries({
        queryKey: ["supplier-marketplace"],
      });
      setOpen(false);
      setShowSuccess(true);
      setTimeout(() => {
        router.replace("/supplier");
      }, 2000);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: AxiosError<ErrorResponse, any>) =>
      handleMutationError(error, locale),
  });

  const handleConfirmBid = async () => {
    submitBid({
      quotation_id: id as string,
      quotation_type: quotation?.service_type
        .toLowerCase()
        .replaceAll(" ", "_")
        .replaceAll("_&", "") as string,
      moving_cost: movingCost,
      truck_cost: truckCost,
      additional_services: additionalCost,
      supplier_notes: notes,
      estimated_pickup_date_from: formatDateForBackend(estimatedPickupDateFrom),
      estimated_pickup_date_to: formatDateForBackend(estimatedPickupDateTo),
      estimated_delivery_date_from: formatDateForBackend(
        estimatedDeliveryDateFrom
      ),
      estimated_delivery_date_to: formatDateForBackend(estimatedDeliveryDateTo),
    });
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push("/supplier");
  };
  console.log(
    "estimatedPickupDateFrom",
    formatDateForBackend(estimatedPickupDateFrom)
  );

  // Handle date selection - no automatic time setting since times are optional
  const handlePickupFromDateChange = (date: Date | undefined) => {
    setEstimatedPickupDateFrom(date);
    // Don't automatically set latest time - user can choose it optionally
  };

  const handleDeliveryFromDateChange = (date: Date | undefined) => {
    setEstimatedDeliveryDateFrom(date);
    // Don't automatically set latest time - user can choose it optionally
  };

  // Don't render anything if we don't have an ID yet
  if (!id) {
    return <FullPageLoader />;
  }

  if (isLoading) return <FullPageLoader />;

  return (
    <div className="container flex flex-col p-4 pb-32">
      <div className="flex w-full items-center mb-6">
        <button onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <div />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoSection
          label={t("requestId")}
          value={quotation?.id.toString() || ""}
        />
        <InfoSection
          label={t("serviceType")}
          value={tCommon(
            `quotationTypes.${getQuotationTypeKey(quotation?.service_type || "")}`
          )}
        />
        <InfoSection
          label={t("date")}
          value={
            (quotation?.date && formatDateLocale(quotation?.date, locale)) || ""
          }
        />
        <InfoSection
          label={t("latestDate")}
          value={
            (quotation?.latest_date &&
              formatDateLocale(quotation?.latest_date, locale)) ||
            ""
          }
        />

        <div className="pt-4">
          <h2 className="text-xl font-semibold mb-4">{t("logistics.title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoSection
              label={t("logistics.fromAddress")}
              value={quotation?.pickup_address || ""}
            />
            <InfoSection
              label={t("logistics.toAddress")}
              value={quotation?.delivery_address || ""}
            />
            <InfoSection
              label={t("logistics.distance")}
              value={`${formatNumber(Number(quotation?.distance))} KM`}
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">{t("moveInformation")}</h2>
        {quotation && (
          <QuotationDetails quotation={quotation as unknown as Quotation} />
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="container max-w-2xl mx-auto flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            {t("buttons.cancel")}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 bg-red-600 hover:bg-red-700">
                {t("buttons.setPrice")}
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90%] md:w-[600px]">
              <DialogHeader>
                <DialogTitle>{t("pricing.title")}</DialogTitle>
                <DialogDescription>
                  {t("pricing.description")}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea
                className="max-h-[400px]"
                scrollHideDelay={0}
                type="always"
              >
                <div className="space-y-4 px-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      {t("pricing.movingCost")}
                    </p>
                    <Input
                      type="number"
                      value={movingCost}
                      onChange={(e) => setMovingCost(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      {t("pricing.truckCost")}
                    </p>
                    <Input
                      type="number"
                      value={truckCost}
                      onChange={(e) => setTruckCost(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      {t("pricing.additionalServicesCost")}
                    </p>
                    <Input
                      type="number"
                      value={additionalCost}
                      onChange={(e) => setAdditionalCost(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      {t("pricing.totalPrice")}
                    </p>
                    <p className="text-lg font-semibold">
                      SEK {totalCost ? Number(totalCost).toLocaleString() : "0"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      {t("pricing.notes")}
                    </p>
                    <Input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t("pricing.notesPlaceholder")}
                    />
                  </div>

                  <div className="space-y-6 my-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        {t("dateSelection.pickupTitle")}
                      </h3>
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">
                          {t("dateSelection.pickupDate")}
                        </p>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal overflow-hidden text-ellipsis whitespace-nowrap",
                                !estimatedPickupDateFrom &&
                                  "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                              {estimatedPickupDateFrom ? (
                                <span className="truncate">
                                  {formatDateLocale(
                                    estimatedPickupDateFrom.toISOString(),
                                    locale,
                                    "PPP"
                                  )}
                                </span>
                              ) : (
                                <span>{t("dateSelection.pickDate")}</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={estimatedPickupDateFrom}
                              onSelect={handlePickupFromDateChange}
                              initialFocus
                              disabled={(date) =>
                                date <
                                new Date(
                                  quotationData?.quotation.date || Date.now()
                                )
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      {/* <p className="text-sm font-medium mb-2 text-gray-500">
                        {t("dateSelection.pickupTime")}
                      </p> */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            {t("dateSelection.time")}
                          </p>
                          <select
                            className="w-full p-2 rounded border h-10"
                            onChange={(e) => {
                              if (estimatedPickupDateFrom && e.target.value) {
                                const newDate = new Date(
                                  estimatedPickupDateFrom
                                );
                                newDate.setHours(
                                  parseInt(e.target.value),
                                  0,
                                  0
                                );
                                setEstimatedPickupDateFrom(newDate);
                              }
                            }}
                            value={estimatedPickupDateFrom?.getHours() || ""}
                            disabled={!estimatedPickupDateFrom}
                          >
                            <option value="">
                              {t("dateSelection.selectHour")}
                            </option>
                            {Array.from({ length: 14 }, (_, i) => i + 7).map(
                              (hour) => (
                                <option key={hour} value={hour}>
                                  {hour.toString().padStart(2, "0")}:00
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            {t("dateSelection.latestTime")}
                          </p>
                          <select
                            className="w-full p-2 rounded border h-10"
                            onChange={(e) => {
                              if (e.target.value === "") {
                                setEstimatedPickupDateTo(undefined);
                              } else if (estimatedPickupDateFrom) {
                                const newDate = new Date(
                                  estimatedPickupDateFrom
                                );
                                newDate.setHours(
                                  parseInt(e.target.value),
                                  0,
                                  0
                                );
                                setEstimatedPickupDateTo(newDate);
                              }
                            }}
                            value={estimatedPickupDateTo?.getHours() || ""}
                            disabled={!estimatedPickupDateFrom}
                          >
                            <option value="">
                              {t("dateSelection.selectHour")}
                            </option>
                            {Array.from({ length: 14 }, (_, i) => i + 7).map(
                              (hour) => (
                                <option
                                  key={hour}
                                  value={hour}
                                  disabled={
                                    estimatedPickupDateFrom &&
                                    hour <= estimatedPickupDateFrom.getHours()
                                  }
                                >
                                  {hour.toString().padStart(2, "0")}:00
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        {t("dateSelection.deliveryTitle")}
                      </h3>
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">
                          {t("dateSelection.deliveryDate")}
                        </p>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal overflow-hidden text-ellipsis whitespace-nowrap",
                                !estimatedDeliveryDateFrom &&
                                  "text-muted-foreground"
                              )}
                              disabled={!estimatedPickupDateFrom}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                              {estimatedDeliveryDateFrom ? (
                                <span className="truncate">
                                  {formatDateLocale(
                                    estimatedDeliveryDateFrom.toISOString(),
                                    locale,
                                    "PPP"
                                  )}
                                </span>
                              ) : (
                                <span>{t("dateSelection.pickDate")}</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={estimatedDeliveryDateFrom}
                              onSelect={handleDeliveryFromDateChange}
                              initialFocus
                              disabled={(date) =>
                                !estimatedPickupDateFrom ||
                                date < estimatedPickupDateFrom
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      {/* <p className="text-sm font-medium mb-2 text-gray-500">
                        {t("dateSelection.deliveryTime")}
                      </p> */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            {t("dateSelection.time")}
                          </p>
                          <select
                            className="w-full p-2 rounded border h-10"
                            onChange={(e) => {
                              if (estimatedDeliveryDateFrom && e.target.value) {
                                const newDate = new Date(
                                  estimatedDeliveryDateFrom
                                );
                                newDate.setHours(
                                  parseInt(e.target.value),
                                  0,
                                  0
                                );
                                setEstimatedDeliveryDateFrom(newDate);
                              }
                            }}
                            value={estimatedDeliveryDateFrom?.getHours() || ""}
                            disabled={!estimatedDeliveryDateFrom}
                          >
                            <option value="">
                              {t("dateSelection.selectHour")}
                            </option>
                            {Array.from({ length: 14 }, (_, i) => i + 7).map(
                              (hour) => (
                                <option key={hour} value={hour}>
                                  {hour.toString().padStart(2, "0")}:00
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            {t("dateSelection.latestTime")}
                          </p>
                          <select
                            className="w-full p-2 rounded border h-10"
                            onChange={(e) => {
                              if (e.target.value === "") {
                                setEstimatedDeliveryDateTo(undefined);
                              } else if (estimatedDeliveryDateFrom) {
                                const newDate = new Date(
                                  estimatedDeliveryDateFrom
                                );
                                newDate.setHours(
                                  parseInt(e.target.value),
                                  0,
                                  0
                                );
                                setEstimatedDeliveryDateTo(newDate);
                              }
                            }}
                            value={estimatedDeliveryDateTo?.getHours() || ""}
                            disabled={!estimatedDeliveryDateFrom}
                          >
                            <option value="">
                              {t("dateSelection.selectHour")}
                            </option>
                            {Array.from({ length: 14 }, (_, i) => i + 7).map(
                              (hour) => (
                                <option
                                  key={hour}
                                  value={hour}
                                  disabled={
                                    estimatedDeliveryDateFrom &&
                                    hour <= estimatedDeliveryDateFrom.getHours()
                                  }
                                >
                                  {hour.toString().padStart(2, "0")}:00
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="bg-red-600 hover:bg-red-700"
                      disabled={
                        !movingCost ||
                        !truckCost ||
                        !estimatedPickupDateFrom ||
                        !estimatedDeliveryDateFrom
                      }
                    >
                      {isPending
                        ? t("buttons.submitting")
                        : t("buttons.bidNow")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("confirmBid.title")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("confirmBid.description")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {t("buttons.cancel")}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleConfirmBid}
                        disabled={isPending}
                      >
                        {isPending
                          ? t("buttons.submitting")
                          : t("buttons.submit")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  {t("buttons.cancel")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        buttonText={t("buttons.goToDashboard")}
        onButtonClick={handleSuccessClose}
        title={t("success.title")}
        description={t("success.description")}
      />
    </div>
  );
}

const InfoSection = ({ label, value }: { label: string; value: string }) => {
  return (
    <div>
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className="text-gray-900 text-lg">{value}</p>
    </div>
  );
};

// Main component with Suspense boundary
export default function Quote() {
  return (
    <Suspense fallback={<div>Loading quote form...</div>}>
      <QuoteContent />
    </Suspense>
  );
}
