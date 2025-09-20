"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Truck, MapPin, Calendar, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { useAssignDriver, useFetchDriverById } from "@/hooks/supplier/useDrivers";
import { toast } from "sonner";
import { useSupplierOrders } from "@/hooks/supplier/useSupplierOrders";
import { formatDateLocale } from "@/lib/formatDateLocale";

type QuotationType = "company_relocation" | "moving_cleaning" | "private_move" | 'secrecy_move' | 'heavy_lifting' | 'estate_clearance' | 'evacuation_move';  

interface Order {
  bid_id: string;
  bid_status: "status" | "accepted" | "ongoing";
  created_at: string;
  final_price: string | null;
  from_city: string;
  move_date: string;
  moving_cost: string;
  order_id: string;
  order_status: null;
  quotation_id: number;
  quotation_type: QuotationType
  supplier_notes: string;
  to_city: string;
  is_assigned: 1 | 0
}


const EmptyState = ({
  message,
  icon,
}: {
  message: string;
  icon?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center w-full py-16 mt-4 bg-white rounded-lg shadow-sm">
    <div className="mb-4 p-4 rounded-full bg-gray-100">
      {icon || <SearchX className="h-8 w-8 text-gray-400" />}
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-1">
      No available order{" "}
    </h3>
    <p className="text-gray-500 text-center max-w-md">{message}</p>
  </div>
);

export default function AssignJobPage() {
  const router = useRouter();
  const { driverId } = useParams<{ driverId: string }>();
  const [filterType, setFilterType] = useState<"location" | "distance">(
    "location"
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { mutate: assignDriver, isPending } = useAssignDriver();
  const { data: ordersData } = useSupplierOrders();

  // const orders = dashboardData?.orders;
  const orders: Order[] = ordersData?.data?.bids.filter((order: Order) => order.order_status === "accepted" && order.is_assigned === 0)
    const {data} = useFetchDriverById(driverId)
    const driver = data?.data
  
  const handleBack = () => {
    router.back();
  };

  const handleSelect = (order: Order) => {
    setSelectedOrderId(order.order_id);
    setSelectedOrder(order);
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    // In a real app, this would make an API call to assign the job
    console.log(`Assigning order ${selectedOrder} to driver ${driverId}`);
    assignDriver({order_id: selectedOrderId!, driver_id: driverId}, {
      onSuccess: (data) => {
        // success message in swedish
        toast(data.messageSv || "Driver assigned successfully");
        setShowConfirmDialog(false);
        setShowSuccessDialog(true);
      },
    });
  };

  const handleGoToDashboard = () => {
    setShowSuccessDialog(false);
    router.push("/supplier");
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  return (
    <div className="container mx-auto px-0 pb-6 md:max-w-4xl lg:max-w-6xl">
      {/* Header */}
      <div className="py-4 flex items-center justify-between px-4">
        <button onClick={handleBack} className="p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Assign Jobs</h1>
        <div className="w-5"></div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 mb-4 flex space-x-2">
        <Button
          variant={filterType === "location" ? "default" : "outline"}
          className={
            filterType === "location"
              ? "bg-red-600 hover:bg-red-700"
              : "border-gray-300"
          }
          onClick={() => setFilterType("location")}
        >
          By Location
        </Button>
        <Button
          variant={filterType === "distance" ? "default" : "outline"}
          className={
            filterType === "distance"
              ? "bg-red-600 hover:bg-red-700"
              : "border-gray-300"
          }
          onClick={() => setFilterType("distance")}
        >
          By Distance
        </Button>
      </div>

      {/* Order List */}
      <div className="px-4 space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
        {orders?.map((order, index) => (
          <div
            key={`${order.order_id}-${index}`}
            className="border border-red-500 rounded-lg overflow-hidden"
          >
            <div className="p-4">
              <p className="font-medium mb-3">Order ID: {order.order_id}</p>

              <div className="space-y-2">
                <div className="flex items-start">
                  <Truck className="h-5 w-5 text-gray-500 mr-2 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Pickup:</p>
                    <p className="text-sm">{order.from_city}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Delivery:</p>
                    <p className="text-sm">{order.to_city}</p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                    <p className="text-sm">Distance: {order.distance || "N/A"}</p>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                    <p className="text-sm">Date: {order.move_date && formatDateLocale(order.move_date, 'sv')}</p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-4 bg-red-600 hover:bg-red-700"
                onClick={() => handleSelect(order)}
              >
                Select
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="pt-6">
            <h2 className="text-xl font-bold text-center mb-6">
              Confirm Assignment
            </h2>

            <div className="mb-6">
              <p className="font-medium mb-4">Assign Job {selectedOrderId} to:</p>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-gray-600">Name:</p>
                  <p className="font-medium">{driver?.full_name}</p>
                </div>

                <div className="flex justify-between">
                  <p className="text-gray-600">Vehicle type:</p>
                  <p className="font-medium">{driver?.vehicle_type}</p>
                </div>

                <div className="flex justify-between">
                  <p className="text-gray-600">Pickup:</p>
                  <p className="font-medium">{selectedOrder?.from_city}</p>
                </div>

                <div className="flex justify-between">
                  <p className="text-gray-600">Delivery:</p>
                  <p className="font-medium">{selectedOrder?.to_city}</p>
                </div>

                <div className="flex justify-between">
                  <p className="text-gray-600">Schedule:</p>
                  <p className="font-medium">{selectedOrder?.move_date && formatDateLocale(selectedOrder?.move_date, 'sv')}</p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex sm:justify-between gap-4">
              <Button
                variant="outline"
                className="flex-1 border-gray-300"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleConfirm}
              >
                {isPending ? 'Confirming...' : 'Confirm'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="pt-6 flex flex-col items-center">
            {/* Green Success Icon */}
            <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-6">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-center mb-2">
              Driver Assigned
            </h2>

            <p className="text-center text-gray-600 mb-8">
              Driver with the ID {driverId} has been assigned to Job{" "}
              {selectedOrderId}.<br />
              He has been notified and can now track, update, and complete the
              job via his driver app.
            </p>

            <Button
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={handleGoToDashboard}
            >
              Go to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
