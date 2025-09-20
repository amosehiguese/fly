"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { MapPin, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import Image from "next/image";
import GoogleMapView from "@/components/GoogleMap";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { useDriverOrders } from "@/hooks/driver";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useDriverStore } from "@/store/driverStore";
import { formatDateLocale } from "@/lib/formatDateLocale";
import { useTranslations } from "next-intl";

interface FormattedOrder {
  id: string;
  orderId: string;
  customerName: string;
  location: string;
  pickupLocation: string;
  dropoffLocation: string;
  scheduledTime: string;
  duration: string;
  distance: string;
  // amount: string;
}

export default function DriverDashboard() {
  const router = useRouter();
  const [currentOrder, setCurrentOrder] = useState<FormattedOrder | null>(null);
  const t = useTranslations("driver");

  // Get driver profile
  // const { useProfile } = useDriverProfile();
  // const { data: profileData, isLoading: profileLoading, error: profileError } = useProfile();
  const { driver } = useDriverStore();

  // Get all tasks
  const { useDriverTasks, updateDriverLocation } = useDriverOrders();
  const {
    data: tasksData,
    isPending: tasksPending,
    error: tasksError,
  } = useDriverTasks(1, 10);
  const [currentTaskIndex] = useState(0);

  // --- Live location tracking ---
  const [userLocation, setUserLocation] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        // Send to backend
      },
      (err) => {
        // Optionally handle error
        console.error("Location error", err);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);
  // --- End live location tracking ---

  useEffect(() => {
    if (!userLocation) return;
    const interval = setInterval(() => {
      updateDriverLocation.mutate({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
      });
    }, 60000); // 60,000 ms = 1 minute

    return () => clearInterval(interval);
  }, [userLocation]);

  // Format order data for display
  useEffect(() => {
    if (tasksData && tasksData?.data?.orders?.length > 0) {
      const order = tasksData?.data?.orders[currentTaskIndex];
      if (order) {
        setCurrentOrder({
          id: order?.id?.toString() || "",
          orderId: order?.order_id || "",
          customerName: order?.name || "Kund",
          location: order?.pickup_address || "",
          pickupLocation: order?.pickup_address || "",
          dropoffLocation: order?.delivery_address || "",
          scheduledTime: `${order?.date && formatDateLocale(order?.date, "sv")}`,
          duration: order?.distance
            ? `~${calculateDuration(order?.distance)} min`
            : "--",
          distance: order?.distance || "--",
          // amount: `${order?.} kr`
        });
      }
    } else {
      setCurrentOrder(null);
    }
  }, [tasksData, currentTaskIndex]);

  // Helper to calculate approximate duration based on distance
  const calculateDuration = (distance: string): string => {
    try {
      const distanceKm = parseFloat(distance.replace(",", "."));
      const averageSpeedKmPerHour = 50; // Assuming average speed in city
      const durationHours = distanceKm / averageSpeedKmPerHour;
      const durationMinutes = Math.round(durationHours * 60);
      return durationMinutes.toString();
    } catch {
      return "30"; // Default fallback
    }
  };

  const handleStartTransit = (orderId: string) => {
    router.push(`/driver/transit/${orderId}`);
  };

  // Show loading state when data is being fetched
  if (tasksPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-gray-600">{t("loadingInfo")}</p>
        </div>
      </div>
    );
  }

  // Show error state if tasks fetch failed
  if (tasksError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="mt-4 text-lg font-semibold">{t("errorOccurred")}</h3>
          <p className="mt-2 text-gray-600">{t("couldNotLoadDriverInfo")}</p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            {t("tryAgain")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3rem)] lg:h-screen flex-1 w-full">
      <div className="relative h-full w-full">
        <GoogleMapView userLocation={userLocation}>
          <div className="absolute top-4 left-4 right-4 bg-white rounded-full shadow-md p-3 flex items-center z-10">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-2">
              <Image
                src={"/avatar_male.jpg"}
                alt={t("customer")}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="flex-1 ml-1">
              <p className="font-medium">{driver?.fullname || t("customer")}</p>
              <div className="flex items-center">
                <MapPin className="w-3 h-3 text-green-600 mr-1" />
                <p className="text-xs text-gray-600">
                  {currentOrder?.location || t("currentLocation")}
                </p>
              </div>
            </div>
            <div className="flex items-center bg-green-500 text-white px-4 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{t("online")}</span>
            </div>
          </div>
        </GoogleMapView>
      </div>

      <Drawer open={false}>
        <DrawerContent>
          <DrawerHeader className="pb-0">
            <DrawerTitle className="text-lg font-semibold">
              {t("newDelivery")}
            </DrawerTitle>
            <DrawerDescription>{t("scheduledDeliveryTime")}</DrawerDescription>
            {/* Move time display outside of DrawerDescription to avoid nesting issues */}
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-500 mr-4">
                {t("plannedTime")}
              </span>
              {currentOrder && (
                <div className="bg-green-100 py-1 px-3 rounded-full">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-green-800" />
                    <span className="text-sm font-medium text-green-800">
                      {currentOrder.scheduledTime}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </DrawerHeader>

          {currentOrder ? (
            <div className="p-4 pt-0">
              <div className="flex items-start mt-4">
                <div className="mr-3 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="h-12 w-[2px] bg-gray-300 my-1 mx-auto"></div>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="mb-4">
                    <span className="text-sm font-medium">
                      {currentOrder.pickupLocation}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="block">
                        {t("customer")}: {currentOrder.customerName}
                      </span>
                      <span className="block">
                        {t("orderId")}: {currentOrder.orderId}
                      </span>
                      <span className="block">
                        {t("distance")}: {currentOrder.distance}km
                      </span>
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium">
                      {currentOrder.dropoffLocation}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="block">
                        {t("estimatedTime")}: {currentOrder.duration}
                      </span>
                      {/* <span className="block">Pris: {currentOrder.amount}</span> */}
                    </p>
                  </div>
                </div>
              </div>

              <DrawerFooter className="pt-2 pb-0">
                <button
                  onClick={() => handleStartTransit(currentOrder.orderId)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-medium"
                >
                  {t("startTransit")}
                </button>
              </DrawerFooter>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">{t("noCurrentDeliveries")}</p>
              <p className="text-sm text-gray-400">
                {t("newDeliveriesAppearHere")}
              </p>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
