"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { OrderCard } from "./OrderCard";
import { BaseQuotation } from "@/api/interfaces/customers/dashboard";
import {
  MyOrder,
  QuotationResults,
} from "@/api/interfaces/customers/dashboard";
import { QuotationCard } from "./QuotationCard";
import { useTranslations } from "next-intl";

interface OrdersTabsProps {
  orders?: MyOrder[];
  quotations?: QuotationResults;
}

export const OrdersTabs: React.FC<OrdersTabsProps> = ({
  orders = [],
  quotations = [],
}) => {
  const sortedOrders =
    orders.length > 0
      ? [...orders].sort(
          (a, b) =>
            new Date(b.order_created_at).getTime() -
            new Date(a.order_created_at).getTime()
        )
      : [];

  const sortedQuotations = Object.entries(quotations)
    .flatMap(([serviceType, quotationArray]) =>
      quotationArray.map((quotation: BaseQuotation) => ({
        ...quotation,
        service_type: serviceType,
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.order_created_at).getTime() -
        new Date(a.order_created_at).getTime()
    );

  const t = useTranslations("customers.orderDetails");

  return (
    <Tabs defaultValue="orders" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="orders">{t("orders")}</TabsTrigger>
        <TabsTrigger value="quotations">{t("quotations")}</TabsTrigger>
      </TabsList>

      <TabsContent value="orders" className="space-y-4">
        {sortedOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {sortedOrders.map((order, index) => (
              <OrderCard key={index} order={order} />
            ))}
          </div>
        ) : (
          <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
            <div className="flex justify-center mb-4">
              <svg
                className="w-32 h-32 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {t("noOrders.title")}
            </h3>
            <p className="text-gray-500 mb-4">{t("noOrders.description")}</p>
            <Link href="/customer/get-quotation">
              <Button className="bg-black hover:bg-gray-800 transition-colors">
                {t("noOrders.button")}
              </Button>
            </Link>
          </div>
        )}
      </TabsContent>

      <TabsContent value="quotations" className="space-y-4">
        {sortedQuotations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {sortedQuotations.map((quotation, index) => (
              <QuotationCard key={index} quotation={quotation} />
            ))}
          </div>
        ) : (
          <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
            <div className="flex justify-center mb-4">
              <svg
                className="w-32 h-32 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {t("noQuotation.title")}
            </h3>
            <p className="text-gray-500 mb-4">{t("noQuotation.description")}</p>
            <Link href="/customer/get-quotation">
              <Button className="bg-black hover:bg-gray-800 transition-colors">
                {t("noQuotation.button")}
              </Button>
            </Link>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
