"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  MapPin,
  Calendar,
  Package,
  User,
  Phone,
  MessageSquare,
  ArrowLeft,
  DollarSign,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrderDetail {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  deliveryDate: string;
  distance: string;
  amount: string;
  status: "pending" | "accepted" | "in_progress" | "completed";
  itemDetails: {
    weight: string;
    dimensions: string;
    itemType: string;
    specialInstructions?: string;
  };
}

export default function OrderDetailsPage() {
  const t = useTranslations("driver");
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [orderDetails, setOrderDetails] = useState<OrderDetail | null>(null);
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  // Mock data for demonstration purposes
  useEffect(() => {
    // In a real application, this would be an API call
    setOrderDetails({
      id: id as string,
      orderId: "#121245",
      customerName: "John Smith",
      customerPhone: "+46 123 456 789",
      pickupLocation: "Arlanda Airport T5, Stockholm",
      dropoffLocation: "Centralplan 15, Stockholm 111 20",
      pickupDate: "May 15, 2025 • 2:00 PM",
      deliveryDate: "May 15, 2025 • 4:30 PM",
      distance: "45 km",
      amount: "450 kr",
      status: "pending",
      itemDetails: {
        weight: "25kg",
        dimensions: "60 x 40 x 30 cm",
        itemType: "Fragile",
        specialInstructions: "Handle with care. Call customer before delivery.",
      },
    });
  }, [id]);

  const handleNavigateBack = () => {
    router.back();
  };

  const handleAcceptOrder = () => {
    // In a real application, this would be an API call
    setOrderDetails((prev) =>
      prev ? { ...prev, status: "accepted" as const } : null
    );

    // Navigate to driver home after a short delay
    setTimeout(() => {
      router.push("/driver");
    }, 1000);
  };

  const handleContactCustomer = () => {
    // In a real application, this would trigger a call
    if (orderDetails) {
      window.open(`tel:${orderDetails.customerPhone}`);
    }
  };

  const handleMessageCustomer = () => {
    // In a real application, this would open the messaging interface
    if (orderDetails) {
      router.push(`/driver/messages/${orderDetails.id}`);
    }
  };

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center">
        <button onClick={handleNavigateBack} className="mr-3">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">
          {t("orderDetails") || "Order Details"}
        </h1>
      </div>

      <div className="p-4">
        {/* Order ID and Status */}
        <div className="bg-white rounded-lg p-4 mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">
              {t("order")} {orderDetails.orderId}
            </h2>
            <p className="text-sm text-gray-500">May 29, 2025</p>
          </div>
          <Badge
            className={cn(
              "px-3 py-1 rounded-full text-sm",
              orderDetails.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : orderDetails.status === "accepted"
                  ? "bg-green-100 text-green-800"
                  : orderDetails.status === "in_progress"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
            )}
          >
            {orderDetails.status === "pending"
              ? t("pending") || "Pending"
              : orderDetails.status === "accepted"
                ? t("accepted") || "Accepted"
                : orderDetails.status === "in_progress"
                  ? t("inProgress") || "In Progress"
                  : t("completed") || "Completed"}
          </Badge>
        </div>

        {/* Location Details */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h3 className="font-medium mb-3">
            {t("deliveryInfo") || "Delivery Information"}
          </h3>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {t("pickupLocation") || "Pickup Location"}
                </p>
                <p className="font-medium">{orderDetails.pickupLocation}</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {t("dropoffLocation") || "Dropoff Location"}
                </p>
                <p className="font-medium">{orderDetails.dropoffLocation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Details */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h3 className="font-medium mb-3">{t("schedule") || "Schedule"}</h3>

          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {t("pickupDateTime") || "Pickup Date & Time"}
                </p>
                <p className="font-medium">{orderDetails.pickupDate}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                <Calendar className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {t("deliveryDateTime") || "Delivery Date & Time"}
                </p>
                <p className="font-medium">{orderDetails.deliveryDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Item Details */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <button
            className="w-full flex justify-between items-center"
            onClick={() => setShowMoreDetails(!showMoreDetails)}
          >
            <h3 className="font-medium">
              {t("itemDetails") || "Item Details"}
            </h3>
            {showMoreDetails ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {showMoreDetails && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <Package className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    {t("itemType") || "Item Type"}
                  </p>
                  <p className="font-medium">
                    {orderDetails.itemDetails.itemType}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <Package className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    {t("weight") || "Weight"}
                  </p>
                  <p className="font-medium">
                    {orderDetails.itemDetails.weight}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <Package className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    {t("dimensions") || "Dimensions"}
                  </p>
                  <p className="font-medium">
                    {orderDetails.itemDetails.dimensions}
                  </p>
                </div>
              </div>

              {orderDetails.itemDetails.specialInstructions && (
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <FileText className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {t("specialInstructions") || "Special Instructions"}
                    </p>
                    <p className="font-medium">
                      {orderDetails.itemDetails.specialInstructions}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h3 className="font-medium mb-3">Customer</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="font-medium">{orderDetails.customerName}</p>
                <p className="text-sm text-gray-500">
                  {orderDetails.customerPhone}
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleContactCustomer}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium mt-4"
              >
                <Phone className="h-4 w-4" />
                {t("contactCustomer") || "Contact Customer"}
              </button>
              <button
                onClick={handleMessageCustomer}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium mt-2"
              >
                <MessageSquare className="h-4 w-4" />
                {t("messageCustomer") || "Message Customer"}
              </button>
            </div>
          </div>
        </div>

        {/* Price Details */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h3 className="font-medium mb-3">Price Details</h3>

          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <p className="font-medium">Total Amount</p>
            </div>
            <p className="font-semibold text-lg">{orderDetails.amount}</p>
          </div>
        </div>

        {/* Action Button */}
        {orderDetails.status === "pending" && (
          <button
            className="w-full bg-green-500 text-white px-6 py-2 rounded-lg font-medium mt-6"
            onClick={handleAcceptOrder}
          >
            {t("acceptJob") || "Accept Job"}
          </button>
        )}

        {orderDetails.status === "accepted" && (
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
            onClick={() => router.push(`/driver/transit/${id}`)}
          >
            Start Transit
          </button>
        )}
      </div>
    </div>
  );
}
