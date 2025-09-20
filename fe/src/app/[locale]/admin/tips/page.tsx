"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAdminTips, useMarkTipsPaid, AdminTip } from "@/hooks/admin/useTips";
import { useTranslations, useLocale } from "next-intl";
import { formatDateLocale } from "@/lib/formatDateLocale";
import { ErrorResponse, handleMutationError } from "@/api";
import { toast } from "sonner";
import {
  Search,
  DollarSign,
  User,
  Clock,
  CheckCircle,
  CreditCard,
  Building,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AxiosError } from "axios";

export default function AdminTipsPage() {
  const t = useTranslations("admin.tips");
  const locale = useLocale();
  const { data: tipsData, isLoading, error } = useAdminTips();
  const markTipsPaid = useMarkTipsPaid();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTips, setSelectedTips] = useState<{
    [driverEmail: string]: string[];
  }>({});

  const tips = tipsData?.data;

  // Filter drivers based on search term
  const filteredDrivers =
    tips?.drivers?.filter(
      (driver) =>
        driver.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.driver_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-3 h-3" />;
      case "pending":
        return <Clock className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const handleTipSelection = (
    driverEmail: string,
    orderId: string,
    checked: boolean
  ) => {
    setSelectedTips((prev) => {
      const driverTips = prev[driverEmail] || [];
      if (checked) {
        return {
          ...prev,
          [driverEmail]: [...driverTips, orderId],
        };
      } else {
        return {
          ...prev,
          [driverEmail]: driverTips.filter((id) => id !== orderId),
        };
      }
    });
  };

  const handleMarkAsPaid = async (driverEmail: string) => {
    const orderIds = selectedTips[driverEmail];
    if (!orderIds || orderIds.length === 0) {
      toast.error(t("selectTipsFirst"));
      return;
    }

    try {
      await markTipsPaid.mutateAsync({
        driverEmail,
        orderIds,
      });
      toast.success(t("tipsMarkedAsPaid"));
      // Clear selections for this driver
      setSelectedTips((prev) => ({
        ...prev,
        [driverEmail]: [],
      }));
    } catch (error) {
      handleMutationError(error as AxiosError<ErrorResponse>, locale);
    }
  };

  const selectAllDriverTips = (driverEmail: string, tips: AdminTip[]) => {
    const pendingTips = tips.filter((tip) => tip.payout_status === "pending");
    const allSelected = pendingTips.every((tip) =>
      selectedTips[driverEmail]?.includes(tip.order_id)
    );

    if (allSelected) {
      setSelectedTips((prev) => ({
        ...prev,
        [driverEmail]: [],
      }));
    } else {
      setSelectedTips((prev) => ({
        ...prev,
        [driverEmail]: pendingTips.map((tip) => tip.order_id),
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">{t("loadingTips")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{t("errorLoadingTips")}</p>
            <Button onClick={() => window.location.reload()}>
              {t("tryAgain")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("tipManagement")}
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalTips")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              SEK {parseFloat(tips?.totals?.total_tips || "0").toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalPaid")}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              SEK{" "}
              {parseFloat(tips?.totals?.total_paid?.toString() || "0").toFixed(
                2
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalPending")}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              SEK {parseFloat(tips?.totals?.total_pending || "0").toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalDrivers")}
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tips?.drivers?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Driver List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("driverTips")}</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchDriversOrSuppliers")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredDrivers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? t("noDriversFound") : t("noDriversWithTips")}
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredDrivers.map((driver, index) => (
                <AccordionItem
                  key={driver.driver_email}
                  value={`driver-${index}`}
                  className="border rounded-lg"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center justify-between w-full mr-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{driver.driver_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {driver.driver_email}
                          </p>
                          <div className="flex items-center mt-1 text-xs text-muted-foreground">
                            <Building className="w-3 h-3 mr-1" />
                            {driver.supplier.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          SEK {parseFloat(driver.total_tips).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {driver.tips.length} {t("tips")}
                        </p>
                        <div className="flex space-x-2 mt-1">
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            {t("paid")}: SEK{" "}
                            {parseFloat(
                              driver.total_paid?.toString() || "0"
                            ).toFixed(2)}
                          </Badge>
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                            {t("pending")}: SEK{" "}
                            {parseFloat(driver.total_pending).toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {/* Supplier Info */}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <h4 className="font-medium mb-2">
                          {t("supplierInfo")}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">{t("name")}:</span>{" "}
                            {driver.supplier.name}
                          </div>
                          <div>
                            <span className="font-medium">{t("email")}:</span>{" "}
                            {driver.supplier.email}
                          </div>
                          <div>
                            <span className="font-medium">{t("phone")}:</span>{" "}
                            {driver.supplier.phone}
                          </div>
                          <div>
                            <span className="font-medium">
                              {t("bankName")}:
                            </span>{" "}
                            {driver.supplier.bankName}
                          </div>
                        </div>
                      </div>

                      {/* Batch Actions */}
                      <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={
                              driver.tips.filter(
                                (tip) => tip.payout_status === "pending"
                              ).length > 0 &&
                              driver.tips
                                .filter(
                                  (tip) => tip.payout_status === "pending"
                                )
                                .every((tip) =>
                                  selectedTips[driver.driver_email]?.includes(
                                    tip.order_id
                                  )
                                )
                            }
                            onCheckedChange={() =>
                              selectAllDriverTips(
                                driver.driver_email,
                                driver.tips
                              )
                            }
                          />
                          <span className="text-sm font-medium">
                            {t("selectAllPending")} (
                            {
                              driver.tips.filter(
                                (tip) => tip.payout_status === "pending"
                              ).length
                            }
                            )
                          </span>
                        </div>
                        <Button
                          onClick={() => handleMarkAsPaid(driver.driver_email)}
                          disabled={
                            !selectedTips[driver.driver_email]?.length ||
                            markTipsPaid.isPending
                          }
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          {markTipsPaid.isPending
                            ? t("marking")
                            : t("markAsPaid")}{" "}
                          ({selectedTips[driver.driver_email]?.length || 0})
                        </Button>
                      </div>

                      {/* Tips List */}
                      <div className="space-y-3">
                        {driver.tips.map((tip, tipIndex) => (
                          <div
                            key={`${tip.order_id}-${tipIndex}`}
                            className="border rounded-lg p-3 bg-background"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-start space-x-3">
                                {tip.payout_status === "pending" && (
                                  <Checkbox
                                    checked={
                                      selectedTips[
                                        driver.driver_email
                                      ]?.includes(tip.order_id) || false
                                    }
                                    onCheckedChange={(checked) =>
                                      handleTipSelection(
                                        driver.driver_email,
                                        tip.order_id,
                                        checked as boolean
                                      )
                                    }
                                  />
                                )}
                                <div>
                                  <p className="font-medium">
                                    {t("order")}: {tip.order_id}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {t("from")}: {tip.customer_name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {tip.customer_email}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  SEK {parseFloat(tip.amount).toFixed(2)}
                                </p>
                                <Badge
                                  className={`${getStatusColor(tip.payout_status)} flex items-center gap-1 mb-1`}
                                >
                                  {getStatusIcon(tip.payout_status)}
                                  {t(`payoutStatus.${tip.payout_status}`)}
                                </Badge>
                                {tip.payout_date && (
                                  <p className="text-xs text-muted-foreground">
                                    {t("paidOn")}:{" "}
                                    {formatDateLocale(tip.payout_date, locale)}
                                  </p>
                                )}
                              </div>
                            </div>
                            {tip.message && (
                              <div className="mt-2">
                                <p className="text-sm">
                                  <span className="font-medium">
                                    {t("message")}:
                                  </span>{" "}
                                  &ldquo;{tip.message}&rdquo;
                                </p>
                              </div>
                            )}
                            {tip.date && (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground">
                                  {t("tipDate")}:{" "}
                                  {formatDateLocale(tip.date, locale)}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
