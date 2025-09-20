import { MapPin, Radar, Truck } from "lucide-react";

import { Package } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { MyOrder } from "@/api/interfaces/customers/dashboard";
import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatDateLocale } from "@/lib/formatDateLocale";

export const OrderCard = ({ order }: { order: MyOrder }) => {
  const t = useTranslations("common");
  const locale = useLocale();

  const renderStatusIcons = () => {
    const isCompleted = order.order_status === "completed";
    const isDelivered = order.order_status === "delivered";
    const isOngoing = order.order_status === "ongoing";
    const isAccepted = order.order_status === "accepted";
    const isPending = order.order_status === "pending";

    // Start with Radar
    const icons = [<Radar key="radar" className="text-primary" size={16} />];

    // Add truck based on status
    if (isAccepted) {
      icons.unshift(
        <Truck key="truck-accepted" className="w-4 h-4 mx-1 text-primary" />
      );
    }

    if (isOngoing) {
      icons.splice(
        1,
        0,
        <Truck key="truck-ongoing" className="w-4 h-4 mx-1 text-primary" />
      );
    }

    if (isDelivered || isCompleted) {
      icons.push(
        <Truck key="truck-final" className="w-4 h-4 mx-1 text-primary" />
      );
    }

    // Calculate active section for border coloring
    const getActiveBorderClass = (index: number) => {
      if (isPending) return "border-gray-300";
      if (isCompleted) return "border-primary";
      if (isDelivered && index >= icons.length - 1) return "border-gray-300";
      if (isOngoing && index >= Math.floor(icons.length / 2))
        return "border-gray-300";
      if (isAccepted && index >= 1) return "border-gray-300";
      return "border-primary";
    };

    return (
      <>
        {icons.map((icon, index) => (
          <React.Fragment key={index}>
            {icon}
            {index < icons.length - 1 && (
              <div
                className={`flex-1 border-b-2 border-dashed ${getActiveBorderClass(
                  index
                )}`}
              />
            )}
          </React.Fragment>
        ))}
        {!isCompleted && <MapPin className="text-primary" size={16} />}
      </>
    );
  };

  return (
    <Link
      href={`/customer/orders/${order.order_id}`}
      className="border border-[#D3D3D3] rounded-[20px] p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className=" flex items-center gap-x-2">
            <div className="bg-primary rounded-full p-2">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col text-xs md:text-sm">
              <div className="font-bold"> {order.order_id}</div>
              <div>{t(`quotationTypes.${order.service_type}`)}</div>
            </div>
          </div>
        </div>
        <div
          className={`px-4 py-1 rounded-full text-sm ${
            order.order_status === "pending"
              ? "bg-yellow-500/20 text-yellow-500"
              : order.order_status === "accepted"
                ? "bg-blue-500/20 text-blue-500"
                : order.order_status === "failed"
                  ? "bg-red-500/20 text-red-500"
                  : order.order_status === "completed"
                    ? "bg-green-500/20 text-green-500"
                    : order.order_status === "delivered"
                      ? "bg-purple-500/20 text-purple-500"
                      : "bg-gray-500/20 text-gray-500"
          }`}
        >
          {t(`status.${order.order_status}`)}
        </div>
      </div>

      <div className="flex justify-between">
        <span>{order.pickup_address}</span>
        <span>{order.delivery_address}</span>
      </div>
      <div className="flex items-center justify-between text-gray-600 mt-2 mb-4">
        {renderStatusIcons()}
      </div>

      <div className="flex items-center">
        <span className="text-gray-500 text-sm">
          {t("date.dateCreated")}:{" "}
          {order.order_created_at &&
            formatDateLocale(order.order_created_at, locale)}
        </span>
      </div>
    </Link>
  );
};
