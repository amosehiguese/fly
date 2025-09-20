"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupplierTips } from "@/hooks/supplier/useTips";
import { useTranslations, useLocale } from "next-intl";
import { formatDateLocale } from "@/lib/formatDateLocale";
import {
  Search,
  DollarSign,
  User,
  Clock,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function SupplierTipsPage() {
  const t = useTranslations("supplier.tips");
  const locale = useLocale();
  const { data: tipsData, isLoading, error } = useSupplierTips();
  const [searchTerm, setSearchTerm] = useState("");

  const tips = tipsData?.data;

  // Filter drivers based on search term
  const filteredDrivers =
    tips?.drivers?.filter(
      (driver) =>
        driver.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.driver_email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
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
      <div className="container mx-auto p-6">
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="">
          <div className="flex">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex flex-1 justify-center">
              <h1 className="text-2xl lg:text-3xl font-bold">
                {t("driverTips")}
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground mt-1">
            {t("manageDriverTipsDescription")}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalTips")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              SEK {parseFloat(tips?.total_tips || "0").toFixed(2)}
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("averageTipPerDriver")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              SEK{" "}
              {tips?.drivers?.length
                ? (parseFloat(tips.total_tips) / tips.drivers.length).toFixed(2)
                : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>{t("driverList")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchDrivers")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {filteredDrivers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? t("noDriversFound") : t("noDriversWithTips")}
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
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
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          SEK {parseFloat(driver.total_tips).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {driver.tips.length} {t("tips")}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      {driver.tips.map((tip, tipIndex) => (
                        <div
                          key={`${tip.order_id}-${tipIndex}`}
                          className="border rounded-lg p-3 bg-muted/50"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">
                                {t("order")}: {tip.order_id}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {t("from")}: {tip.customer_name}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                SEK {parseFloat(tip.amount).toFixed(2)}
                              </p>
                              <Badge
                                className={`${getStatusColor(tip.status)} flex items-center gap-1`}
                              >
                                {getStatusIcon(tip.status)}
                                {t(`status.${tip.status}`)}
                              </Badge>
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
                                {t("date")}:{" "}
                                {formatDateLocale(tip.date, locale)}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
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
