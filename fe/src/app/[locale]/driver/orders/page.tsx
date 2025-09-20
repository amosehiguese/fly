"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  MapPin,
  Search,
  ChevronRight,
  Package,
  Filter,
  Calendar,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDriverOrders } from "@/hooks/driver";

interface Order {
  id: string;
  orderId: string;
  customerName: string;
  pickupLocation: string;
  dropoffLocation: string;
  date: string;
  amount: string;
  status: "pending" | "completed" | "cancelled";
}

export default function OrdersPage() {
  const t = useTranslations("driver");
  const { useActiveOrder } = useDriverOrders();
  const { data: activeOrders, error } = useActiveOrder();
  if (error) console.log("driver active orders", activeOrders, error);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [orders] = useState<Order[]>([
    {
      id: "1",
      orderId: "#121245",
      customerName: "John Smith",
      pickupLocation: "Arlanda Airport T5, Stockholm",
      dropoffLocation: "Centralplan 15, Stockholm",
      date: "May 15, 2025",
      amount: "450 kr",
      status: "completed",
    },
    {
      id: "2",
      orderId: "#121246",
      customerName: "Emma Andersson",
      pickupLocation: "Stockholm Central",
      dropoffLocation: "Solna Business Park",
      date: "May 10, 2025",
      amount: "250 kr",
      status: "completed",
    },
    {
      id: "3",
      orderId: "#121247",
      customerName: "Liam Johnson",
      pickupLocation: "Uppsala Center",
      dropoffLocation: "Kista Galleria",
      date: "May 5, 2025",
      amount: "350 kr",
      status: "cancelled",
    },
    {
      id: "4",
      orderId: "#121248",
      customerName: "Olivia Wilson",
      pickupLocation: "Bromma Airport",
      dropoffLocation: "Södermalm, Stockholm",
      date: "May 1, 2025",
      amount: "300 kr",
      status: "completed",
    },
  ]);

  const filteredOrders = orders.filter(
    (order) =>
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.dropoffLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedOrders = filteredOrders.filter(
    (order) => order.status === "completed"
  );
  const cancelledOrders = filteredOrders.filter(
    (order) => order.status === "cancelled"
  );

  const handleOrderSelect = (orderId: string) => {
    router.push(`/driver/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 border-b">
        <h1 className="text-xl font-semibold">{t("myOrders")}</h1>
      </div>

      {/* Search */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("searchOrders")}
              className="pl-10 bg-gray-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-2 bg-gray-100 rounded-md">
            <Filter className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white mb-4">
        <Tabs defaultValue="completed" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="completed">{t("completed")}</TabsTrigger>
            <TabsTrigger value="cancelled">{t("cancelled")}</TabsTrigger>
          </TabsList>

          <TabsContent value="completed" className="p-0">
            {completedOrders.length > 0 ? (
              <div className="flex flex-col">
                {completedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white p-4 border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleOrderSelect(order.id)}
                  >
                    <div className="flex justify-between mb-2">
                      <h3 className="font-semibold">Order {order.orderId}</h3>
                      <Badge className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        Completed
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-500 mb-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {order.date}
                    </div>

                    <div className="flex justify-between mt-3">
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                          <MapPin className="w-3 h-3 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t("from")}</p>
                          <p className="text-sm font-medium truncate max-w-[120px]">
                            {order.pickupLocation}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                          <MapPin className="w-3 h-3 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t("to")}</p>
                          <p className="text-sm font-medium truncate max-w-[120px]">
                            {order.dropoffLocation}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <div>
                        <p className="text-xs text-gray-500">
                          {t("customerLabel")}
                        </p>
                        <p className="text-sm font-medium">
                          {order.customerName}
                        </p>
                      </div>
                      <p className="font-semibold">{order.amount}</p>
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">{t("noCompletedOrders")}</p>
                <p className="text-sm text-gray-400 mt-2">
                  {t("completedOrdersAppearHere")}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="p-0">
            {cancelledOrders.length > 0 ? (
              <div className="flex flex-col">
                {cancelledOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white p-4 border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleOrderSelect(order.id)}
                  >
                    <div className="flex justify-between mb-2">
                      <h3 className="font-semibold">Order {order.orderId}</h3>
                      <Badge className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                        Cancelled
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-500 mb-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {order.date}
                    </div>

                    <div className="flex justify-between mt-3">
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                          <MapPin className="w-3 h-3 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t("from")}</p>
                          <p className="text-sm font-medium truncate max-w-[120px]">
                            {order.pickupLocation}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                          <MapPin className="w-3 h-3 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t("to")}</p>
                          <p className="text-sm font-medium truncate max-w-[120px]">
                            {order.dropoffLocation}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <div>
                        <p className="text-xs text-gray-500">
                          {t("customerLabel")}
                        </p>
                        <p className="text-sm font-medium">
                          {order.customerName}
                        </p>
                      </div>
                      <p className="font-semibold">{order.amount}</p>
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No cancelled orders found.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Cancelled orders will appear here.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
