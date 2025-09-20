"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { useDriverOrders } from "@/hooks/driver";
import { Separator } from "@/components/ui/separator";
import LiveLocationMap from "@/components/driver/LiveLocationMap";
import { useTranslations } from "next-intl";

interface TripDetails {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  dropoffLocation: string;
  // pickupCoordinates?: string; // Address or coordinates string for Google Maps
  // dropoffCoordinates?: string; // Address or coordinates string for Google Maps
  startTime: string;
  estimatedArrival: string;
  distance: string;
  // amount: string;
}

export default function TransitPage() {
  const t = useTranslations("driver");
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [tripCompleted, setTripCompleted] = useState(false);

  // Get order details from the API
  const { useOrderDetails, updateOrderStatus } = useDriverOrders();
  const { data: orderData, isPending, error } = useOrderDetails(id as string);

  // Format order data for display
  useEffect(() => {
    if (orderData?.data) {
      const order = orderData.data;
      setTripDetails({
        id: id as string,
        customerName: order.quotation.name || "Kund",
        customerPhone: order.quotation.phone || "+46 00 000 0000",
        pickupLocation: order.quotation.pickup_address,
        dropoffLocation: order.quotation.delivery_address,
        // pickupCoordinates: order.quotation.pickup_address,
        // dropoffCoordinates: order.quotation.delivery_address,
        startTime: order.quotation.date,
        estimatedArrival: calculateEstimatedArrival(
          order.quotation.pickup_time,
          order.quotation.distance
        ),
        distance: order.quotation.distance,
        // amount: `${order.quotation.price} kr`
      });
    }
  }, [orderData, id]);

  // Helper function to calculate estimated arrival time
  const calculateEstimatedArrival = (
    startTime: string,
    distance: string
  ): string => {
    try {
      const time = startTime.split(":");
      const hours = parseInt(time[0]);
      const minutes = parseInt(time[1]);

      // Calculate duration in minutes based on distance
      let durationMinutes = 30; // Default fallback
      try {
        const distanceKm = parseFloat(distance.replace(",", "."));
        const averageSpeedKmPerHour = 50; // Assuming average city speed
        const durationHours = distanceKm / averageSpeedKmPerHour;
        durationMinutes = Math.round(durationHours * 60);
      } catch {
        // Use default if calculation fails
      }

      // Add duration to start time
      let totalMinutes = minutes + durationMinutes;
      let totalHours = hours + Math.floor(totalMinutes / 60);
      totalMinutes = totalMinutes % 60;
      totalHours = totalHours % 24; // Handle day overflow

      return `${totalHours.toString().padStart(2, "0")}:${totalMinutes.toString().padStart(2, "0")}`;
    } catch {
      return "--:--";
    }
  };

  const handleNavigateBack = () => {
    router.back();
  };

  const handleCompleteTrip = () => {
    updateOrderStatus.mutate(
      { orderId: id as string, status: "completed" },
      {
        onSuccess: () => {
          setTripCompleted(true);
          setTimeout(() => {
            router.push("/driver");
          }, 2000);
        },
      }
    );
  };

  const handleCallCustomer = () => {
    // In a real application, this would trigger a call
    if (tripDetails) {
      window.open(`tel:${tripDetails.customerPhone}`);
    }
  };

  const handleMessageCustomer = () => {
    // Navigate to messages page for this customer
    if (orderData?.data?.customer_id) {
      router.push(`/driver/messages/${orderData.data.customer_id}`);
    }
  };

  // Loading state
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-gray-600">
            {t("loadingInfo") || "Loading trip information..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !tripDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="mt-4 text-lg font-semibold">
            {t("errorOccurred") || "An error occurred"}
          </h3>
          <p className="mt-2 text-gray-600">
            {t("errorLoadingTrip") ||
              "We could not load trip information. Please try again later."}
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            {t("tryAgainBtn") || "Try Again"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center">
        <button onClick={handleNavigateBack} className="mr-3">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">
          {t("tripInProgress") || "Trip In Progress"}
        </h1>
      </div>

      <LiveLocationMap />

      {/* Map Area with Directions */}
      {/* <div className="relative h-[80vh] md:h-[50vh] lg:h-[60vh] w-full">
        {tripDetails && (
          <DirectionsMap
            pickupAddress={tripDetails.pickupLocation}
            dropoffAddress={tripDetails.dropoffLocation}
          >
            <Tabs 
              defaultValue="directions" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 h-10">
                <TabsTrigger value="directions">Vägbeskrivning</TabsTrigger>
                <TabsTrigger value="details">Detaljer</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="pt-2">
                <div className="px-4">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Upphämtningsplats</p>
                      <p className="font-medium">{tripDetails.pickupLocation}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                      <MapPin className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Leveransadress</p>
                      <p className="font-medium">{tripDetails.dropoffLocation}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Upphämtningstid</p>
                      <p className="font-medium">{tripDetails.startTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                      <Package className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Artiklar</p>
                      <p className="font-medium">1 objekt</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DirectionsMap>
        )}
      </div>     */}

      {/* Trip Info Card */}
      <div className="bg-white shadow-md rounded-t-2xl -mt-5 flex-1 p-4">
        {tripCompleted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {/* <Check className="h-8 w-8 text-green-600" /> */}
            </div>
            <h2 className="text-xl font-semibold mb-2">Körning slutförd</h2>
            <p className="text-gray-500">Tack för din insats!</p>
          </div>
        ) : (
          <>
            {/* Destination */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">
                {t("destination") || "Destination"}
              </p>
              <h2 className="text-xl font-semibold">
                {tripDetails.dropoffLocation}
              </h2>
            </div>

            <Separator className="my-4" />

            {/* Trip Details */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">
                  {t("estimatedArrival") || "Beräknad ankomst"}
                </p>
                <p className="font-medium">{tripDetails.estimatedArrival}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {t("distance") || "Avstånd"}
                </p>
                <p className="font-medium">{tripDetails.distance}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {t("amount") || "Belopp"}
                </p>
                <p className="font-medium">{tripDetails.amount}</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500">
                  {t("customer") || "Kund"}
                </p>
                <p className="font-medium">{tripDetails.customerName}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCallCustomer}
                  className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"
                >
                  {/* <Phone className="h-5 w-5 text-green-600" /> */}
                </button>
                <button
                  onClick={handleMessageCustomer}
                  className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
                >
                  {/* <MessageSquare className="h-5 w-5 text-blue-600" /> */}
                </button>
              </div>
            </div>

            {/* Complete Trip Button */}
            <Button
              onClick={handleCompleteTrip}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-full"
            >
              {t("completeTrip") || "Slutför körning"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
