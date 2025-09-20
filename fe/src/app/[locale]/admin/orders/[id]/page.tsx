"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import {
  useFetchCheckoutById,
  useFetchOrderById,
} from "@/hooks/admin/useFetchOrders";
import Link from "next/link";
import { formatNumber } from "@/lib/formatNumber";
import { format, parseISO } from "date-fns";
import { QuotationDetails } from "@/components/admin/QuotationDetails";
import { InitiateChatButton } from "@/components/InitiateChatButton";
import { useLocale, useTranslations } from "next-intl";
import { formatDateLocale } from "@/lib/formatDateLocale";
import { formatToQuotationType } from "@/lib/formatToQuotationType";

const Page = () => {
  const t = useTranslations("admin.orderDetails");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { id } = useParams<{ id: string }>();
  const { data } = useFetchOrderById(id);
  const order = data?.data;
  const { data: checkoutData } = useFetchCheckoutById(id);
  const checkout = checkoutData;
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="w-full">
        <div className="flex justify-between items-center">
          <h2 className="md:text-[20px] text-[16px]  font-bold">
            {t("title", { id: order?.order_id || "" })}
          </h2>
          <Link
            href={"/admin/orders"}
            className="text-white dark:text-black p-2 items-center justify-center rounded-[10px] bg-black dark:bg-white"
          >
            {t("backToOrders")}
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 md:gap-x-6 gap-x-0 md:gap-y-0 gap-y-6 mt-6">
          <Tabs
            defaultValue="order"
            className="lg:col-span-3 border rounded-[8px] "
          >
            <TabsList className="gap-x-4 grid w-full grid-cols-4 bg-white dark:bg-black border-b rounded-none rounded-t data-[active]:">
              {[
                { title: t("tabs.status"), value: "status" },
                { title: t("tabs.orderDetails"), value: "order" },
              ].map((item, index) => (
                <TabsTrigger
                  key={index}
                  value={item.value}
                  className="text-xs lg:text-[14px] data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 rounded-none border-black dark:border-gray-400"
                >
                  {item.title}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="status">
              <Card className="rounded-t-none border-t-0">
                <CardHeader>
                  <CardTitle>{t("status.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 font-semibold text-sm text-gray-600">
                      <div>{t("status.columns.date")}</div>
                      <div>{t("status.columns.statusType")}</div>
                      <div>{t("status.columns.user")}</div>
                      <div>{t("status.columns.status")}</div>
                    </div>
                    <div className="grid grid-cols-4 items-center">
                      <div className="text-sm">
                        {order?.quotation?.date
                          ? format(order?.quotation?.date, "dd MMM yyyy")
                          : ""}
                      </div>
                      <div className="text-sm">{t("status.types.order")}</div>
                      <div className="text-sm">{order?.supplier?.name}</div>
                      <div>
                        <Badge
                          variant={
                            order?.quotation?.status === "accepted"
                              ? "default"
                              : "destructive"
                          }
                          className={`
                            ${
                              order?.quotation?.status === "accepted"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                            px-3 py-1 rounded-full text-xs
                          `}
                        >
                          {order?.quotation
                            ? tCommon(`status.${order?.quotation?.status}`)
                            : ""}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center">
                      <div className="text-sm">
                        {order?.quotation?.date
                          ? format(order?.quotation?.date, "dd MMM yyyy")
                          : ""}
                      </div>
                      <div className="text-sm">{t("status.types.payment")}</div>
                      <div className="text-sm">
                        {order?.quotation?.name || "-"}
                      </div>
                      <div>
                        <Badge
                          variant={
                            order?.payment_status === "completed"
                              ? "default"
                              : "destructive"
                          }
                          className={`capitalize
                            ${
                              order?.payment_status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                            px-3 py-1 rounded-full text-xs
                          `}
                        >
                          {order?.payment_status
                            ? tCommon(`paymentStatus.${order?.payment_status}`)
                            : "N/A"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="order">
              <Card className="rounded-t-none border-t-0">
                <CardHeader>
                  <CardTitle>{t("details.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className=" grid gap-4 grid-cols-2 ">
                    <div className="">
                      <div className="text-sm text-gray-600">
                        {t("details.quotationType")}
                      </div>
                      <div className="text-sm font-medium">
                        {order?.quotation?.service_type}
                      </div>
                    </div>
                    <div className="">
                      <div className="text-sm text-gray-600">
                        {t("details.bidDate")}
                      </div>
                      <div className="text-sm font-medium">
                        {order?.quotation?.created_at
                          ? formatDateLocale(
                              order?.quotation?.created_at,
                              locale
                            )
                          : ""}
                      </div>
                    </div>
                    <div className="">
                      <div className="text-sm text-gray-600">
                        {t("details.amountBidded")}
                      </div>
                      <div className="text-sm font-medium">
                        N/A
                        {/* {formatNumber(
                          Number(order?.final_price) | 0
                        )}{" "}
                        SEK */}
                      </div>
                    </div>
                    <div className="">
                      <div className="text-sm text-gray-600">
                        {t("details.totalAmount")}
                      </div>
                      <div className="text-sm font-medium">
                        {formatNumber(Number(order?.total_price) | 0)} SEK
                      </div>
                    </div>
                    <div className="">
                      <div className="text-sm text-gray-600">
                        {t("details.moverName")}
                      </div>
                      <div className="text-sm font-medium">
                        {order?.supplier?.name}
                      </div>
                    </div>
                    <div className="">
                      <div className="text-sm text-gray-600">
                        {t("details.moveDate")}
                      </div>
                      <div className="text-sm font-medium">
                        {order?.quotation?.date
                          ? formatDateLocale(order?.quotation?.date, locale)
                          : ""}
                      </div>
                    </div>
                    <div className="">
                      <div className="text-sm text-gray-600">
                        {t("details.rutApplied")}
                      </div>
                      <div className="text-sm font-medium">
                        {checkout?.rut_discount_applied === 1
                          ? tCommon("answer.yes")
                          : tCommon("answer.no")}
                      </div>
                    </div>
                    <div className="">
                      <div className="text-sm text-gray-600">
                        {t("details.rutDeduction")}
                      </div>
                      <div className="text-sm font-medium">
                        {checkout?.rut_deduction
                          ? formatNumber(Number(checkout?.rut_deduction) | 0)
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mover">
              <Card className="rounded-t-none border-t-0">
                <CardHeader>
                  <CardTitle>Mover Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className=" grid gap-4 grid-cols-2 ">
                    <div className="">
                      <div className="text-sm text-gray-600">Mover Name</div>
                      <div className="text-sm font-medium">
                        {order?.supplier?.name}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>{t("customer.title")}</CardTitle>
            </CardHeader>
            <CardContent className="">
              <div className=" grid gap-4 grid-cols-2 ">
                <div className="">
                  <div className="text-sm text-gray-600">
                    {t("customer.name")}
                  </div>
                  <div className="text-sm font-medium">
                    {`${order?.quotation.name}`}
                  </div>
                </div>

                <div className="">
                  <div className="text-sm text-gray-600">
                    {t("customer.email")}
                  </div>
                  <div className="text-sm font-medium break-words">
                    {order?.quotation?.email}
                  </div>
                </div>
                <div className="">
                  <div className="text-sm text-gray-600">
                    {t("customer.phone")}
                  </div>
                  <div className="text-sm font-medium">
                    {order?.quotation?.phone}
                  </div>
                </div>

                <InitiateChatButton
                  isAdmin
                  recipientId={order?.customer_id}
                  recipientType="customer"
                />

                {/* <div className="">
                  <div className="text-sm text-gray-600">Address:</div>
                  <div className="text-sm font-medium">
                    {customerDetails.address}
                  </div>
                </div> */}
                {/* <div className="">
                  <div className="text-sm text-gray-600">Suburb/City:</div>
                  <div className="text-sm font-medium">
                    {customerDetails.suburb}
                  </div>
                </div> */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div>
        <Tabs
          defaultValue="logistics"
          className="lg:col-span-3 border rounded-[8px] "
        >
          <TabsList className="gap-x-4 grid w-full grid-cols-4 bg-white dark:bg-black border-b rounded-none rounded-t data-[active]:">
            {[
              { title: t("logistics.title"), value: "logistics" },
              { title: t("moveDetails.title"), value: "move-details" },
            ].map((item, index) => (
              <TabsTrigger
                key={index}
                value={item.value}
                className="text-xs lg:text-[14px] data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 rounded-none border-black dark:border-gray-400"
              >
                {item.title}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="logistics">
            <Card className="rounded-t-none border-t-0">
              <CardHeader>
                <CardTitle>{t("logistics.details.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className=" grid gap-4 grid-cols-4 ">
                  <div className="">
                    <div className="text-sm text-gray-600">
                      {t("logistics.details.fromCity")}
                    </div>
                    <div className="text-sm font-medium">
                      {order?.quotation?.pickup_address}
                    </div>
                  </div>
                  <div>
                    <div className="">
                      <div className="text-sm text-gray-600">
                        {t("logistics.details.toCity")}
                      </div>
                      <div className="text-sm font-medium">
                        {order?.quotation?.delivery_address}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">
                      {t("logistics.details.completionDate")}
                    </div>
                    <div className="text-sm font-medium">
                      {order?.quotation?.latest_date
                        ? format(
                            parseISO(order?.quotation?.latest_date),
                            "dd MMMM yyyy"
                          )
                        : ""}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">
                      {t("logistics.details.distance")}
                    </div>
                    <div className="text-sm font-medium">
                      {formatNumber(Number(order?.distance) | 0)} km
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="move-details">
            <Card className="rounded-t-none border-t-0">
              <CardHeader>
                <CardTitle>{t("moveDetails.details.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-2 mb-4">
                  <div className="">
                    <div className="text-sm text-gray-600 capitalize">
                      {t("moveDetails.details.moveDate")}
                    </div>
                    <div className="text-sm font-medium">
                      {order?.quotation?.date
                        ? formatDateLocale(order?.quotation?.date, locale)
                        : ""}
                    </div>
                  </div>
                  <div className="">
                    <div className="text-sm text-gray-600 capitalize">
                      {t("moveDetails.details.serviceType")}
                    </div>
                    <div className="text-sm font-medium capitalize">
                      {order?.quotation?.service_type
                        ? tCommon(
                            `quotationTypes.${formatToQuotationType(
                              order?.quotation?.service_type
                            )}`
                          )
                        : ""}
                    </div>
                  </div>
                </div>
                {order?.quotation && (
                  <QuotationDetails quotation={order?.quotation} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Page;

// export async function generateStaticParams() {
//   // Fetch all order IDs that you want to pre-render
//   const response = await api.get(`api/admins/orders/`);
//   const orders = response.data;

//   return orders.map((order: { id: string }) => ({
//     id: order.id,
//   }));
// }
